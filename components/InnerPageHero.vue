<script setup lang="ts">
const props = withDefaults(defineProps<{
  lines: string[]
  contentWidth?: 'resume' | 'wide'
  showGrid?: boolean
}>(), {
  contentWidth: 'wide',
  showGrid: false,
})

const contentClass = computed(() =>
  props.contentWidth === 'resume' ? 'max-w-[1120px]' : 'max-w-[1200px]',
)
</script>

<template>
  <!-- P1-03 / Figma 19:255、19:356、19:460、19:560:內頁頁首固定
       手機 160px、桌機 208px,並在 92% 處消融至頁面底色。圖片與線條均為
       裝飾,列印時整段移除。 -->
  <section class="no-print relative isolate h-40 overflow-hidden bg-wy-bg md:h-52">
    <!-- P1-03(Figma 19:255/19:356/19:460/19:560 核實):A03 不重新製作圖檔,
         直接沿用首頁已有的四張 horizon-* 圖——桌機/手機是不同構圖裁切
         (1672×941 vs 1086×1448),不是同一張圖縮放,所以分兩層 wrapper
         各自負責一個斷點,跟 pages/index.vue 首頁 Hero 的做法一致。
         不透明度淺色 80%、深色 50%(2026-10-01 對照 Figma 與實際畫面拍板,
         高於 Website 設計文件 §5.1 當時寫的 10–16%/8–12%)。在頁首高度
         92% 處另外用下方的漸層 div 消融至 --color-bg。 -->
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 md:hidden">
      <NuxtImg
        src="/images/horizon-light-mobile.png"
        format="avif"
        width="1086"
        height="1448"
        class="h-full w-full object-cover opacity-[0.8] dark:hidden"
        alt=""
      />
      <NuxtImg
        src="/images/horizon-dark-mobile.png"
        format="avif"
        width="1086"
        height="1448"
        class="hidden h-full w-full object-cover opacity-[0.5] dark:block"
        alt=""
      />
    </div>
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 hidden md:block">
      <NuxtImg
        src="/images/horizon-light.png"
        format="avif"
        width="1672"
        height="941"
        class="h-full w-full object-cover opacity-[0.8] dark:hidden"
        alt=""
      />
      <NuxtImg
        src="/images/horizon-dark.png"
        format="avif"
        width="1672"
        height="941"
        class="hidden h-full w-full object-cover opacity-[0.5] dark:block"
        alt=""
      />
    </div>

    <div
      v-if="showGrid"
      aria-hidden="true"
      class="pointer-events-none absolute right-0 top-0 h-[88%] w-[18%] bg-wy-grid [background-size:32px_32px]"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-wy-bg to-[92%]"
    />

    <!-- Figma 的桌機與手機曲線是兩套獨立幾何，不以同一張圖縮放。路徑取自
         19:261/19:362（深色對應 19:466/19:566），色彩依 Figma 使用 wy-yura token。 -->
    <svg
      aria-hidden="true"
      viewBox="0 0 143.085 148.021"
      fill="none"
      class="pointer-events-none absolute left-[46.1538%] top-[-25px] h-[148px] w-[36.6667%] text-wy-yura md:hidden"
    >
      <path
        d="M0.0129826 0.526221C77.013 -1.47378 39.613 111.526 143.013 126.526M0.0129826 7.52622C77.013 5.52622 39.613 118.526 143.013 133.526M0.0129826 14.5262C77.013 12.5262 39.613 125.526 143.013 140.526M0.0129826 21.5262C77.013 19.5262 39.613 132.526 143.013 147.526"
        stroke="currentColor"
        vector-effect="non-scaling-stroke"
      />
    </svg>
    <svg
      aria-hidden="true"
      viewBox="0 0 429.04 212.418"
      fill="none"
      class="pointer-events-none absolute left-[54.1667%] top-[-35px] hidden h-[212px] w-[29.7917%] text-wy-yura md:block"
    >
      <path
        d="M0.00432884 0.519013C231.004 -1.48099 118.804 154.919 429.004 176.919M0.00432884 7.51901C231.004 5.51901 118.804 161.919 429.004 183.919M0.00432884 14.519C231.004 12.519 118.804 168.919 429.004 190.919M0.00432884 21.519C231.004 19.519 118.804 175.919 429.004 197.919M0.00432884 28.519C231.004 26.519 118.804 182.919 429.004 204.919M0.00432884 35.519C231.004 33.519 118.804 189.919 429.004 211.919"
        stroke="currentColor"
        vector-effect="non-scaling-stroke"
      />
    </svg>

    <div
      :class="contentClass"
      class="relative mx-auto flex h-full flex-col justify-start px-5 pt-[30px] md:px-8 md:pt-11 lg:px-0"
    >
      <p class="text-[11px] leading-[18px] tracking-[1.4px] text-wy-text-muted">
        <template v-for="line in lines" :key="line">
          {{ line }}<br>
        </template>
      </p>
      <span aria-hidden="true" class="mt-3 block h-px w-6 bg-wy-yura" />
    </div>
  </section>
</template>
