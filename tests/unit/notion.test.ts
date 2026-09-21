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
  getUrl,
  isForPerson,
  mapExperience,
  mapPerson,
  mapProject,
  mapSkill,
  parseRoleAttribution,
  splitHighlights,
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

  it('getUrl 取出網址,型別不符或未填時回傳 null', () => {
    const page = makePage({ DemoUrl: { type: 'url', url: 'https://wei-yuu.github.io/wedding' } })
    expect(getUrl(page, 'DemoUrl')).toBe('https://wei-yuu.github.io/wedding')
    expect(getUrl(makePage({ RepoUrl: { type: 'url', url: null } }), 'RepoUrl')).toBeNull()
    expect(getUrl(makePage({}), 'Missing')).toBeNull()
  })
})

describe('parseRoleAttribution', () => {
  it('用逗號分人、冒號分角色,拆成結構化列表', () => {
    expect(parseRoleAttribution('Yura: 視覺/動效, Wilson: 架構/彈幕')).toEqual([
      { person: 'Yura', role: '視覺/動效' },
      { person: 'Wilson', role: '架構/彈幕' },
    ])
  })

  it('全形逗號與冒號也能正確拆分', () => {
    expect(parseRoleAttribution('Yura：視覺，Wilson：架構')).toEqual([
      { person: 'Yura', role: '視覺' },
      { person: 'Wilson', role: '架構' },
    ])
  })

  it('片段沒有冒號或任一邊為空時,直接跳過該片段', () => {
    expect(parseRoleAttribution('Yura 視覺, Wilson: 架構, : 空人名, Yura2:')).toEqual([
      { person: 'Wilson', role: '架構' },
    ])
  })

  it('空字串回傳空陣列', () => {
    expect(parseRoleAttribution('')).toEqual([])
  })
})

describe('splitHighlights', () => {
  it('Notion 原生兩層項目符號(• 主項 / ◦ 子項)正確拆成巢狀結構', () => {
    const text =
      '  • 擔任前端團隊 Lead (約 4 人)\n' +
      '      ◦ 負責定義技術選型、分配開發任務\n' +
      '      ◦ 建立團隊間的溝通橋樑\n' +
      '  • 主動建立前端開發規範與自動化流程\n' +
      '      ◦ 提升程式碼一致性與團隊協作效率'

    expect(splitHighlights(text)).toEqual([
      {
        text: '擔任前端團隊 Lead (約 4 人)',
        children: ['負責定義技術選型、分配開發任務', '建立團隊間的溝通橋樑'],
      },
      {
        text: '主動建立前端開發規範與自動化流程',
        children: ['提升程式碼一致性與團隊協作效率'],
      },
    ])
  })

  it('子項出現在第一個主項之前時,直接忽略(沒有父項可以掛)', () => {
    expect(splitHighlights('◦ 沒有父項的子項\n• 正常主項')).toEqual([
      { text: '正常主項', children: [] },
    ])
  })

  it('相容舊格式:純手動編號的單層文字,視為沒有子項的主項', () => {
    const text = '1. 擔任前端團隊 Lead (約 4 人)- 負責定義技術選型\n2. 主動建立前端開發規範\n\n'
    expect(splitHighlights(text)).toEqual([
      { text: '擔任前端團隊 Lead (約 4 人)- 負責定義技術選型', children: [] },
      { text: '主動建立前端開發規範', children: [] },
    ])
  })

  it('沒有任何符號時,整段當一個沒有子項的主項', () => {
    expect(splitHighlights('單純一段話的重點')).toEqual([
      { text: '單純一段話的重點', children: [] },
    ])
  })

  it('空字串回傳空陣列', () => {
    expect(splitHighlights('')).toEqual([])
  })

  it('編號用全角「、」也能正確去除', () => {
    expect(splitHighlights('1、第一項\n2、第二項')).toEqual([
      { text: '第一項', children: [] },
      { text: '第二項', children: [] },
    ])
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
      Highlights: {
        type: 'rich_text',
        rich_text: [{ plain_text: '  • 擔任前端團隊 Lead\n      ◦ 負責分配任務\n  • 主動建立開發規範\n\n' }],
      },
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
      highlights: [
        { text: '擔任前端團隊 Lead', children: ['負責分配任務'] },
        { text: '主動建立開發規範', children: [] },
      ],
      techUsed: ['TypeScript', 'React'],
    })
  })

  it('mapSkill 把真實 Notion 回應形狀轉成乾淨的 SkillItem', () => {
    const page = makePage({
      SkillName: { type: 'title', title: [{ plain_text: 'Vue 3 Composition API' }] },
      Category: { type: 'select', select: { name: 'Frontend Core' } },
      TargetUserName: {
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

  it('mapPerson 把 People 資料庫的欄位轉成乾淨的 PersonItem', () => {
    const page = makePage({
      Name: { type: 'title', title: [{ plain_text: 'Wilson' }] },
      JobTitle: { type: 'rich_text', rich_text: [{ plain_text: '前端工程師 · 架構與資料管線工程' }] },
      Bio: { type: 'rich_text', rich_text: [{ plain_text: '專注可維護的前端架構。' }] },
      SeoDescription: { type: 'rich_text', rich_text: [{ plain_text: 'Wilson 的個人履歷與作品集。' }] },
      Email: { type: 'email', email: 'wilson@example.com' },
      GitHubUrl: { type: 'url', url: 'https://github.com/wilson' },
      LinkedInUrl: { type: 'url', url: 'https://www.linkedin.com/in/wilson' },
    })

    expect(mapPerson(page)).toEqual({
      id: 'test-id',
      name: 'Wilson',
      jobTitle: '前端工程師 · 架構與資料管線工程',
      bio: '專注可維護的前端架構。',
      seoDescription: 'Wilson 的個人履歷與作品集。',
      email: 'wilson@example.com',
      githubUrl: 'https://github.com/wilson',
      linkedinUrl: 'https://www.linkedin.com/in/wilson',
    })
  })

  it('mapPerson 對還沒填個人資料的欄位,回傳安全空值而不是拋錯', () => {
    const page = makePage({ Name: { type: 'title', title: [{ plain_text: 'Yura' }] } })

    expect(mapPerson(page)).toEqual({
      id: 'test-id',
      name: 'Yura',
      jobTitle: '',
      bio: '',
      seoDescription: '',
      email: '',
      githubUrl: null,
      linkedinUrl: null,
    })
  })

  it('mapProject 把真實 Notion 回應形狀轉成乾淨的 ProjectItem', () => {
    const page = makePage({
      Title: { type: 'title', title: [{ plain_text: '互動婚禮網站' }] },
      Slug: { type: 'rich_text', rich_text: [{ plain_text: 'wedding' }] },
      Summary: { type: 'rich_text', rich_text: [{ plain_text: '雙人協作打造的互動婚禮網站。' }] },
      Background: { type: 'rich_text', rich_text: [{ plain_text: '真實上線的婚禮網站,想留存技術亮點。' }] },
      Approach: { type: 'rich_text', rich_text: [{ plain_text: '移植真實 repo 的彈幕與時間軸模組。' }] },
      Outcome: { type: 'rich_text', rich_text: [{ plain_text: '兩個模組皆為 Demo-only 呈現。' }] },
      RoleAttribution: {
        type: 'rich_text',
        rich_text: [{ plain_text: 'Yura: 視覺/動效, Wilson: 架構/彈幕' }],
      },
      TechStackNames: {
        type: 'rollup',
        rollup: {
          type: 'array',
          array: [
            { type: 'title', title: [{ plain_text: 'Vue' }] },
            { type: 'title', title: [{ plain_text: 'TypeScript' }] },
          ],
        },
      },
      DemoUrl: { type: 'url', url: 'https://wei-yuu.github.io/wedding' },
      RepoUrl: { type: 'url', url: 'https://github.com/wei-yuu/wedding' },
      Featured: { type: 'checkbox', checkbox: true },
      Order: { type: 'number', number: 1 },
    })

    expect(mapProject(page)).toEqual({
      id: 'test-id',
      title: '互動婚禮網站',
      slug: 'wedding',
      summary: '雙人協作打造的互動婚禮網站。',
      background: '真實上線的婚禮網站,想留存技術亮點。',
      approach: '移植真實 repo 的彈幕與時間軸模組。',
      outcome: '兩個模組皆為 Demo-only 呈現。',
      roleAttribution: [
        { person: 'Yura', role: '視覺/動效' },
        { person: 'Wilson', role: '架構/彈幕' },
      ],
      techStack: ['Vue', 'TypeScript'],
      demoUrl: 'https://wei-yuu.github.io/wedding',
      repoUrl: 'https://github.com/wei-yuu/wedding',
      featured: true,
      order: 1,
    })
  })

  it('mapProject 的 Background/Approach/Outcome 純空白(空格/換行/Tab)要 trim 成空字串', () => {
    const page = makePage({
      Background: { type: 'rich_text', rich_text: [{ plain_text: '   ' }] },
      Approach: { type: 'rich_text', rich_text: [{ plain_text: '\n\n' }] },
      Outcome: { type: 'rich_text', rich_text: [{ plain_text: '\t \n' }] },
    })

    const project = mapProject(page)
    expect(project.background).toBe('')
    expect(project.approach).toBe('')
    expect(project.outcome).toBe('')
  })

  it('mapProject 的 Background/Approach/Outcome 只清開頭/結尾空白,保留內文中間的換行', () => {
    const page = makePage({
      Approach: {
        type: 'rich_text',
        rich_text: [
          { plain_text: '  第一段文字\n' },
          { plain_text: '第二段文字  ' },
        ],
      },
    })

    expect(mapProject(page).approach).toBe('第一段文字\n第二段文字')
  })

  it('mapProject 對還沒填任何欄位的佔位列,回傳安全預設值而不是拋錯', () => {
    const page = makePage({})

    expect(mapProject(page)).toEqual({
      id: 'test-id',
      title: '',
      slug: '',
      summary: '',
      background: '',
      approach: '',
      outcome: '',
      roleAttribution: [],
      techStack: [],
      demoUrl: null,
      repoUrl: null,
      featured: false,
      order: null,
    })
  })
})
