<script setup lang="ts">
const props = defineProps<{
  person: 'Yura' | 'Wilson'
  jobTitle: string
  bio: string
  email: string
  githubUrl: string | null
  linkedinUrl: string | null
}>()

const { experiences, skills, relatedProjects, status } = useProfileContent(props.person)

// Website 設計文件 §4.2(2026-09-14 確認):下載履歷直接沿用瀏覽器列印邏輯
// (§4.9),不是另外產生獨立檔案。
function downloadResume() {
  window.print()
}

// SRS v5.2.0 §3.1:聯絡入口依 Email → LinkedIn → GitHub 選第一個可用值。
// 全部空白時保留 disabled,不輸出空連結或示意帳號。
const contactUrl = computed(() => {
  if (props.email) return `mailto:${props.email}`
  return props.linkedinUrl || props.githubUrl
})

const hasContactInfo = computed(() =>
  Boolean(props.email || props.githubUrl || props.linkedinUrl),
)
</script>

<template>
  <div>
    <ContextualHeader />
    <main class="print:max-w-none print:px-0">
      <InnerPageHero content-width="resume" :lines="['SAME OCEAN', 'DIFFERENT PERSPECTIVE', 'A BRIGHTER TOMORROW']" />

      <PageContainer class="py-10 lg:py-14">
        <!-- Website 設計文件 §3.3/§4.10:橫幅下先是人物頁籤,用獨立路由的
             NuxtLink + aria-current,不是同頁切換的 tabs。 -->
        <PersonTabs class="mb-8" />

        <!-- Website 設計文件 §1.2/§4.10(視覺回饋修正):姓名/職稱區塊撐開,
             操作按鈕靠正文右側對齊(不是緊貼姓名);手機收成單欄,姓名在前、
             操作區在後,且兩顆按鈕並排。不放星座裝飾語(星座僅為品牌靈感,
             不推定職能,§1.1 已明訂),也不放大頭照(提案本身未展示大頭照,
             A06 非首發必填素材)。姓名依提案採 Georgia(font-display-en);
             姓名字級是 H1 的明確例外(桌機 72px、手機 54px,§3.1,2026-09-16
             確認),不套用一般 h1/h1-lg。
             P1-02(列印驗收時發現):職稱不能沿用 font-display-en——那是
             Georgia,提案假設職稱只會是純英文(如 pages/index.vue 首頁
             縮寫版 shortRole() 的結果),但這裡渲染的是 Notion 原始
             JobTitle 全文,真實內容是「資深前端工程師．Senior Frontend
             Engineer」這種中英夾雜。Georgia 不含中文字型資料,中文字部分
             整段落到瀏覽器/系統的字型後備(fallback),沒有內建中文字型的
             環境(包含本機列印測試用的無頭瀏覽器,以及理論上任何缺中文
             字型的系統)會直接顯示豆腐框——改用預設 font-sans(自架的
             Noto Sans TC),中英文都嵌在同一個 webfont 檔案裡,不吃系統
             字型後備。 -->
        <div class="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 class="font-display-en text-resume-name font-semibold text-wy-text lg:text-resume-name-lg">
              {{ person }}
            </h1>
            <p class="mt-2 text-h3 font-medium text-wy-text-secondary lg:text-h3-lg">
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
            <AppButton
              v-if="contactUrl"
              :to="contactUrl"
              variant="secondary"
              aria-label="聯絡我"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true">
                <rect x="2" y="3.5" width="12" height="9" rx="1.2" />
                <path d="M2.6 4.2 8 8.5l5.4-4.3" />
              </svg>
              聯絡我
            </AppButton>
            <AppButton v-else type="button" variant="secondary" disabled aria-label="聯絡我(尚未開放)">
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
        <section class="mt-12 lg:mt-16">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">關於我</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">ABOUT ME</p>
          </div>
          <p v-if="bio" class="mt-4 max-w-[720px] text-body text-wy-text-secondary">{{ bio }}</p>
        </section>

        <!-- P1-02(code review 修正):避免分頁截斷的層級要放在「單筆經歷」
             這張卡片本身(ExperienceTimeline.vue 的 <li> 已經有
             break-inside-avoid-page),不能放在整個區塊的 <section> 上。
             套在 section 等於要求「工作經歷」整段都留在同一頁,一旦內容
             長度超過單頁可用高度,瀏覽器會把整段都推到下一頁、而不是從
             中間分頁,導致第一頁留下大片空白,且下一頁還是會被迫拆開
             (因為真的放不下一整頁)——等於沒有達成效果,還製造空白。
             技能(SkillMatrix 的每個分類 div)已經有同一層級的保護,
             這裡不需要重複套。 -->
        <section class="mt-12 lg:mt-16">
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

        <section class="mt-12 lg:mt-16">
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
        <section v-if="relatedProjects.length > 0" class="mt-12 lg:mt-16">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">相關作品</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">RELATED WORK</p>
          </div>
          <ul class="mt-6 flex flex-col gap-4">
            <li v-for="project in relatedProjects" :key="project.id" class="break-inside-avoid-page">
              <NuxtLink :to="`/projects/${project.slug}`" class="group block">
                <p class="text-h3 font-semibold text-wy-text underline-offset-4 group-hover:underline lg:text-h3-lg">
                  {{ project.title }}
                </p>
                <p class="mt-1 text-body-sm text-wy-text-secondary">{{ project.summary }}</p>
              </NuxtLink>
            </li>
          </ul>
        </section>

        <section v-if="hasContactInfo" class="mt-12 lg:mt-16">
          <div class="flex items-center gap-4">
            <h2 class="shrink-0 font-serif-tc text-h2 font-semibold text-wy-text lg:text-h2-lg">聯絡資訊</h2>
            <span aria-hidden="true" class="h-px flex-1 bg-wy-border-subtle" />
            <p class="shrink-0 font-display-en text-body-sm tracking-wide text-wy-text-muted">CONTACT</p>
          </div>
          <ul class="mt-6 space-y-2 text-body-sm text-wy-text-secondary">
            <li v-if="email" class="break-inside-avoid-page">
              Email：<a :href="`mailto:${email}`" class="underline underline-offset-4">{{ email }}</a>
            </li>
            <li v-if="githubUrl" class="break-inside-avoid-page">
              GitHub：<a :href="githubUrl" class="break-all underline underline-offset-4">{{ githubUrl }}</a>
            </li>
            <li v-if="linkedinUrl" class="break-inside-avoid-page">
              LinkedIn：<a :href="linkedinUrl" class="break-all underline underline-offset-4">{{ linkedinUrl }}</a>
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
