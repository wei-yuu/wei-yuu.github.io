<script setup lang="ts">
const props = defineProps<{
  person: 'Yura' | 'Wilson'
  jobTitle: string
  bio: string
}>()

const { experiences, skills, relatedProjects, status } = useProfileContent(props.person)

// Website 設計文件 §4.2(2026-09-14 確認):下載履歷直接沿用瀏覽器列印邏輯
// (§4.9),不是另外產生獨立檔案。
function downloadResume() {
  window.print()
}
</script>

<template>
  <div>
    <ContextualHeader />
    <main class="print:max-w-none print:px-0">
      <!-- Website 設計文件 §4.10(視覺回饋修正):淡海紋橫幅是獨立的窄裝飾帶,
           不含姓名/頁籤等正文——沿用首頁 A01/A02 素材低透明度處理成「淡海紋
           質感」(專用的 A03 橫幅裁切尚未交付);裝飾層全部掛 no-print,列印
           時只留文字內容(§4.9)。旁註文字改用 muted 色(不是固定暖白的
           wy-on-image)——原因是淺色模式下海景本身偏亮,暖白文字在淺色海景
           上對比不足,muted 色雖然是隨主題變的一般文字色,但在兩種模式下都
           比固定暖白更清楚。潮汐線條移到右上角、縮小尺寸,不橫跨底部整條。 -->
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
          class="no-print pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-wy-bg"
        />
        <TideLines aria-hidden="true" class="no-print absolute right-0 top-0 w-1/3 max-w-[220px] md:w-1/4" />

        <PageContainer class="relative flex h-40 flex-col justify-center md:h-56">
          <p class="text-[11px] leading-relaxed tracking-wide text-wy-text-muted">
            SAME OCEAN<br >
            DIFFERENT PERSPECTIVE<br >
            A BRIGHTER TOMORROW
          </p>
          <span aria-hidden="true" class="mt-2 h-px w-8 bg-wy-text-muted" />
        </PageContainer>
      </section>

      <PageContainer class="py-10 lg:py-14">
        <!-- Website 設計文件 §3.3/§4.10:橫幅下先是人物頁籤,用獨立路由的
             NuxtLink + aria-current,不是同頁切換的 tabs。 -->
        <PersonTabs class="mb-8" />

        <!-- Website 設計文件 §1.2/§4.10(視覺回饋修正):姓名/職稱區塊撐開,
             操作按鈕靠正文右側對齊(不是緊貼姓名);手機收成單欄,姓名在前、
             操作區在後,且兩顆按鈕並排。不放星座裝飾語(星座僅為品牌靈感,
             不推定職能,§1.1 已明訂),也不放大頭照(提案本身未展示大頭照,
             A06 非首發必填素材)。姓名/職稱依提案採 Georgia(font-display-en)。 -->
        <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 class="font-display-en text-h1 font-semibold text-wy-text lg:text-h1-lg">{{ person }}</h1>
            <p class="mt-2 font-display-en text-h3 font-medium text-wy-text-secondary lg:text-h3-lg">
              {{ jobTitle }}
            </p>
          </div>

          <!-- Website 設計文件 §4.2(2026-09-14 確認):聯絡我按鈕在聯絡方式資料
               到位前維持 disabled,只做視覺樣式(AppButton 的 disabled 狀態
               本身就會換底色跟文字色)。下載/聯絡改用線條圖示,不是文字符號。 -->
          <div class="flex flex-row gap-3 md:flex-col md:border-l md:border-wy-border-subtle md:pl-8">
            <AppButton type="button" @click="downloadResume">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
                <path d="M8 2v7m0 0-3-3m3 3 3-3" />
                <path d="M2.5 11v1.5A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V11" />
              </svg>
              下載履歷
            </AppButton>
            <AppButton type="button" variant="secondary" disabled aria-label="聯絡我(尚未開放)">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
                <rect x="2" y="3.5" width="12" height="9" rx="1.2" />
                <path d="M2.6 4.2 8 8.5l5.4-4.3" />
              </svg>
              聯絡我
            </AppButton>
          </div>
        </div>

        <!-- Website 設計文件 §4.10:內容為「關於我/ABOUT ME」→「工作經歷/EXPERIENCE」
             →「技能/SKILLS」→「相關作品」,關於我是獨立段落,不縮在姓名下當一行
             副標。中文段落標題用 Noto Serif TC(font-serif-tc);標題—細橫線—
             英文小標同列呈現,不是細線在整列下方。 -->
        <section class="mt-10 break-inside-avoid-page lg:mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">關於我</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">ABOUT ME</p>
          </div>
          <p v-if="bio" class="mt-4 max-w-[720px] text-body text-wy-text-secondary">{{ bio }}</p>
        </section>

        <section class="mt-10 break-inside-avoid-page lg:mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">工作經歷</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">EXPERIENCE</p>
          </div>
          <p v-if="status === 'pending'" class="mt-4 text-body-sm text-wy-text-muted">載入中...</p>
          <p v-else-if="status === 'error'" class="mt-4 text-body-sm text-wy-error">經歷載入失敗,請稍後再試。</p>
          <p v-else-if="experiences.length === 0" class="mt-4 text-body-sm text-wy-text-muted">尚無經歷資料。</p>
          <ExperienceTimeline v-else class="mt-6" :items="experiences" :person="person" />
        </section>

        <section class="mt-10 break-inside-avoid-page lg:mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">技能</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">SKILLS</p>
          </div>
          <p v-if="status === 'pending'" class="mt-4 text-body-sm text-wy-text-muted">載入中...</p>
          <SkillMatrix v-else class="mt-6" :items="skills" />
        </section>

        <!-- Website 設計文件 §4.2 內容順序「相關作品入口」:只連到該人參與過的
             案例,用 RoleAttribution 篩選,不是列出全站所有專案。 -->
        <section v-if="relatedProjects.length > 0" class="mt-10 break-inside-avoid-page lg:mt-12">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">相關作品</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">RELATED WORK</p>
          </div>
          <ul class="mt-6 flex flex-col gap-4">
            <li v-for="project in relatedProjects" :key="project.id">
              <NuxtLink :to="`/projects/${project.slug}`" class="group block">
                <p class="text-h3 font-semibold text-wy-text underline-offset-4 group-hover:underline lg:text-h3-lg">
                  {{ project.title }}
                </p>
                <p class="mt-1 text-body-sm text-wy-text-secondary">{{ project.summary }}</p>
              </NuxtLink>
            </li>
          </ul>
        </section>
      </PageContainer>
    </main>

    <footer class="no-print border-t border-wy-border-subtle py-8 text-body-sm text-wy-text-muted">
      <PageContainer>
        <p>© {{ new Date().getFullYear() }} Yura &amp; Wilson</p>
      </PageContainer>
    </footer>
  </div>
</template>
