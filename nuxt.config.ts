// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // SRS §2.1:核心框架採 SSG 靜態導出
  ssr: true,
  nitro: {
    preset: 'github-pages',
  },

  // SRS §2.1:TypeScript 5.x Strict Mode
  typescript: {
    strict: true,
    typeCheck: false, // CI 另外跑 `vue-tsc --noEmit`(Stage 1),避免重複拖慢 dev/build
  },

  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxtjs/tailwindcss'],

  image: {
    // SRS §2.1:建置期自動轉檔 WebP/AVIF
    format: ['avif', 'webp'],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant' },
    },
  },
})
