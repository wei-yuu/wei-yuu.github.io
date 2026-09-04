import { expect, test } from '@playwright/test'

// SRS §5.1:驗證 SSG 靜態導出完整性。/projects/wedding 的導航測試等 Sprint 3
// DanmakuPlayground 開發完成後補上。
test('首頁能被靜態導出的 dist 正常服務', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('wei-yuu — Yura & Wilson')
})

test.describe('個人履歷頁', () => {
  test('/yura 能正常導航,且經歷/技能區塊有渲染', async ({ page }) => {
    await page.goto('/yura')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Yura')
    await expect(page.getByRole('heading', { name: '工作經歷' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '技能矩陣' })).toBeVisible()
  })

  test('/wilson 能正常導航,且經歷/技能區塊有渲染', async ({ page }) => {
    await page.goto('/wilson')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Wilson')
    await expect(page.getByRole('heading', { name: '工作經歷' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '技能矩陣' })).toBeVisible()
  })

  test('列印模式下,微縮導覽列(.no-print)必須被隱藏', async ({ page }) => {
    await page.goto('/yura')
    await page.emulateMedia({ media: 'print' })
    await expect(page.locator('.no-print')).toBeHidden()
  })
})
