import { defineConfig } from 'vitest/config'

// SRS §5.1:嚴格覆蓋率門檻,statements/branches ≥ 80%,未達標 CI 判定失敗。
// 現階段(Sprint 1)僅 scripts/ 底下有實質邏輯,頁面/元件邏輯進來後(Sprint 2-3)
// 應把 include 範圍擴大到 composables/**、components/** 等,而不是無限期只測 scripts/。
export default defineConfig({
  test: {
    environment: 'happy-dom',
    // tests/e2e/** 是 Playwright 的測試,不歸 Vitest 管,避免重複執行/型別衝突
    exclude: ['node_modules/**', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      include: ['scripts/**/*.ts', 'utils/**/*.ts'],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
})
