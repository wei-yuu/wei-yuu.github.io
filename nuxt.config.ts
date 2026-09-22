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

  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxtjs/tailwindcss', '@nuxtjs/sitemap', '@nuxt/fonts'],

  // Website 設計文件 §3.1:正文/導覽用 Noto Sans TC,中文標題可選 Noto Serif TC。
  // @nuxt/fonts 會自動掃描實際用到的 font-family 並自架(self-host),不用自
  // 己手動連 Google Fonts CDN,對 §2.2 的 LCP 門檻更友善。
  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
      subsets: ['latin', 'chinese-traditional'],
    },
  },

  css: ['~/assets/css/main.css'],

  image: {
    // SRS §2.1:建置期自動轉檔 WebP/AVIF
    format: ['avif', 'webp'],
  },

  // SRS §2.4:@nuxtjs/sitemap 需要知道網站正式網域才能產出正確的絕對網址
  site: {
    url: 'https://wei-yuu.github.io',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant' },
      // Website 設計文件 §5(A12):品牌 favicon,取代 Nuxt 預設的 favicon.ico。
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      // SRS §2.8/Website 設計文件 §3.4:防止首屏主題閃爍。這段必須在 Vue
      // 掛載前、瀏覽器解析到 <body> 之前同步執行完,所以用原生 inline script
      // 直接操作 DOM,不能等 composable/plugin 掛載後才處理。
      script: [
        {
          key: 'wy-theme-init',
          innerHTML: `(function(){try{var s=localStorage.getItem('wy-theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
        },
      ],
    },
  },
})
