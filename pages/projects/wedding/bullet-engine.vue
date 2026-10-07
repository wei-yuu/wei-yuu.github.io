<script setup lang="ts">
// SRS §3.2 / Website 設計文件 §4.6:標題、摘要、簡介讀 highlights/bullet-engine,
// Demo-only 提醒、使用說明與技術說明讀 bullet-notes,預設祝福讀 default-wishes;
// 章節標題、表單 UI 文字與限制數值留在程式碼。
const siteConfig = useSiteConfig()
const pageUrl = computed(() => `${siteConfig.url}/projects/wedding/bullet-engine`)
const ogImage = computed(() => `${siteConfig.url}/images/og-bullet-engine.png`)

const { content, findHighlight } = useWeddingContent()
const highlight = findHighlight('bullet-engine')
const notes = computed(() => content.value?.bulletNotes)
const title = computed(() => highlight.value?.title ?? '')
const description = computed(() => highlight.value?.summary ?? '')

const usageNotes = computed(() =>
  (notes.value?.usage ?? []).map((note) =>
    fillUsagePlaceholders(note, {
      maxLength: BULLET_MAX_LENGTH,
      throttleSeconds: BULLET_THROTTLE_MS / 1000,
      demoOnly: notes.value?.demoOnly ?? '',
    }),
  ),
)

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

        <!-- Website 設計文件 §4.6:內容順序為麵包屑 → 模組目的與真實來源 →
             Demo → 使用說明與限制 → 技術說明 → 返回案例。這個亮點頁沒有對應
             的 Figma 提案畫面,樣式沿用作品集頁已對過 Figma 的字級/色票。 -->
        <h1 class="mt-6 font-serif-tc text-h1 font-semibold text-wy-text lg:text-h1-lg">{{ title }}</h1>
        <p v-if="highlight" class="mt-2 max-w-[720px] text-body text-wy-text-secondary">{{ highlight.intro }}</p>

        <section v-if="content" class="mt-10">
          <BulletPlayground :default-wishes="content.defaultWishes" :demo-only-note="content.bulletNotes.demoOnly" />
        </section>

        <section v-if="usageNotes.length" class="mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">使用說明與限制</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">USAGE</p>
          </div>
          <ul class="mt-4 max-w-[720px] list-disc space-y-1.5 pl-5 text-body text-wy-text-secondary">
            <li v-for="note in usageNotes" :key="note">{{ note }}</li>
          </ul>
        </section>

        <section v-if="notes" class="mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">技術說明</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">HOW IT WORKS</p>
          </div>
          <p class="mt-4 max-w-[720px] whitespace-pre-line text-body text-wy-text-secondary">{{ notes.tech }}</p>
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
