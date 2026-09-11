import { expect, test } from '@playwright/test'

// SRS §5.1:驗證 SSG 靜態導出完整性。
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

test.describe('專案作品集', () => {
  test('/projects 能正常導航,且列出至少一個專案卡片連結', async ({ page }) => {
    await page.goto('/projects')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('專案作品集')
    await expect(page.getByRole('link', { name: '互動婚禮網站' })).toBeVisible()
  })

  test('/projects/wedding 總覽頁能正常導航,且列出兩個亮點連結', async ({ page }) => {
    await page.goto('/projects/wedding')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('互動婚禮網站 Case Study')
    await expect(page.getByRole('link', { name: '賓客祝福彈幕' })).toBeVisible()
    await expect(page.getByRole('link', { name: '故事時間軸' })).toBeVisible()
  })

  test('/projects/wedding/bullet-engine 能正常導航,且彈幕 Demo 有渲染', async ({ page }) => {
    await page.goto('/projects/wedding/bullet-engine')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('賓客祝福彈幕')
    await expect(page.getByText('模擬演示模式')).toBeVisible()
  })

  test('/projects/wedding/story-timeline 能正常導航,且時間軸有渲染', async ({ page }) => {
    await page.goto('/projects/wedding/story-timeline')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('故事時間軸')
    await expect(page.getByText('相識')).toBeVisible()
  })
})
