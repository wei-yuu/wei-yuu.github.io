import { exec } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { promisify } from 'node:util'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const execAsync = promisify(exec)

// P1-04(code review 補充要求):前一個 integration test 只驗證了 SSR
// node-server 模式(@nuxt/test-utils 需要覆寫 nitro.preset 才能啟動 server),
// 沒有驗證過假專案真的能被 `nuxi generate` 輸出成靜態 HTML——這個網站實際
// 部署用的是 nitro.preset: 'github-pages'(純靜態,見 nuxt.config.ts),SSR
// 模式測過不等於 SSG 產物也正確,兩者走的是不同的渲染路徑(SSG 靠 nitro
// 的 prerender crawler)。
//
// nitro 沒有提供任何 CLI 參數或環境變數可以覆寫 output 目錄(翻過
// nitropack/dist/core/index.mjs 確認,只有 NITRO_PRESET/SERVER_PRESET 這
// 兩個env 會被讀),所以這裡會直接寫進專案預設的 .output——跟手動跑
// `npm run generate` 的產物是同一個位置。afterAll 會用不帶假資料的 flag
// 重新 generate 一次,把 .output 還原成可以直接部署的乾淨狀態,不留著
// 測試用的假專案,避免有人在本機單獨跑完這個測試後忘記重新 generate。
describe('/projects/[slug] 的 SSG 靜態產出(nuxi generate)', () => {
  beforeAll(async () => {
    await execAsync('npx nuxi generate', {
      cwd: process.cwd(),
      env: { ...process.env, E2E_FIXTURE_PROJECTS: '1' },
    })
  }, 60_000)

  afterAll(async () => {
    const cleanEnv = { ...process.env }
    delete cleanEnv.E2E_FIXTURE_PROJECTS
    await execAsync('npx nuxi generate', { cwd: process.cwd(), env: cleanEnv })
  }, 60_000)

  it('假專案會被 generate 成真正的靜態 HTML,background/approach/outcome 正確輸出', () => {
    const filePath = '.output/public/projects/e2e-fixture-project/index.html'
    expect(existsSync(filePath)).toBe(true)
    const html = readFileSync(filePath, 'utf-8')
    expect(html).toContain('E2E 測試專案 Case Study')
    expect(html).toContain('E2E 測試用背景文字。')
    expect(html).toContain('E2E 測試用作法文字。')
    expect(html).toContain('E2E 測試用成果文字。')
  })

  it('/projects 列表的靜態產出也包含假專案連結', () => {
    const html = readFileSync('.output/public/projects/index.html', 'utf-8')
    expect(html).toContain('/projects/e2e-fixture-project')
  })

  it('未知 slug 不會有任何對應的靜態檔案被產出', () => {
    expect(existsSync('.output/public/projects/this-slug-does-not-exist-anywhere/index.html')).toBe(false)
  })
})
