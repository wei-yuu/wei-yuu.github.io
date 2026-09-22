<script setup lang="ts">
defineProps<{ name: 'book' | 'chat' }>()
</script>

<template>
  <!-- Website 設計文件 §4.10(作品集):「故事時間軸」書本 icon 與「互動彈幕」
       對話框 icon,線條圖示,顏色交給呼叫端(外層 text-* class)決定。 -->
  <svg
    v-if="name === 'book'"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    stroke-width="1.4"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-[26px] w-[26px]"
    aria-hidden="true"
  >
    <path d="M4 4.5c2-1 4-1 6 0v11c-2-1-4-1-6 0z" />
    <path d="M16 4.5c-2-1-4-1-6 0v11c2-1 4-1 6 0z" />
  </svg>
  <svg
    v-else
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    stroke-width="1.4"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="h-[26px] w-[26px]"
    aria-hidden="true"
  >
    <path d="M3.5 5.5h13a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H8l-3.5 3v-3H3.5a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z" />
  </svg>
</template>
