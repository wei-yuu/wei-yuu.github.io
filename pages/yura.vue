<script setup lang="ts">
const SITE_URL = 'https://wei-yuu.github.io'

// SRS §2.4:每個獨立頁面要有各自的 OG meta 與 JSON-LD,不是共用首頁那組
useSeoMeta({
  title: 'Yura ｜ 前端工程師',
  description: 'Yura 的個人履歷與作品集,專精互動動效與視覺呈現。',
  ogTitle: 'Yura ｜ 前端工程師',
  ogDescription: 'Yura 的個人履歷與作品集,專精互動動效與視覺呈現。',
  ogType: 'profile',
  ogUrl: `${SITE_URL}/yura`,
})

useHead({
  link: [{ rel: 'canonical', href: `${SITE_URL}/yura` }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
          '@type': 'Person',
          name: 'Yura',
          jobTitle: '前端工程師',
          url: `${SITE_URL}/yura`,
        },
      }),
    },
  ],
})
</script>

<template>
  <ResumeProfile person="Yura" job-title="前端工程師 · 視覺與互動動效" />
</template>
