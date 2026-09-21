<template>
  <div class="contents">
    <!-- Opposite -->
    <div :class="[oppositeClass]">
      <slot name="opposite" :item="item" />
    </div>
    <!-- Divider -->
    <div class="relative col-start-2 flex h-full flex-col items-center" :class="[dividerAlign]">
      <slot name="divider">
        <span class="absolute top-[-24px] h-6 w-1 bg-gray-300" />
        <span class="z-10 h-7 w-7 rounded-full" :class="[dotColor, { 'border-4': !fullDot }]" />
        <span class="absolute h-full w-1 bg-gray-300" />
      </slot>
    </div>
    <!-- Default -->
    <div :class="[contentClass]">
      <slot :item="item" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
// 忠實移植自 wei-yuu/wedding 的 src/components/ui/timeline/item.vue:桌面版單雙數
// index 左右交錯排列,手機版(< 768px)一律靠左,靠 CSS Grid 的 col-start 達成。
//
// 跟原版的差異:原版直接讀 window.innerWidth 算 computed 決定左右——原版是純
// SPA 一定有 window,但這裡要跑 Nuxt SSG,SSR 階段沒有 window 只能先假設手機版,
// client 端 hydrate 後才用真實寬度重算一次;這個做法在 SSG 下有 hydration 不
// 一致的問題:SSR 渲染出的 class 跟 client 端算出來的 class 不一樣,而 Vue 在
// 正式環境的 hydration 不會強制重新套用 class,結果桌機版打開仍卡在 SSR 當時
// 算出的手機排列。改成完全不讀 window,單雙數決定的 class 本身就用 md: 前綴
// 寫成響應式(手機一律靠左的 class 不加前綴、桌機才要的交錯 class 才加 md:),
// 交給瀏覽器的 CSS media query 判斷,SSR/CSR 永遠算出同一個 class 字串。
const props = defineProps<{
  color?: 'pink' | 'blue' | 'gray'
  fullDot?: boolean
  index: number
  item: T
}>()

const align = inject('timeline-align', computed(() => 'start' as 'start' | 'center'))

const isOddIndex = computed(() => props.index % 2 === 1)

const oppositeClass = computed(() =>
  isOddIndex.value
    ? 'col-start-1 justify-self-end pe-6 md:col-start-3 md:justify-self-auto md:pe-0 md:ps-6'
    : 'col-start-1 justify-self-end pe-6',
)
const contentClass = computed(() =>
  isOddIndex.value ? 'col-start-3 ps-6 md:col-start-1 md:ps-0 md:pe-6' : 'col-start-3 ps-6',
)
const dividerAlign = computed(() => (align.value === 'center' ? 'justify-center' : 'justify-start'))

// 原版用專案自訂的品牌色 pink/blue,這裡先用 Tailwind 內建色階近似,
// 實際品牌配色留給 Sprint 4 日夜主題視覺決策時再定案。
const dotColor = computed(() => {
  const colors: Record<string, string> = {
    pink: 'bg-pink-400',
    blue: 'bg-blue-400',
    gray: 'bg-gray-300',
  }
  return colors[props.color ?? 'gray'] ?? 'bg-gray-300'
})
</script>
