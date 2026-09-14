import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 模擬 @notionhq/client,讓測試不需要真實 Token 也能驗證重試/分頁/降級邏輯
const queryMock = vi.fn()
vi.mock('@notionhq/client', () => ({
  Client: vi.fn().mockImplementation(() => ({
    databases: { query: queryMock },
  })),
}))

// 模擬 fs-extra,把「本地備份」換成記憶體內的假檔案系統。
// 來源程式碼是 `import fs from 'fs-extra'`(default import),mock 也必須提供 `default`,
// 否則測試會通過但真實執行時 default import 拿到的形狀不一樣(這正是今天發生過的 bug)。
const fakeFs = new Map<string, unknown>()
const fsExtraMock = {
  ensureDir: vi.fn().mockResolvedValue(undefined),
  outputJson: vi.fn(async (filePath: string, data: unknown) => {
    fakeFs.set(filePath, data)
  }),
  pathExists: vi.fn(async (filePath: string) => fakeFs.has(filePath)),
  readJson: vi.fn(async (filePath: string) => fakeFs.get(filePath)),
}
vi.mock('fs-extra', () => ({ default: fsExtraMock, ...fsExtraMock }))

const { fetchDbWithRetry, requireEnv, runPipeline, BACKUP_DIR, CACHE_DIR } = await import(
  '../../scripts/fetch-notion'
)

describe('fetchDbWithRetry', () => {
  beforeEach(() => {
    queryMock.mockReset()
    fakeFs.clear()
  })

  it('單頁成功時直接回傳結果並寫入備份', async () => {
    queryMock.mockResolvedValueOnce({ results: [{ id: 'row-1' }], next_cursor: null })

    const results = await fetchDbWithRetry('projects', 'db-id')

    expect(results).toEqual([{ id: 'row-1' }])
    expect(queryMock).toHaveBeenCalledTimes(1)
  })

  it('遇到 next_cursor 會自動翻頁,合併所有頁面的結果', async () => {
    queryMock
      .mockResolvedValueOnce({ results: [{ id: 'row-1' }], next_cursor: 'cursor-2' })
      .mockResolvedValueOnce({ results: [{ id: 'row-2' }], next_cursor: null })

    const results = await fetchDbWithRetry('experiences', 'db-id')

    expect(results).toEqual([{ id: 'row-1' }, { id: 'row-2' }])
    expect(queryMock).toHaveBeenCalledTimes(2)
    expect(queryMock).toHaveBeenNthCalledWith(2, expect.objectContaining({ start_cursor: 'cursor-2' }))
  })

  it('重試耗盡且有本地備份時,降級讀取備份而不拋出例外', async () => {
    fakeFs.set(path.join(BACKUP_DIR, 'skills.json'), [{ id: 'cached-row' }])
    queryMock.mockRejectedValue(new Error('429 rate_limited'))

    const results = await fetchDbWithRetry('skills', 'db-id', 2)

    expect(results).toEqual([{ id: 'cached-row' }])
    expect(queryMock).toHaveBeenCalledTimes(2)
  }, 10_000)

  it('重試耗盡且無本地備份時,拋出 Fatal 例外中止建置', async () => {
    queryMock.mockRejectedValue(new Error('429 rate_limited'))

    await expect(fetchDbWithRetry('projects', 'db-id', 2)).rejects.toThrow('[Notion Fatal]')
  }, 10_000)
})

describe('requireEnv', () => {
  const KEY = '__FETCH_NOTION_TEST_ENV__'

  afterEach(() => {
    Reflect.deleteProperty(process.env, KEY)
  })

  it('環境變數存在時回傳其值', () => {
    process.env[KEY] = 'db-123'
    expect(requireEnv(KEY)).toBe('db-123')
  })

  it('環境變數缺失時拋出例外,而不是靜默回傳 undefined', () => {
    expect(() => requireEnv(KEY)).toThrow('缺少必要環境變數')
  })
})

describe('runPipeline', () => {
  beforeEach(() => {
    queryMock.mockReset()
    fakeFs.clear()
    process.env.NOTION_DB_PROJECTS = 'db-projects'
    process.env.NOTION_DB_EXP = 'db-experiences'
    process.env.NOTION_DB_SKILLS = 'db-skills'
    process.env.NOTION_DB_PEOPLE = 'db-people'
  })

  afterEach(() => {
    delete process.env.NOTION_DB_PROJECTS
    delete process.env.NOTION_DB_EXP
    delete process.env.NOTION_DB_SKILLS
    delete process.env.NOTION_DB_PEOPLE
  })

  it('依序抓取四個資料庫,並把彙整結果寫入 .cache/active-content.json', async () => {
    queryMock.mockResolvedValue({ results: [{ id: 'row' }], next_cursor: null })

    await runPipeline()

    expect(queryMock).toHaveBeenCalledTimes(4)
    const cacheFile = path.join(CACHE_DIR, 'active-content.json')
    const cached = fakeFs.get(cacheFile) as Record<string, unknown>
    expect(cached).toMatchObject({
      projects: [{ id: 'row' }],
      experiences: [{ id: 'row' }],
      skills: [{ id: 'row' }],
      people: [{ id: 'row' }],
    })
    expect(typeof cached.updatedAt).toBe('string')
  })
})
