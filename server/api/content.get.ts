import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import * as path from 'node:path'
import type { NotionPage, ProfileContent, ProjectItem } from '~/types/notion'
import type { ProjectPageBackup, ProjectPageContent } from '~/types/projectContent'
import { mapExperience, mapPerson, mapProject, mapSkill } from '~/utils/notion'
import { validateProjectPageBackup } from '~/utils/projectContent'

// P1-04 回歸測試(code review 要求):/projects/[slug].vue 只有在真的有
// 「wedding 以外」的專案時才會被 generate/SSR 走過——目前 Notion 只有
// wedding 一筆正式資料,之前 await useAsyncData() 的 SSR 時序 bug(每個
// 合法 slug 都誤判 404)就是因為沒有任何測試真的走過這個路由才沒被抓到。
// 這個假專案只在明確設定 E2E_FIXTURE_PROJECTS=1 時才會被加進回應,正式
// 環境(CI 的 Stage 3/3.5/4 生成與部署)不會設這個環境變數,不會混進真實
// 內容或被部署出去;tests/integration/dynamic-project-route.test.ts 用
// @nuxt/test-utils 啟動一個真的 Nuxt server 來測這個 slug,
// tests/integration/dynamic-project-route-generate.test.ts 則另外驗證
// `nuxi generate` 的靜態 HTML 產物。
const E2E_FIXTURE_SLUG = 'e2e-fixture-project'

function buildFixtureProject(): ProjectItem {
  return {
    id: 'e2e-fixture-project-id',
    title: 'E2E 測試專案',
    slug: E2E_FIXTURE_SLUG,
    summary: 'E2E 回歸測試專用的假資料,不是真實作品。',
    background: 'E2E 測試用背景文字。',
    approach: 'E2E 測試用作法文字。',
    outcome: 'E2E 測試用成果文字。',
    roleAttribution: [],
    techStack: [],
    demoUrl: null,
    repoUrl: null,
    featured: false,
    order: 999,
  }
}

// 專案根目錄由 nuxt.config.ts 的 runtimeConfig.contentRoot 在建置期注入。
function contentPaths() {
  const root = useRuntimeConfig().contentRoot
  const backupDir = path.join(root, 'content/backup')
  return {
    cacheFile: path.join(root, '.cache/active-content.json'),
    projectsBackup: path.join(backupDir, 'projects.json'),
    experiencesBackup: path.join(backupDir, 'experiences.json'),
    skillsBackup: path.join(backupDir, 'skills.json'),
    peopleBackup: path.join(backupDir, 'people.json'),
    projectPagesBackupDir: path.join(backupDir, 'project-pages'),
    publicDir: path.join(root, 'public'),
  }
}

interface RawContent {
  projects: NotionPage[]
  experiences: NotionPage[]
  skills: NotionPage[]
  people: NotionPage[]
  projectPages?: Record<string, ProjectPageBackup>
  updatedAt?: string
}

async function readJson<T>(filePath: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(filePath, 'utf-8')) as T
  } catch {
    return undefined
  }
}

async function readProjectPageBackups(dir: string, publicDir: string): Promise<Record<string, ProjectPageBackup>> {
  let files: string[]
  try {
    files = (await readdir(dir)).filter((name) => name.endsWith('.json'))
  } catch {
    return {}
  }
  const backups = await Promise.all(files.map((name) => readJson<ProjectPageBackup>(path.join(dir, name))))
  // 跟 fetch-notion.ts 的降級共用同一套驗證:半份或不符契約的備份不進頁面。
  const valid = backups.filter((b): b is ProjectPageBackup => {
    if (!b) return false
    const issues = validateProjectPageBackup(b, {
      pageId: b.pageId,
      slug: b.slug,
      assetExists: (assetPath) => existsSync(path.join(publicDir, assetPath)),
    })
    if (issues.length) console.warn(`[content] 略過不可用的備份 ${b.pageId}: ${issues.join('; ')}`)
    return issues.length === 0
  })
  return Object.fromEntries(valid.map((b) => [b.pageId, b]))
}

async function loadRawContent(): Promise<RawContent> {
  const paths = contentPaths()
  const cached = await readJson<RawContent>(paths.cacheFile)
  if (cached) return cached

  // 本機開發還沒跑過 `npm run fetch:content` 時,直接讀本地備份——
  // 跟 fetch-notion.ts 的降級精神一致,不因為忘了跑一次腳本就整個頁面掛掉。
  const [projects, experiences, skills, people, projectPages] = await Promise.all([
    readJson<NotionPage[]>(paths.projectsBackup),
    readJson<NotionPage[]>(paths.experiencesBackup),
    readJson<NotionPage[]>(paths.skillsBackup),
    readJson<NotionPage[]>(paths.peopleBackup),
    readProjectPageBackups(paths.projectPagesBackupDir, paths.publicDir),
  ])
  return {
    projects: projects ?? [],
    experiences: experiences ?? [],
    skills: skills ?? [],
    people: people ?? [],
    projectPages,
  }
}

export default defineEventHandler(async (): Promise<ProfileContent> => {
  const raw = await loadRawContent()
  const projects = raw.projects.map(mapProject)
  // 只輸出已驗證的公開內容,不帶原始 blocks 或抓取時間以外的管線資訊。
  const projectPages: Record<string, ProjectPageContent> = Object.fromEntries(
    Object.values(raw.projectPages ?? {}).map((backup) => [backup.pageId, backup.content]),
  )
  // fixture 專案刻意沒有客製內容,用來驗證「無客製內容的專案」不會串到別人的資料。
  if (process.env.E2E_FIXTURE_PROJECTS === '1') {
    projects.push(buildFixtureProject())
  }
  return {
    projects,
    projectPages,
    experiences: raw.experiences.map(mapExperience),
    skills: raw.skills.map(mapSkill),
    people: raw.people.map(mapPerson),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  }
})
