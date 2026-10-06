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
})
