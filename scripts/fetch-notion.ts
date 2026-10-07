// SRS §3.3 強化版同步與容錯管線(Fetch Pipeline V2)
// 針對 Notion API 3 req/sec 速率限制與 100 筆分頁上限,實作指數退避重試、
// start_cursor 分頁與逐資料庫獨立降級(任一資料庫失敗不影響其他資料庫)。
import { Client } from '@notionhq/client'
import type { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints'
// 注意:必須用 default import,不能用 `import * as fs`——fs-extra 是 CJS 模組,
// readJson/outputJson 等方法是動態掛載到 module.exports 上,cjs-module-lexer 靜態分析
// 抓不到,`import * as fs` 合成出來的 namespace 上就會缺這些方法(pathExists/ensureDir
// 因為是靜態賦值,不受影響,所以只有部分方法在真實執行時才會炸,測試用 mock 蓋不到)。
import fs from 'fs-extra'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NotionPage } from '../types/notion'
import type { ContentBlock, ProjectPageBackup } from '../types/projectContent'
import { PROJECT_CONTENT_SCHEMA_VERSION } from '../types/projectContent'
import { getRichText } from '../utils/notion'
import { findContentRoot, parseProjectPageContent, validateProjectPageBackup } from '../utils/projectContent'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const BACKUP_DIR = path.resolve(__dirname, '../content/backup')
const CACHE_DIR = path.resolve(__dirname, '../.cache')

const notion = new Client({ auth: process.env.NOTION_API_KEY })

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type NotionRow = QueryDatabaseResponse['results'][number]

/**
 * 帶指數退避與分頁邏輯的安全抓取封裝。
 * 重試耗盡時降級讀取該資料庫自己的本地備份(per-database fallback),
 * 不會因單一資料庫故障拖累其他資料庫或中止整個建置。
 */
async function fetchDbWithRetry(
  dbName: string,
  dbId: string,
  maxRetries = 3,
): Promise<NotionRow[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Notion Pipeline] 正在抓取 ${dbName} (嘗試第 ${attempt} 次)...`)

      let results: NotionRow[] = []
      let cursor: string | undefined

      do {
        const response = await notion.databases.query({
          database_id: dbId,
          start_cursor: cursor,
        })
        results = [...results, ...response.results]
        cursor = response.next_cursor ?? undefined
      } while (cursor)

      const backupFile = path.join(BACKUP_DIR, `${dbName}.json`)
      await fs.outputJson(backupFile, results, { spaces: 2 })
      return results
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`[Notion Pipeline] ${dbName} 抓取失敗: ${message}`)

      if (attempt < maxRetries) {
        // 指數退避延遲:1s, 2s, 4s,並加入微隨機抖動
        const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 200
        await sleep(delay)
        continue
      }

      console.warn(`[Notion Fallback] ${dbName} 重試耗盡,啟動本地備份降級讀取!`)
      const backupFile = path.join(BACKUP_DIR, `${dbName}.json`)
      if (await fs.pathExists(backupFile)) {
        return await fs.readJson(backupFile)
      }
      throw new Error(`[Notion Fatal] ${dbName} 遠端與本地備份均不可用!`)
    }
  }
  // 理論上不會到達(迴圈內每個分支都 return 或 throw),僅滿足 TS 回傳型別要求
  throw new Error(`[Notion Fatal] ${dbName} 流程異常終止`)
}

// SRS §3.3.1:專案頁面內文(website-content:v1)同步。資料庫 query 拿不到頁面
// blocks,要另外讀 blocks/children;每一層都處理分頁,只遞迴根 Toggle 的子樹。
const PROJECT_PAGES_BACKUP_DIR = path.join(BACKUP_DIR, 'project-pages')
const PUBLIC_DIR = path.resolve(__dirname, '../public')
// 讀 blocks 的請求間隔,配合 3 req/sec 限制;測試可用環境變數歸零。
const BLOCK_REQUEST_GAP_MS = Number(process.env.NOTION_BLOCK_GAP_MS ?? 350)

async function withRetry<T>(label: string, task: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await task()
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.warn(`[Notion Pipeline] ${label} 失敗(第 ${attempt} 次): ${message}`)
      if (attempt === maxRetries) throw error
      await sleep(Math.pow(2, attempt - 1) * 1000 + Math.random() * 200)
    }
  }
  throw new Error(`[Notion Fatal] ${label} 流程異常終止`)
}

async function listBlockChildren(blockId: string): Promise<ContentBlock[]> {
  let results: ContentBlock[] = []
  let cursor: string | undefined
  do {
    const response = await withRetry(`讀取區塊 ${blockId}`, () =>
      notion.blocks.children.list({ block_id: blockId, start_cursor: cursor, page_size: 100 }),
    )
    results = [...results, ...(response.results as unknown as ContentBlock[])]
    cursor = response.next_cursor ?? undefined
    await sleep(BLOCK_REQUEST_GAP_MS)
  } while (cursor)
  return results
}

async function hydrateChildren(block: ContentBlock): Promise<void> {
  if (!block.has_children) return
  block.children = await listBlockChildren(block.id)
  for (const child of block.children) {
    await hydrateChildren(child)
  }
}

// 只回傳最上層 blocks,且只有根 Toggle 的子樹被展開;區塊外的筆記不會被讀取。
async function fetchProjectContentBlocks(pageId: string): Promise<ContentBlock[]> {
  const topLevel = await listBlockChildren(pageId)
  const ctx = { issues: [] as string[], assetExists: () => true }
  const root = findContentRoot(topLevel, ctx)
  if (root) await hydrateChildren(root)
  return topLevel.map((block) => (block === root ? root : { ...block, children: undefined }))
}

function projectPageBackupFile(pageId: string): string {
  return path.join(PROJECT_PAGES_BACKUP_DIR, `${pageId}.json`)
}

async function readValidProjectPageBackup(pageId: string, slug: string): Promise<ProjectPageBackup | undefined> {
  const file = projectPageBackupFile(pageId)
  if (!(await fs.pathExists(file))) return undefined
  const backup: unknown = await fs.readJson(file)
  const issues = validateProjectPageBackup(backup, { pageId, slug, assetExists })
  if (issues.length) {
    console.warn(`[Notion Fallback] ${slug} 的備份不可用:\n- ${issues.join('\n- ')}`)
    return undefined
  }
  return backup as ProjectPageBackup
}

// 先寫暫存檔再搬移,避免寫到一半中斷留下半份備份。
async function writeJsonAtomic(file: string, data: unknown): Promise<void> {
  const tmp = `${file}.tmp`
  await fs.outputJson(tmp, data, { spaces: 2 })
  await fs.move(tmp, file, { overwrite: true })
}

function assetExists(assetPath: string): boolean {
  return fs.existsSync(path.join(PUBLIC_DIR, assetPath))
}

/**
 * 逐專案同步頁面內文。網路失敗才降級讀同一 pageId、同 slug 的有效備份;
 * 格式錯誤直接中止,不覆寫備份,也不拿舊備份掩蓋編輯錯誤。
 */
async function syncProjectPages(projectRows: NotionRow[]): Promise<Record<string, ProjectPageBackup>> {
  const result: Record<string, ProjectPageBackup> = {}
  for (const row of projectRows) {
    // 沒有 Slug 的列是 Notion 預設的空白佔位列,跟 useProjects 一樣直接略過。
    const page = row as unknown as Partial<NotionPage>
    const slug = page.properties ? getRichText(page as NotionPage, 'Slug') : ''
    if (!slug) continue

    let blocks: ContentBlock[]
    try {
      blocks = await fetchProjectContentBlocks(row.id)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const backup = await readValidProjectPageBackup(row.id, slug)
      if (backup) {
        console.warn(`[Notion Fallback] ${slug} 頁面內文抓取失敗(${message}),降級使用 ${backup.fetchedAt} 的備份`)
        result[row.id] = backup
        continue
      }
      throw new Error(`[Notion Fatal] ${slug} 頁面內文遠端與有效備份均不可用: ${message}`)
    }

    const content = parseProjectPageContent(blocks, { pageId: row.id, slug, assetExists })
    if (!content) {
      console.log(`[Notion Pipeline] ${slug} 沒有 website-content:v1,視為無客製內容`)
      continue
    }
    const backup: ProjectPageBackup = {
      schemaVersion: PROJECT_CONTENT_SCHEMA_VERSION,
      pageId: row.id,
      slug,
      fetchedAt: new Date().toISOString(),
      content,
    }
    await writeJsonAtomic(projectPageBackupFile(row.id), backup)
    result[row.id] = backup
    console.log(`[Notion Pipeline] ${slug} 頁面內文同步完成(${content.contract} 契約)`)
  }
  return result
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`[Notion Pipeline] 缺少必要環境變數: ${name}`)
  }
  return value
}

async function runPipeline() {
  await fs.ensureDir(BACKUP_DIR)
  await fs.ensureDir(CACHE_DIR)

  // 串行執行並加入延遲,杜絕並發觸發 429 Rate Limit(3 req/sec)
  const projects = await fetchDbWithRetry('projects', requireEnv('NOTION_DB_PROJECTS'))
  await sleep(400)
  const experiences = await fetchDbWithRetry('experiences', requireEnv('NOTION_DB_EXP'))
  await sleep(400)
  const skills = await fetchDbWithRetry('skills', requireEnv('NOTION_DB_SKILLS'))
  await sleep(400)
  // People 原本只是 Owner/TargetUser 的 Relation 目標,現在也直接抓取自己的欄位
  // (JobTitle/SeoDescription),供 /yura、/wilson 頁面的 SEO meta 使用。
  const people = await fetchDbWithRetry('people', requireEnv('NOTION_DB_PEOPLE'))
  await sleep(400)
  const projectPages = await syncProjectPages(projects)

  const activeContent = {
    projects,
    experiences,
    skills,
    people,
    projectPages,
    updatedAt: new Date().toISOString(),
  }
  await fs.outputJson(path.join(CACHE_DIR, 'active-content.json'), activeContent, { spaces: 2 })
  console.log('[Notion Pipeline] 資料管線建置完成,已注入 Nuxt 生成快取。')
}

// 直接以 `tsx scripts/fetch-notion.ts` 執行時才啟動管線,方便日後被單元測試 import 個別函式
// 這個進入點分支本質是「CLI 執行時的行程管理」,無法在不啟動子行程的情況下有意義地單元測試,
// 故以 v8 ignore 排除,不計入覆蓋率門檻(邏輯本體 fetchDbWithRetry/runPipeline/requireEnv 皆已覆蓋測試)。
/* v8 ignore start */
if (import.meta.url === `file://${process.argv[1]}`) {
  runPipeline().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
/* v8 ignore stop */

export { fetchDbWithRetry, requireEnv, runPipeline, syncProjectPages, BACKUP_DIR, CACHE_DIR, PROJECT_PAGES_BACKUP_DIR }
