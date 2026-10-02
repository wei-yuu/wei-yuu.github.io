<script setup lang="ts">
import { WEDDING_HIGHLIGHTS } from '~/data/wedding-highlights'

// SRS §4.1:/projects 是資料驅動的列表頁,卡片點進去對應各自手刻的 /projects/{slug} 詳情頁。
const siteConfig = useSiteConfig()
const pageUrl = computed(() => `${siteConfig.url}/projects`)
const { projects } = useProjects()

useSeoMeta({
  title: '專案作品集 ｜ Wei Yu',
  description: 'Yura 與 Wilson 的作品集專案列表,點進去看每個案例的技術亮點剖析。',
  ogTitle: '專案作品集',
  ogDescription: 'Yura 與 Wilson 的作品集專案列表,點進去看每個案例的技術亮點剖析。',
  ogUrl: pageUrl,
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
})

// 亮點清單目前只有婚禮案例手刻,之後新增案例時再依 slug 對應各自的清單。
function highlightsFor(slug: string) {
  return slug === 'wedding' ? WEDDING_HIGHLIGHTS : []
}

// Figma(node 19:1117「案例預覽 / 預設展開」)比對後新增:標題旁有獨立的
// 收合切換鈕(－/＋圖示),首發預設展開,不需要先點一次才能看見——依 §4.4
// 若保留收合功能就要用 aria-expanded/aria-controls 的規則實作。
const collapsedSlugs = ref(new Set<string>())

function isExpanded(slug: string) {
  return !collapsedSlugs.value.has(slug)
}

function toggleHighlights(slug: string) {
  const next = new Set(collapsedSlugs.value)
  if (next.has(slug)) next.delete(slug)
  else next.add(slug)
  collapsedSlugs.value = next
}
</script>

<template>
  <div>
    <ContextualHeader />
    <main>
      <InnerPageHero :lines="['IDEAS FLOW', 'INTO REALITY', 'LIKE TIDES']" show-grid />

      <PageContainer class="py-10 lg:py-14">
        <div class="flex items-start justify-between gap-6">
          <div>
            <h1 class="font-serif-tc text-h1 font-semibold text-wy-text lg:text-h1-lg">一起完成的作品</h1>
            <p class="mt-2 font-display-en text-2xl text-wy-text md:text-3xl">Selected work</p>
          </div>
          <div aria-hidden="true" class="hidden shrink-0 md:block">
            <p class="text-left text-[11px] leading-relaxed tracking-wide text-wy-text-muted">
              SMALL STEPS<br>
              BIGGER HORIZONS
            </p>
            <span class="mt-1 block h-px w-6 bg-wy-mist" />
          </div>
        </div>

        <p v-if="projects.length === 0" class="mt-10 text-body text-wy-text-muted">作品整理中,敬請期待。</p>

        <!-- Website 設計文件 §4.4:提案採單欄通欄案例編排,首發沿用此結構;
             多專案時以相同模組往下排列,不自動改兩欄小卡。 -->
        <ul v-else class="mt-10 flex flex-col gap-16">
          <li v-for="project in projects" :key="project.id">
            <!-- Website 設計文件 §4.4/A08:玻璃雙圓是婚禮案例專屬封面,不是
                 全站通用樣式——其他專案不套用婚禮雙圓,缺圖時顯示固定比例的
                 中性色占位跟專案名稱。 -->
            <!-- Figma(node 19:1104「封面英文旁註」)比對後修正:淺色封面底
                 是米白純色,不是海景照片,固定暖白的 wy-on-image 在這裡對比
                 不足——實際量出的字色是 wy-text-muted、無襯線、靠左對齊,
                 下方還有一條細短線(色票對應「潮汐曲線」那個變數,取近似的
                 wy-mist)。 -->
            <GlassCover v-if="project.slug === 'wedding'" class="relative">
              <div aria-hidden="true" class="absolute left-[76%] top-[40%] hidden md:block">
                <p class="text-left text-[11px] leading-relaxed tracking-wide text-wy-text-muted">
                  A SPECIAL DAY<br>
                  A LONGER STORY
                </p>
                <span class="mt-1 block h-px w-6 bg-wy-mist" />
              </div>
            </GlassCover>
            <ProjectCoverPlaceholder v-else :title="project.title" />

            <div class="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <NuxtLink :to="`/projects/${project.slug}`" class="hover:underline">
                  <h2 class="font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">{{ project.title }}</h2>
                </NuxtLink>
                <p class="mt-1 text-body text-wy-text-secondary">{{ project.summary }}</p>
              </div>
              <!-- Figma(node 19:1112/19:1114「人物標籤」)比對後修正:兩個
                   人名徽章共用同一組中性邊框/文字色,沒有依人物套暖石色/
                   霧藍色分開——人物識別色只用在履歷經歷時間軸節點,不是這裡。 -->
              <div v-if="project.roleAttribution.length" class="flex shrink-0 gap-2">
                <span
                  v-for="attribution in project.roleAttribution"
                  :key="attribution.person"
                  class="rounded-full border border-wy-border-control px-3 py-1 text-body-sm text-wy-text"
                >
                  {{ attribution.person }}
                </span>
              </div>
            </div>

            <ul v-if="project.techStack.length" class="mt-3 flex flex-wrap gap-1.5">
              <li
                v-for="tech in project.techStack"
                :key="tech"
                class="rounded-full border border-wy-border-subtle bg-wy-surface px-2.5 py-0.5 text-body-sm text-wy-text-secondary"
              >
                {{ tech }}
              </li>
            </ul>

            <p v-if="project.demoUrl || project.repoUrl" class="mt-3 flex gap-4 text-body-sm">
              <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank" rel="noopener" class="underline">
                線上 Demo
              </a>
              <a v-if="project.repoUrl" :href="project.repoUrl" target="_blank" rel="noopener" class="underline">
                GitHub Repo
              </a>
            </p>

            <!-- Figma(node 19:1118/19:1124「案例預覽標題」/「案例亮點」)
                 比對後修正:標題是襯線字 22/26px(不是無襯線 16px),收合鈕
                 緊貼在標題右邊(不是被 justify-between 推到最右);亮點標題
                 也是襯線 20/22px,圖示圓底是 52px(不是 36px)。 -->
            <div v-if="highlightsFor(project.slug).length" class="mt-6 border-t border-wy-border-subtle pt-4">
              <div class="flex items-center gap-3">
                <p class="font-serif-tc text-[22px] text-wy-text md:text-[26px]">案例預覽</p>
                <button
                  type="button"
                  class="inline-flex h-11 w-11 items-center justify-center rounded text-wy-text-secondary hover:text-wy-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wy-focus"
                  :aria-expanded="isExpanded(project.slug)"
                  :aria-controls="`case-preview-${project.slug}`"
                  @click="toggleHighlights(project.slug)"
                >
                  <span class="sr-only">{{ isExpanded(project.slug) ? '收合案例預覽' : '展開案例預覽' }}</span>
                  <svg v-if="isExpanded(project.slug)" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="h-3 w-3" aria-hidden="true">
                    <path d="M1 6h10" />
                  </svg>
                  <svg v-else viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" class="h-3 w-3" aria-hidden="true">
                    <path d="M6 1v10M1 6h10" />
                  </svg>
                </button>
              </div>

              <!-- Website 設計文件 §4.4(2026-09-14 確認):案例預覽改圖示＋標題＋
                   一句話的可點列表,首發預設展開,不需要先點一次才能看見。
                   Figma(node 19:1125「圖示圓底」)比對後修正:圓底是實色暖石
                   底,不是淡色 tint。量出來的圓底色實際對應 wy-wilson 這組
                   token 的數值(不是 wy-warm-glint),這裡純粹借用其暖棕色調
                   當裝飾底色,跟人物歸屬無關——沿用 Figma 既有色票,不是我方
                   自創的意義。
                   SRS §2.3(a11y 對比度審查):圖示原本跟著 wy-text 隨主題切
                   換,深色模式下 wy-wilson 會變得比淺色模式更亮(暖石色刻意
                   調亮以在深色底上維持可見度),疊上同樣變亮的 wy-text(暖白)
                   後兩者亮度接近,實測對比只有 1.74:1,連圖示用的 3:1 門檔
                   都不到。改成深色模式固定用 wy-on-accent 的深色模式數值
                   (直接借用該 token,不是語意上「這是強調色上的文字」)—
                   —這個值不管在淺色版 wilson(4.91:1)或深色版 wilson
                   (7.65:1)上都穩穩過門檔,比繼續跟著 wy-text 走更安全。 -->
              <ul
                v-show="isExpanded(project.slug)"
                :id="`case-preview-${project.slug}`"
                class="mt-4 flex flex-col divide-y divide-wy-border-subtle md:flex-row md:divide-x md:divide-y-0"
              >
                <li v-for="highlight in highlightsFor(project.slug)" :key="highlight.slug" class="flex-1 py-4 md:px-6 md:py-2 first:md:pl-0">
                  <NuxtLink :to="`/projects/${project.slug}/${highlight.slug}`" class="group flex items-start gap-3">
                    <span
                      class="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-wy-wilson text-wy-text dark:text-wy-on-accent"
                    >
                      <HighlightIcon :name="highlight.icon" />
                    </span>
                    <span>
                      <span class="block font-serif-tc text-[20px] text-wy-text group-hover:underline md:text-[22px]">{{ highlight.title }}</span>
                      <span class="mt-0.5 block text-body-sm text-wy-text-secondary">{{ highlight.summary }}</span>
                    </span>
                  </NuxtLink>
                </li>
              </ul>
            </div>

            <AppButton :to="`/projects/${project.slug}`" class="mt-6">
              查看完整案例
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" class="h-3.5 w-3.5" aria-hidden="true">
                <path d="M3 9l6-6" />
                <path d="M4.5 3H9v4.5" />
              </svg>
            </AppButton>
          </li>
        </ul>
      </PageContainer>
    </main>

    <!-- Figma(node 19:1148「頁尾資訊」)比對後修正:左邊字標「Wei Yu」
         (Georgia 24px)、右邊「Wilson & Yura」(12px),不是置中的一行
         copyright 文字。 -->
    <footer class="no-print border-t border-wy-border-subtle py-8">
      <PageContainer class="flex items-center justify-between">
        <p class="font-display-en text-2xl text-wy-text">Wei Yu</p>
        <p class="text-xs text-wy-text-muted">Wilson &amp; Yura</p>
      </PageContainer>
    </footer>
  </div>
</template>
