// 對應 SRS §3.1 最終 schema:只描述我們實際會用到的屬性形態,不是完整 Notion API 型別。
export interface NotionTitleProperty {
  type: 'title'
  title: Array<{ plain_text: string }>
}

export interface NotionRichTextProperty {
  type: 'rich_text'
  rich_text: Array<{ plain_text: string }>
}

export interface NotionSelectProperty {
  type: 'select'
  select: { name: string } | null
}

export interface NotionCheckboxProperty {
  type: 'checkbox'
  checkbox: boolean
}

export interface NotionNumberProperty {
  type: 'number'
  number: number | null
}

export interface NotionDateProperty {
  type: 'date'
  date: { start: string; end: string | null } | null
}

export interface NotionRelationProperty {
  type: 'relation'
  relation: Array<{ id: string }>
}

export interface NotionUrlProperty {
  type: 'url'
  url: string | null
}

export interface NotionRollupArrayProperty {
  type: 'rollup'
  rollup: {
    type: 'array'
    array: Array<{ type: 'title'; title: Array<{ plain_text: string }> }>
  }
}

export type NotionProperty =
  | NotionTitleProperty
  | NotionRichTextProperty
  | NotionSelectProperty
  | NotionCheckboxProperty
  | NotionNumberProperty
  | NotionDateProperty
  | NotionRelationProperty
  | NotionRollupArrayProperty
  | NotionUrlProperty

export interface NotionPage {
  id: string
  properties: Record<string, NotionProperty>
}

export interface DateRange {
  start: string
  end: string | null
}

// Highlights 支援兩層:主項 + 縮排子項(對應 Notion 原生的 • / ◦ 兩層項目符號)
export interface HighlightItem {
  text: string
  children: string[]
}

// 解析後給頁面用的乾淨資料型別
export interface ExperienceItem {
  id: string
  company: string
  role: string
  targetUsers: string[]
  period: DateRange | null
  isCurrent: boolean
  highlights: HighlightItem[]
  techUsed: string[]
}

export interface SkillItem {
  id: string
  skillName: string
  category: string
  targetUsers: string[]
  proficiency: string
  order: number | null
}

export interface PersonItem {
  id: string
  name: string
  jobTitle: string
  seoDescription: string
}

// RoleAttribution 是「Yura: 視覺/動效, Wilson: 架構/彈幕」這種單行文字,
// 拆成每人一列給 §4.2 的雙人分工矩陣渲染用。
export interface RoleAttributionItem {
  person: string
  role: string
}

export interface ProjectItem {
  id: string
  title: string
  slug: string
  summary: string
  roleAttribution: RoleAttributionItem[]
  techStack: string[]
  demoUrl: string | null
  repoUrl: string | null
  featured: boolean
  order: number | null
}

export interface ProfileContent {
  projects: ProjectItem[]
  experiences: ExperienceItem[]
  skills: SkillItem[]
  people: PersonItem[]
  updatedAt: string
}
