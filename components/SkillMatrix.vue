<script setup lang="ts">
import type { SkillItem } from '~/types/notion'

const props = defineProps<{ items: SkillItem[] }>()

const grouped = computed(() => {
  const map = new Map<string, SkillItem[]>()
  for (const skill of props.items) {
    const list = map.get(skill.category) ?? []
    list.push(skill)
    map.set(skill.category, list)
  }
  return [...map.entries()]
})
</script>

<template>
  <!-- Website 設計文件 §4.10(視覺回饋修正):桌機分類標籤在左、技能標籤在右
       同一列並排,不是分類疊在標籤上方;手機收回單欄,分類在上、標籤在下。
       用有文字的分類/標籤呈現,不加沒有依據的百分比進度條——熟練度直接寫成
       文字附在標籤上,不是量化的視覺長度。 -->
  <div class="divide-y divide-wy-border-subtle">
    <div
      v-for="[category, skills] in grouped"
      :key="category"
      class="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 break-inside-avoid-page md:flex-row md:items-baseline md:gap-8"
    >
      <h3 class="shrink-0 text-body-sm font-semibold uppercase tracking-wide text-wy-text-muted md:w-40">
        {{ category }}
      </h3>
      <ul class="flex flex-wrap gap-2">
        <li
          v-for="skill in skills"
          :key="skill.id"
          class="rounded-full border border-wy-border-subtle bg-wy-surface px-3 py-1 text-body-sm text-wy-text-secondary"
        >
          {{ skill.skillName }}
          <span class="text-wy-text-muted">· {{ skill.proficiency }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
