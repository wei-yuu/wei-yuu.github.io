<script setup lang="ts">
const siteConfig = useSiteConfig()
const pageUrl = computed(() => `${siteConfig.url}/projects/wedding/bullet-engine`)
const description = '忠實移植 wei-yuu/wedding 的彈匣循環填補模式,Demo-only 即時彈幕牆。'

useSeoMeta({
  title: '賓客祝福彈幕 ｜ 互動婚禮網站 Case Study',
  description,
  ogTitle: '賓客祝福彈幕',
  ogDescription: description,
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
      <NuxtLink to="/projects/wedding" class="text-sm text-slate-500 hover:underline dark:text-slate-400">
        ← 回互動婚禮網站 Case Study
      </NuxtLink>
      <h1 class="mt-2 text-3xl font-bold">賓客祝福彈幕</h1>
      <p class="mt-2 text-slate-500 dark:text-slate-400">
        忠實移植自 wei-yuu/wedding 真實上線版本的彈匣循環填補(Magazine Pattern):固定軌道數量,
        每軌一次僅播一則,播畢即從佇列依序抽下一則補位,序列化天生無碰撞,不需碰撞演算法。
        純前端記憶體模擬,不寫入任何後端,重新整理即清空。
      </p>

      <section class="mt-8">
        <BulletPlayground />
      </section>
    </main>
  </div>
</template>
