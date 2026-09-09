<script setup lang="ts">
// SRS §4(個人履歷頁規格)微縮導覽切換:保留跳去首頁或另一半履歷的彈性,
// 但列印時要整個消失,不能出現在 PDF 輸出裡——所以掛 no-print,由全域 print CSS 隱藏。
</script>

<template>
  <header
    class="no-print flex items-center justify-between border-b border-slate-200 px-4 py-2 text-sm dark:border-slate-700"
  >
    <NuxtLink to="/" class="font-semibold">wei-yuu</NuxtLink>
    <nav class="flex gap-3">
      <!-- TODO(Sprint 4):首頁雙門戶導流卡片做好後,這裡的專案連結可能要重新規劃
           (例如改成「有專案就自動列出」),目前先手動加這一個。 -->
      <NuxtLink to="/projects/wedding" class="hover:underline" active-class="underline">婚禮案例</NuxtLink>
      <NuxtLink to="/yura" class="hover:underline" active-class="underline">Yura</NuxtLink>
      <NuxtLink to="/wilson" class="hover:underline" active-class="underline">Wilson</NuxtLink>
    </nav>
  </header>
</template>
