<script setup lang="ts">
// Website 設計文件 §3.3(2026-09-14 確認)/§4.10(視覺回饋修正):/wilson、
// /yura 視覺上呈現為頁籤(各自短底線標示目前選中,不是整列共用一條底線),
// 但骨子裡仍是兩個獨立路由——直接用 NuxtLink 導航,不是同頁內容切換,避免
// 破壞既有 SEO 與分享連結。current 由路由自然決定,不需要外部傳入 active
// 狀態。字體採 Georgia(font-display-en)、19px,對應提案圖的頁籤樣式。
const TABS = [
  { to: '/wilson', label: 'Wilson' },
  { to: '/yura', label: 'Yura' },
]
</script>

<template>
  <nav aria-label="切換人物履歷" class="no-print flex gap-6">
    <NuxtLink
      v-for="tab in TABS"
      :key="tab.to"
      :to="tab.to"
      class="-mb-px border-b-2 border-transparent pb-2 font-display-en text-[19px] font-medium text-wy-text-secondary transition-colors hover:text-wy-text"
      active-class="border-wy-accent text-wy-text"
    >
      {{ tab.label }}
    </NuxtLink>
  </nav>
</template>
