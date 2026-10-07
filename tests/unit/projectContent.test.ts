import { describe, expect, it } from 'vitest'
import type { ContentBlock, ProjectPageContentBase, WeddingStoryEvent } from '../../types/projectContent'
import {
  fillUsagePlaceholders,
  parseProjectPageContent,
  ProjectContentError,
  toStoryItems,
  validateProjectPageBackup,
  type ProjectContentContract,
} from '../../utils/projectContent'

// 用小工具組 Notion 區塊樹,模擬 blocks/children 經過分頁合併後的形狀。
let counter = 0
function rich(text: string) {
  return [{ plain_text: text }]
}
function toggle(name: string, children: ContentBlock[] = []): ContentBlock {
  return { id: `toggle-${counter++}`, type: 'toggle', has_children: children.length > 0, toggle: { rich_text: rich(name) }, children }
}
function bullet(text: string): ContentBlock {
  return { id: `bullet-${counter++}`, type: 'bulleted_list_item', bulleted_list_item: { rich_text: rich(text) } }
}
function row(key: string, value: string | Array<{ plain_text: string }>): ContentBlock {
  return {
    id: `row-${counter++}`,
    type: 'table_row',
    table_row: { cells: [rich(key), typeof value === 'string' ? rich(value) : value] },
  }
}
function table(fields: Record<string, string>, extraRows: ContentBlock[] = []): ContentBlock {
  return {
    id: `table-${counter++}`,
    type: 'table',
    has_children: true,
    table: { table_width: 2, has_column_header: true },
    children: [row('key', 'value'), ...Object.entries(fields).map(([k, v]) => row(k, v)), ...extraRows],
  }
}
function record(key: string, fields: Record<string, string>): ContentBlock {
  return toggle(key, [table(fields)])
}
function paragraph(text: string): ContentBlock {
  return { id: `p-${counter++}`, type: 'paragraph', ...({ paragraph: { rich_text: rich(text) } } as object) }
}

const highlightFields = (title: string, icon = 'book') => ({ title, summary: `${title}摘要`, intro: `${title}簡介`, icon })
const previewFields = (assetPath: string, caption = '') => ({ assetPath, alt: `${assetPath} 的替代文字`, caption })
const eventFields = (title: string, overrides: Record<string, string> = {}) => ({
  dateStatus: 'pending',
  title,
  description: '故事文案待補',
  majorEvent: 'false',
  color: 'blue',
  ...overrides,
})

function weddingModules(overrides: Partial<Record<string, ContentBlock>> = {}): ContentBlock[] {
  const defaults: Record<string, ContentBlock> = {
    highlights: toggle('highlights', [
      record('story-timeline', highlightFields('故事時間軸', 'book')),
      record('bullet-engine', highlightFields('賓客祝福彈幕', 'chat')),
    ]),
    previews: toggle('previews', [
      record('site-desktop', previewFields('/images/wedding-site-desktop.png', '婚禮網站首頁')),
      record('site-mobile', previewFields('/images/wedding-site-mobile.png')),
      record('bullet-engine', previewFields('/images/bullet-engine-preview.png', '彈幕預覽')),
    ]),
    'bullet-notes': toggle('bullet-notes', [
      table({ demoOnly: '僅供展示（Demo-only）。', tech: '每條軌道一次只播一則。' }),
      toggle('usage', [bullet('上限 {maxLength} 字，間隔 {throttleSeconds} 秒。'), bullet('{demoOnly}')]),
    ]),
    'default-wishes': toggle('default-wishes', [bullet('祝福新人百年好合！'), bullet('新婚快樂～')]),
    'story-events': toggle('story-events', [
      record('meeting', eventFields('相識')),
      record('dating', eventFields('交往', { color: 'pink' })),
      record('proposal', eventFields('求婚', { majorEvent: 'true', color: 'pink' })),
      record('wedding', eventFields('婚禮', { majorEvent: 'true' })),
    ]),
  }
  return Object.entries({ ...defaults, ...overrides }).map(([, block]) => block as ContentBlock)
}

function weddingPage(modules = weddingModules(), extraTopLevel: ContentBlock[] = []): ContentBlock[] {
  return [paragraph('區塊外的私人筆記'), toggle('website-content:v1', modules), ...extraTopLevel]
}

const options = { pageId: 'page-wedding', slug: 'wedding', assetExists: () => true }

function issuesOf(fn: () => unknown): string[] {
  try {
    fn()
  } catch (error) {
    if (error instanceof ProjectContentError) return error.issues
    throw error
  }
  throw new Error('預期要拋出 ProjectContentError')
}

describe('parseProjectPageContent — wedding 契約', () => {
  it('完整的 website-content:v1 解析成型別安全的婚禮內容,並依區塊順序排序', () => {
    const content = parseProjectPageContent(weddingPage(), options)
    expect(content).toMatchObject({ contract: 'wedding', pageId: 'page-wedding', slug: 'wedding', schemaVersion: 'v1' })
    if (content?.contract !== 'wedding') throw new Error('契約錯誤')
    expect(content.highlights.map((h) => h.slug)).toEqual(['story-timeline', 'bullet-engine'])
    expect(content.highlights[1]).toEqual({ slug: 'bullet-engine', title: '賓客祝福彈幕', summary: '賓客祝福彈幕摘要', intro: '賓客祝福彈幕簡介', icon: 'chat' })
    expect(content.previews.map((p) => p.key)).toEqual(['site-desktop', 'site-mobile', 'bullet-engine'])
    expect(content.previews[1].caption).toBe('')
    expect(content.bulletNotes).toEqual({
      demoOnly: '僅供展示（Demo-only）。',
      tech: '每條軌道一次只播一則。',
      usage: ['上限 {maxLength} 字，間隔 {throttleSeconds} 秒。', '{demoOnly}'],
    })
    expect(content.defaultWishes).toEqual(['祝福新人百年好合！', '新婚快樂～'])
    expect(content.storyEvents.map((e) => e.key)).toEqual(['meeting', 'dating', 'proposal', 'wedding'])
    expect(content.storyEvents[2]).toMatchObject({ dateStatus: 'pending', year: '', month: '', majorEvent: true, color: 'pink', imagePath: '' })
  })

  it('區塊外的筆記不會進入解析結果', () => {
    const content = parseProjectPageContent(weddingPage(weddingModules(), [paragraph('另一段筆記'), toggle('備忘', [bullet('x')])]), options)
    expect(JSON.stringify(content)).not.toContain('筆記')
    expect(JSON.stringify(content)).not.toContain('備忘')
  })

  it('rich_text 多片段與換行會合併保留', () => {
    const modules = weddingModules({
      'bullet-notes': toggle('bullet-notes', [
        table({ demoOnly: 'x' }, [row('tech', [{ plain_text: '第一段\n' }, { plain_text: '第二段' }])]),
        toggle('usage', [bullet('{demoOnly}')]),
      ]),
    })
    const content = parseProjectPageContent(weddingPage(modules), options)
    expect(content?.contract === 'wedding' && content.bulletNotes.tech).toBe('第一段\n第二段')
  })

  it('confirmed 事件會正規化 month,並接受有 imageAlt 的靜態照片', () => {
    const modules = weddingModules({
      'story-events': toggle('story-events', [
        record('meeting', eventFields('相識', { dateStatus: 'confirmed', year: '2019', month: '03', imagePath: '/images/story/meeting.jpg', imageAlt: '相識合照' })),
        record('dating', eventFields('交往')),
        record('proposal', eventFields('求婚')),
        record('wedding', eventFields('婚禮')),
      ]),
    })
    const content = parseProjectPageContent(weddingPage(modules), options)
    expect(content?.contract === 'wedding' && content.storyEvents[0]).toMatchObject({ year: '2019', month: '3', imagePath: '/images/story/meeting.jpg', imageAlt: '相識合照' })
  })

  it('缺少根 Toggle 時,wedding 契約要求中止而不是視為無客製內容', () => {
    expect(issuesOf(() => parseProjectPageContent([paragraph('沒有內容')], options))).toEqual(['缺少必需的 website-content:v1 根 Toggle'])
  })

  it('根 Toggle 重複或版本不支援都回報', () => {
    expect(issuesOf(() => parseProjectPageContent([toggle('website-content:v1'), toggle('website-content:v1')], options))[0]).toContain('根 Toggle 必須唯一')
    expect(issuesOf(() => parseProjectPageContent([toggle('website-content:v2', weddingModules())], options))[0]).toContain('不支援的內容版本')
  })

  it('缺少必要模組、未知模組與重複模組都回報,不靜默略過', () => {
    const modules = weddingModules()
    modules.pop()
    const issues = issuesOf(() => parseProjectPageContent(weddingPage([...modules, toggle('extra-module'), toggle('highlights')]), options))
    expect(issues).toEqual(expect.arrayContaining([
      expect.stringContaining('缺少必要模組「story-events」'),
      expect.stringContaining('未知模組「extra-module」'),
      expect.stringContaining('模組「highlights」重複'),
    ]))
  })

  it('記錄欄位:缺漏必填、未知欄位、重複欄位、非法 icon 各自回報', () => {
    const modules = weddingModules({
      highlights: toggle('highlights', [
        toggle('story-timeline', [table({ title: '故事', summary: 's', intro: 'i', icon: 'star', extra: 'x' }, [row('title', '重複')])]),
        record('bullet-engine', { title: '彈幕', icon: 'chat' }),
      ]),
    })
    const issues = issuesOf(() => parseProjectPageContent(weddingPage(modules), options))
    expect(issues).toEqual(expect.arrayContaining([
      expect.stringContaining('欄位「title」重複'),
      expect.stringContaining('未知欄位「extra」'),
      expect.stringContaining('icon 只能是 book/chat'),
      expect.stringContaining('highlights/bullet-engine:缺少必填欄位「summary」'),
      expect.stringContaining('highlights/bullet-engine:缺少必填欄位「intro」'),
    ]))
  })

  it('亮點識別鍵必須正好是已有子頁路由的 story-timeline、bullet-engine(集合比對)', () => {
    const modules = weddingModules({
      highlights: toggle('highlights', [record('story-timeline', highlightFields('a')), record('new-feature', highlightFields('b'))]),
    })
    const issues = issuesOf(() => parseProjectPageContent(weddingPage(modules), options))
    expect(issues).toEqual([expect.stringContaining('缺少記錄 bullet-engine'), expect.stringContaining('不允許的記錄 new-feature')])
  })

  it('亮點與預覽依 Notion 區塊順序呈現,對調兩筆不會報錯', () => {
    const modules = weddingModules({
      highlights: toggle('highlights', [record('bullet-engine', highlightFields('彈幕', 'chat')), record('story-timeline', highlightFields('故事'))]),
      previews: toggle('previews', [
        record('bullet-engine', previewFields('/images/bullet-engine-preview.png')),
        record('site-mobile', previewFields('/images/wedding-site-mobile.png')),
        record('site-desktop', previewFields('/images/wedding-site-desktop.png')),
      ]),
    })
    const content = parseProjectPageContent(weddingPage(modules), options)
    if (content?.contract !== 'wedding') throw new Error()
    expect(content.highlights.map((h) => h.slug)).toEqual(['bullet-engine', 'story-timeline'])
    expect(content.previews.map((p) => p.key)).toEqual(['bullet-engine', 'site-mobile', 'site-desktop'])
  })

  it('條列項目底下的巢狀內容不支援,要指出位置而不是靜默丟棄', () => {
    const nested = { ...bullet('新婚快樂'), has_children: true, children: [paragraph('藏在底下的補充')] }
    const modules = weddingModules({ 'default-wishes': toggle('default-wishes', [bullet('祝福'), nested]) })
    const issues = issuesOf(() => parseProjectPageContent(weddingPage(modules), options))
    expect(issues).toEqual([expect.stringContaining('default-wishes:條列項目「新婚快樂」底下有巢狀內容')])
  })

  it('錯誤區塊形態:表格缺首列、非兩欄、模組內出現段落都回報', () => {
    const badTable: ContentBlock = { id: 't', type: 'table', table: { table_width: 3, has_column_header: true }, children: [row('key', 'value')] }
    const noHeader: ContentBlock = { id: 't2', type: 'table', table: { table_width: 2, has_column_header: true }, children: [row('title', 'x')] }
    const modules = weddingModules({
      highlights: toggle('highlights', [toggle('story-timeline', [badTable]), toggle('bullet-engine', [noHeader])]),
      'default-wishes': toggle('default-wishes', [paragraph('不是條列'), bullet('')]),
    })
    const issues = issuesOf(() => parseProjectPageContent(weddingPage(modules), options))
    expect(issues).toEqual(expect.arrayContaining([
      expect.stringContaining('簡單表格必須是兩欄'),
      expect.stringContaining('表格首列必須是 key / value'),
      expect.stringContaining('列表只接受條列項目,不允許 paragraph'),
      expect.stringContaining('列表有空白項目'),
    ]))
  })

  it('空白列表與缺少 usage 子 Toggle 都回報', () => {
    const modules = weddingModules({
      'default-wishes': toggle('default-wishes', []),
      'bullet-notes': toggle('bullet-notes', [table({ demoOnly: 'x', tech: 'y' })]),
    })
    const issues = issuesOf(() => parseProjectPageContent(weddingPage(modules), options))
    expect(issues).toEqual(expect.arrayContaining([
      expect.stringContaining('default-wishes:列表至少要有一筆'),
      expect.stringContaining('需要恰好一個名為 usage 的子 Toggle'),
    ]))
  })

  it('使用說明的未知占位鍵視為格式錯誤', () => {
    const modules = weddingModules({
      'bullet-notes': toggle('bullet-notes', [table({ demoOnly: 'x', tech: 'y' }), toggle('usage', [bullet('上限 {max} 字')])]),
    })
    expect(issuesOf(() => parseProjectPageContent(weddingPage(modules), options))[0]).toContain('未知占位鍵「{max}」')
  })

  it('story-events:非法 dateStatus/boolean/color、pending 卻填日期、confirmed 日期格式錯誤、照片缺 alt 都回報', () => {
    const modules = weddingModules({
      'story-events': toggle('story-events', [
        record('meeting', eventFields('相識', { dateStatus: 'maybe', majorEvent: 'yes', color: 'gray' })),
        record('dating', eventFields('交往', { year: '2020' })),
        record('proposal', eventFields('求婚', { dateStatus: 'confirmed', year: '20', month: '13' })),
        record('wedding', eventFields('婚禮', { imagePath: '/images/story/wedding.jpg' })),
      ]),
    })
    const issues = issuesOf(() => parseProjectPageContent(weddingPage(modules), options))
    expect(issues).toEqual(expect.arrayContaining([
      expect.stringContaining('dateStatus 只能是 pending/confirmed'),
      expect.stringContaining('majorEvent 只能是 true/false'),
      expect.stringContaining('color 只能是 blue/pink'),
      expect.stringContaining('pending 時 year/month 必須留空'),
      expect.stringContaining('year 必須是四位數'),
      expect.stringContaining('month 必須是 1–12'),
      expect.stringContaining('imagePath 非空時必須提供 imageAlt'),
    ]))
  })

  it('事件順序必須維持相識→交往→求婚→婚禮', () => {
    const modules = weddingModules({
      'story-events': toggle('story-events', [record('wedding', eventFields('婚禮')), record('meeting', eventFields('相識')), record('dating', eventFields('交往')), record('proposal', eventFields('求婚'))]),
    })
    expect(issuesOf(() => parseProjectPageContent(weddingPage(modules), options))[0]).toContain('記錄必須依序為 meeting、dating、proposal、wedding')
  })

  it('靜態路徑限制:非 /images/ 路徑、路徑穿越、遠端網址、不存在的檔案都回報', () => {
    const modules = weddingModules({
      previews: toggle('previews', [
        record('site-desktop', previewFields('https://notion.so/signed.png')),
        record('site-mobile', previewFields('/images/../secret.png')),
        record('bullet-engine', previewFields('/images/missing.png')),
      ]),
    })
    const issues = issuesOf(() => parseProjectPageContent(weddingPage(modules), { ...options, assetExists: (p) => p !== '/images/missing.png' }))
    expect(issues).toEqual([
      expect.stringContaining('「https://notion.so/signed.png」不是 /images/ 下的穩定靜態路徑'),
      expect.stringContaining('「/images/../secret.png」不是 /images/ 下的穩定靜態路徑'),
      expect.stringContaining('找不到靜態檔案 public/images/missing.png'),
    ])
  })
})

describe('parseProjectPageContent — 多專案契約隔離', () => {
  it('沒有根 Toggle 的非婚禮專案視為無客製內容,回傳 null', () => {
    expect(parseProjectPageContent([paragraph('只有筆記')], { pageId: 'p2', slug: 'other-project' })).toBeNull()
  })

  it('非婚禮專案有空的根 Toggle 時得到 generic 內容,不被迫提供婚禮欄位', () => {
    const content = parseProjectPageContent([toggle('website-content:v1')], { pageId: 'p2', slug: 'other-project' })
    expect(content).toEqual({ contract: 'generic', schemaVersion: 'v1', pageId: 'p2', slug: 'other-project', highlights: [], previews: [] })
  })

  it('非婚禮專案若填了婚禮模組,視為未註冊模組而中止,不會套用婚禮模型', () => {
    const issues = issuesOf(() => parseProjectPageContent([toggle('website-content:v1', weddingModules())], { pageId: 'p2', slug: 'other-project' }))
    expect(issues).toHaveLength(5)
    expect(issues[0]).toContain('未知模組「highlights」,此專案尚未註冊任何內容模組')
  })

  it('測試專用契約可以註冊自己的模組,解析結果只屬於該 slug', () => {
    type FixtureContent = ProjectPageContentBase & { contract: 'fixture'; featureNotes: string[] }
    const fixtureContract: ProjectContentContract<FixtureContent> = {
      rootRequired: true,
      parse(modules, ctx, base) {
        const notes = modules.get('feature-notes')
        if (!notes) {
          ctx.issues.push('feature-notes:缺少')
          return undefined
        }
        return { ...base, contract: 'fixture', featureNotes: (notes.children ?? []).map((b) => b.bulleted_list_item?.rich_text[0]?.plain_text ?? '') }
      },
    }
    const contracts = { fixture: fixtureContract }
    const content = parseProjectPageContent<FixtureContent>(
      [toggle('website-content:v1', [toggle('feature-notes', [bullet('功能一'), bullet('功能二')])])],
      { pageId: 'p3', slug: 'fixture', contracts },
    )
    expect(content).toMatchObject({ contract: 'fixture', slug: 'fixture', featureNotes: ['功能一', '功能二'] })

    // 同一份區塊若掛在 wedding slug 底下,會因缺少婚禮模組而中止,證明資料不會串到別的專案。
    expect(() =>
      parseProjectPageContent([toggle('website-content:v1', [toggle('feature-notes', [bullet('功能一')])])], { pageId: 'p3', slug: 'wedding', contracts }),
    ).toThrow(ProjectContentError)
  })
})

describe('fillUsagePlaceholders / toStoryItems', () => {
  it('以程式參數注入占位鍵,未列入的大括號文字原樣保留', () => {
    expect(fillUsagePlaceholders('上限 {maxLength} 字，間隔 {throttleSeconds} 秒。{demoOnly} {other}', { maxLength: 30, throttleSeconds: 1.5, demoOnly: '僅供展示' })).toBe(
      '上限 30 字，間隔 1.5 秒。僅供展示 {other}',
    )
  })

  it('pending 事件顯示「待確認」且不帶月份;confirmed 事件照實輸出,照片與 alt 一併帶出', () => {
    const stories = toStoryItems([
      { key: 'meeting', dateStatus: 'pending', year: '', month: '', title: '相識', description: '待補', majorEvent: false, color: 'blue', imagePath: '', imageAlt: '' },
      { key: 'wedding', dateStatus: 'confirmed', year: '2024', month: '10', title: '婚禮', description: '正文', majorEvent: true, color: 'pink', imagePath: '/images/story/wedding.jpg', imageAlt: '婚禮合照' },
    ])
    expect(stories[0]).toEqual({ year: '待確認', month: '', title: '相識', description: '待補', photo: undefined, photoAlt: undefined, majorEvent: false, color: 'blue' })
    expect(stories[1]).toEqual({ year: '2024', month: '10', title: '婚禮', description: '正文', photo: '/images/story/wedding.jpg', photoAlt: '婚禮合照', majorEvent: true, color: 'pink' })
  })
})

describe('validateProjectPageBackup', () => {
  const validBackup = () => ({
    schemaVersion: 'v1',
    pageId: 'page-wedding',
    slug: 'wedding',
    fetchedAt: '2026-10-06T00:00:00.000Z',
    content: parseProjectPageContent(weddingPage(), options),
  })
  const opts = { pageId: 'page-wedding', slug: 'wedding' }

  it('完整的 wedding 備份通過驗證', () => {
    expect(validateProjectPageBackup(validBackup(), opts)).toEqual([])
  })

  it('正文只有 contract 標記的半份備份不被接受', () => {
    const backup = { ...validBackup(), content: { contract: 'wedding' } }
    const issues = validateProjectPageBackup(backup, opts)
    expect(issues).toEqual(expect.arrayContaining([
      expect.stringContaining('content 的 pageId/slug/schemaVersion'),
      expect.stringContaining('highlights 必須是陣列'),
      expect.stringContaining('previews 必須是陣列'),
      expect.stringContaining('bulletNotes 必須含'),
      expect.stringContaining('defaultWishes 必須是'),
      expect.stringContaining('storyEvents 必須是陣列'),
    ]))
  })

  it('外層 pageId/slug/版本不符、契約不符與靜態素材不存在都回報', () => {
    const backup = validBackup()
    expect(validateProjectPageBackup({ ...backup, slug: 'renamed' }, opts)).toContain('slug 與專案不符')
    expect(validateProjectPageBackup({ ...backup, schemaVersion: 'v2' }, opts)[0]).toContain('schemaVersion 必須是 v1')
    expect(validateProjectPageBackup({ ...backup, content: { ...backup.content, contract: 'generic' } }, opts)[0]).toContain('content.contract 必須是 wedding')
    expect(validateProjectPageBackup(backup, { ...opts, assetExists: (p) => !p.includes('mobile') })).toEqual([
      expect.stringContaining('previews/site-mobile 的靜態檔案 /images/wedding-site-mobile.png 不可用'),
    ])
  })

  it('缺少必要亮點或事件順序錯誤的備份不被接受', () => {
    const backup = validBackup()
    if (backup.content?.contract !== 'wedding') throw new Error()
    const missingHighlight = { ...backup, content: { ...backup.content, highlights: backup.content.highlights.slice(0, 1) } }
    expect(validateProjectPageBackup(missingHighlight, opts)).toEqual([expect.stringContaining('highlights 必須正好包含')])
    const reordered = { ...backup, content: { ...backup.content, storyEvents: [...backup.content.storyEvents].reverse() } }
    expect(validateProjectPageBackup(reordered, opts)).toEqual([expect.stringContaining('storyEvents 必須依序為')])
  })

  it('事件日期沿用解析器規則:confirmed 的非法 year/month、pending 卻填日期、未正規化 month 都拒絕', () => {
    const backup = validBackup()
    const content = backup.content
    if (content?.contract !== 'wedding') throw new Error()
    const withEvent = (patch: Record<string, string>) => ({
      ...backup,
      content: { ...content, storyEvents: content.storyEvents.map((e: WeddingStoryEvent, i: number) => (i === 0 ? { ...e, ...patch } : e)) },
    })
    expect(validateProjectPageBackup(withEvent({ dateStatus: 'confirmed', year: 'not-a-year', month: '99' }), opts)).toEqual([
      expect.stringMatching(/storyEvents\/meeting 日期不合法:.*year 必須是四位數.*month 必須是 1–12/),
    ])
    expect(validateProjectPageBackup(withEvent({ year: '2020', month: '1' }), opts)).toEqual([expect.stringContaining('pending 時 year/month 必須留空')])
    expect(validateProjectPageBackup(withEvent({ dateStatus: 'confirmed', year: '2020', month: '03' }), opts)).toEqual([expect.stringContaining('month 未正規化')])
    expect(validateProjectPageBackup(withEvent({ dateStatus: 'confirmed', year: '2020', month: '3' }), opts)).toEqual([])
  })

  it('highlights/previews 追加重複記錄會被拒絕,但自由排序仍接受', () => {
    const backup = validBackup()
    if (backup.content?.contract !== 'wedding') throw new Error()
    const dupHighlight = { ...backup, content: { ...backup.content, highlights: [...backup.content.highlights, backup.content.highlights[0]] } }
    expect(validateProjectPageBackup(dupHighlight, opts)).toEqual([
      expect.stringContaining('highlights 有重複記錄 story-timeline'),
      expect.stringContaining('highlights 必須正好包含'),
    ])
    const dupPreview = { ...backup, content: { ...backup.content, previews: [...backup.content.previews, backup.content.previews[2]] } }
    expect(validateProjectPageBackup(dupPreview, opts)).toEqual([
      expect.stringContaining('previews 有重複記錄 bullet-engine'),
      expect.stringContaining('previews 必須正好包含'),
    ])
    const reordered = {
      ...backup,
      content: { ...backup.content, highlights: [...backup.content.highlights].reverse(), previews: [...backup.content.previews].reverse() },
    }
    expect(validateProjectPageBackup(reordered, opts)).toEqual([])
  })

  it('generic 專案的備份只接受空的 highlights/previews', () => {
    const base = { schemaVersion: 'v1', pageId: 'p2', slug: 'other', fetchedAt: 'x' }
    const content = { contract: 'generic', schemaVersion: 'v1', pageId: 'p2', slug: 'other', highlights: [], previews: [] }
    expect(validateProjectPageBackup({ ...base, content }, { pageId: 'p2', slug: 'other' })).toEqual([])
    expect(validateProjectPageBackup({ ...base, content: { ...content, highlights: [{}] } }, { pageId: 'p2', slug: 'other' })).toEqual([expect.stringContaining('generic 契約')])
  })
})
