// @ts-check
// SRS §5.2 Stage 1:`eslint .` 為 CI 第一道驗證卡點
// 需先執行過一次 `npm run postinstall`(即 `nuxt prepare`)產生 ./.nuxt/eslint.config.mjs
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt()
