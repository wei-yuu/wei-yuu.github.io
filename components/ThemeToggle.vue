<script setup lang="ts">
// Website 設計文件 §3.4:太陽／月亮圖示 + 操作標籤,不是純圖示按鈕。
// 減少動態偏好時的顏色轉場降級,交給 assets/css/main.css 的全域
// prefers-reduced-motion 規則統一處理,這裡不用重複判斷。
const { isDark, toggleTheme } = useTheme()

const label = computed(() => (isDark.value ? '切換為淺色模式' : '切換為深色模式'))
</script>

<template>
  <button
    type="button"
    class="inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-lg border border-wy-border-control px-3 text-sm text-wy-text transition-colors duration-200
           hover:bg-wy-surface-subtle
           focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-wy-focus
           print:hidden"
    :aria-pressed="isDark"
    @click="toggleTheme"
  >
    <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-4 w-4" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
    </svg>
    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-4 w-4" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 2.5v3M12 18.5v3M4.4 4.4l2.1 2.1M17.5 17.5l2.1 2.1M2.5 12h3M18.5 12h3M4.4 19.6l2.1-2.1M17.5 6.5l2.1-2.1" />
    </svg>
    <!-- 手機導覽列跟漢堡鈕並列,空間有限,文字標籤縮成 sr-only;桌機常駐導覽
         有空間,依 §3.4 規則維持圖示+文字標籤都可見。 -->
    <span class="sr-only md:not-sr-only">{{ label }}</span>
  </button>
</template>
