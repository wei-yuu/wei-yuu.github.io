<script setup lang="ts">
// Website 設計文件 §4.1:首頁順序——共用導覽 → 海平線 Hero(含 Wilson/Yura 履歷
// 入口)→ 精選作品導流 → 頁尾。作品連結一律指向 /projects,不直達單一案例
// (即使該案例是 Featured),已在 §4.1 確認;首頁不揭露特定案例名稱,只做通用
// 導流(2026-09-14 提案樣式確認)。
//
// A01/A02(首頁淺色/深色海景圖)已取得,存放於 public/images/,依斷點與明暗
// 各自對應 4 個檔案(見下方 template 的說明)。
const siteConfig = useSiteConfig();
const { profile: wilsonProfile } = useProfileContent("Wilson");
const { profile: yuraProfile } = useProfileContent("Yura");
const { projects } = useProjects();

const description =
  "兩位資深前端工程師 Yura 與 Wilson 共同打造的技術工作室與個人品牌網站。";

// 星座是品牌靈感裝飾(不推定職能),搭配 People 資料庫的真實職稱英文部分,
// 組成提案樣式裡「Libra · Frontend Engineer」這種簡短單行介紹。
function shortRole(jobTitle: string | undefined, fallback: string) {
  const en = jobTitle?.split(/[.．]/).at(-1)?.trim();
  return en || fallback;
}
const wilsonRole = computed(() =>
  shortRole(wilsonProfile.value?.jobTitle, "Frontend Engineer"),
);
const yuraRole = computed(() =>
  shortRole(yuraProfile.value?.jobTitle, "Frontend Engineer"),
);

useSeoMeta({
  title: "Wei Yu ｜ Yura & Wilson",
  description,
  ogTitle: "Wei Yu ｜ Yura & Wilson",
  ogDescription: description,
});

useHead({
  link: [{ rel: "canonical", href: computed(() => siteConfig.url) }],
  script: [
    {
      type: "application/ld+json",
      innerHTML: computed(() =>
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Wei Yu",
          url: siteConfig.url,
        }),
      ),
    },
  ],
});
</script>

<template>
  <div>
    <ContextualHeader />

    <section class="relative overflow-hidden bg-wy-bg">
      <!-- Website 設計文件 §5(A01/A02):純裝飾海景,不承載文字資訊,alt 留空。
           手機/桌機是不同構圖裁切(3:4 vs 16:9),不是同一張圖縮放,所以用兩層
           wrapper 各自負責一個軸(斷點/明暗),每層內只有一個 dark: 開關,避免
           疑義。dark: 類別在 Vue 掛載前就由防閃爍 script 設好,不會有 hydration
           時的內容閃爍。 -->
      <div aria-hidden="true" class="absolute inset-0 md:hidden">
        <NuxtImg
          src="/images/horizon-light-mobile.png"
          format="avif"
          width="1086"
          height="1448"
          fetchpriority="high"
          class="h-full w-full object-cover dark:hidden"
          alt=""
        />
        <NuxtImg
          src="/images/horizon-dark-mobile.png"
          format="avif"
          width="1086"
          height="1448"
          fetchpriority="high"
          class="hidden h-full w-full object-cover dark:block"
          alt=""
        />
      </div>
      <div aria-hidden="true" class="absolute inset-0 hidden md:block">
        <NuxtImg
          src="/images/horizon-light.png"
          format="avif"
          width="1672"
          height="941"
          fetchpriority="high"
          class="h-full w-full object-cover dark:hidden"
          alt=""
        />
        <NuxtImg
          src="/images/horizon-dark.png"
          format="avif"
          width="1672"
          height="941"
          fetchpriority="high"
          class="hidden h-full w-full object-cover dark:block"
          alt=""
        />
      </div>
      <!-- Website 設計文件 §2.2:海景文字遮罩,確保姓名/簡介文字對照片的對比度
           足夠,而不是靠文字陰影補救(§2.6)。底部漸層改成收斂到 wy-bg(不是
           固定的 wy-scrim 深色)——wy-bg 本身就跟著明暗模式變(淺色=米白、
           深色=深藍),跟 wy-text 的明暗互補,同時漸層終點正好等於下一段的
           背景色,兩段之間不會有色塊分界,不需要另外一塊轉場 div。 -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-0 bg-gradient-to-r from-wy-hero-start to-wy-hero-end"
      />
      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-b from-transparent to-wy-bg"
      />

      <PageContainer
        class="relative flex min-h-[480px] flex-col justify-between py-10 lg:min-h-[640px] lg:py-14"
      >
        <div class="flex items-start justify-between gap-6">
          <div>
            <p
              class="font-display-en text-body-sm italic text-wy-text-secondary"
            >
              Two perspectives. One shared horizon.
            </p>
            <h1
              class="mt-3 max-w-[16ch] text-balance text-h1 font-semibold text-wy-text lg:text-h1-lg"
            >
              各自的風景，共同的海平線。
            </h1>
            <p
              class="mt-4 text-body text-wy-text-secondary md:whitespace-nowrap"
            >
              {{ description }}
            </p>
          </div>
          <!-- 純裝飾標語,呼應提案樣式右上角的三行英文小標,不是導覽或功能。 -->
          <p
            aria-hidden="true"
            class="font-display-en hidden shrink-0 text-right text-body-sm leading-relaxed tracking-wide text-wy-text-muted md:block"
          >
            DIFFERENT PERSPECTIVES<br >
            SAME OCEAN<br >
            ALWAYS FORWARD
          </p>
        </div>

        <div
          class="mt-10 flex flex-col divide-y divide-wy-border-subtle md:flex-row md:divide-x md:divide-y-0"
        >
          <div class="flex flex-1 flex-col gap-2 py-4 md:py-0 md:pr-8">
            <p class="text-h3 font-semibold text-wy-text lg:text-h3-lg">
              Wilson
            </p>
            <p class="text-body-sm text-wy-text-secondary">{{ wilsonRole }}</p>
            <AppButton
              to="/wilson"
              variant="secondary"
              class="mt-2 self-start"
              aria-label="查看 Wilson 的履歷"
            >
              查看履歷 ↗
            </AppButton>
          </div>
          <div class="flex flex-1 flex-col gap-2 py-4 md:py-0 md:pl-8">
            <p class="text-h3 font-semibold text-wy-text lg:text-h3-lg">Yura</p>
            <p class="text-body-sm text-wy-text-secondary">{{ yuraRole }}</p>
            <AppButton
              to="/yura"
              variant="secondary"
              class="mt-2 self-start"
              aria-label="查看 Yura 的履歷"
            >
              查看履歷 ↗
            </AppButton>
          </div>
        </div>
      </PageContainer>
    </section>

    <!-- 潮汐線條(A04,Website 設計文件 §5.3):貼在「一起完成的作品」這個
         作品集導流區塊的頂邊,再往上偏移一點(負值 top),讓線條的下緣不會
         壓進文字區塊;拿掉 overflow-hidden,偏移的部分才不會被裁掉,是刻意
         讓線條的上緣一部分疊進上一段(Hero)的留白區,不是裁切失誤。定位
         class 傳給 <TideLines>,元件本身只負責線條、斷點切換跟顏色繼承。 -->
    <section
      v-if="projects.length > 0"
      class="relative bg-wy-bg py-12 lg:py-16"
    >
      <TideLines class="absolute inset-x-0 -top-10 md:-top-16" />

      <PageContainer
        class="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <p
            class="font-display-en text-body-sm tracking-wide text-wy-text-muted"
          >
            TWO PERSPECTIVES. MORE POSSIBILITIES.
          </p>
          <p class="mt-1 text-h3 font-semibold text-wy-text lg:text-h3-lg">
            一起完成的作品
          </p>
        </div>
        <AppButton to="/projects">探索作品集 ↗</AppButton>
      </PageContainer>
    </section>

    <footer
      class="no-print border-t border-wy-border-subtle py-8 text-body-sm text-wy-text-muted"
    >
      <PageContainer>
        <p>© {{ new Date().getFullYear() }} Yura &amp; Wilson</p>
      </PageContainer>
    </footer>
  </div>
</template>
