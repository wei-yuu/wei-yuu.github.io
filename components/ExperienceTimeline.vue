<script setup lang="ts">
import type { ExperienceItem } from '~/types/notion'

defineProps<{ items: ExperienceItem[] }>()
</script>

<template>
  <ol class="space-y-6">
    <li
      v-for="item in items"
      :key="item.id"
      class="break-inside-avoid-page rounded-lg border border-slate-200 p-4 dark:border-slate-700"
    >
      <div class="flex flex-wrap items-baseline justify-between gap-2">
        <h3 class="font-semibold">{{ item.company }}</h3>
        <span class="text-sm text-slate-500 dark:text-slate-400">
          {{ item.period?.start }} – {{ item.isCurrent ? '現職' : item.period?.end ?? '' }}
        </span>
      </div>
      <p class="text-sm text-slate-600 dark:text-slate-300">{{ item.role }}</p>
      <ul v-if="item.highlights.length" class="mt-2 list-disc space-y-1 pl-5 text-sm">
        <li v-for="(point, index) in item.highlights" :key="index">
          {{ point.text }}
          <ul v-if="point.children.length" class="mt-1 list-[circle] space-y-0.5 pl-5 text-slate-500 dark:text-slate-400">
            <li v-for="(child, childIndex) in point.children" :key="childIndex">{{ child }}</li>
          </ul>
        </li>
      </ul>
      <ul v-if="item.techUsed.length" class="mt-2 flex flex-wrap gap-1">
        <li
          v-for="tech in item.techUsed"
          :key="tech"
          class="rounded bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800"
        >
          {{ tech }}
        </li>
      </ul>
    </li>
  </ol>
</template>
