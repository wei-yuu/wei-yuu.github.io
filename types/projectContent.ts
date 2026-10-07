// SRS §3.2:各 Projects 紀錄頁面內文的客製內容契約(website-content:v1)。
// 共用欄位(Title/Slug/Summary/Background…)仍在資料庫屬性,這裡只描述頁面內文
// 解析後的乾淨型別;UI 標籤、節流參數、軌道數等執行邏輯不屬於內容,留在程式碼。

export const PROJECT_CONTENT_ROOT = 'website-content:v1'
export const PROJECT_CONTENT_SCHEMA_VERSION = 'v1'

export interface NotionRichTextFragment {
  plain_text: string
}

// 只描述解析器會碰到的區塊形態;合約區域內只接受 toggle / table / table_row /
// bulleted_list_item,其他型別一律回報錯誤。
export interface ContentBlock {
  id: string
  type: string
  has_children?: boolean
  children?: ContentBlock[]
  toggle?: { rich_text: NotionRichTextFragment[] }
  bulleted_list_item?: { rich_text: NotionRichTextFragment[] }
  table?: { table_width: number; has_column_header: boolean }
  table_row?: { cells: NotionRichTextFragment[][] }
}

export type HighlightIconName = 'book' | 'chat'

export interface ProjectHighlight {
  slug: string
  title: string
  // 同時作為卡片摘要與子頁 meta description。
  summary: string
  intro: string
  icon: HighlightIconName
}

export interface ProjectPreview {
  key: string
  // 只允許 public/images 下的穩定路徑,不接受會過期的 Notion 圖片網址。
  assetPath: string
  alt: string
  caption: string
}

export interface ProjectPageContentBase {
  schemaVersion: typeof PROJECT_CONTENT_SCHEMA_VERSION
  pageId: string
  slug: string
  highlights: ProjectHighlight[]
  previews: ProjectPreview[]
}

export interface GenericProjectPageContent extends ProjectPageContentBase {
  contract: 'generic'
}

export interface WeddingBulletNotes {
  demoOnly: string
  tech: string
  // 條列可含 {maxLength}/{throttleSeconds}/{demoOnly} 占位鍵,由程式注入實際值。
  usage: string[]
}

export type StoryDateStatus = 'pending' | 'confirmed'

export interface WeddingStoryEvent {
  key: string
  dateStatus: StoryDateStatus
  year: string
  month: string
  title: string
  description: string
  majorEvent: boolean
  color: 'blue' | 'pink'
  imagePath: string
  imageAlt: string
}

export interface WeddingPageContent extends ProjectPageContentBase {
  contract: 'wedding'
  bulletNotes: WeddingBulletNotes
  defaultWishes: string[]
  storyEvents: WeddingStoryEvent[]
}

export type ProjectPageContent = GenericProjectPageContent | WeddingPageContent

// content/backup/project-pages/{pageId}.json 的內容,也是 .cache 的 projectPages 值。
export interface ProjectPageBackup {
  schemaVersion: typeof PROJECT_CONTENT_SCHEMA_VERSION
  pageId: string
  slug: string
  fetchedAt: string
  content: ProjectPageContent
}
