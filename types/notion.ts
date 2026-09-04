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

export interface NotionPage {
  id: string
  properties: Record<string, NotionProperty>
}

export interface DateRange {
  start: string
  end: string | null
}

// 解析後給頁面用的乾淨資料型別
export interface ExperienceItem {
  id: string
  company: string
  role: string
  targetUsers: string[]
  period: DateRange | null
  isCurrent: boolean
  highlights: string
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

export interface ProfileContent {
  experiences: ExperienceItem[]
  skills: SkillItem[]
  updatedAt: string
}
