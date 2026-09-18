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
      <!-- Figma(node 19:1079「頁首 / 淡化海景」)比對後修正:橫幅本身只是
           窄裝飾帶(桌機 208px、手機 160px),不含主標——主標/副標在橫幅下方
           的正文區,跟左上英文旁註分開。裝飾層全部掛 no-print。 -->
      <section class="relative isolate h-40 overflow-hidden bg-wy-bg md:h-52">
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
          class="no-print pointer-events-none absolute right-0 top-0 h-[88%] w-[18%] bg-wy-grid [background-size:32px_32px]"
        />
        <div
          aria-hidden="true"
          class="no-print pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-wy-bg"
        />
        <!-- Figma(node 19:1085「潮汐曲線 / 裝飾」)比對後修正:這是一條從
             右上往右下彎落、跟右側格線交會的曲線,不是首頁那種橫跨底部的
             水平波浪——TideLines 元件形狀不合,改直接內嵌 Figma 匯出的
             strokeGeometry 路徑(填色取代描邊以還原原始線寬)。手機(node
             19:1171,143×147)跟桌機(node 19:1085,429×212)是各自獨立畫的
             曲線,不是同一條路徑等比縮放,所以分開兩組 viewBox/定位,不能
             共用一組再靠 w-[]縮放。 -->
        <svg
          aria-hidden="true"
          viewBox="0 0 143 147"
          class="no-print pointer-events-none absolute -top-[16%] left-[46%] h-auto w-[37%] text-wy-tide md:hidden"
        >
          <path
            fill="currentColor"
            d="M0 0.0262287L0.0129826 0.52606C19.1119 0.0299843 31.0667 6.65283 39.906 17.0839C48.7846 27.5612 54.5269 41.8801 61.1427 56.8533C67.7436 71.7928 75.1981 87.3352 87.5028 100.077C99.8216 112.833 116.975 122.756 142.928 126.521L143 126.026L143.072 125.531C117.325 121.796 100.378 111.97 88.2222 99.382C76.0519 86.7798 68.6564 71.3846 62.0573 56.4492C55.4731 41.5473 49.6654 27.0538 40.669 16.4374C31.6333 5.77463 19.3881 -0.977527 -0.0129826 -0.473603L0 0.0262287ZM0 7.02623L0.0129826 7.52606C19.1119 7.02998 31.0667 13.6528 39.906 24.0839C48.7846 34.5612 54.5269 48.8801 61.1427 63.8533C67.7436 78.7928 75.1981 94.3352 87.5028 107.077C99.8216 119.833 116.975 129.756 142.928 133.521L143 133.026L143.072 132.531C117.325 128.796 100.378 118.97 88.2222 106.382C76.0519 93.7798 68.6564 78.3846 62.0573 63.4492C55.4731 48.5473 49.6654 34.0538 40.669 23.4374C31.6333 12.7746 19.3881 6.02247 -0.0129826 6.5264L0 7.02623ZM0 14.0262L0.0129826 14.5261C19.1119 14.03 31.0667 20.6528 39.906 31.0839C48.7846 41.5612 54.5269 55.8801 61.1427 70.8533C67.7436 85.7928 75.1981 101.335 87.5028 114.077C99.8216 126.833 116.975 136.756 142.928 140.521L143 140.026L143.072 139.531C117.325 135.796 100.378 125.97 88.2222 113.382C76.0519 100.78 68.6564 85.3846 62.0573 70.4492C55.4731 55.5473 49.6654 41.0538 40.669 30.4374C31.6333 19.7746 19.3881 13.0225 -0.0129826 13.5264L0 14.0262ZM0 21.0262L0.0129826 21.5261C19.1119 21.03 31.0667 27.6528 39.906 38.0839C48.7846 48.5612 54.5269 62.8801 61.1427 77.8533C67.7436 92.7928 75.1981 108.335 87.5028 121.077C99.8216 133.833 116.975 143.756 142.928 147.521L143 147.026L143.072 146.531C117.325 142.796 100.378 132.97 88.2222 120.382C76.0519 107.78 68.6564 92.3846 62.0573 77.4492C55.4731 62.5473 49.6654 48.0538 40.669 37.4374C31.6333 26.7746 19.3881 20.0225 -0.0129826 20.5264L0 21.0262Z"
          />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 429 212"
          class="no-print pointer-events-none absolute -top-[17%] left-[54%] hidden h-auto w-[30%] text-wy-tide md:block"
        >
          <path
            fill="currentColor"
            d="M0 0.0190137L0.00432884 0.518995C57.6981 0.0194817 93.9065 9.41063 120.622 24.0823C147.351 38.7614 164.617 58.7417 184.438 79.5638C204.253 100.38 226.577 121.981 263.37 139.744C300.156 157.505 351.372 171.415 428.965 176.918L429 176.419L429.035 175.92C351.528 170.423 300.444 156.533 263.805 138.844C227.173 121.158 204.947 99.6582 185.162 78.8743C165.383 58.0963 147.999 37.9767 121.103 23.2058C94.1935 8.42739 57.8019 -0.981454 -0.00432884 -0.480968L0 0.0190137ZM0 7.01901L0.00432884 7.519C57.6981 7.01948 93.9065 16.4106 120.622 31.0823C147.351 45.7614 164.617 65.7417 184.438 86.5638C204.253 107.38 226.577 128.981 263.37 146.744C300.156 164.505 351.372 178.415 428.965 183.918L429 183.419L429.035 182.92C351.528 177.423 300.444 163.533 263.805 145.844C227.173 128.158 204.947 106.658 185.162 85.8743C165.383 65.0963 147.999 44.9767 121.103 30.2058C94.1935 15.4274 57.8019 6.01855 -0.00432884 6.51903L0 7.01901ZM0 14.019L0.00432884 14.519C57.6981 14.0195 93.9065 23.4106 120.622 38.0823C147.351 52.7614 164.617 72.7417 184.438 93.5638C204.253 114.38 226.577 135.981 263.37 153.744C300.156 171.505 351.372 185.415 428.965 190.918L429 190.419L429.035 189.92C351.528 184.423 300.444 170.533 263.805 152.844C227.173 135.158 204.947 113.658 185.162 92.8743C165.383 72.0963 147.999 51.9767 121.103 37.2058C94.1935 22.4274 57.8019 13.0185 -0.00432884 13.519L0 14.019ZM0 21.019L0.00432884 21.519C57.6981 21.0195 93.9065 30.4106 120.622 45.0823C147.351 59.7614 164.617 79.7417 184.438 100.564C204.253 121.38 226.577 142.981 263.37 160.744C300.156 178.505 351.372 192.415 428.965 197.918L429 197.419L429.035 196.92C351.528 191.423 300.444 177.533 263.805 159.844C227.173 142.158 204.947 120.658 185.162 99.8743C165.383 79.0963 147.999 58.9767 121.103 44.2058C94.1935 29.4274 57.8019 20.0185 -0.00432884 20.519L0 21.019ZM0 28.019L0.00432884 28.519C57.6981 28.0195 93.9065 37.4106 120.622 52.0823C147.351 66.7614 164.617 86.7417 184.438 107.564C204.253 128.38 226.577 149.981 263.37 167.744C300.156 185.505 351.372 199.415 428.965 204.918L429 204.419L429.035 203.92C351.528 198.423 300.444 184.533 263.805 166.844C227.173 149.158 204.947 127.658 185.162 106.874C165.383 86.0963 147.999 65.9767 121.103 51.2058C94.1935 36.4274 57.8019 27.0185 -0.00432884 27.519L0 28.019ZM0 35.019L0.00432884 35.519C57.6981 35.0195 93.9065 44.4106 120.622 59.0823C147.351 73.7614 164.617 93.7417 184.438 114.564C204.253 135.38 226.577 156.981 263.37 174.744C300.156 192.505 351.372 206.415 428.965 211.918L429 211.419L429.035 210.92C351.528 205.423 300.444 191.533 263.805 173.844C227.173 156.158 204.947 134.658 185.162 113.874C165.383 93.0963 147.999 72.9767 121.103 58.2058C94.1935 43.4274 57.8019 34.0185 -0.00432884 34.519L0 35.019Z"
          />
        </svg>

        <PageContainer class="relative flex h-full flex-col justify-center">
          <p class="text-[11px] leading-relaxed tracking-wide text-wy-text-muted">
            IDEAS FLOW<br >
            INTO REALITY<br >
            LIKE TIDES
          </p>
          <span aria-hidden="true" class="mt-2 block h-px w-8 bg-wy-mist" />
        </PageContainer>
      </section>

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
                   底,不是淡色 tint;圖示用 wy-text(淺色模式深色圖示、深色
                   模式暖白圖示,跟正文文字色一起隨主題切換,不是固定暖石色)。
                   量出來的圓底色實際對應 wy-wilson 這組 token 的數值(不是
                   wy-warm-glint),這裡純粹借用其暖棕色調當裝飾底色,跟人物
                   歸屬無關——沿用 Figma 既有色票,不是我方自創的意義。 -->
              <ul
                v-show="isExpanded(project.slug)"
                :id="`case-preview-${project.slug}`"
                class="mt-4 flex flex-col divide-y divide-wy-border-subtle md:flex-row md:divide-x md:divide-y-0"
              >
                <li v-for="highlight in highlightsFor(project.slug)" :key="highlight.slug" class="flex-1 py-4 md:px-6 md:py-2 first:md:pl-0">
                  <NuxtLink :to="`/projects/${project.slug}/${highlight.slug}`" class="group flex items-start gap-3">
                    <span
                      class="inline-flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full bg-wy-wilson text-wy-text"
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
