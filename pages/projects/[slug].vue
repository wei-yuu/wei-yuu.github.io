<script setup lang="ts">
// P1-04:/projects 列表頁的卡片連結一律指向 /projects/{slug},但先前只有
// wedding 案例手刻了對應頁面——Notion 新增其他專案時,列表頁本身雖然是
// 資料驅動、能正確多長出一張卡片,點進去卻會落到不存在的路由(404)。
// 這個檔案接住「除了 wedding 以外」的所有 slug,由 Projects 資料庫直接
// 產生案例頁,不用每新增一個專案就手刻一份 Vue 檔案。wedding 有自己的
// 手刻亮點 Demo(bullet-engine/story-timeline),繼續交給
// pages/projects/wedding/index.vue 這個更具體的靜態路由處理——Nuxt 的
// 檔案路由對同一路徑會優先比對靜態路由,動態的 [slug] 不會搶到
// /projects/wedding。
import type { ProfileContent } from '~/types/notion'

const route = useRoute()
const slug = computed(() => String(route.params.slug))

const siteConfig = useSiteConfig()

// P1-04(修正):不能沿用 useProjects() 的 findProjectBySlug 後就同步檢查
// project.value 是否存在——useAsyncData 在這裡是透過 onServerPrefetch 讓
// SSR 等待,那個等待動作發生在整個 <script setup> 同步執行完之後,此時
// project.value 還是初始值(undefined),同步檢查一定會誤判成「找不到」,
// 讓每個合法 slug 都被錯誤導向 404(實測用假的第二個專案驗證時抓到)。
// 改成直接 await useAsyncData 本身,等資料真正回來後才判斷。key 沿用跟
// useProjects() 相同的 'site-content-projects',共用同一份 payload 快取。
const { data: content } = await useAsyncData<ProfileContent>('site-content-projects', () =>
  $fetch('/api/content'),
)
const project = computed(() => content.value?.projects.find((item) => item.slug === slug.value))

// slug 對不到任何專案時當成 404,不要顯示一個標題/內容全空的頁面。
if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: '找不到這個作品' })
}

const title = computed(() => project.value?.title ?? '')
const summary = computed(() => project.value?.summary ?? '')
const pageUrl = computed(() => `${siteConfig.url}/projects/${slug.value}`)
// P1-08:沒有經確認的專案專屬封面時，不生成假 UI；動態案例先沿用
// 作品集 OG 圖，待真實素材交付後再為該 slug 指定獨立圖片。
const ogImage = computed(() => `${siteConfig.url}/images/og-projects.png`)

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

        <!-- 沿用 /projects 列表頁跟 wedding 案例頁已對過 Figma 的既有樣式,
             這個泛用案例頁沒有專屬設計稿。 -->
        <div class="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 class="font-serif-tc text-h1 font-semibold text-wy-text lg:text-h1-lg">{{ title }} Case Study</h1>
            <p class="mt-2 text-body text-wy-text-secondary">{{ summary }}</p>
          </div>
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

        <!-- P1-08 尚未補齊真實封面素材前,沿用 /projects 列表頁對非婚禮案例
             的占位處理,不能顯示破圖或假截圖。 -->
        <ProjectCoverPlaceholder :title="title" class="mt-8" />

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
