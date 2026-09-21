# AGENTS.md

給任何在這個 repo 工作的 AI coding agent（Claude Code、Cursor、Copilot 等）看的專案指南。

## 這是什麼

`wei-yuu.github.io`：Yura 與 Wilson 兩位前端工程師的雙人技術工作室官方入口，兼個人履歷 (`/yura`、`/wilson`) 與作品集 (`/projects`)。求職導向的作品集網站，會被 HR / 技術主管快速瀏覽，效能與可讀性門檻寫在規格書裡（見下方）。

## 唯一真相來源

程式碼之外，這個專案由兩份 Notion 文件驅動——**改規格前先讀這兩份，程式碼實作要跟它們一致，發現不一致時要回頭修文件或修程式碼，不要放著不管**：

- **SRS（系統需求規格書）**：功能、路由、資料庫 schema、效能/a11y/測試門檻、Sprint 計畫。`https://app.notion.com/p/SRS-3d436cd8ad0e808c816bd2abcba15d80`
- **Website 設計（Design v1.2）**：視覺系統——色票 token、Tailwind 設定、字體/間距/斷點、逐頁內容規範、素材清單。功能與品質門檻仍以 SRS 為準，這份文件補視覺實作細節。`https://app.notion.com/p/Website-3db36cd8ad0e80208308de2ec9bee6be`

**讀 Notion 文件時的已知陷阱**：用 Notion API 的 `blocks/{id}/children` 讀取頁面內容時，一次最多回傳 100 個 block，`has_more`/`next_cursor` 一定要處理分頁迴圈，不然文件內容會在第 100 個 block 附近被靜默截斷——這份文件本身就曾經因為這個 bug 被讀漏過第 5-7 章。

## 技術棧

Nuxt 3（SSG，`nitro.preset: github-pages`）、TypeScript strict、Tailwind CSS 3.x + CSS 變數雙主題、`@nuxt/image`、`@nuxtjs/sitemap`、Vitest（單元測試）、Playwright（E2E，這個開發環境目前缺 `libnspr4.so` 跑不起來，只能寫測試、不能實際執行驗證，要誠實跟使用者說清楚）。

**開發環境版本鎖定**（SRS §2.9）：Node 22.x LTS、npm 10.9.8。`package.json` 的 `engines`/`packageManager`、`.nvmrc`、CI 的 `node-version: 22` 都已對齊，改動前先確認本機版本一致，避免 lockfile 不同步。

## 內容管線

四個 Notion 資料庫（Projects/Experiences/Skills/People）+ 一個關聯庫（TechStack），透過 `scripts/fetch-notion.ts` 在建置期抓取（指數退避重試、分頁、逐庫本地備份降級），寫入 `.cache/active-content.json`，`server/api/content.get.ts` 讀取並用 `utils/notion.ts` 的 `mapXxx` 函式轉成乾淨型別給頁面用。**Relation 欄位只有 id，要看 Rollup 欄位才有可讀名稱**——這是這套資料庫設計的核心模式，新增欄位時記得沿用。

## 移植真實 repo 時的鐵律

婚禮案例（彈幕引擎、故事時間軸）明確要求「照 `wei-yuu/wedding` 這個真實 repo 的做法做」，**不是照規格書的文字描述做**。已經發生過不止一次：規格書的抽象敘述（如「軌道池碰撞演算法」「IntersectionObserver 捲軸聯動 + GPU 視差滾動」）跟真實 repo 的實際做法完全不同（真實做法分別是「彈匣循環填補」跟「純 CSS Grid 靜態交錯排版」，都比規格書寫的簡單）。**遇到「規格書怎麼寫」跟「參考 repo 實際怎麼做」的岔路時，先去讀真實 repo 的原始碼再動手，不要只憑規格書的文字描述臆測實作方式；發現兩者不一致，回頭把 SRS 文字改成跟真實做法一致。**

## 檔案命名慣例（SRS §1.2）

- **Vue 元件**（`components/`）：PascalCase；巢狀資料夾根元件跟資料夾同名（`bullet/Bullet.vue`），不用 `index.vue`（Nuxt 會自動去重，tag 名稱不受影響，純粹編輯器分頁可讀性）。
- **路由頁面**（`pages/`）：kebab-case；資料夾索引路由的 `index.vue` 是框架強制規定，不受上一條規則影響。
- **Composables**：camelCase + `use` 前綴。
- **一般 TS 模組**（`utils/`、`types/`、`server/api/`）：camelCase；**獨立 CLI 腳本**（`scripts/`）：kebab-case。
- **測試檔**：跟被測來源檔同名同大小寫 + `.test.ts`；沒有對應單一來源檔的整合測試，用主題自訂 kebab-case。

## 視覺系統現況（2026-09-14 起，SRS §2.8 + Website 設計文件）

日夜閱讀模式跟人物切換（Wilson/Yura）**互相獨立**——切換明暗不換人物、路由或內容；兩位人物都各有淺色/深色版本。視覺方向是「海平線 × 方圓與潮汐」：首頁保留完整海景，內頁用淡化海景 + 格線 + 潮汐線條。色票、Tailwind config、全域 CSS 變數已經在 Website 設計文件 §2 給出完整可用的程式碼，實作時直接套用該文件的 token 命名（`wy-*` namespace），不要自己另外發明一套命名。A01／A02 海景、A04 潮汐線條與 A12 字標／favicon 已整合；A03、A05-A11、A13 仍依設計文件的個別狀態處理。尚未交付的素材要用清楚標示「待補」的中性色占位圖搭骨架，不能用假截圖或破圖頂著。

## 對照 Figma 開發

視覺還原（頁面排版、間距、色值、向量圖形）以使用者提供的 Figma 設計稿（含 `node-id` 的 URL）為準，跟 Website 設計文件互補——設計文件給 token/斷點等系統性規則,Figma 稿是逐頁逐元件的實際排版依據,兩者有落差時以 Figma 實測值為準,並回頭補文件。

優先用 `mcp__claude_ai_Figma__get_design_context` 等 MCP 工具讀取。若 MCP 回報無編輯權限（no edit access）等錯誤，改用 `.env` 的 `FIGMA_API_TOKEN` 直接打 Figma REST API 當備援，不要因此放棄比對或憑螢幕截圖臆測數值：

- 節點結構／樣式／變數：`GET https://api.figma.com/v1/files/{fileKey}/nodes?ids={nodeId}`（加 `&geometry=paths` 可取得向量的精確 SVG path 資料，適合截取無法用既有元件還原的客製曲線／圖形）。
- 渲染截圖：`GET https://api.figma.com/v1/images/{fileKey}?ids={nodeId}&format=png&scale=N`（回傳的是暫存圖片網址，要再對該網址發一次請求才拿到實際圖片，且該網址有時效）。
- 呼叫方式：`curl -H "X-Figma-Token: $FIGMA_API_TOKEN" "..."`；token 只從 `.env` 讀取，不印出、不寫進程式碼或 commit。
- 連結指向的節點若是空的（子節點數為 0），先用 `get_metadata`／`nodes` API 查同層級的其他節點（常見情形：真正有內容的 frame 在旁邊的 SECTION 裡），不要就此判定該區塊無需比對。

比對時優先重用專案既有 `wy-*` token／元件；只有實測色值、幾何跟現有 token 有明顯落差時才考慮另立新值，並在程式碼註解或回覆中說明依據（對照的 Figma node、量到的數值），避免日後誤讀成隨意決定。

## 工作流程

- **GitHub Flow**，無 `develop` 分支；`main` 鎖保護，PR 需另一人 Approve；分支前綴 `feature/`、`fix/`、`docs/`、`chore/`；一個 Sprint 一個分支。
- **commit 前一定要先給使用者看過、明確同意才 commit**——不要自己判斷「這樣應該可以」就直接 commit。
- 改動後跑 `npm run lint` / `npm run typecheck` / `npm run test` / `npm run generate`，確認靜態產出內容正確（`grep` 生成的 HTML）。Playwright E2E 只能寫，不能在這個環境實際跑，要明確告知使用者這個限制。
- 這個環境沒有 `gh` CLI 也沒有 GitHub token，無法直接建立 PR，只能給使用者可以直接點擊、已經填好標題/內文的 GitHub compare URL。
