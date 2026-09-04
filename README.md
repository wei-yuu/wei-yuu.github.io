# wei-yuu.github.io

Yura & Wilson 雙人前端作品集與個人品牌網站。技術規格見團隊內部 SRS v5(最終修訂版)。

## 開發

```bash
npm install
npm run dev        # http://localhost:3000
```

## 內容管線

四個 Notion 資料庫(Projects / Experiences / Skills / People)是內容主幹,`scripts/fetch-notion.ts`
在建置期抓取並正規化,失敗時逐資料庫降級讀取 `content/backup/*.json`(已提交至 git,
作為第一次建置或 Notion 完全不可用時的種子資料)。Owner/TargetUser/TechStack/TechUsed
採 Relation + Rollup 指向 People/TechStack 兩個共用主資料庫,詳見 SRS §3.1。

```bash
cp .env.example .env   # 填入 NOTION_API_KEY 與四個資料庫 ID
npm run fetch:content  # 產出 .cache/active-content.json,並逆向覆寫 content/backup/*.json
```

## 驗證(對應 CI Stage 1-3.5)

```bash
npm run lint        # Stage 1
npm run typecheck   # Stage 1
npm run test        # Stage 2(coverage.thresholds ≥ 80%,scripts/** 範圍)
npm run generate    # Stage 3,產出 .output/public
npm run test:e2e    # Stage 3.5,對 .output/public 跑 Playwright
                     # 首次跑需先 `npx playwright install --with-deps chromium`
```

## 部署

`.github/workflows/ci.yml`:PR 只跑 Stage 1-2;push main / `workflow_dispatch` /
每週一 04:00(UTC+8)排程,才會跑到會打 Notion API 與部署 GitHub Pages 的 Stage 3-4。

Secrets(`NOTION_API_KEY`、`NOTION_DB_PROJECTS`、`NOTION_DB_EXP`、`NOTION_DB_SKILLS`、
`NOTION_DB_PEOPLE`)存於 GitHub Organization Secrets,見 SRS §3.4。
