<script setup lang="ts">
import { WEDDING_HIGHLIGHTS } from '~/data/wedding-highlights'

// SRS §4.1:案例總覽頁只放摘要跟亮點列表卡片,個別亮點的完整說明跟 Demo 各自獨立成子頁
// (bullet-engine.vue / story-timeline.vue),避免總覽頁一次載入所有亮點的 JS——彈幕引擎
// 持續跑的計時器邏輯跟故事時間軸元件不應該互相拖累對方的載入成本,Nuxt 逐頁 code-split
// 下,使用者只點開哪個亮點才會載入對應的 JS。
const siteConfig = useSiteConfig()
const pageUrl = computed(() => `${siteConfig.url}/projects/wedding`)
const ogImage = computed(() => `${siteConfig.url}/images/og-wedding.png`)
const { findProjectBySlug } = useProjects()
const project = findProjectBySlug('wedding')

const summary = computed(
  () => project.value?.summary || '雙人協作打造的互動婚禮網站,展示彈幕引擎與視差故事時間軸。',
)
const title = computed(() => project.value?.title || '互動婚禮網站')

const HIGHLIGHTS = WEDDING_HIGHLIGHTS

useSeoMeta({
  title: '互動婚禮網站 Case Study ｜ Wei Yu',
  description: summary,
  ogTitle: '互動婚禮網站 Case Study',
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

        <!-- Website 設計文件 §4.5:內容順序為麵包屑 → 標題/摘要/技術與真實分工
             → 封面 → 背景/作法/成果 → 亮點入口 → Demo/Repo → 返回作品集。
             這個案例頁沒有對應的 Figma 提案畫面(該檔案只做了首頁/履歷/作品集
             列表三頁提案),依文件開頭「尚未做過的子頁視覺為沿用既定系統的實作
             建議」,標題/徽章/技術標籤等樣式直接沿用 /projects 列表頁已對過
             Figma 的既有樣式,不重新設計一套。 -->
        <div class="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 class="font-serif-tc text-h1 font-semibold text-wy-text lg:text-h1-lg">{{ title }} Case Study</h1>
            <p class="mt-2 text-body text-wy-text-secondary">{{ summary }}</p>
          </div>
          <!-- Website 設計文件 §4.5:案例詳細頁要呈現「真實分工」,不是像
               /projects 列表頁那樣只掛人名徽章——分工取實際資料(role),不把
               SRS 範例值當事實。 -->
          <div v-if="project?.roleAttribution.length" class="flex shrink-0 flex-col gap-2">
            <span
              v-for="attribution in project.roleAttribution"
              :key="attribution.person"
              class="rounded-full border border-wy-border-control px-3 py-1 text-body-sm text-wy-text"
            >
              {{ attribution.person }}<span class="text-wy-text-secondary">：{{ attribution.role }}</span>
            </span>
          </div>
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
        <section class="mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">實際畫面</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">PRODUCT PREVIEW</p>
          </div>
          <div class="mt-6 grid gap-6 lg:grid-cols-2">
            <figure>
              <!-- P1-09(code review 修正):桌機/手機截圖是直的手機跟橫的桌機
                   兩種完全不同的長寬比,原本兩者共用同一個固定 aspect-[8/5]
                   (桌機比例)——object-cover 要把直向照片硬塞進橫向的框,得把
                   圖片放大到寬度填滿整個框,結果高度大幅溢出被裁掉(舊版
                   390×844 塞進 8:5 框只留得住最上面 28.8% 高度,裁掉約
                   71%)。改成預設(手機斷點)用跟手機截圖一致的長寬比,
                   sm: 以上才切回跟桌機截圖一致的比例——兩邊長寬比都跟實際
                   圖片一致,object-cover 不會再裁到關鍵 UI。
                   兩張圖都已換成從真實上線站(wei-yuu.github.io/wedding)
                   實際擷取的畫面,解析度符合 Website 設計文件 §5.1 的
                   A09 規格(桌機 ≥1600、手機 ≥750):桌機 1600×1000、
                   手機 750×1624。 -->
              <picture>
                <source media="(max-width: 639px)" srcset="/images/wedding-site-mobile.png">
                <img
                  src="/images/wedding-site-desktop.png"
                  width="1600"
                  height="1000"
                  loading="lazy"
                  alt="互動婚禮網站首頁的實際上線畫面"
                  class="aspect-[750/1624] w-full rounded border border-wy-border-subtle bg-wy-surface object-cover object-top sm:aspect-[1600/1000]"
                >
              </picture>
              <figcaption class="mt-2 text-body-sm text-wy-text-muted">婚禮網站首頁（桌機與手機實際畫面）</figcaption>
            </figure>
            <figure>
              <!-- P1-09(code review 修正):原本的截圖幾乎都是導覽列/頁首/
                   說明文字,只截到舞台最上緣,輸入框跟發送按鈕完全沒入鏡;
                   尺寸 1200×675 也低於 Website 設計文件 §5.1 的 A10 規格
                   (1600×900)。重新擷取本專案 /projects/wedding/bullet-engine
                   的實際畫面,涵蓋標題/說明/完整彈幕舞台/輸入框/發送按鈕/
                   字數提示,尺寸改為規格要求的 1600×900。 -->
              <img
                src="/images/bullet-engine-preview.png"
                width="1600"
                height="900"
                loading="lazy"
                alt="賓客祝福彈幕引擎的實際執行畫面,含輸入框與發送按鈕"
                class="aspect-video w-full rounded border border-wy-border-subtle bg-wy-surface object-cover"
              >
              <figcaption class="mt-2 text-body-sm text-wy-text-muted">賓客祝福彈幕引擎靜態預覽</figcaption>
            </figure>
          </div>
        </section>

        <!-- SRS §4.1/Website 設計文件 §4.5(2026-09-21 決議):案例正文改讀
             Notion Projects 的 Background/Approach/Outcome 三個 Rich Text
             欄位,由 Notion 維護,不寫死於 Vue;取消「目標」段落,不新增 Goal
             欄位。單欄未填就隱藏對應標題,三欄皆空時整個區塊都不顯示,不回退
             到舊的硬編碼文案。文字用 whitespace-pre-line 保留 Notion 裡的
             換行,維持自然高度,不裁切內容。 -->
        <section v-if="project?.background || project?.approach || project?.outcome" class="mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">案例背景</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">OVERVIEW</p>
          </div>
          <dl class="mt-4 max-w-[720px] space-y-3 text-body text-wy-text-secondary">
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

        <section v-if="HIGHLIGHTS.length" class="mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">亮點入口</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">HIGHLIGHTS</p>
          </div>
          <ul class="mt-6 flex flex-col divide-y divide-wy-border-subtle md:flex-row md:divide-x md:divide-y-0">
            <li v-for="highlight in HIGHLIGHTS" :key="highlight.slug" class="flex-1 py-4 md:px-6 md:py-2 first:md:pl-0">
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
