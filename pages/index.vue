<script setup lang="ts">
// Sprint 1 佔位首頁,雙人工作室品牌內容(日夜模式、雙門戶導流卡片)於 Sprint 4 實作。
// 這裡先補上 SRS §2.4 要求的 WebSite JSON-LD 與基本 SEO meta,不等 Sprint 4 才補。
// SITE_URL 統一來源是 nuxt.config.ts 的 site.url(useSiteConfig 由 @nuxtjs/sitemap
// 帶的 nuxt-site-config 提供),不要在每個頁面各寫一份常數——換自訂網域時只改一個地方。
const siteConfig = useSiteConfig()

useSeoMeta({
  title: 'wei-yuu ｜ Yura & Wilson',
  description: '兩位資深前端工程師 Yura 與 Wilson 共同打造的技術工作室與個人品牌網站。',
  ogTitle: 'wei-yuu ｜ Yura & Wilson',
  ogDescription: '兩位資深前端工程師 Yura 與 Wilson 共同打造的技術工作室與個人品牌網站。',
})

useHead({
  link: [{ rel: 'canonical', href: computed(() => siteConfig.url) }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'wei-yuu',
          url: siteConfig.url,
        }),
      ),
    },
  ],
})
</script>

<template>
  <div>
    <ContextualHeader />
    <main class="flex min-h-screen flex-col items-center justify-center gap-4 bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
      <h1 class="text-2xl font-bold">wei-yuu — Yura & Wilson</h1>
      <nav class="flex gap-4 text-sm">
        <NuxtLink to="/yura" class="underline">Yura 的履歷</NuxtLink>
        <NuxtLink to="/wilson" class="underline">Wilson 的履歷</NuxtLink>
      </nav>
    </main>
  </div>
</template>
