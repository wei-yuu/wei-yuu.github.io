import { readFile } from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NotionPage, ProfileContent, ProjectItem } from '~/types/notion'
import { mapExperience, mapPerson, mapProject, mapSkill } from '~/utils/notion'

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

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE_FILE = path.resolve(__dirname, '../../.cache/active-content.json')
const PROJECTS_BACKUP = path.resolve(__dirname, '../../content/backup/projects.json')
const EXPERIENCES_BACKUP = path.resolve(__dirname, '../../content/backup/experiences.json')
const SKILLS_BACKUP = path.resolve(__dirname, '../../content/backup/skills.json')
const PEOPLE_BACKUP = path.resolve(__dirname, '../../content/backup/people.json')

interface RawContent {
  projects: NotionPage[]
  experiences: NotionPage[]
  skills: NotionPage[]
  people: NotionPage[]
  updatedAt?: string
}

async function readJson<T>(filePath: string): Promise<T | undefined> {
  try {
    return JSON.parse(await readFile(filePath, 'utf-8')) as T
  } catch {
    return undefined
  }
}

async function loadRawContent(): Promise<RawContent> {
  const cached = await readJson<RawContent>(CACHE_FILE)
  if (cached) return cached

  // 本機開發還沒跑過 `npm run fetch:content` 時,直接讀本地備份——
  // 跟 fetch-notion.ts 的降級精神一致,不因為忘了跑一次腳本就整個頁面掛掉。
  const [projects, experiences, skills, people] = await Promise.all([
    readJson<NotionPage[]>(PROJECTS_BACKUP),
    readJson<NotionPage[]>(EXPERIENCES_BACKUP),
    readJson<NotionPage[]>(SKILLS_BACKUP),
    readJson<NotionPage[]>(PEOPLE_BACKUP),
  ])
  return {
    projects: projects ?? [],
    experiences: experiences ?? [],
    skills: skills ?? [],
    people: people ?? [],
  }
}

export default defineEventHandler(async (): Promise<ProfileContent> => {
  const raw = await loadRawContent()
  const projects = raw.projects.map(mapProject)
  if (process.env.E2E_FIXTURE_PROJECTS === '1') {
    projects.push(buildFixtureProject())
  }
  return {
    projects,
    experiences: raw.experiences.map(mapExperience),
    skills: raw.skills.map(mapSkill),
    people: raw.people.map(mapPerson),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  }
})
