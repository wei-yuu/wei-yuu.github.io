<script setup lang="ts">
// Website 設計文件 §3.3:案例/亮點頁增加麵包屑及返回上層。最後一項是當前頁,
// 不給 to,渲染成純文字(aria-current="page"),不能點。
interface BreadcrumbItem {
  label: string
  to?: string
}
defineProps<{ items: BreadcrumbItem[] }>()
</script>

<template>
  <nav aria-label="麵包屑導覽" class="text-body-sm text-wy-text-muted">
    <ol class="flex flex-wrap items-center gap-1.5">
      <li v-for="(item, index) in items" :key="item.label" class="flex items-center gap-1.5">
        <NuxtLink v-if="item.to" :to="item.to" class="underline hover:text-wy-accent">{{ item.label }}</NuxtLink>
        <span v-else aria-current="page" class="text-wy-text">{{ item.label }}</span>
        <span v-if="index < items.length - 1" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>
