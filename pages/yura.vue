<script setup lang="ts">
const siteConfig = useSiteConfig()
const { profile } = useProfileContent('Yura')

// Notion People.JobTitle/SeoDescription 還沒填時,用這兩句當合理預設值,
// 不要讓 SEO meta 空白或顯示 undefined。
const jobTitle = computed(() => profile.value?.jobTitle || '前端工程師')
const description = computed(
  () => profile.value?.seoDescription || 'Yura 的個人履歷與作品集,專精互動動效與視覺呈現。',
)
const pageTitle = computed(() => `Yura ｜ ${jobTitle.value}`)
const pageUrl = computed(() => `${siteConfig.url}/yura`)

// SRS §2.4:每個獨立頁面要有各自的 OG meta 與 JSON-LD,不是共用首頁那組
useSeoMeta({
  title: pageTitle,
  description,
  ogTitle: pageTitle,
  ogDescription: description,
  ogType: 'profile',
  ogUrl: pageUrl,
})

useHead({
  link: [{ rel: 'canonical', href: pageUrl }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: computed(() =>
        JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          mainEntity: {
            '@type': 'Person',
            name: 'Yura',
            jobTitle: jobTitle.value,
            url: pageUrl.value,
          },
        }),
      ),
    },
  ],
})
</script>

<template>
  <ResumeProfile person="Yura" :job-title="jobTitle" :bio="description" />
</template>
