<script setup lang="ts">
const SITE_URL = 'https://wei-yuu.github.io'

useSeoMeta({
  title: 'Wilson ｜ 前端工程師',
  description: 'Wilson 的個人履歷與作品集,專精架構設計與資料管線工程。',
  ogTitle: 'Wilson ｜ 前端工程師',
  ogDescription: 'Wilson 的個人履歷與作品集,專精架構設計與資料管線工程。',
  ogType: 'profile',
  ogUrl: `${SITE_URL}/wilson`,
})

useHead({
  link: [{ rel: 'canonical', href: `${SITE_URL}/wilson` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: 'Wilson',
          jobTitle: '前端工程師',
          url: `${SITE_URL}/wilson`,
        },
      }),
    },
  ],
})
</script>

<template>
  <ResumeProfile person="Wilson" job-title="前端工程師 · 架構與資料管線工程" />
</template>
