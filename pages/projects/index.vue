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

// Website 設計文件 §4.4(2026-09-14 確認):卡片人物標籤徽章只顯示人名,
// 不呈現完整分工說明表格(雙人分工矩陣已確認不採用)。人物識別色只用在
// 邊框上做裝飾——wy-wilson/wy-yura 對 wy-bg 的文字對比不到 3:1,達不到一般
// 文字 AA 4.5:1 的門檀,文字一律用 wy-text-secondary。
function personBadgeBorderClass(person: string) {
  const name = person.toLowerCase()
  if (name === 'wilson') return 'border-wy-wilson'
  if (name === 'yura') return 'border-wy-yura'
  return 'border-wy-border-subtle'
}

// 亮點清單目前只有婚禮案例手刻,之後新增案例時再依 slug 對應各自的清單。
function highlightsFor(slug: string) {
  return slug === 'wedding' ? WEDDING_HIGHLIGHTS : []
}
</script>

<template>
  <div>
    <ContextualHeader />
    <main>
      <!-- Website 設計文件 §4.4/§4.10(作品集):頁首淡海紋 + 右上格線 + 向左下
           延伸的潮汐曲線,標題區跟首頁 Hero 一樣用左上/右上小英文旁註夾住主
           標;裝飾層全部掛 no-print。 -->
      <section class="relative isolate overflow-hidden bg-wy-bg">
        <div aria-hidden="true" class="no-print pointer-events-none absolute inset-0 opacity-20 md:hidden">
          <NuxtImg
            src="/images/horizon-light-mobile.png"
            width="1086"
            height="1448"
            class="h-full w-full object-cover dark:hidden"
            alt=""
          />
          <NuxtImg
            src="/images/horizon-dark-mobile.png"
            width="1086"
            height="1448"
            class="hidden h-full w-full object-cover dark:block"
            alt=""
          />
        </div>
        <div aria-hidden="true" class="no-print pointer-events-none absolute inset-0 hidden opacity-20 md:block">
          <NuxtImg
            src="/images/horizon-light.png"
            width="1672"
            height="941"
            class="h-full w-full object-cover dark:hidden"
            alt=""
          />
          <NuxtImg
            src="/images/horizon-dark.png"
            width="1672"
            height="941"
            class="hidden h-full w-full object-cover dark:block"
            alt=""
          />
        </div>
        <div
          aria-hidden="true"
          class="no-print pointer-events-none absolute right-0 top-0 h-2/3 w-1/2 bg-wy-grid opacity-70"
        />
        <div
          aria-hidden="true"
          class="no-print pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-wy-bg"
        />
        <TideLines aria-hidden="true" class="no-print absolute bottom-0 left-0 w-1/3 max-w-[220px] md:w-1/4" />

        <PageContainer class="relative flex flex-col gap-8 py-12 lg:py-16">
          <div class="flex items-start justify-between gap-6">
            <div>
              <p class="text-[11px] leading-relaxed tracking-wide text-wy-text-muted">
                IDEAS FLOW<br >
                INTO REALITY<br >
                LIKE TIDES
              </p>
              <span aria-hidden="true" class="mt-2 block h-px w-8 bg-wy-text-muted" />
            </div>
            <p
              aria-hidden="true"
              class="hidden shrink-0 text-right text-[11px] leading-relaxed tracking-wide text-wy-text-muted md:block"
            >
              SMALL STEPS<br >
              BIGGER HORIZONS
            </p>
          </div>

          <div>
            <h1 class="font-serif-tc text-h1 font-semibold text-wy-text lg:text-h1-lg">一起完成的作品</h1>
            <p class="mt-2 font-display-en text-body text-wy-text-secondary">Selected work</p>
          </div>
        </PageContainer>
      </section>

      <!-- Website 設計文件 §4.4:提案採單欄通欄案例編排,首發沿用此結構;
           多專案時以相同模組往下排列,不自動改兩欄小卡。 -->
      <PageContainer class="py-10 lg:py-14">
        <p v-if="projects.length === 0" class="text-body text-wy-text-muted">作品整理中,敬請期待。</p>

        <ul v-else class="flex flex-col gap-16">
          <li v-for="project in projects" :key="project.id">
            <!-- Website 設計文件 §4.4/A08:玻璃雙圓是婚禮案例專屬封面,不是
                 全站通用樣式——其他專案不套用婚禮雙圓,缺圖時顯示固定比例的
                 中性色占位跟專案名稱。 -->
            <GlassCover v-if="project.slug === 'wedding'" class="relative">
              <p
                aria-hidden="true"
                class="absolute right-4 top-4 hidden text-right font-display-en text-[11px] leading-relaxed tracking-wide text-wy-on-image md:block"
              >
                A SPECIAL DAY<br >
                A LONGER STORY
              </p>
            </GlassCover>
            <ProjectCoverPlaceholder v-else :title="project.title" />

            <div class="mt-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
              <div>
                <NuxtLink :to="`/projects/${project.slug}`" class="hover:underline">
                  <h2 class="font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">{{ project.title }}</h2>
                </NuxtLink>
                <p class="mt-1 text-body text-wy-text-secondary">{{ project.summary }}</p>
              </div>
              <div v-if="project.roleAttribution.length" class="flex shrink-0 gap-2">
                <span
                  v-for="attribution in project.roleAttribution"
                  :key="attribution.person"
                  :class="personBadgeBorderClass(attribution.person)"
                  class="rounded-full border px-3 py-1 text-body-sm text-wy-text-secondary"
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

            <!-- Website 設計文件 §4.4(2026-09-14 確認):案例預覽改圖示＋標題＋
                 一句話的可點列表,首發預設展開,不需要先點一次才能看見。 -->
            <ul
              v-if="highlightsFor(project.slug).length"
              class="mt-6 flex flex-col divide-y divide-wy-border-subtle border-t border-wy-border-subtle md:flex-row md:divide-x md:divide-y-0"
            >
              <li v-for="highlight in highlightsFor(project.slug)" :key="highlight.slug" class="flex-1 py-4 md:px-6 md:py-6 first:md:pl-0">
                <NuxtLink :to="`/projects/${project.slug}/${highlight.slug}`" class="group flex items-start gap-3">
                  <span
                    class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wy-warm-glint/15 text-wy-warm-glint"
                  >
                    <HighlightIcon :name="highlight.icon" />
                  </span>
                  <span>
                    <span class="block font-medium text-wy-text group-hover:underline">{{ highlight.title }}</span>
                    <span class="mt-0.5 block text-body-sm text-wy-text-secondary">{{ highlight.summary }}</span>
                  </span>
                </NuxtLink>
              </li>
            </ul>

            <AppButton :to="`/projects/${project.slug}`" class="mt-6">查看完整案例 ↗</AppButton>
          </li>
        </ul>
      </PageContainer>
    </main>

    <footer class="no-print border-t border-wy-border-subtle py-8 text-body-sm text-wy-text-muted">
      <PageContainer>
        <p>© {{ new Date().getFullYear() }} Yura &amp; Wilson</p>
      </PageContainer>
    </footer>
  </div>
</template>
