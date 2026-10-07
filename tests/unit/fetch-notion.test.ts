import * as path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 模擬 @notionhq/client,讓測試不需要真實 Token 也能驗證重試/分頁/降級邏輯
const queryMock = vi.fn()
const blocksListMock = vi.fn()
vi.mock('@notionhq/client', () => ({
  Client: vi.fn().mockImplementation(() => ({
    databases: { query: queryMock },
    blocks: { children: { list: blocksListMock } },
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
  move: vi.fn(async (from: string, to: string) => {
    fakeFs.set(to, fakeFs.get(from))
    fakeFs.delete(from)
  }),
  existsSync: vi.fn((filePath: string) => !filePath.endsWith('missing.png')),
}
vi.mock('fs-extra', () => ({ default: fsExtraMock, ...fsExtraMock }))

process.env.NOTION_BLOCK_GAP_MS = '0'
const { fetchDbWithRetry, requireEnv, runPipeline, syncProjectPages, BACKUP_DIR, CACHE_DIR, PROJECT_PAGES_BACKUP_DIR } =
  await import('../../scripts/fetch-notion')

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
      projectPages: {},
    })
    expect(typeof cached.updatedAt).toBe('string')
  })
})

// SRS §3.3.1:專案頁面內文同步——分頁、只讀根 Toggle 子樹、逐專案備份與降級。
describe('syncProjectPages', () => {
  const WEDDING_ROW = { id: 'page-wedding', properties: { Slug: { type: 'rich_text', rich_text: [{ plain_text: 'wedding' }] } } }
  const OTHER_ROW = { id: 'page-other', properties: { Slug: { type: 'rich_text', rich_text: [{ plain_text: 'other' }] } } }
  const DRAFT_ROW = { id: 'page-draft', properties: { Slug: { type: 'rich_text', rich_text: [] } } }

  const rich = (text: string) => [{ plain_text: text }]
  const toggle = (id: string, name: string) => ({ id, type: 'toggle', has_children: true, toggle: { rich_text: rich(name) } })
  const bullet = (id: string, text: string) => ({ id, type: 'bulleted_list_item', has_children: false, bulleted_list_item: { rich_text: rich(text) } })
  const tableBlock = (id: string) => ({ id, type: 'table', has_children: true, table: { table_width: 2, has_column_header: true } })
  const row = (id: string, k: string, v: string) => ({ id, type: 'table_row', has_children: false, table_row: { cells: [rich(k), rich(v)] } })
  const rows = (prefix: string, fields: Record<string, string>) => [row(`${prefix}-h`, 'key', 'value'), ...Object.entries(fields).map(([k, v], i) => row(`${prefix}-${i}`, k, v))]

  // 以 block id 為鍵的假 Notion 頁面樹;list 依 block_id 回傳對應子區塊,支援 next_cursor 分頁。
  type FakeBlock = Record<string, unknown> & { id: string }
  function installTree(tree: Record<string, FakeBlock[]>, pageSize = 100) {
    blocksListMock.mockImplementation(async ({ block_id, start_cursor }: { block_id: string; start_cursor?: string }) => {
      const all = tree[block_id] ?? []
      const start = start_cursor ? Number(start_cursor) : 0
      const results = all.slice(start, start + pageSize)
      const next = start + pageSize < all.length ? String(start + pageSize) : null
      return { results, next_cursor: next }
    })
  }

  function weddingTree(): Record<string, FakeBlock[]> {
    const hl = (prefix: string, title: string, icon: string) => ({ title, summary: `${title}摘要`, intro: `${title}簡介`, icon })
    const ev = (title: string, extra: Record<string, string> = {}) => ({ dateStatus: 'pending', title, description: '待補', majorEvent: 'false', color: 'blue', ...extra })
    return {
      'page-wedding': [
        { id: 'note', type: 'paragraph', has_children: true, paragraph: { rich_text: rich('私人筆記') } },
        toggle('root', 'website-content:v1'),
      ],
      note: [bullet('note-child', '不該被讀取')],
      root: [toggle('m-hl', 'highlights'), toggle('m-pv', 'previews'), toggle('m-bn', 'bullet-notes'), toggle('m-dw', 'default-wishes'), toggle('m-se', 'story-events')],
      'm-hl': [toggle('hl-1', 'story-timeline'), toggle('hl-2', 'bullet-engine')],
      'hl-1': [tableBlock('hl-1-t')],
      'hl-1-t': rows('hl1', hl('a', '故事時間軸', 'book')),
      'hl-2': [tableBlock('hl-2-t')],
      'hl-2-t': rows('hl2', hl('b', '賓客祝福彈幕', 'chat')),
      'm-pv': [toggle('pv-1', 'site-desktop'), toggle('pv-2', 'site-mobile'), toggle('pv-3', 'bullet-engine')],
      'pv-1': [tableBlock('pv-1-t')],
      'pv-1-t': rows('pv1', { assetPath: '/images/wedding-site-desktop.png', alt: '桌機', caption: '首頁' }),
      'pv-2': [tableBlock('pv-2-t')],
      'pv-2-t': rows('pv2', { assetPath: '/images/wedding-site-mobile.png', alt: '手機' }),
      'pv-3': [tableBlock('pv-3-t')],
      'pv-3-t': rows('pv3', { assetPath: '/images/bullet-engine-preview.png', alt: '彈幕' }),
      'm-bn': [tableBlock('bn-t'), toggle('bn-usage', 'usage')],
      'bn-t': rows('bn', { demoOnly: '僅供展示', tech: '技術說明' }),
      'bn-usage': [bullet('u1', '上限 {maxLength} 字'), bullet('u2', '{demoOnly}')],
      'm-dw': Array.from({ length: 120 }, (_, i) => bullet(`w${i}`, `祝福 ${i}`)),
      'm-se': [toggle('se-1', 'meeting'), toggle('se-2', 'dating'), toggle('se-3', 'proposal'), toggle('se-4', 'wedding')],
      'se-1': [tableBlock('se-1-t')],
      'se-1-t': rows('se1', ev('相識')),
      'se-2': [tableBlock('se-2-t')],
      'se-2-t': rows('se2', ev('交往', { color: 'pink' })),
      'se-3': [tableBlock('se-3-t')],
      'se-3-t': rows('se3', ev('求婚', { majorEvent: 'true', color: 'pink' })),
      'se-4': [tableBlock('se-4-t')],
      'se-4-t': rows('se4', ev('婚禮', { majorEvent: 'true' })),
    }
  }

  beforeEach(() => {
    blocksListMock.mockReset()
    fakeFs.clear()
  })

  it('只遞迴根 Toggle 子樹、每層處理分頁,解析後寫入逐專案備份', async () => {
    installTree(weddingTree(), 50)

    const result = await syncProjectPages([WEDDING_ROW, DRAFT_ROW] as never)

    const backup = result['page-wedding']
    expect(backup).toMatchObject({ schemaVersion: 'v1', pageId: 'page-wedding', slug: 'wedding' })
    expect(backup.content.contract).toBe('wedding')
    if (backup.content.contract !== 'wedding') throw new Error()
    expect(backup.content.defaultWishes).toHaveLength(120)
    expect(backup.content.previews[0].caption).toBe('首頁')
    expect(fakeFs.get(path.join(PROJECT_PAGES_BACKUP_DIR, 'page-wedding.json'))).toEqual(backup)
    expect(fakeFs.has(path.join(PROJECT_PAGES_BACKUP_DIR, 'page-wedding.json.tmp'))).toBe(false)

    const requestedIds = blocksListMock.mock.calls.map((call) => call[0].block_id)
    expect(requestedIds).not.toContain('note')
    expect(requestedIds.filter((id) => id === 'm-dw')).toHaveLength(3)
    expect(result['page-draft']).toBeUndefined()
  }, 60_000)

  it('沒有根 Toggle 的非婚禮專案記錄為無客製內容,不寫備份也不中止', async () => {
    installTree({ 'page-other': [{ id: 'p', type: 'paragraph', has_children: false }] })

    const result = await syncProjectPages([OTHER_ROW] as never)

    expect(result).toEqual({})
    expect(fakeFs.size).toBe(0)
  })

  it('遠端格式錯誤時直接中止,且不覆寫既有備份', async () => {
    const tree = weddingTree()
    tree['hl-2-t'] = rows('hl2', { title: '彈幕', icon: 'chat' })
    installTree(tree)
    const existing = { schemaVersion: 'v1', pageId: 'page-wedding', slug: 'wedding', fetchedAt: 'old', content: {} }
    fakeFs.set(path.join(PROJECT_PAGES_BACKUP_DIR, 'page-wedding.json'), existing)

    await expect(syncProjectPages([WEDDING_ROW] as never)).rejects.toThrow('缺少必填欄位「summary」')
    expect(fakeFs.get(path.join(PROJECT_PAGES_BACKUP_DIR, 'page-wedding.json'))).toEqual(existing)
  }, 60_000)

  it('缺少必需根 Toggle 的婚禮專案中止發布,不以舊備份掩蓋', async () => {
    installTree({ 'page-wedding': [] })
    fakeFs.set(path.join(PROJECT_PAGES_BACKUP_DIR, 'page-wedding.json'), { schemaVersion: 'v1', pageId: 'page-wedding', slug: 'wedding', fetchedAt: 'old', content: {} })

    await expect(syncProjectPages([WEDDING_ROW] as never)).rejects.toThrow('缺少必需的 website-content:v1 根 Toggle')
  })

  it('網路失敗且有同 pageId/slug 的完整備份時降級,不影響其他專案', async () => {
    // 先用一次成功同步產生真正通過契約驗證的備份,再模擬網路失敗。
    installTree(weddingTree())
    const synced = await syncProjectPages([WEDDING_ROW] as never)
    const backup = fakeFs.get(path.join(PROJECT_PAGES_BACKUP_DIR, 'page-wedding.json'))
    expect(backup).toEqual(synced['page-wedding'])

    blocksListMock.mockImplementation(async ({ block_id }: { block_id: string }) => {
      if (block_id === 'page-wedding') throw new Error('503')
      return { results: [], next_cursor: null }
    })

    const result = await syncProjectPages([WEDDING_ROW, OTHER_ROW] as never)

    expect(result).toEqual({ 'page-wedding': backup })
  }, 60_000)

  it('網路失敗時,正文不完整的備份(只有 contract 標記)不被接受而中止', async () => {
    blocksListMock.mockRejectedValue(new Error('503'))
    fakeFs.set(path.join(PROJECT_PAGES_BACKUP_DIR, 'page-wedding.json'), { schemaVersion: 'v1', pageId: 'page-wedding', slug: 'wedding', fetchedAt: 'x', content: { contract: 'wedding' } })

    await expect(syncProjectPages([WEDDING_ROW] as never)).rejects.toThrow('遠端與有效備份均不可用')
  }, 60_000)

  it('網路失敗且備份 slug/版本不符或不存在時中止', async () => {
    blocksListMock.mockRejectedValue(new Error('503'))
    fakeFs.set(path.join(PROJECT_PAGES_BACKUP_DIR, 'page-wedding.json'), { schemaVersion: 'v1', pageId: 'page-wedding', slug: 'renamed', fetchedAt: 'x', content: {} })

    await expect(syncProjectPages([WEDDING_ROW] as never)).rejects.toThrow('遠端與有效備份均不可用')
    await expect(syncProjectPages([OTHER_ROW] as never)).rejects.toThrow('遠端與有效備份均不可用')
  }, 60_000)
})
