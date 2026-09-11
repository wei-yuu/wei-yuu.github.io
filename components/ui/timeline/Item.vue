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
// 跟原版的差異:原版直接讀 window.innerWidth 算 computed,原版是純 SPA 一定有
// window,但這裡要跑 Nuxt SSG 的伺服器端渲染,建置期沒有 window,直接讀會直接
// 噴錯,所以加了 typeof window !== 'undefined' 防護(伺服器端渲染先當手機版,
// 客戶端 hydrate 後才會用真實寬度重新算一次)。跟原版一樣,這個值只在渲染當下
// 算一次,不會隨視窗真的拖曳縮放即時更新。
const props = defineProps<{
  color?: 'pink' | 'blue' | 'gray'
  fullDot?: boolean
  index: number
  item: T
}>()

const align = inject('timeline-align', computed(() => 'start' as 'start' | 'center'))

const isDesktopRight = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 768 && props.index % 2 === 1
})

const oppositeClass = computed(() =>
  isDesktopRight.value ? 'col-start-3 ps-6' : 'col-start-1 justify-self-end pe-6',
)
const contentClass = computed(() => (isDesktopRight.value ? 'col-start-1 pe-6' : 'col-start-3 ps-6'))
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
