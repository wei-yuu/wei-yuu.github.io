import { describe, expect, it } from 'vitest'
import type { NotionPage } from '../../types/notion'
import {
  getCheckbox,
  getDateRange,
  getNumber,
  getRichText,
  getRollupNames,
  getSelectName,
  getTitleText,
  isForPerson,
  mapExperience,
  mapSkill,
} from '../../utils/notion'

function makePage(properties: NotionPage['properties']): NotionPage {
  return { id: 'test-id', properties }
}

describe('Notion 屬性解析器', () => {
  it('getTitleText 從 title 型別取出純文字', () => {
    const page = makePage({ Company: { type: 'title', title: [{ plain_text: 'ASUS 華碩電腦' }] } })
    expect(getTitleText(page, 'Company')).toBe('ASUS 華碩電腦')
  })

  it('getTitleText 遇到型別不符或欄位不存在,回傳空字串而不是拋錯', () => {
    const page = makePage({})
    expect(getTitleText(page, 'Missing')).toBe('')
  })

  it('getRichText 串接多個 rich_text 片段', () => {
    const page = makePage({
      Role: { type: 'rich_text', rich_text: [{ plain_text: '高級' }, { plain_text: '工程師' }] },
    })
    expect(getRichText(page, 'Role')).toBe('高級工程師')
  })

  it('getSelectName 取出選項名稱,select 為 null 時回傳空字串', () => {
    const withValue = makePage({ Category: { type: 'select', select: { name: 'Frontend Core' } } })
    const withNull = makePage({ Category: { type: 'select', select: null } })
    expect(getSelectName(withValue, 'Category')).toBe('Frontend Core')
    expect(getSelectName(withNull, 'Category')).toBe('')
  })

  it('getCheckbox 型別不符時安全預設為 false', () => {
    const page = makePage({ IsCurrent: { type: 'checkbox', checkbox: true } })
    expect(getCheckbox(page, 'IsCurrent')).toBe(true)
    expect(getCheckbox(page, 'Missing')).toBe(false)
  })

  it('getNumber 與 getDateRange 直接透傳原始值', () => {
    const page = makePage({
      Order: { type: 'number', number: 3 },
      Period: { type: 'date', date: { start: '2025-03-24', end: null } },
    })
    expect(getNumber(page, 'Order')).toBe(3)
    expect(getDateRange(page, 'Period')).toEqual({ start: '2025-03-24', end: null })
  })

  it('getRollupNames 從 rollup array 取出每個關聯項目的 title 文字', () => {
    const page = makePage({
      TechUsedNames: {
        type: 'rollup',
        rollup: {
          type: 'array',
          array: [
            { type: 'title', title: [{ plain_text: 'TypeScript' }] },
            { type: 'title', title: [{ plain_text: 'Tailwindcss' }] },
          ],
        },
      },
    })
    expect(getRollupNames(page, 'TechUsedNames')).toEqual(['TypeScript', 'Tailwindcss'])
  })

  it('getRollupNames 對空陣列或型別不符,回傳空陣列', () => {
    const empty = makePage({
      OwnerNames: { type: 'rollup', rollup: { type: 'array', array: [] } },
    })
    expect(getRollupNames(empty, 'OwnerNames')).toEqual([])
    expect(getRollupNames(makePage({}), 'Missing')).toEqual([])
  })
})

describe('isForPerson', () => {
  it('忽略大小寫比對人名', () => {
    expect(isForPerson(['Wilson', 'Yura'], 'wilson')).toBe(true)
    expect(isForPerson(['Yura'], 'Wilson')).toBe(false)
  })
})

describe('mapExperience / mapSkill', () => {
  it('mapExperience 把真實 Notion 回應形狀轉成乾淨的 ExperienceItem', () => {
    const page = makePage({
      Company: { type: 'title', title: [{ plain_text: 'ASUS 華碩電腦' }] },
      Role: { type: 'rich_text', rich_text: [{ plain_text: '高級工程師' }] },
      TargetUserName: {
        type: 'rollup',
        rollup: { type: 'array', array: [{ type: 'title', title: [{ plain_text: 'Wilson' }] }] },
      },
      Period: { type: 'date', date: { start: '2025-03-24', end: null } },
      IsCurrent: { type: 'checkbox', checkbox: true },
      Highlights: { type: 'rich_text', rich_text: [] },
      TechUsedNames: {
        type: 'rollup',
        rollup: {
          type: 'array',
          array: [
            { type: 'title', title: [{ plain_text: 'TypeScript' }] },
            { type: 'title', title: [{ plain_text: 'React' }] },
          ],
        },
      },
    })

    expect(mapExperience(page)).toEqual({
      id: 'test-id',
      company: 'ASUS 華碩電腦',
      role: '高級工程師',
      targetUsers: ['Wilson'],
      period: { start: '2025-03-24', end: null },
      isCurrent: true,
      highlights: '',
      techUsed: ['TypeScript', 'React'],
    })
  })

  it('mapSkill 把真實 Notion 回應形狀轉成乾淨的 SkillItem', () => {
    const page = makePage({
      SkillName: { type: 'title', title: [{ plain_text: 'Vue 3 Composition API' }] },
      Category: { type: 'select', select: { name: 'Frontend Core' } },
      TargetUserNames: {
        type: 'rollup',
        rollup: {
          type: 'array',
          array: [
            { type: 'title', title: [{ plain_text: 'Wilson' }] },
            { type: 'title', title: [{ plain_text: 'Yura' }] },
          ],
        },
      },
      Proficiency: { type: 'select', select: { name: 'Expert' } },
      Order: { type: 'number', number: 1 },
    })

    expect(mapSkill(page)).toEqual({
      id: 'test-id',
      skillName: 'Vue 3 Composition API',
      category: 'Frontend Core',
      targetUsers: ['Wilson', 'Yura'],
      proficiency: 'Expert',
      order: 1,
    })
  })
})
