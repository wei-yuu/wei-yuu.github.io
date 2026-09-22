import { defineConfig } from '@playwright/test'

// SRS §5.1/§5.2 Stage 3.5:對 `nuxi generate` 產出的靜態 dist(.output/public)跑 E2E,
// 而不是對 dev server 測試,確保驗證的是「真正會上線的那份靜態檔案」。
export default defineConfig({
  testDir: './tests/e2e',
  webServer: {
    command: 'npx serve .output/public -p 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  use: {
    baseURL: 'http://localhost:4173',
  },
})
