<script setup lang="ts">
// SRS §4.1:案例總覽頁只放摘要跟亮點列表卡片,個別亮點的完整說明跟 Demo 各自獨立成子頁
// (bullet-engine.vue / story-timeline.vue),避免總覽頁一次載入所有亮點的 JS——彈幕引擎
// 持續跑的計時器邏輯跟故事時間軸元件不應該互相拖累對方的載入成本,Nuxt 逐頁 code-split
// 下,使用者只點開哪個亮點才會載入對應的 JS。
const siteConfig = useSiteConfig()
const pageUrl = computed(() => `${siteConfig.url}/projects/wedding`)
const ogImage = computed(() => `${siteConfig.url}/images/og-wedding.png`)
// SRS §3.2:標題/摘要來自 Projects 欄位;亮點入口與實際畫面的 alt/caption 來自
// 頁面內文的 highlights/previews 模組,跟 /projects 列表共用同一份資料。
const { project, content, findPreview } = useWeddingContent()

const summary = computed(() => project.value?.summary ?? '')
const title = computed(() => project.value?.title ?? '')
const highlights = computed(() => content.value?.highlights ?? [])
const desktopPreview = findPreview('site-desktop')
const mobilePreview = findPreview('site-mobile')
const bulletPreview = findPreview('bullet-engine')

// P1-19:兩個預覽共用的外框與圖片規則。手機單欄用 4:5(直式截圖較大),sm 以上
// 用 16:10 對齊桌機截圖比例;其他比例的圖以留白容納。
const PREVIEW_FRAME =
  'flex aspect-[4/5] items-center justify-center overflow-hidden rounded border border-wy-border-subtle bg-wy-surface p-3 sm:aspect-[16/10]'
const PREVIEW_IMAGE = 'h-full w-full object-contain'

useSeoMeta({
  title: () => `${title.value} Case Study ｜ Wei Yu`,
  description: summary,
  ogTitle: () => `${title.value} Case Study`,
  ogDescription: summary,
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
        <AppBreadcrumb :items="[{ label: '作品集', to: '/projects' }, { label: title }]" />

        <!-- Website 設計文件 §4.5(2026-10-07):內容順序為麵包屑 → 標題/摘要/技術標籤
             → 封面 → 背景/作法/成果 → 亮點入口 → Demo/Repo → 返回作品集。案例頁不顯示
             「人名:職責」分工標籤(RoleAttribution 資料與列表頁人名徽章保留)。
             這個案例頁沒有對應的 Figma 提案畫面,樣式沿用 /projects 列表頁已對過
             Figma 的既有樣式。 -->
        <div class="mt-6">
          <h1 class="font-serif-tc text-h1 font-semibold text-wy-text lg:text-h1-lg">{{ title }} Case Study</h1>
          <p class="mt-2 text-body text-wy-text-secondary">{{ summary }}</p>
        </div>

        <ul v-if="project?.techStack.length" class="mt-3 flex flex-wrap gap-1.5">
          <li
            v-for="tech in project.techStack"
            :key="tech"
            class="rounded-full border border-wy-border-subtle bg-wy-surface px-2.5 py-0.5 text-body-sm text-wy-text-secondary"
          >
            {{ tech }}
          </li>
        </ul>

        <!-- §4.4/A08:玻璃雙圓是這個案例的專屬風格封面,不是全站通用樣式。 -->
        <GlassCover class="relative mt-8" />

        <!-- P1-09/A09/A10:案例頁只使用真實上線婚禮網站的桌機/手機截圖，
             以及本專案實際彈幕 Demo 的靜態預覽；不以假 UI 或示意稿代替。 -->
        <section v-if="desktopPreview && mobilePreview && bulletPreview" class="mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">實際畫面</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">PRODUCT PREVIEW</p>
          </div>
          <!-- Website 設計文件 §4.5(2026-10-07,P1-19):網站截圖與彈幕預覽在同一斷點
               共用同一組外框(PREVIEW_FRAME),並排時頂/底對齊;圖片用 object-contain
               保持原比例,靠外框留白容納不同構圖,不拉伸也不裁切。桌機/手機截圖仍依
               sm 斷點切換來源;圖說放在框外。
               NuxtPicture + format="avif,webp" 產生 avif → webp → PNG 三層 fallback
               (Safari 15.4 不支援 AVIF);sizes 固定成單一尺寸,這些是手動切斷點的
               固定圖片,不給預設的整組響應式斷點,避免衍生出三十幾個用不到的檔案。 -->
          <div class="mt-6 grid gap-6 lg:grid-cols-2">
            <figure>
              <div :class="PREVIEW_FRAME" data-testid="preview-frame">
                <NuxtPicture
                  :src="mobilePreview.assetPath"
                  format="avif,webp"
                  width="750"
                  height="1624"
                  sizes="750px"
                  loading="lazy"
                  :alt="mobilePreview.alt"
                  :img-attrs="{ class: PREVIEW_IMAGE }"
                  class="block h-full w-full sm:hidden"
                />
                <NuxtPicture
                  :src="desktopPreview.assetPath"
                  format="avif,webp"
                  width="1600"
                  height="1000"
                  sizes="1600px"
                  loading="lazy"
                  :alt="desktopPreview.alt"
                  :img-attrs="{ class: PREVIEW_IMAGE }"
                  class="hidden h-full w-full sm:block"
                />
              </div>
              <!-- 桌機/手機共用說明由 site-desktop 的 caption 提供,site-mobile 的 caption 留空。 -->
              <figcaption v-if="desktopPreview.caption" class="mt-2 text-body-sm text-wy-text-muted">{{ desktopPreview.caption }}</figcaption>
            </figure>
            <figure>
              <div :class="PREVIEW_FRAME" data-testid="preview-frame">
                <NuxtPicture
                  :src="bulletPreview.assetPath"
                  format="avif,webp"
                  width="1600"
                  height="900"
                  sizes="1600px"
                  loading="lazy"
                  :alt="bulletPreview.alt"
                  :img-attrs="{ class: PREVIEW_IMAGE }"
                  class="block h-full w-full"
                />
              </div>
              <figcaption v-if="bulletPreview.caption" class="mt-2 text-body-sm text-wy-text-muted">{{ bulletPreview.caption }}</figcaption>
            </figure>
          </div>
        </section>

        <!-- SRS §4.1/Website 設計文件 §4.5(2026-09-21 決議):案例正文改讀
             Notion Projects 的 Background/Approach/Outcome 三個 Rich Text
             欄位,由 Notion 維護,不寫死於 Vue;取消「目標」段落,不新增 Goal
             欄位。單欄未填就隱藏對應標題,三欄皆空時整個區塊都不顯示,不回退
             到舊的硬編碼文案。文字用 whitespace-pre-line 保留 Notion 裡的
             換行,維持自然高度,不裁切內容。
             P1-20(2026-10-07):正文使用內容外框全寬,跟章節標題/封面對齊,
             不另加 max-w 縮短;這是案例背景區的個別規則。 -->
        <section v-if="project?.background || project?.approach || project?.outcome" class="mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">案例背景</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">OVERVIEW</p>
          </div>
          <dl class="mt-4 space-y-3 text-body text-wy-text-secondary" data-testid="case-overview">
            <div v-if="project.background">
              <dt class="font-medium text-wy-text">背景</dt>
              <dd class="whitespace-pre-line">{{ project.background }}</dd>
            </div>
            <div v-if="project.approach">
              <dt class="font-medium text-wy-text">作法</dt>
              <dd class="whitespace-pre-line">{{ project.approach }}</dd>
            </div>
            <div v-if="project.outcome">
              <dt class="font-medium text-wy-text">成果</dt>
              <dd class="whitespace-pre-line">{{ project.outcome }}</dd>
            </div>
          </dl>
        </section>

        <section v-if="highlights.length" class="mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">亮點入口</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">HIGHLIGHTS</p>
          </div>
          <ul class="mt-6 flex flex-col divide-y divide-wy-border-subtle md:flex-row md:divide-x md:divide-y-0">
            <li v-for="highlight in highlights" :key="highlight.slug" class="flex-1 py-4 md:px-6 md:py-2 first:md:pl-0">
              <NuxtLink :to="`/projects/wedding/${highlight.slug}`" class="group flex items-start gap-3">
                <!-- SRS §2.3(a11y 對比度審查):深色模式下 wy-wilson 圓底會變亮,
                     跟著切換的 wy-text(暖白)疊上去只剩 1.74:1,連圖示 3:1 的
                     門檔都不到——固定用 wy-on-accent 的深色模式數值,在淺色版
                     wilson(4.91:1)、深色版 wilson(7.65:1)都能穩穩過門檔,
                     詳細數據見 /projects 列表頁同一處的註解。 -->
                <span class="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-wy-wilson text-wy-text dark:text-wy-on-accent">
                  <HighlightIcon :name="highlight.icon" />
                </span>
                <span>
                  <span class="block font-serif-tc text-[20px] text-wy-text group-hover:underline md:text-[22px]">{{ highlight.title }}</span>
                  <span class="mt-0.5 block text-body-sm text-wy-text-secondary">{{ highlight.summary }}</span>
                </span>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <div class="mt-10 flex flex-wrap items-center gap-4">
          <p v-if="project?.demoUrl || project?.repoUrl" class="flex gap-4 text-body-sm">
            <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank" rel="noopener" class="underline">
              線上 Demo
            </a>
            <a v-if="project.repoUrl" :href="project.repoUrl" target="_blank" rel="noopener" class="underline">
              GitHub Repo
            </a>
          </p>
        </div>

        <AppButton to="/projects" variant="secondary" class="mt-8">
          ← 回作品集
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
