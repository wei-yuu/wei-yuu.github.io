import type {
  ContentBlock,
  GenericProjectPageContent,
  NotionRichTextFragment,
  ProjectHighlight,
  ProjectPageContent,
  ProjectPageContentBase,
  ProjectPreview,
  WeddingBulletNotes,
  WeddingPageContent,
  WeddingStoryEvent,
} from '../types/projectContent'
import { PROJECT_CONTENT_ROOT, PROJECT_CONTENT_SCHEMA_VERSION } from '../types/projectContent'
import type { Story } from '../types/story'

// SRS §3.2 的純函式解析器:輸入已含 children 的區塊樹,輸出型別安全的頁面內容。
// 不碰網路與檔案系統;靜態檔案是否存在交由呼叫端以 assetExists 注入判斷。
// 任何格式問題都收集後一次拋出,不靜默略過,也不回傳半份資料。

export class ProjectContentError extends Error {
  constructor(
    readonly pageId: string,
    readonly slug: string,
    readonly issues: string[],
  ) {
    super(`[Project Content] ${slug}(${pageId}) 的 ${PROJECT_CONTENT_ROOT} 格式錯誤:\n- ${issues.join('\n- ')}`)
    this.name = 'ProjectContentError'
  }
}

interface ParseContext {
  issues: string[]
  assetExists: (assetPath: string) => boolean
}

type ModuleMap = Map<string, ContentBlock>

export interface ProjectContentContract<T extends ProjectPageContentBase & { contract: string }> {
  // 已排程客製內容的專案缺少根 Toggle 要中止發布;其他專案視為沒有客製內容。
  rootRequired: boolean
  parse(modules: ModuleMap, ctx: ParseContext, base: ProjectPageContentBase): T | undefined
}

const ROOT_PATTERN = /^website-content:v(\d+)$/
const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const ASSET_PATH = /^\/images\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.(?:png|jpe?g|webp|avif|svg)$/
const USAGE_PLACEHOLDERS = ['maxLength', 'throttleSeconds', 'demoOnly'] as const
const HIGHLIGHT_ICONS = ['book', 'chat'] as const

function plainText(fragments: NotionRichTextFragment[] | undefined): string {
  return (fragments ?? []).map((fragment) => fragment.plain_text).join('')
}

function blockTitle(block: ContentBlock): string {
  if (block.type === 'toggle') return plainText(block.toggle?.rich_text).trim()
  if (block.type === 'bulleted_list_item') return plainText(block.bulleted_list_item?.rich_text).trim()
  return ''
}

function fail(ctx: ParseContext, path: string, message: string) {
  ctx.issues.push(`${path}:${message}`)
}

export function findContentRoot(blocks: ContentBlock[], ctx: ParseContext): ContentBlock | null {
  const roots: ContentBlock[] = []
  for (const block of blocks) {
    if (block.type !== 'toggle') continue
    const match = blockTitle(block).match(ROOT_PATTERN)
    if (!match) continue
    if (match[1] !== '1') {
      fail(ctx, blockTitle(block), '不支援的內容版本,目前只接受 website-content:v1')
      continue
    }
    roots.push(block)
  }
  if (roots.length > 1) {
    fail(ctx, PROJECT_CONTENT_ROOT, `根 Toggle 必須唯一,目前有 ${roots.length} 個`)
    return null
  }
  return roots[0] ?? null
}

function parseModuleMap(root: ContentBlock, ctx: ParseContext): ModuleMap {
  const modules: ModuleMap = new Map()
  for (const child of root.children ?? []) {
    if (child.type !== 'toggle') {
      fail(ctx, PROJECT_CONTENT_ROOT, `模組只能是 Toggle,不允許 ${child.type} 區塊`)
      continue
    }
    const key = blockTitle(child)
    if (!KEBAB_CASE.test(key)) {
      fail(ctx, PROJECT_CONTENT_ROOT, `模組鍵「${key}」必須是 kebab-case`)
      continue
    }
    if (modules.has(key)) {
      fail(ctx, PROJECT_CONTENT_ROOT, `模組「${key}」重複`)
      continue
    }
    modules.set(key, child)
  }
  return modules
}

interface TableOptions {
  // bullet-notes 這類模組除了表格還允許直接子 Toggle(usage)。
  allowChildToggles?: boolean
}

function parseKeyValueTable(
  block: ContentBlock,
  ctx: ParseContext,
  path: string,
  options: TableOptions = {},
): Record<string, string> | undefined {
  const tables: ContentBlock[] = []
  for (const child of block.children ?? []) {
    if (child.type === 'table') tables.push(child)
    else if (!(options.allowChildToggles && child.type === 'toggle')) {
      fail(ctx, path, `不允許 ${child.type} 區塊,只接受 key/value 簡單表格`)
    }
  }
  if (tables.length !== 1) {
    fail(ctx, path, `需要恰好一張 key/value 簡單表格,目前有 ${tables.length} 張`)
    return undefined
  }
  const table = tables[0]
  if (table.table?.table_width !== 2) {
    fail(ctx, path, '簡單表格必須是兩欄(key/value)')
    return undefined
  }
  const rows = table.children ?? []
  const header = rows[0]
  const headerCells = header?.table_row?.cells ?? []
  if (
    header?.type !== 'table_row' ||
    plainText(headerCells[0]).trim() !== 'key' ||
    plainText(headerCells[1]).trim() !== 'value'
  ) {
    fail(ctx, path, '表格首列必須是 key / value')
    return undefined
  }
  const fields: Record<string, string> = {}
  for (const row of rows.slice(1)) {
    if (row.type !== 'table_row') {
      fail(ctx, path, `表格內出現非 table_row 的 ${row.type} 區塊`)
      continue
    }
    const cells = row.table_row?.cells ?? []
    const key = plainText(cells[0]).trim()
    if (!key) {
      fail(ctx, path, '表格有空白的欄位名稱')
      continue
    }
    if (key in fields) {
      fail(ctx, path, `欄位「${key}」重複`)
      continue
    }
    fields[key] = plainText(cells[1]).trim()
  }
  return fields
}

function expectFields(
  fields: Record<string, string>,
  ctx: ParseContext,
  path: string,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  let ok = true
  for (const key of Object.keys(fields)) {
    if (!required.includes(key) && !optional.includes(key)) {
      fail(ctx, path, `未知欄位「${key}」`)
      ok = false
    }
  }
  for (const key of required) {
    if (!fields[key]) {
      fail(ctx, path, `缺少必填欄位「${key}」`)
      ok = false
    }
  }
  return ok
}

function parseStringList(block: ContentBlock, ctx: ParseContext, path: string): string[] | undefined {
  const items: string[] = []
  let ok = true
  for (const child of block.children ?? []) {
    if (child.type !== 'bulleted_list_item') {
      fail(ctx, path, `列表只接受條列項目,不允許 ${child.type} 區塊`)
      ok = false
      continue
    }
    const text = blockTitle(child)
    if (!text) {
      fail(ctx, path, '列表有空白項目')
      ok = false
      continue
    }
    if (child.has_children || child.children?.length) {
      fail(ctx, path, `條列項目「${text}」底下有巢狀內容,v1 不支援,請移除或改成獨立項目`)
      ok = false
      continue
    }
    items.push(text)
  }
  if (ok && items.length === 0) {
    fail(ctx, path, '列表至少要有一筆')
    ok = false
  }
  return ok ? items : undefined
}

interface RecordEntry {
  key: string
  fields: Record<string, string>
}

function parseRecords(block: ContentBlock, ctx: ParseContext, path: string): RecordEntry[] | undefined {
  const records: RecordEntry[] = []
  const seen = new Set<string>()
  let ok = true
  for (const child of block.children ?? []) {
    if (child.type !== 'toggle') {
      fail(ctx, path, `記錄只能是 Toggle,不允許 ${child.type} 區塊`)
      ok = false
      continue
    }
    const key = blockTitle(child)
    if (!KEBAB_CASE.test(key)) {
      fail(ctx, path, `記錄識別鍵「${key}」必須是 kebab-case`)
      ok = false
      continue
    }
    if (seen.has(key)) {
      fail(ctx, path, `記錄「${key}」重複`)
      ok = false
      continue
    }
    seen.add(key)
    const fields = parseKeyValueTable(child, ctx, `${path}/${key}`)
    if (!fields) {
      ok = false
      continue
    }
    records.push({ key, fields })
  }
  return ok ? records : undefined
}

function expectRecordKeys(records: RecordEntry[], ctx: ParseContext, path: string, expected: readonly string[]): boolean {
  const actual = records.map((record) => record.key)
  if (actual.length === expected.length && actual.every((key, index) => key === expected[index])) return true
  fail(ctx, path, `記錄必須依序為 ${expected.join('、')},目前是 ${actual.join('、') || '(空)'}`)
  return false
}

// 集合比對、保留 Notion 區塊順序:亮點/預覽的順序由編輯者決定。
function expectRecordKeySet(records: RecordEntry[], ctx: ParseContext, path: string, expected: readonly string[]): boolean {
  const actual = records.map((record) => record.key)
  const missing = expected.filter((key) => !actual.includes(key))
  const extra = actual.filter((key) => !expected.includes(key))
  if (missing.length === 0 && extra.length === 0) return true
  if (missing.length) fail(ctx, path, `缺少記錄 ${missing.join('、')}`)
  if (extra.length) fail(ctx, path, `不允許的記錄 ${extra.join('、')},只接受 ${expected.join('、')}`)
  return false
}

function validateAssetPath(value: string, ctx: ParseContext, path: string): boolean {
  if (!ASSET_PATH.test(value)) {
    fail(ctx, path, `「${value}」不是 /images/ 下的穩定靜態路徑`)
    return false
  }
  if (!ctx.assetExists(value)) {
    fail(ctx, path, `找不到靜態檔案 public${value}`)
    return false
  }
  return true
}

function parseHighlights(
  block: ContentBlock,
  ctx: ParseContext,
  allowedSlugs: readonly string[],
): ProjectHighlight[] | undefined {
  const path = 'highlights'
  const records = parseRecords(block, ctx, path)
  if (!records || !expectRecordKeySet(records, ctx, path, allowedSlugs)) return undefined
  const highlights: ProjectHighlight[] = []
  for (const { key, fields } of records) {
    const recordPath = `${path}/${key}`
    let ok = expectFields(fields, ctx, recordPath, ['title', 'summary', 'intro', 'icon'])
    if (fields.icon && !(HIGHLIGHT_ICONS as readonly string[]).includes(fields.icon)) {
      fail(ctx, recordPath, `icon 只能是 ${HIGHLIGHT_ICONS.join('/')},目前是「${fields.icon}」`)
      ok = false
    }
    if (!ok) continue
    highlights.push({
      slug: key,
      title: fields.title,
      summary: fields.summary,
      intro: fields.intro,
      icon: fields.icon as ProjectHighlight['icon'],
    })
  }
  return highlights.length === records.length ? highlights : undefined
}

function parsePreviews(
  block: ContentBlock,
  ctx: ParseContext,
  expectedKeys: readonly string[],
): ProjectPreview[] | undefined {
  const path = 'previews'
  const records = parseRecords(block, ctx, path)
  if (!records || !expectRecordKeySet(records, ctx, path, expectedKeys)) return undefined
  const previews: ProjectPreview[] = []
  for (const { key, fields } of records) {
    const recordPath = `${path}/${key}`
    if (!expectFields(fields, ctx, recordPath, ['assetPath', 'alt'], ['caption'])) continue
    if (!validateAssetPath(fields.assetPath, ctx, `${recordPath}/assetPath`)) continue
    previews.push({ key, assetPath: fields.assetPath, alt: fields.alt, caption: fields.caption ?? '' })
  }
  return previews.length === records.length ? previews : undefined
}

function validateUsagePlaceholders(notes: string[], ctx: ParseContext, path: string): boolean {
  let ok = true
  for (const note of notes) {
    for (const match of note.matchAll(/\{([^{}]*)\}/g)) {
      if (!(USAGE_PLACEHOLDERS as readonly string[]).includes(match[1])) {
        fail(ctx, path, `未知占位鍵「{${match[1]}}」,只允許 ${USAGE_PLACEHOLDERS.map((k) => `{${k}}`).join('/')}`)
        ok = false
      }
    }
  }
  return ok
}

function parseBulletNotes(block: ContentBlock, ctx: ParseContext): WeddingBulletNotes | undefined {
  const path = 'bullet-notes'
  const fields = parseKeyValueTable(block, ctx, path, { allowChildToggles: true })
  const toggles = (block.children ?? []).filter((child) => child.type === 'toggle')
  const usageBlock = toggles.length === 1 && blockTitle(toggles[0]) === 'usage' ? toggles[0] : undefined
  if (!usageBlock) {
    fail(ctx, path, '需要恰好一個名為 usage 的子 Toggle')
  }
  if (!fields || !usageBlock) return undefined
  if (!expectFields(fields, ctx, path, ['demoOnly', 'tech'])) return undefined
  const usage = parseStringList(usageBlock, ctx, `${path}/usage`)
  if (!usage || !validateUsagePlaceholders(usage, ctx, `${path}/usage`)) return undefined
  return { demoOnly: fields.demoOnly, tech: fields.tech, usage }
}

const STORY_EVENT_KEYS = ['meeting', 'dating', 'proposal', 'wedding'] as const
const STORY_EVENT_FIELDS = ['dateStatus', 'title', 'description', 'majorEvent', 'color'] as const
const STORY_EVENT_OPTIONAL_FIELDS = ['year', 'month', 'imagePath', 'imageAlt'] as const

// 解析器與備份驗證共用同一套日期規則。回傳問題清單與正規化後的 month。
export function checkStoryDate(dateStatus: string, year: string, month: string): { issues: string[]; month: string } {
  const issues: string[] = []
  if (dateStatus !== 'pending' && dateStatus !== 'confirmed') {
    issues.push(`dateStatus 只能是 pending/confirmed,目前是「${dateStatus}」`)
    return { issues, month }
  }
  if (dateStatus === 'pending') {
    if (year || month) issues.push('dateStatus 為 pending 時 year/month 必須留空')
    return { issues, month }
  }
  if (!/^\d{4}$/.test(year)) issues.push(`confirmed 的 year 必須是四位數,目前是「${year}」`)
  const monthNumber = /^\d{1,2}$/.test(month) ? Number(month) : NaN
  if (!(monthNumber >= 1 && monthNumber <= 12)) {
    issues.push(`confirmed 的 month 必須是 1–12,目前是「${month}」`)
    return { issues, month }
  }
  return { issues, month: String(monthNumber) }
}

function parseStoryEvent(record: RecordEntry, ctx: ParseContext): WeddingStoryEvent | undefined {
  const path = `story-events/${record.key}`
  const f = record.fields
  if (!expectFields(f, ctx, path, STORY_EVENT_FIELDS, STORY_EVENT_OPTIONAL_FIELDS)) return undefined
  let ok = true

  const year = f.year ?? ''
  const date = checkStoryDate(f.dateStatus, year, f.month ?? '')
  for (const issue of date.issues) fail(ctx, path, issue)
  if (date.issues.length) ok = false
  const month = date.month
  if (f.majorEvent !== 'true' && f.majorEvent !== 'false') {
    fail(ctx, path, `majorEvent 只能是 true/false,目前是「${f.majorEvent}」`)
    ok = false
  }
  if (f.color !== 'blue' && f.color !== 'pink') {
    fail(ctx, path, `color 只能是 blue/pink,目前是「${f.color}」`)
    ok = false
  }
  const imagePath = f.imagePath ?? ''
  const imageAlt = f.imageAlt ?? ''
  if (imagePath) {
    if (!validateAssetPath(imagePath, ctx, `${path}/imagePath`)) ok = false
    if (!imageAlt) {
      fail(ctx, path, 'imagePath 非空時必須提供 imageAlt')
      ok = false
    }
  }
  if (!ok) return undefined
  return {
    key: record.key,
    dateStatus: f.dateStatus as WeddingStoryEvent['dateStatus'],
    year,
    month,
    title: f.title,
    description: f.description,
    majorEvent: f.majorEvent === 'true',
    color: f.color as WeddingStoryEvent['color'],
    imagePath,
    imageAlt,
  }
}

function parseStoryEvents(block: ContentBlock, ctx: ParseContext): WeddingStoryEvent[] | undefined {
  const records = parseRecords(block, ctx, 'story-events')
  if (!records || !expectRecordKeys(records, ctx, 'story-events', STORY_EVENT_KEYS)) return undefined
  const events = records.map((record) => parseStoryEvent(record, ctx)).filter((event) => event !== undefined)
  return events.length === records.length ? events : undefined
}

function rejectUnknownModules(modules: ModuleMap, ctx: ParseContext, known: readonly string[], hint: string) {
  for (const key of modules.keys()) {
    if (!known.includes(key)) fail(ctx, PROJECT_CONTENT_ROOT, `未知模組「${key}」,${hint}`)
  }
}

function requireModule(modules: ModuleMap, ctx: ParseContext, key: string): ContentBlock | undefined {
  const block = modules.get(key)
  if (!block) fail(ctx, PROJECT_CONTENT_ROOT, `缺少必要模組「${key}」`)
  return block
}

// 尚未為非婚禮專案註冊任何模組:新增模組要先有欄位、型別、parser、呈現元件與測試。
export const genericContract: ProjectContentContract<GenericProjectPageContent> = {
  rootRequired: false,
  parse(modules, ctx, base) {
    rejectUnknownModules(modules, ctx, [], '此專案尚未註冊任何內容模組')
    return { ...base, contract: 'generic' }
  },
}

const WEDDING_HIGHLIGHT_SLUGS = ['story-timeline', 'bullet-engine'] as const
const WEDDING_PREVIEW_KEYS = ['site-desktop', 'site-mobile', 'bullet-engine'] as const
const WEDDING_MODULES = ['highlights', 'previews', 'bullet-notes', 'default-wishes', 'story-events'] as const

export const weddingContract: ProjectContentContract<WeddingPageContent> = {
  rootRequired: true,
  parse(modules, ctx, base) {
    rejectUnknownModules(modules, ctx, WEDDING_MODULES, `婚禮契約只接受 ${WEDDING_MODULES.join('、')}`)
    const blocks = WEDDING_MODULES.map((key) => requireModule(modules, ctx, key))
    if (blocks.some((block) => !block)) return undefined
    const [highlightsBlock, previewsBlock, notesBlock, wishesBlock, eventsBlock] = blocks as ContentBlock[]

    const highlights = parseHighlights(highlightsBlock, ctx, WEDDING_HIGHLIGHT_SLUGS)
    const previews = parsePreviews(previewsBlock, ctx, WEDDING_PREVIEW_KEYS)
    const bulletNotes = parseBulletNotes(notesBlock, ctx)
    const defaultWishes = parseStringList(wishesBlock, ctx, 'default-wishes')
    const storyEvents = parseStoryEvents(eventsBlock, ctx)
    if (!highlights || !previews || !bulletNotes || !defaultWishes || !storyEvents) return undefined
    return { ...base, contract: 'wedding', highlights, previews, bulletNotes, defaultWishes, storyEvents }
  },
}

type AnyContract = ProjectContentContract<ProjectPageContentBase & { contract: string }>

export const projectContentContracts: Record<string, AnyContract> = {
  wedding: weddingContract,
}

export function resolveContract(slug: string, contracts: Record<string, AnyContract> = projectContentContracts): AnyContract {
  return contracts[slug] ?? genericContract
}

export interface ParseProjectContentOptions {
  pageId: string
  slug: string
  assetExists?: (assetPath: string) => boolean
  contracts?: Record<string, AnyContract>
}

// 回傳 null 代表此專案沒有客製內容(沒有根 Toggle 且契約不要求)。
export function parseProjectPageContent<T extends ProjectPageContentBase & { contract: string } = ProjectPageContent>(
  blocks: ContentBlock[],
  options: ParseProjectContentOptions,
): T | null {
  const { pageId, slug } = options
  const ctx: ParseContext = { issues: [], assetExists: options.assetExists ?? (() => true) }
  const contract = resolveContract(slug, options.contracts)

  const root = findContentRoot(blocks, ctx)
  if (!root && ctx.issues.length === 0) {
    if (contract.rootRequired) throw new ProjectContentError(pageId, slug, [`缺少必需的 ${PROJECT_CONTENT_ROOT} 根 Toggle`])
    return null
  }

  let content: (ProjectPageContentBase & { contract: string }) | undefined
  if (root) {
    const modules = parseModuleMap(root, ctx)
    content = contract.parse(modules, ctx, {
      schemaVersion: PROJECT_CONTENT_SCHEMA_VERSION,
      pageId,
      slug,
      highlights: [],
      previews: [],
    })
  }
  if (ctx.issues.length > 0 || !content) {
    throw new ProjectContentError(pageId, slug, ctx.issues.length ? ctx.issues : ['解析失敗但沒有記錄原因'])
  }
  return content as T
}

// 備份/快取內容的執行期驗證:降級與本地讀取備份時,除了外層 pageId/slug/版本,
// 正文也要符合契約(型別、必要模組、靜態素材),不接受半份資料。
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isStringArray(value: unknown, minLength = 0): value is string[] {
  return Array.isArray(value) && value.length >= minLength && value.every((item) => typeof item === 'string' && item.length > 0)
}

// 備份裡的記錄鍵:正好一組 allowed、不得重複,順序自由。
function checkKeySet(keys: unknown[], issues: string[], label: string, allowed: readonly string[]) {
  const strings = keys.map(String)
  const duplicates = strings.filter((key, index) => strings.indexOf(key) !== index)
  if (duplicates.length) issues.push(`${label} 有重複記錄 ${[...new Set(duplicates)].join('、')}`)
  const missing = allowed.filter((key) => !strings.includes(key))
  const extra = strings.filter((key) => !allowed.includes(key))
  if (missing.length || extra.length || strings.length !== allowed.length) {
    issues.push(`${label} 必須正好包含 ${allowed.join('、')} 各一筆`)
  }
}

function checkHighlights(value: unknown, issues: string[], allowed: readonly string[]) {
  if (!Array.isArray(value)) return issues.push('highlights 必須是陣列')
  const keys = value.map((item) => (isRecord(item) ? item.slug : undefined))
  for (const item of value) {
    if (!isRecord(item) || !['slug', 'title', 'summary', 'intro'].every((k) => typeof item[k] === 'string' && item[k]) || !(HIGHLIGHT_ICONS as readonly string[]).includes(String(item.icon))) {
      issues.push('highlights 有欄位不完整或 icon 非法的記錄')
      return
    }
  }
  checkKeySet(keys, issues, 'highlights', allowed)
}

function checkPreviews(value: unknown, issues: string[], allowed: readonly string[], assetExists: (p: string) => boolean) {
  if (!Array.isArray(value)) return issues.push('previews 必須是陣列')
  for (const item of value) {
    if (!isRecord(item) || typeof item.key !== 'string' || typeof item.assetPath !== 'string' || typeof item.alt !== 'string' || !item.alt || typeof item.caption !== 'string') {
      issues.push('previews 有欄位不完整的記錄')
      return
    }
    if (!ASSET_PATH.test(item.assetPath) || !assetExists(item.assetPath)) issues.push(`previews/${item.key} 的靜態檔案 ${item.assetPath} 不可用`)
  }
  checkKeySet(value.map((item) => (item as ProjectPreview).key), issues, 'previews', allowed)
}

function checkStoryEvents(value: unknown, issues: string[], assetExists: (p: string) => boolean) {
  if (!Array.isArray(value)) return issues.push('storyEvents 必須是陣列')
  const keys = value.map((item) => (isRecord(item) ? item.key : undefined))
  if (keys.length !== STORY_EVENT_KEYS.length || keys.some((key, i) => key !== STORY_EVENT_KEYS[i])) {
    issues.push(`storyEvents 必須依序為 ${STORY_EVENT_KEYS.join('、')}`)
  }
  for (const item of value) {
    if (
      !isRecord(item) ||
      (item.dateStatus !== 'pending' && item.dateStatus !== 'confirmed') ||
      typeof item.title !== 'string' || !item.title ||
      typeof item.description !== 'string' || !item.description ||
      typeof item.majorEvent !== 'boolean' ||
      (item.color !== 'blue' && item.color !== 'pink') ||
      typeof item.year !== 'string' || typeof item.month !== 'string' ||
      typeof item.imagePath !== 'string' || typeof item.imageAlt !== 'string'
    ) {
      issues.push('storyEvents 有欄位不完整或值非法的事件')
      return
    }
    const date = checkStoryDate(item.dateStatus, item.year, item.month)
    if (date.issues.length || date.month !== item.month) {
      issues.push(`storyEvents/${item.key} 日期不合法:${date.issues.join(';') || 'month 未正規化'}`)
    }
    if (item.imagePath && (!item.imageAlt || !ASSET_PATH.test(item.imagePath) || !assetExists(item.imagePath))) {
      issues.push(`storyEvents/${item.key} 的照片 ${item.imagePath} 不可用或缺少 imageAlt`)
    }
  }
}

export interface ValidateBackupOptions {
  pageId: string
  slug: string
  assetExists?: (assetPath: string) => boolean
}

// 回傳問題清單;空陣列代表備份可用。
export function validateProjectPageBackup(backup: unknown, options: ValidateBackupOptions): string[] {
  const issues: string[] = []
  const assetExists = options.assetExists ?? (() => true)
  if (!isRecord(backup)) return ['備份不是物件']
  if (backup.schemaVersion !== PROJECT_CONTENT_SCHEMA_VERSION) issues.push(`schemaVersion 必須是 ${PROJECT_CONTENT_SCHEMA_VERSION}`)
  if (backup.pageId !== options.pageId) issues.push('pageId 與專案不符')
  if (backup.slug !== options.slug) issues.push('slug 與專案不符')
  if (typeof backup.fetchedAt !== 'string') issues.push('缺少 fetchedAt')
  const content = backup.content
  if (!isRecord(content)) return [...issues, 'content 不是物件']
  if (content.pageId !== options.pageId || content.slug !== options.slug || content.schemaVersion !== PROJECT_CONTENT_SCHEMA_VERSION) {
    issues.push('content 的 pageId/slug/schemaVersion 與備份外層不一致')
  }

  const expectedContract = options.slug in projectContentContracts ? options.slug : 'generic'
  if (content.contract !== expectedContract) {
    return [...issues, `content.contract 必須是 ${expectedContract},目前是「${String(content.contract)}」`]
  }
  if (expectedContract === 'generic') {
    if (!Array.isArray(content.highlights) || content.highlights.length || !Array.isArray(content.previews) || content.previews.length) {
      issues.push('generic 契約的 highlights/previews 必須是空陣列')
    }
    return issues
  }

  checkHighlights(content.highlights, issues, WEDDING_HIGHLIGHT_SLUGS)
  checkPreviews(content.previews, issues, WEDDING_PREVIEW_KEYS, assetExists)
  const notes = content.bulletNotes
  if (!isRecord(notes) || typeof notes.demoOnly !== 'string' || !notes.demoOnly || typeof notes.tech !== 'string' || !notes.tech || !isStringArray(notes.usage, 1)) {
    issues.push('bulletNotes 必須含 demoOnly、tech 與至少一筆 usage')
  } else if (notes.usage.some((note) => [...note.matchAll(/\{([^{}]*)\}/g)].some((m) => !(USAGE_PLACEHOLDERS as readonly string[]).includes(m[1])))) {
    issues.push('bulletNotes.usage 含未知占位鍵')
  }
  if (!isStringArray(content.defaultWishes, 1)) issues.push('defaultWishes 必須是至少一筆的非空字串陣列')
  checkStoryEvents(content.storyEvents, issues, assetExists)
  return issues
}

export function isWeddingContent(content: ProjectPageContent | null | undefined): content is WeddingPageContent {
  return content?.contract === 'wedding'
}

export interface UsagePlaceholderValues {
  maxLength: number
  throttleSeconds: number
  demoOnly: string
}

export function fillUsagePlaceholders(note: string, values: UsagePlaceholderValues): string {
  return note.replace(/\{(maxLength|throttleSeconds|demoOnly)\}/g, (_, key: keyof UsagePlaceholderValues) =>
    String(values[key]),
  )
}

export const STORY_PENDING_DATE_LABEL = '待確認'

export function toStoryItems(events: WeddingStoryEvent[]): Story[] {
  return events.map((event) => ({
    year: event.dateStatus === 'pending' ? STORY_PENDING_DATE_LABEL : event.year,
    month: event.dateStatus === 'pending' ? '' : event.month,
    title: event.title,
    description: event.description,
    photo: event.imagePath || undefined,
    photoAlt: event.imageAlt || undefined,
    majorEvent: event.majorEvent,
    color: event.color,
  }))
}
