<script setup lang="ts">
// SRS §4(個人履歷頁規格)微縮導覽切換:保留跳去首頁或另一半履歷的彈性,
// 但列印時要整個消失,不能出現在 PDF 輸出裡——所以掛 no-print,由全域 print CSS 隱藏。
</script>

<template>
  <header
    class="no-print flex items-center justify-between border-b border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
  >
    <NuxtLink to="/" class="font-semibold">wei-yuu</NuxtLink>
    <nav class="flex items-center gap-3">
      <NuxtLink to="/projects" class="hover:underline" active-class="underline">作品集</NuxtLink>
      <NuxtLink to="/yura" class="hover:underline" active-class="underline">Yura</NuxtLink>
      <NuxtLink to="/wilson" class="hover:underline" active-class="underline">Wilson</NuxtLink>
      <!-- TODO(Sprint 4 步驟 3):Nav 視覺改版時,連同這顆按鈕一起套用新的
           wy-* token 樣式,目前先只確保切換功能本身可用。 -->
      <ThemeToggle />
    </nav>
  </header>
</template>
