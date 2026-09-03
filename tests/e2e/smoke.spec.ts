import { expect, test } from '@playwright/test'

// SRS §5.1:驗證 SSG 靜態導出完整性。Sprint 1 階段僅有佔位首頁,
// /yura、/wilson、/projects/wedding 的導航測試於對應頁面開發完成(Sprint 2-3)後補上。
test('首頁能被靜態導出的 dist 正常服務', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('wei-yuu — Yura & Wilson')
})
