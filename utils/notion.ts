import type { DateRange, ExperienceItem, NotionPage, PersonItem, SkillItem } from '~/types/notion'

// 純函式,不碰 fs/網路,方便在 server API 與單元測試裡共用。
// 每個 get* 對應一種 Notion 屬性形態,型別不符就回傳安全預設值,不拋例外——
// 單一欄位被改壞不該讓整頁 500,寧可缺一個欄位也要讓其他資料正常顯示。

function prop(page: NotionPage, key: string) {
  return page.properties[key]
}

export function getTitleText(page: NotionPage, key: string): string {
  const p = prop(page, key)
  if (p?.type !== 'title') return ''
  return p.title.map((t) => t.plain_text).join('')
}

export function getRichText(page: NotionPage, key: string): string {
  const p = prop(page, key)
  if (p?.type !== 'rich_text') return ''
  return p.rich_text.map((t) => t.plain_text).join('')
}

export function getSelectName(page: NotionPage, key: string): string {
  const p = prop(page, key)
  if (p?.type !== 'select') return ''
  return p.select?.name ?? ''
}

export function getCheckbox(page: NotionPage, key: string): boolean {
  const p = prop(page, key)
  return p?.type === 'checkbox' ? p.checkbox : false
}

export function getNumber(page: NotionPage, key: string): number | null {
  const p = prop(page, key)
  return p?.type === 'number' ? p.number : null
}

export function getDateRange(page: NotionPage, key: string): DateRange | null {
  const p = prop(page, key)
  if (p?.type !== 'date') return null
  return p.date
}

// Relation 本身只有 page id,實際名稱要靠 Rollup(見 SRS §3.1「額外關聯資料庫」段落),
// 所以這裡故意只接受 rollup 型別,不去解析 relation 欄位。
export function getRollupNames(page: NotionPage, key: string): string[] {
  const p = prop(page, key)
  if (p?.type !== 'rollup' || p.rollup.type !== 'array') return []
  return p.rollup.array
    .filter((item) => item.type === 'title')
    .map((item) => item.title.map((t) => t.plain_text).join(''))
    .filter((name) => name.length > 0)
}

export function isForPerson(targetUsers: string[], person: string): boolean {
  return targetUsers.some((name) => name.toLowerCase() === person.toLowerCase())
}

export function mapExperience(page: NotionPage): ExperienceItem {
  return {
    id: page.id,
    company: getTitleText(page, 'Company'),
    role: getRichText(page, 'Role'),
    targetUsers: getRollupNames(page, 'TargetUserName'),
    period: getDateRange(page, 'Period'),
    isCurrent: getCheckbox(page, 'IsCurrent'),
    highlights: getRichText(page, 'Highlights'),
    techUsed: getRollupNames(page, 'TechUsedNames'),
  }
}

export function mapPerson(page: NotionPage): PersonItem {
  return {
    id: page.id,
    name: getTitleText(page, 'Name'),
    jobTitle: getRichText(page, 'JobTitle'),
    seoDescription: getRichText(page, 'SeoDescription'),
  }
}

export function mapSkill(page: NotionPage): SkillItem {
  return {
    id: page.id,
    skillName: getTitleText(page, 'SkillName'),
    category: getSelectName(page, 'Category'),
    targetUsers: getRollupNames(page, 'TargetUserNames'),
    proficiency: getSelectName(page, 'Proficiency'),
    order: getNumber(page, 'Order'),
  }
}
