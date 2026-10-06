import { expect, test } from '@playwright/test'

// P1-05:補齊彈幕功能的 E2E 覆蓋——輸入、送出、空白／超長輸入、1.5 秒節流、
// 彈幕 DOM(動態模式)與 reduced-motion 靜態列表。
//
// code review 抓到的假陽性:getByText(...) 在沒有限定範圍時,會連到
// sr-only 靜態清單(displayMessages)裡同樣文字的 <li>——Playwright 判定
// sr-only 元素(1x1px、沒有 visibility:hidden)為 visible,所以即使動畫
// 佇列(magazine,真正驅動 BulletScreen 播放的那份資料)完全沒收到訊息,
// 測試也可能通過。sr-only 清單跟 magazine 是兩份獨立資料(見
// components/bullet/Playground.vue 的註解),只測其中一份沒辦法代表另一份
// 也正確——改成用 components/bullet/Playground.vue 新增的
// data-testid="bullet-magazine-last"/"bullet-magazine-length" 直接讀
// magazine 的真實狀態,兩份資料分開斷言。

test.describe('彈幕 Demo', () => {
  test('輸入並送出後,清空輸入框、顯示送出狀態,且訊息真的進入播放佇列與可讀清單', async ({ page }) => {
    await page.goto('/projects/wedding/bullet-engine')
    const input = page.getByLabel('輸入祝福彈幕')
    const submit = page.getByRole('button', { name: '發送' })

    await input.fill('祝福 E2E 測試順利')
    await submit.click()

    await expect(input).toHaveValue('')
    await expect(page.locator('#bullet-input-status')).toHaveText('已加入播放佇列,請稍候片刻再送出下一則。')
    // 動畫佇列(magazine):確認送出的文字真的被 push 進去,不是只有可讀
    // 清單更新。
    await expect(page.getByTestId('bullet-magazine-last')).toHaveText('祝福 E2E 測試順利')
    // sr-only 可讀清單(displayMessages):跟動畫佇列分開驗證,限定在這個
    // 清單本身,不是沒限定範圍的全頁文字搜尋。
    await expect(page.getByTestId('bullet-static-list').getByText('祝福 E2E 測試順利')).toBeAttached()
  })

  test('空白輸入送出時,顯示錯誤訊息,不會加入播放佇列', async ({ page }) => {
    await page.goto('/projects/wedding/bullet-engine')
    const submit = page.getByRole('button', { name: '發送' })

    const lengthBefore = await page.getByTestId('bullet-magazine-length').textContent()

    await submit.click()

    await expect(page.locator('#bullet-input-error')).toHaveText('請輸入內容再送出。')
    // 真正確認「不會加入播放佇列」:長度前後不變,不是只檢查錯誤訊息。
    await expect(page.getByTestId('bullet-magazine-length')).toHaveText(lengthBefore ?? '')
  })

  test('超長輸入(超過 30 字)送出時,實際加入播放佇列的訊息會被截斷成 30 字', async ({ page }) => {
    await page.goto('/projects/wedding/bullet-engine')
    const input = page.getByLabel('輸入祝福彈幕')
    const submit = page.getByRole('button', { name: '發送' })

    const longText = 'a'.repeat(50)
    // maxlength 屬性只擋使用者真的用鍵盤輸入,不擋程式直接指定 value——用
    // JS 直接寫入繞過 maxlength,確保測到的是程式碼自己的 slice(0, 30) 防線,
    // 不是碰巧被瀏覽器的 maxlength 擋下來。
    await input.evaluate((el: HTMLInputElement, value: string) => {
      el.value = value
      el.dispatchEvent(new Event('input'))
    }, longText)
    await submit.click()

    await expect(page.getByTestId('bullet-magazine-last')).toHaveText('a'.repeat(30))
  })

  test('送出後 1.5 秒節流:按鈕先停用,節流時間過後恢復可用', async ({ page }) => {
    await page.goto('/projects/wedding/bullet-engine')
    const input = page.getByLabel('輸入祝福彈幕')
    const submit = page.getByRole('button', { name: '發送' })

    await input.fill('測試節流')
    await submit.click()

    await expect(submit).toBeDisabled()
    await expect(submit).toBeEnabled({ timeout: 3000 })
  })

  test('一般模式下,彈幕以動畫方式呈現在舞台上', async ({ page }) => {
    await page.goto('/projects/wedding/bullet-engine')
    // 動畫舞台(BulletScreen)有專屬 data-testid,跟下面永遠存在的 sr-only
    // 靜態清單分開,不會撞到 Playwright 的 strict mode。預設彈幕一開始就會
    // 播放,不用等使用者互動,第一則短訊息的播放時長至少 15 秒,載入後
    // 應該能立刻看到其中之一還在畫面上跑。
    const stage = page.getByTestId('bullet-stage')
    await expect(stage).toBeVisible()
    await expect(stage.getByText('祝福新人百年好合、永浴愛河！')).toBeVisible()
  })

  test('prefers-reduced-motion 時,彈幕舞台完全不掛載,改成靜態可讀清單', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto('/projects/wedding/bullet-engine')

    // 動畫舞台(BulletScreen)整個不存在於 DOM,不是只是視覺上隱藏。
    await expect(page.getByTestId('bullet-stage')).toHaveCount(0)

    // 靜態清單在減弱動態模式下永遠可見(不是 sr-only)。
    const staticList = page.getByTestId('bullet-static-list')
    await expect(staticList).toBeVisible()
    await expect(staticList).not.toHaveClass(/sr-only/)
    await expect(staticList.getByText('祝福新人百年好合、永浴愛河！')).toBeVisible()
  })
})
