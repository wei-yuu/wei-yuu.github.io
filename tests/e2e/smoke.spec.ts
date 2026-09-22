import { expect, test } from '@playwright/test'

// SRS §5.1:驗證 SSG 靜態導出完整性。
test('首頁能被靜態導出的 dist 正常服務', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('各自的風景，共同的海平線。')
  await expect(page.getByRole('link', { name: 'Wei Yu' }).first()).toBeVisible()
})

test.describe('個人履歷頁', () => {
  test('/yura 能正常導航,且經歷/技能區塊有渲染', async ({ page }) => {
    await page.goto('/yura')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Yura')
    await expect(page.getByRole('heading', { name: '工作經歷' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '技能' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Yura', exact: true })).toHaveAttribute('aria-current', 'page')
  })

  test('/wilson 能正常導航,且經歷/技能區塊有渲染', async ({ page }) => {
    await page.goto('/wilson')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Wilson')
    await expect(page.getByRole('heading', { name: '工作經歷' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '技能' })).toBeVisible()
  })

  // Website 設計文件 §4.9:列印強制白底黑字,移除導覽/主題切換/互動按鈕,
  // 但姓名、職稱、經歷、技能等正文要保留(不能連正文一起被藏起來)。
  test('列印模式下,導覽與互動按鈕隱藏,白底黑字,正文仍保留可讀', async ({ page }) => {
    await page.goto('/yura')
    await page.emulateMedia({ media: 'print' })

    // 頁面上有多個 .no-print 元素(導覽列、橫幅、頁尾……),對整組 locator
    // 直接 toBeHidden() 會撞到 Playwright 的 strict mode(要求單一元素)而
    // 拋錯、卡住後面的斷言——改成先確認數量存在,再逐一檢查每個都真的隱藏。
    const noPrintElements = page.locator('.no-print')
    const noPrintCount = await noPrintElements.count()
    expect(noPrintCount).toBeGreaterThan(0)
    for (let i = 0; i < noPrintCount; i++) {
      await expect(noPrintElements.nth(i)).toBeHidden()
    }

    await expect(page.getByRole('button', { name: '下載履歷' })).toBeHidden()
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(0, 0, 0)')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('heading', { name: '工作經歷' })).toBeVisible()
    await expect(page.getByRole('heading', { name: '技能' })).toBeVisible()
  })
})

test.describe('專案作品集', () => {
  test('/projects 能正常導航,且列出至少一個專案卡片連結', async ({ page }) => {
    await page.goto('/projects')
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('一起完成的作品')
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
