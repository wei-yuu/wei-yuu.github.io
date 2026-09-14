<script setup lang="ts">
import type { Story } from '~/types/story'

const siteConfig = useSiteConfig()
const pageUrl = computed(() => `${siteConfig.url}/projects/wedding/story-timeline`)
const description = '忠實移植 wei-yuu/wedding 的左右交錯式時間軸版面。'

// §4.2.2 故事時間軸:對應 wei-yuu/wedding 的故事資料(原版來自 Google Sheets),
// 我們沒有規劃對應 Notion 資料庫,先用固定陣列撐版位,等 Yura 提供實際故事文案跟
// 照片後直接替換這份陣列內容即可,元件不需要改動。
const STORY_PLACEHOLDER: Story[] = [
  { year: '2023', month: '1', title: '相識', description: '故事文案待 Yura 補上', majorEvent: false, color: 'blue' },
  { year: '2023', month: '6', title: '交往', description: '故事文案待 Yura 補上', majorEvent: false, color: 'pink' },
  { year: '2024', month: '2', title: '求婚', description: '故事文案待 Yura 補上', majorEvent: true, color: 'pink' },
  { year: '2024', month: '10', title: '婚禮', description: '故事文案待 Yura 補上', majorEvent: true, color: 'blue' },
]

useSeoMeta({
  title: '故事時間軸 ｜ 互動婚禮網站 Case Study',
  description,
  ogTitle: '故事時間軸',
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
      <h1 class="mt-2 text-3xl font-bold">故事時間軸</h1>
      <p class="mt-2 text-slate-500 dark:text-slate-400">
        忠實移植自 wei-yuu/wedding 的左右交錯式時間軸版面:純 CSS Grid 排版,桌面單雙數自動左右
        交錯、手機一律靠左,沒有 IntersectionObserver 或視差滾動。
      </p>

      <section class="mt-8">
        <StoryTimeline :stories="STORY_PLACEHOLDER" />
      </section>
    </main>
  </div>
</template>
