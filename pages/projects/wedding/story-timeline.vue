<script setup lang="ts">
import type { Story } from '~/types/story'

const siteConfig = useSiteConfig()
const pageUrl = computed(() => `${siteConfig.url}/projects/wedding/story-timeline`)
const ogImage = computed(() => `${siteConfig.url}/images/og-story-timeline.png`)
const description = '忠實移植 wei-yuu/wedding 的左右交錯式時間軸版面。'

// §4.2.2 故事時間軸:對應 wei-yuu/wedding 的故事資料(原版來自 Google Sheets),
// 我們沒有規劃對應 Notion 資料庫,先用固定陣列撐版位,等 Yura 提供實際故事文案跟
// 照片後直接替換這份陣列內容即可,元件不需要改動。
//
// P1-10(code review 修正):year 原本放真實格式的年份(如 "2023"),跟文案裡
// 「故事文案待 Yura 補上」這種明確待補標示不一致,使用者容易誤以為時間軸的
// 日期已經確定。改成每筆都用「待確認」,month 留空(components/story/Timeline.vue
// 的 #opposite 會依 month 是否有值決定要不要補「年」「月」兩個字);事件順序
// 本身(相識→交往→求婚→婚禮)不受影響,只是不再顯示看起來很真的日期。
const STORY_PLACEHOLDER: Story[] = [
  { year: '待確認', month: '', title: '相識', description: '故事文案待 Yura 補上', majorEvent: false, color: 'blue' },
  { year: '待確認', month: '', title: '交往', description: '故事文案待 Yura 補上', majorEvent: false, color: 'pink' },
  { year: '待確認', month: '', title: '求婚', description: '故事文案待 Yura 補上', majorEvent: true, color: 'pink' },
  { year: '待確認', month: '', title: '婚禮', description: '故事文案待 Yura 補上', majorEvent: true, color: 'blue' },
]

useSeoMeta({
  title: '故事時間軸 ｜ 互動婚禮網站 Case Study',
  description,
  ogTitle: '故事時間軸',
  ogDescription: description,
  ogUrl: pageUrl,
  ogImage,
  twitterCard: 'summary_large_image',
  twitterImage: ogImage,
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
})
</script>

<template>
  <div>
    <ContextualHeader />
    <main>
      <InnerPageHero :lines="['IDEAS FLOW', 'INTO REALITY', 'LIKE TIDES']" show-grid />
      <PageContainer class="py-10 lg:py-14">
        <AppBreadcrumb
          :items="[
            { label: '作品集', to: '/projects' },
            { label: '互動婚禮網站', to: '/projects/wedding' },
            { label: '故事時間軸' },
          ]"
        />

        <!-- Website 設計文件 §4.7:內容順序為麵包屑 → 標題/簡介 → 節點 →
             返回案例。這個亮點頁沒有對應的 Figma 提案畫面,樣式沿用作品集頁
             已對過 Figma 的字級/色票。 -->
        <h1 class="mt-6 font-serif-tc text-h1 font-semibold text-wy-text lg:text-h1-lg">故事時間軸</h1>
        <p class="mt-2 max-w-[720px] text-body text-wy-text-secondary">
          忠實移植自 wei-yuu/wedding 的左右交錯式時間軸版面:純 CSS Grid 排版,桌面單雙數自動左右
          交錯、手機一律靠左,沒有 IntersectionObserver 或視差滾動。
        </p>

        <section class="mt-10">
          <StoryTimeline :stories="STORY_PLACEHOLDER" />
        </section>

        <AppButton to="/projects/wedding" variant="secondary" class="mt-10">
          ← 回互動婚禮網站 Case Study
        </AppButton>
      </PageContainer>
    </main>

    <footer class="no-print border-t border-wy-border-subtle py-8">
      <PageContainer class="flex items-center justify-between">
        <p class="font-display-en text-2xl text-wy-text">Wei Yu</p>
        <p class="text-xs text-wy-text-muted">Wilson &amp; Yura</p>
      </PageContainer>
    </footer>
  </div>
</template>
