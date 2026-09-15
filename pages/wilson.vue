<script setup lang="ts">
const siteConfig = useSiteConfig()
const { profile } = useProfileContent('Wilson')

const jobTitle = computed(() => profile.value?.jobTitle || '前端工程師')
const description = computed(
  () => profile.value?.seoDescription || 'Wilson 的個人履歷與作品集,專精架構設計與資料管線工程。',
)
const pageTitle = computed(() => `Wilson ｜ ${jobTitle.value}`)
const pageUrl = computed(() => `${siteConfig.url}/wilson`)

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
            name: 'Wilson',
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
  <ResumeProfile person="Wilson" :job-title="jobTitle" :bio="description" />
</template>
