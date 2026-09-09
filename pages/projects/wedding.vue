<script setup lang="ts">
const siteConfig = useSiteConfig()
const pageUrl = computed(() => `${siteConfig.url}/projects/wedding`)

useSeoMeta({
  title: '互動婚禮網站 Case Study ｜ wei-yuu',
  description: '雙人協作打造的互動婚禮網站,展示彈幕引擎與視差故事時間軸的技術剖析。',
  ogTitle: '互動婚禮網站 Case Study',
  ogDescription: '雙人協作打造的互動婚禮網站,展示彈幕引擎與視差故事時間軸的技術剖析。',
  ogUrl: pageUrl,
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
})
</script>

<template>
  <div>
    <ContextualHeader />
    <main class="mx-auto max-w-3xl px-4 py-8">
      <h1 class="text-3xl font-bold">互動婚禮網站 Case Study</h1>
      <p class="mt-2 text-slate-500 dark:text-slate-400">
        雙人協作打造的互動婚禮網站,展示彈幕引擎與視差故事時間軸。
      </p>

      <!-- TODO(Sprint 3 剩餘範圍):動態故事時間軸(Story Timeline)—
           IntersectionObserver 捲軸聯動 + GPU 加速視差滾動,尚未實作。 -->

      <section class="mt-8">
        <h2 class="mb-4 text-xl font-semibold">賓客祝福彈幕(Demo)</h2>
        <BulletPlayground />
      </section>
    </main>
  </div>
</template>
