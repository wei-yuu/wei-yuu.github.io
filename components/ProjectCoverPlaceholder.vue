<script setup lang="ts">
defineProps<{ title: string }>()
</script>

<template>
  <!-- Website 設計文件 §4.8:缺圖用固定比例、中性色的占位,標示專案名稱跟
       「待補」,不能顯示破圖或假截圖。列表占位暫採 7:3,對齊婚禮雙圓封面的
       比例,避免版面因為某張卡片換了比例而跳動——A08 本身標的是 16:10,
       這裡的 7:3 是列表排版的權宜選擇,不是引用 A08 規格。 -->
  <div class="flex aspect-[7/3] flex-col items-center justify-center gap-1 rounded bg-wy-surface-subtle">
    <p class="text-body font-medium text-wy-text-muted">{{ title }}</p>
    <p class="text-body-sm text-wy-text-muted">封面待補</p>
  </div>
</template>
