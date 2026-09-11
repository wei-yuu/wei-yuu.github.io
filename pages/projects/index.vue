<script setup lang="ts">
// SRS §4.1:/projects 是資料驅動的列表頁,卡片點進去對應各自手刻的 /projects/{slug} 詳情頁。
const siteConfig = useSiteConfig()
const pageUrl = computed(() => `${siteConfig.url}/projects`)
const { projects } = useProjects()

useSeoMeta({
  title: '專案作品集 ｜ wei-yuu',
  description: 'Yura 與 Wilson 的作品集專案列表,點進去看每個案例的技術亮點剖析。',
  ogTitle: '專案作品集',
  ogDescription: 'Yura 與 Wilson 的作品集專案列表,點進去看每個案例的技術亮點剖析。',
  ogUrl: pageUrl,
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
})
</script>

<template>
  <div>
    <ContextualHeader />
    <main class="mx-auto max-w-3xl px-4 py-8">
      <h1 class="text-3xl font-bold">專案作品集</h1>
      <p class="mt-2 text-slate-500 dark:text-slate-400">
        目前展示中的專案,點進去看各自的技術亮點剖析。
      </p>

      <!-- TODO(Sprint 4):封面圖依 §4.1 決策走 public/images/projects/{slug}.jpg,
           待實際專案照片備妥後補上,目前先以純文字卡片呈現。 -->
      <ul class="mt-8 space-y-4">
        <li
          v-for="project in projects"
          :key="project.id"
          class="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
        >
          <NuxtLink :to="`/projects/${project.slug}`" class="text-xl font-semibold hover:underline">
            {{ project.title }}
          </NuxtLink>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{{ project.summary }}</p>
          <ul v-if="project.techStack.length" class="mt-2 flex flex-wrap gap-1.5">
            <li
              v-for="tech in project.techStack"
              :key="tech"
              class="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {{ tech }}
            </li>
          </ul>
        </li>
      </ul>
    </main>
  </div>
</template>
