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
  <!-- Website 設計文件 §4.2:技能用有文字的分類/標籤呈現,不加沒有依據的
       百分比進度條——熟練度直接寫成文字附在標籤上,不是量化的視覺長度。 -->
  <div class="space-y-6">
    <div v-for="[category, skills] in grouped" :key="category" class="break-inside-avoid-page">
      <h3 class="mb-2 text-body-sm font-semibold uppercase tracking-wide text-wy-text-muted">
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
