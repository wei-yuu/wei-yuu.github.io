<script setup lang="ts">
// Website 設計文件 §3.2:響應式版寬——手機 <768px 左右 20px、平板 768-1023px
// 左右 32px、桌機 ≥1024px 內容最大 1200px、左右至少 48px。剛好對應 Tailwind
// 預設間距(px-5=20px、px-8=32px、px-12=48px),不用額外自訂 spacing scale。
</script>

<template>
  <div class="mx-auto max-w-[1200px] px-5 md:px-8 lg:px-12">
    <slot />
  </div>
</template>
