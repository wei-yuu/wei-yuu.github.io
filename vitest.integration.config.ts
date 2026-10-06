import { defineConfig } from 'vitest/config'

// P1-04 回歸測試專用設定:只跑 tests/integration/**,跟 vitest.config.ts
// (快速、無網路相依的單元測試,見該檔案註解)分開——這裡的測試會透過
// @nuxt/test-utils 實際建置並啟動一個 Nuxt server,較慢、需要能綁定本機
// 連接埠,不應該混進 `npm run test` 的覆蓋率與速度門檔。
export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 120_000,
    // 這裡的測試檔各自會啟動一整套 Nuxt build(一個跑 nuxi generate 寫進
    // 共用的 .output,一個用 @nuxt/test-utils 開 dev server),vitest 預設
    // 跨檔案平行執行會讓兩個同時佔用大量 CPU/記憶體去跑 build,在資源有限
    // 的環境下實測會撞出 segfault 或 PostCSS context 錯誤——關掉跨檔案
    // 平行化,改成依序執行。
    fileParallelism: false,
  },
})
