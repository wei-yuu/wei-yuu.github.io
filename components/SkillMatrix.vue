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
  <div class="space-y-4">
    <div v-for="[category, skills] in grouped" :key="category" class="break-inside-avoid-page">
      <h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {{ category }}
      </h3>
      <ul class="flex flex-wrap gap-2">
        <li
          v-for="skill in skills"
          :key="skill.id"
          class="rounded-full border border-slate-200 px-3 py-1 text-sm dark:border-slate-700"
        >
          {{ skill.skillName }}
          <span class="text-slate-400">· {{ skill.proficiency }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
