import { fetch, setup } from '@nuxt/test-utils/e2e'
import { describe, expect, it } from 'vitest'

// P1-04(code review 要求的永久回歸測試):正式 Notion 資料目前只有 wedding
// 一筆,wedding 會被更具體的靜態路由 pages/projects/wedding/index.vue 接手,
// 所以一般的 generate/E2E 跑下來,從來沒有任何路由真正走過
// pages/projects/[slug].vue——先前「await useAsyncData() 時序錯誤,導致每個
// 合法 slug 都被判定成 404」這個 bug,就是因為沒有測試真的打到這個動態路由
// 才沒被抓到。
//
// 這裡用 @nuxt/test-utils 啟動一個真的 Nuxt server,並透過 env 開啟
// server/api/content.get.ts 裡「只在 E2E_FIXTURE_PROJECTS=1 時才會注入」的
// 假專案(見該檔案註解),讓 [slug].vue 在測試裡被真正渲染,而不是只靠手動
// 單次驗證。這個環境變數在一般 generate/CI 流程不會被設定,不會把假資料
// 帶進正式網站或部署產物。
//
// await setup() 必須直接寫在 describe callback 裡(不能包進 beforeAll)——
// @nuxt/test-utils 靠這個時機把 context 掛進目前的 suite,包進 beforeAll
// 的話 fetch()/$fetch() 拿不到正確的 server base URL,會直接把 path 當成
// 完整 URL 去解析而噴 Invalid URL。
describe('動態案例頁 /projects/[slug]', async () => {
  await setup({
    rootDir: '.',
    server: true,
    browser: false,
    env: { E2E_FIXTURE_PROJECTS: '1' },
    setupTimeout: 120_000,
    // nuxt.config.ts 固定 nitro.preset 為 github-pages(純靜態輸出,沒有
    // server/index.mjs 可以啟動),這裡覆寫成 node-server,才能真的開一個
    // 可以打 HTTP 請求的 server 來測,不影響正式 generate 用的設定。
    nuxtConfig: { nitro: { preset: 'node-server' } },
  })

  it('假專案會出現在 /projects 列表', async () => {
    const res = await fetch('/projects')
    const html = await res.text()
    expect(html).toContain('E2E 測試專案')
  })

  it('/projects/{fixture-slug} 可以直接開啟,background/approach/outcome 正確輸出', async () => {
    const res = await fetch('/projects/e2e-fixture-project')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('E2E 測試專案 Case Study')
    expect(html).toContain('E2E 測試用背景文字。')
    expect(html).toContain('E2E 測試用作法文字。')
    expect(html).toContain('E2E 測試用成果文字。')
  })

  it('未知 slug 回傳 404', async () => {
    const res = await fetch('/projects/this-slug-does-not-exist-anywhere')
    expect(res.status).toBe(404)
  })

  // SRS §3.3.1 / §5.1.1:API 只輸出已驗證的公開內容,並以 ProjectItem.id 對應;
  // 沒有客製內容的 fixture 專案不會拿到婚禮的資料,婚禮內容也不會串到別的專案。
  it('/api/content 以 pageId 回傳已驗證的 projectPages,fixture 專案沒有客製內容', async () => {
    const res = await fetch('/api/content')
    const body = (await res.json()) as {
      projects: Array<{ id: string; slug: string }>
      projectPages: Record<string, { contract: string; slug: string; highlights: Array<{ slug: string; summary: string }> }>
    }
    const wedding = body.projects.find((p) => p.slug === 'wedding')
    const fixture = body.projects.find((p) => p.slug === 'e2e-fixture-project')
    expect(wedding && body.projectPages[wedding.id]).toMatchObject({ contract: 'wedding', slug: 'wedding' })
    expect(fixture && body.projectPages[fixture.id]).toBeUndefined()
    expect(Object.values(body.projectPages).every((page) => page.slug === 'wedding')).toBe(true)
    expect(JSON.stringify(body)).not.toMatch(/ntn_|secret_|"blocks"/)
  })

  it('婚禮亮點摘要在 /projects、總覽與子頁 meta 都讀同一份 Notion 內容;fixture 專案頁沒有亮點入口', async () => {
    const api = (await (await fetch('/api/content')).json()) as {
      projects: Array<{ id: string; slug: string }>
      projectPages: Record<string, { highlights: Array<{ slug: string; summary: string; intro: string }> }>
    }
    const wedding = api.projects.find((p) => p.slug === 'wedding')!
    const highlights = api.projectPages[wedding.id].highlights
    expect(highlights.map((h) => h.slug)).toEqual(['story-timeline', 'bullet-engine'])

    const listHtml = await (await fetch('/projects')).text()
    const overviewHtml = await (await fetch('/projects/wedding')).text()
    for (const highlight of highlights) {
      expect(listHtml).toContain(highlight.summary)
      expect(overviewHtml).toContain(highlight.summary)
      const subHtml = await (await fetch(`/projects/wedding/${highlight.slug}`)).text()
      expect(subHtml).toContain(`<meta name="description" content="${highlight.summary}"`)
      expect(subHtml).toContain(highlight.intro)
    }

    // 內嵌的 __NUXT_DATA__ payload 本來就帶整份 /api/content,所以只檢查渲染出來的
    // 標記:fixture 專案不能出現亮點入口區塊,也不能長出指向自己 slug 的亮點連結。
    const fixtureHtml = await (await fetch('/projects/e2e-fixture-project')).text()
    const rendered = fixtureHtml.replace(/<script[\s\S]*?<\/script>/g, '')
    expect(rendered).not.toContain('亮點入口')
    expect(rendered).not.toContain(highlights[0].summary)
    expect(fixtureHtml).not.toContain('/projects/e2e-fixture-project/story-timeline')
    expect(fixtureHtml).not.toContain('/projects/e2e-fixture-project/bullet-engine')
  })
})
