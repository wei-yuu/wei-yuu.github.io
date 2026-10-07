<script setup lang="ts">
// SRS §3.2 / Website 設計文件 §4.7:標題、摘要、簡介讀 highlights/story-timeline,
// 事件讀 story-events;pending 日期顯示「待確認」,照片路徑空白時維持占位。
const siteConfig = useSiteConfig()
const pageUrl = computed(() => `${siteConfig.url}/projects/wedding/story-timeline`)
const ogImage = computed(() => `${siteConfig.url}/images/og-story-timeline.png`)

const { content, findHighlight } = useWeddingContent()
const highlight = findHighlight('story-timeline')
const title = computed(() => highlight.value?.title ?? '')
const description = computed(() => highlight.value?.summary ?? '')
const stories = computed(() => toStoryItems(content.value?.storyEvents ?? []))

useSeoMeta({
  title: () => `${title.value} ｜ 互動婚禮網站 Case Study`,
  description,
  ogTitle: title,
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
            { label: title },
          ]"
        />

        <!-- Website 設計文件 §4.7:內容順序為麵包屑 → 標題/簡介 → 節點 →
             返回案例。這個亮點頁沒有對應的 Figma 提案畫面,樣式沿用作品集頁
             已對過 Figma 的字級/色票。 -->
        <h1 class="mt-6 font-serif-tc text-h1 font-semibold text-wy-text lg:text-h1-lg">{{ title }}</h1>
        <p v-if="highlight" class="mt-2 max-w-[720px] text-body text-wy-text-secondary">{{ highlight.intro }}</p>

        <section v-if="stories.length" class="mt-10">
          <StoryTimeline :stories="stories" />
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
