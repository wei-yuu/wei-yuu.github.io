<script setup lang="ts">
const props = defineProps<{
  person: 'Yura' | 'Wilson'
  jobTitle: string
}>()

const { experiences, skills, status } = useProfileContent(props.person)
</script>

<template>
  <div>
    <ContextualHeader />
    <main class="mx-auto max-w-3xl px-4 py-8 print:max-w-none print:px-0">
      <h1 class="text-3xl font-bold">{{ person }}</h1>
      <p class="text-slate-500 dark:text-slate-400">{{ jobTitle }}</p>

      <section class="mt-8 break-inside-avoid-page">
        <h2 class="mb-4 text-xl font-semibold">工作經歷</h2>
        <p v-if="status === 'pending'" class="text-sm text-slate-500">載入中...</p>
        <p v-else-if="status === 'error'" class="text-sm text-red-500">經歷載入失敗,請稍後再試。</p>
        <p v-else-if="experiences.length === 0" class="text-sm text-slate-500">尚無經歷資料。</p>
        <ExperienceTimeline v-else :items="experiences" />
      </section>

      <section class="mt-8 break-inside-avoid-page">
        <h2 class="mb-4 text-xl font-semibold">技能矩陣</h2>
        <p v-if="status === 'pending'" class="text-sm text-slate-500">載入中...</p>
        <SkillMatrix v-else :items="skills" />
      </section>
    </main>
  </div>
</template>
