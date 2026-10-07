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
        <section v-if="desktopPreview && mobilePreview && bulletPreview" class="mt-12">
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
                   手機 750×1624。
                   P1-09(code review 修正):原生 <picture><source> 直接
                   載入原始 PNG(桌機約 1.60MB、手機約 0.99MB),沒有經過
                   設計文件 §5.1 要求的轉碼最佳化。改用跟首頁海景圖
                   (pages/index.vue)同一套手法——兩張圖各自負責一個斷點、
                   用 class 切換顯示,而不是 <picture><source> 手動指定
                   單一 src。
                   第三輪 code review 修正:改用 NuxtImg + format="avif"
                   時,產出的 HTML 只有一個 <img src>,一律是 AVIF,沒有
                   備援格式——SRS 要求支援 Safari 15.4,但 AVIF 要 Safari
                   16 才開始支援,15.4 會直接破圖。換成 NuxtPicture +
                   format="avif,webp",它會產生真正的 <picture><source>
                   結構(avif → webp → 原始 PNG 三層 fallback),WebP 從
                   Safari 14 就支援,舊版 Safari 也不會破圖。 -->
              <!-- sizes 固定成單一尺寸(不給 $img.options.screens 的預設值):
                   這兩張圖本來就是用兩張固定圖片手動切斷點(art direction),
                   不是同一張圖縮放成不同寬度的響應式情境——不指定 sizes
                   的話,NuxtPicture 會依預設的一整組響應式斷點(320~3072px)
                   各生成一份 avif/webp/png,一張圖就衍生出三十幾個檔案,
                   generate 時間跟產物數量暴增卻完全用不到。 -->
              <NuxtPicture
                :src="mobilePreview.assetPath"
                format="avif,webp"
                width="750"
                height="1624"
                sizes="750px"
                loading="lazy"
                :alt="mobilePreview.alt"
                :img-attrs="{ class: 'aspect-[750/1624] w-full rounded border border-wy-border-subtle bg-wy-surface object-cover object-top' }"
                class="block sm:hidden"
              />
              <NuxtPicture
                :src="desktopPreview.assetPath"
                format="avif,webp"
                width="1600"
                height="1000"
                sizes="1600px"
                loading="lazy"
                :alt="desktopPreview.alt"
                :img-attrs="{ class: 'aspect-[1600/1000] w-full rounded border border-wy-border-subtle bg-wy-surface object-cover object-top' }"
                class="hidden sm:block"
              />
              <!-- 桌機/手機共用說明由 site-desktop 的 caption 提供,site-mobile 的 caption 留空。 -->
              <figcaption v-if="desktopPreview.caption" class="mt-2 text-body-sm text-wy-text-muted">{{ desktopPreview.caption }}</figcaption>
            </figure>
            <figure>
              <!-- P1-09(code review 修正):原本的截圖幾乎都是導覽列/頁首/
                   說明文字,只截到舞台最上緣,輸入框跟發送按鈕完全沒入鏡;
                   尺寸 1200×675 也低於 Website 設計文件 §5.1 的 A10 規格
                   (1600×900)。重新擷取本專案 /projects/wedding/bullet-engine
                   的實際畫面,涵蓋標題/說明/完整彈幕舞台/輸入框/發送按鈕/
                   字數提示,尺寸改為規格要求的 1600×900。
                   第二輪 code review 修正:原本截圖時 5 條彈幕都停在剛進場
                   的最右緣,只露出開頭幾個字——改成擷取前先把每條彈幕的
                   CSS animation 暫停在各自 duration 的 50% 進度,確保每句
                   祝福都完整滑進舞台中央可讀的範圍。
                   第三輪 code review 修正:NuxtImg + format="avif" 只會
                   輸出單一 AVIF,Safari 15.4 還不支援 AVIF(要到 Safari 16
                   才支援)會直接破圖。換成 NuxtPicture + format="avif,webp"
                   產生 avif → webp → 原始 PNG 三層 <picture><source>
                   fallback,WebP 從 Safari 14 就支援。 -->
              <NuxtPicture
                :src="bulletPreview.assetPath"
                format="avif,webp"
                width="1600"
                height="900"
                sizes="1600px"
                loading="lazy"
                :alt="bulletPreview.alt"
                :img-attrs="{ class: 'aspect-video w-full rounded border border-wy-border-subtle bg-wy-surface object-cover' }"
              />
              <figcaption v-if="bulletPreview.caption" class="mt-2 text-body-sm text-wy-text-muted">{{ bulletPreview.caption }}</figcaption>
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
