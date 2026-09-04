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

  const activeContent = {
    projects,
    experiences,
    skills,
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

export { fetchDbWithRetry, requireEnv, runPipeline, BACKUP_DIR, CACHE_DIR }
