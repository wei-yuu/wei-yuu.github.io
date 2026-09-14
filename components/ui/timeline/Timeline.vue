<template>
  <div
    class="m-auto grid grid-flow-dense grid-cols-[auto_min-content_auto] gap-y-6 p-6 lg:max-w-[1280px] justify-self-center"
    :class="[alignClass]"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
// 忠實移植自 wei-yuu/wedding 的 src/components/ui/timeline/index.vue:跟內容無關的
// 通用交錯式時間軸版面元件。align 用 provide 往下傳給 <UiTimelineItem>,取代原版用
// Pinia store 存全域狀態的做法——這裡只是單一畫面內共用一個值,provide/inject 就夠,
// 不需要為了這個引入全域狀態管理套件(本專案目前也沒有用 Pinia)。
const props = withDefaults(defineProps<{ align?: 'start' | 'center' }>(), { align: 'start' })

provide(
  'timeline-align',
  computed(() => props.align),
)

const alignClass = computed(() => (props.align === 'center' ? 'items-center' : 'items-start'))
</script>
