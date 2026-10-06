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

  // P0-01:主導覽的「履歷」預設連到 /wilson,但 /wilson、/yura 都要標示成
  // 目前頁面(桌機/手機皆需底線 + aria-current),不能只有連結目標本身的
  // /wilson 才會被判定成 active。同時 aria-current="page" 語意上代表
  // 「這個連結指到的就是目前這頁」,所以連結的 href 也要跟著目前路由變動
  // (在 /yura 時連結要指回 /yura,不能宣告 aria-current="page" 卻連去
  // 另一個會離開目前頁面的 /wilson——code review 抓到的語意問題)。
  for (const path of ['/wilson', '/yura']) {
    test(`桌機主導覽「履歷」在 ${path} 會標示為目前頁面`, async ({ page }) => {
      await page.goto(path)
      const desktopNav = page.getByRole('navigation', { name: '主要導覽' })
      const resumeLink = desktopNav.getByRole('link', { name: '履歷' })
      await expect(resumeLink).toHaveAttribute('aria-current', 'page')
      await expect(resumeLink).toHaveAttribute('href', path)
      await expect(resumeLink).toHaveCSS('text-decoration-line', 'underline')
    })
  }

  // 手機斷點(<768px)導覽收進漢堡選單,要展開後才能檢查到選單裡的「履歷」
  // 連結,不能只驗證桌機版——這是清單原本要求、上一輪漏掉的測試覆蓋。
  test.describe('手機版漢堡選單', () => {
    test.use({ viewport: { width: 375, height: 812 } })

    for (const path of ['/wilson', '/yura']) {
      test(`手機主導覽「履歷」在 ${path} 會標示為目前頁面`, async ({ page }) => {
        await page.goto(path)
        await page.getByRole('button', { name: '開啟選單' }).click()
        const mobileNav = page.locator('#mobile-nav')
        const resumeLink = mobileNav.getByRole('link', { name: '履歷' })
        await expect(resumeLink).toHaveAttribute('aria-current', 'page')
        await expect(resumeLink).toHaveAttribute('href', path)
        await expect(resumeLink).toHaveCSS('text-decoration-line', 'underline')
      })
    }
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

  // P1-02:「跟隨系統」模式(沒有手動選過主題,localStorage 沒有 wy-theme)
  // 且作業系統為深色時,畫面本身會是深色主題,但列印一定要直接是白底黑字,
  // 不能先跳回淺色畫面才印——main.css 的 @media print 同時覆寫 :root 跟
  // :root.dark 兩組色票正是為了這個情境,這裡實際模擬「OS 深色 + 列印」
  // 疊加發生時,規則仍然生效。
  test('跟隨系統且 OS 為深色模式時,列印仍直接是白底黑字', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' })
    await page.goto('/yura')
    await expect(page.locator('html')).toHaveClass(/dark/)

    await page.emulateMedia({ colorScheme: 'dark', media: 'print' })
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)')
    await expect(page.locator('body')).toHaveCSS('color', 'rgb(0, 0, 0)')
  })

  // P1-02:單筆工作經歷不能從中間被分頁截斷——確認 break-inside-avoid-page
  // 這個 class 真的有對應到瀏覽器的 computed style,不是命名對但沒生效
  // 的空殼(此前一度誤判成沒生效,是因為 Tailwind 產出的樣式被 Nuxt inline
  // 進 HTML 的 <style>,不在獨立的 .css 檔案裡)。
  test('列印模式下,每筆工作經歷都設定 break-inside: avoid-page,避免從中間分頁', async ({ page }) => {
    // 用 /wilson 而不是 /yura——Yura 的工作經歷內容目前還沒補齊(見調整
    // 清單 P1-06),/yura 這裡會是空清單,測不到任何一筆真正的經歷項目。
    await page.goto('/wilson')
    await page.emulateMedia({ media: 'print' })

    const firstEntry = page.locator('ol > li').first()
    await expect(firstEntry).toHaveCSS('break-inside', 'avoid-page')
  })

  // P1-02(code review 修正):break-inside-avoid-page 只能套在「單筆經歷」
  // 這張卡片本身,不能套在整個「工作經歷」區塊的 <section> 上——套在
  // section 等於要求整段都留在同一頁,內容長度一旦超過單頁可用高度,
  // 瀏覽器會把整段推到下一頁、本頁留下大片空白,下一頁還是會被迫從中間
  // 拆開(真的放不下一整頁)。這裡反向確認 section 本身是預設的
  // break-inside: auto,不會被誤改回去。
  test('列印模式下,工作經歷整個區塊不會被限制留在單一頁(只限制單筆經歷)', async ({ page }) => {
    await page.goto('/wilson')
    await page.emulateMedia({ media: 'print' })

    const experienceSection = page.locator('section').filter({ has: page.getByRole('heading', { name: '工作經歷' }) })
    await expect(experienceSection).toHaveCSS('break-inside', 'auto')
  })

  // P1-02:案例連結(相關作品)是正文的一部分,列印時要保留、可讀,不能被
  // no-print 規則一併隱藏。
  test('列印模式下,相關作品連結仍保留可讀', async ({ page }) => {
    await page.goto('/yura')
    await page.emulateMedia({ media: 'print' })

    const relatedWorkLink = page.getByRole('link', { name: /互動婚禮網站/ })
    await expect(relatedWorkLink).toBeVisible()
    await expect(relatedWorkLink).toHaveAttribute('href', '/projects/wedding')
  })
})

test.describe('深色偏好 hydration', () => {
  // P0-02:使用者已存 dark 偏好時,直接載入 /wilson、/projects 不能出現
  // hydration mismatch——SSR 永遠算 isDark=false,如果 initTheme() 校正
  // 時機比 hydration 還早,client 端第一次 render 用的 isDark 就會跟
  // SSR 對不上。用 addInitScript 在真正 load 頁面前先寫入 localStorage,
  // 模擬「已存深色偏好」的回訪使用者,再確認畫面主題正確且 console 沒有
  // 任何 hydration 相關警告/錯誤。
  for (const path of ['/wilson', '/projects', '/projects/wedding']) {
    test(`已存深色偏好時載入 ${path},不出現 hydration mismatch`, async ({ page }) => {
      const consoleIssues: string[] = []
      page.on('console', (msg) => {
        if (/hydration/i.test(msg.text())) consoleIssues.push(msg.text())
      })
      page.on('pageerror', (err) => {
        if (/hydration/i.test(err.message)) consoleIssues.push(err.message)
      })

      await page.addInitScript(() => {
        localStorage.setItem('wy-theme', 'dark')
      })
      await page.goto(path)

      await expect(page.locator('html')).toHaveClass(/dark/)
      // 桌機/手機各有一顆 ThemeToggle,兩顆同時存在 DOM(靠 CSS class 決定
      // 顯示哪一顆,不是 v-if),用 .first() 避免撞到 strict mode。
      const themeToggle = page.getByRole('button', { name: '切換為淺色模式' }).first()
      await expect(themeToggle).toHaveAttribute('aria-pressed', 'true')
      expect(consoleIssues).toEqual([])
    })
  }
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

  // P1-09(code review 修正):這三張圖之前用 NuxtImg + format="avif" 只會
  // 輸出單一 AVIF 格式,Safari 15.4(SRS 要求支援的最低版本)還不支援
  // AVIF(要到 Safari 16 才支援),會直接破圖——改成 NuxtPicture +
  // format="avif,webp" 之後,真正產出的是 <picture><source> 多格式
  // fallback,這裡直接檢查 HTML 結構確保兩種格式的 source 都存在,不是
  // 只肉眼看渲染結果(換成只支援其中一種格式的瀏覽器也不會壞)。
  test('/projects/wedding 的真實截圖都有 AVIF 與 WebP 雙重備援格式', async ({ page }) => {
    await page.goto('/projects/wedding')
    const pictures = page.locator('picture')
    const count = await pictures.count()
    expect(count).toBeGreaterThan(0)
    for (let i = 0; i < count; i++) {
      const picture = pictures.nth(i)
      await expect(picture.locator('source[type="image/avif"]')).toHaveCount(1)
      await expect(picture.locator('source[type="image/webp"]')).toHaveCount(1)
    }
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

  // P1-10(code review 修正):撐版資料原本放真實格式的年份(如「2023 年 1
  // 月」),使用者容易誤以為時間軸日期已經確定——跟文案/照片一樣應明確標示
  // 待確認,不能顯示看起來很真的日期。
  test('/projects/wedding/story-timeline 的日期未確認前,一律顯示「待確認」,不顯示假日期', async ({ page }) => {
    await page.goto('/projects/wedding/story-timeline')
    const dateLabels = page.getByText('待確認')
    await expect(dateLabels).toHaveCount(4)
    await expect(page.getByText(/\d{4}\s*年/)).toHaveCount(0)
  })
})
