<script setup lang="ts">
import type { ProjectHighlight } from '~/types/highlight'

// SRS §4.1:案例總覽頁只放摘要跟亮點列表卡片,個別亮點的完整說明跟 Demo 各自獨立成子頁
// (bullet-engine.vue / story-timeline.vue),避免總覽頁一次載入所有亮點的 JS——彈幕引擎
// 持續跑的計時器邏輯跟故事時間軸元件不應該互相拖累對方的載入成本,Nuxt 逐頁 code-split
// 下,使用者只點開哪個亮點才會載入對應的 JS。
const siteConfig = useSiteConfig()
const pageUrl = computed(() => `${siteConfig.url}/projects/wedding`)
const { findProjectBySlug } = useProjects()
const project = findProjectBySlug('wedding')

const summary = computed(
  () => project.value?.summary || '雙人協作打造的互動婚禮網站,展示彈幕引擎與視差故事時間軸。',
)

const HIGHLIGHTS: ProjectHighlight[] = [
  {
    slug: 'bullet-engine',
    title: '賓客祝福彈幕',
    summary: '忠實移植 wei-yuu/wedding 的彈匣循環填補模式,Demo-only 即時彈幕牆。',
  },
  {
    slug: 'story-timeline',
    title: '故事時間軸',
    summary: '忠實移植 wei-yuu/wedding 的左右交錯式時間軸版面。',
  },
]

useSeoMeta({
  title: '互動婚禮網站 Case Study ｜ wei-yuu',
  description: summary,
  ogTitle: '互動婚禮網站 Case Study',
  ogDescription: summary,
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
      <p class="mt-2 text-slate-500 dark:text-slate-400">{{ summary }}</p>

      <p v-if="project?.demoUrl || project?.repoUrl" class="mt-3 flex gap-4 text-sm">
        <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank" rel="noopener" class="underline">
          線上 Demo
        </a>
        <a v-if="project.repoUrl" :href="project.repoUrl" target="_blank" rel="noopener" class="underline">
          GitHub Repo
        </a>
      </p>

      <ul class="mt-8 space-y-4">
        <li
          v-for="highlight in HIGHLIGHTS"
          :key="highlight.slug"
          class="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
        >
          <NuxtLink
            :to="`/projects/wedding/${highlight.slug}`"
            class="text-xl font-semibold hover:underline"
          >
            {{ highlight.title }}
          </NuxtLink>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ highlight.summary }}</p>
        </li>
      </ul>
    </main>
  </div>
</template>
