import { readFile } from 'node:fs/promises'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NotionPage, ProfileContent } from '~/types/notion'
import { mapExperience, mapPerson, mapSkill } from '~/utils/notion'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CACHE_FILE = path.resolve(__dirname, '../../.cache/active-content.json')
const EXPERIENCES_BACKUP = path.resolve(__dirname, '../../content/backup/experiences.json')
const SKILLS_BACKUP = path.resolve(__dirname, '../../content/backup/skills.json')
const PEOPLE_BACKUP = path.resolve(__dirname, '../../content/backup/people.json')

interface RawContent {
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
  const [experiences, skills, people] = await Promise.all([
    readJson<NotionPage[]>(EXPERIENCES_BACKUP),
    readJson<NotionPage[]>(SKILLS_BACKUP),
    readJson<NotionPage[]>(PEOPLE_BACKUP),
  ])
  return { experiences: experiences ?? [], skills: skills ?? [], people: people ?? [] }
}

export default defineEventHandler(async (): Promise<ProfileContent> => {
  const raw = await loadRawContent()
  return {
    experiences: raw.experiences.map(mapExperience),
    skills: raw.skills.map(mapSkill),
    people: raw.people.map(mapPerson),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  }
})
