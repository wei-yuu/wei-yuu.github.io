<script setup lang="ts">
// Website 設計文件 §2.5/§3.2/§3.3(Design v1.2):主按鈕(accent 底 + on-accent
// 文字)、次按鈕(surface 底 + border-control 邊線 + accent 文字);兩者共用
// 點擊區 ≥44×44px、focus-visible 外框、disabled 同時改色又改語意狀態的規則。
// 按鈕採偏方正外觀(約 4px 圓角),不是整站 16px 圓角卡片那一套。
// 有 `to` 就渲染成 <NuxtLink>(案例連結等導覽用途),沒有就是原生 <button>
// (表單送出、展開/收合等互動用途)。
const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary'
    to?: string
    type?: 'button' | 'submit'
    disabled?: boolean
  }>(),
  { variant: 'primary', to: undefined, type: 'button', disabled: false },
)

const buttonClass = computed(() => [
  'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded px-5 py-3 text-btn font-medium transition-colors duration-200',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-wy-focus',
  'print:hidden',
  props.variant === 'primary'
    ? 'bg-wy-accent text-wy-on-accent hover:bg-wy-accent-hover active:bg-wy-accent-active disabled:bg-wy-disabled-bg disabled:text-wy-disabled-text'
    : 'border border-wy-border-control bg-wy-surface text-wy-accent hover:bg-wy-surface-subtle disabled:border-wy-disabled-bg disabled:bg-wy-disabled-bg disabled:text-wy-disabled-text',
])
</script>

<template>
  <NuxtLink v-if="to" :to="to" :class="buttonClass">
    <slot />
  </NuxtLink>
  <button v-else :type="type" :disabled="disabled" :aria-disabled="disabled" :class="buttonClass">
    <slot />
  </button>
</template>
