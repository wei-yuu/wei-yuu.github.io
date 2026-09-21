<script setup lang="ts">
import { WEDDING_HIGHLIGHTS } from '~/data/wedding-highlights'

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
const title = computed(() => project.value?.title || '互動婚禮網站')

const HIGHLIGHTS = WEDDING_HIGHLIGHTS

useSeoMeta({
  title: '互動婚禮網站 Case Study ｜ Wei Yu',
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
    <main>
      <PageContainer class="py-10 lg:py-14">
        <AppBreadcrumb :items="[{ label: '作品集', to: '/projects' }, { label: title }]" />

        <!-- Website 設計文件 §4.5:內容順序為麵包屑 → 標題/摘要/技術與真實分工
             → 封面 → 背景/目標/作法/成果 → 亮點入口 → Demo/Repo → 返回作品集。
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

        <section class="mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">案例背景</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">OVERVIEW</p>
          </div>
          <dl class="mt-4 max-w-[720px] space-y-3 text-body text-wy-text-secondary">
            <div>
              <dt class="font-medium text-wy-text">背景</dt>
              <dd>雙人工作室作品集的第一個案例,忠實複刻 Yura 與 Wilson 真實上線的婚禮網站 wei-yuu/wedding。</dd>
            </div>
            <div>
              <dt class="font-medium text-wy-text">目標</dt>
              <dd>在求職導向的作品集裡完整重現這個案例最值得展示的技術模組,而不是重新設計一個新網站。</dd>
            </div>
            <div>
              <dt class="font-medium text-wy-text">作法</dt>
              <dd>
                彈幕牆移植自真實 repo 的彈匣循環填補模式,故事時間軸移植自真實 repo 的純 CSS Grid
                交錯排版——兩者都比 SRS 原本規劃的做法更單純,細節見下方各亮點頁。
              </dd>
            </div>
            <div>
              <dt class="font-medium text-wy-text">成果</dt>
              <dd>兩個模組皆為 Demo-only 呈現,不寫入任何後端;完整原始碼可從下方 GitHub Repo 查看。</dd>
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
                <span class="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-wy-wilson text-wy-text">
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
