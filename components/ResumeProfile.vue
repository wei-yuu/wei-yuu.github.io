<script setup lang="ts">
const props = defineProps<{
  person: 'Yura' | 'Wilson'
  jobTitle: string
  bio: string
}>()

const { experiences, skills, status } = useProfileContent(props.person)
</script>

<template>
  <div>
    <ContextualHeader />
    <main class="print:max-w-none print:px-0">
      <PageContainer class="py-10 lg:py-14">
        <!-- Website 設計文件 §4.2/4.3:內容順序為姓名/職稱/簡介 → ... → 工作經歷 →
             技能分類,此區塊只負責姓名/職稱/簡介;不放星座裝飾語(星座僅為品牌靈感,
             不推定職能,§1.1 已明訂),也不放大頭照(A06 素材尚未交付)。 -->
        <header class="max-w-[720px] border-b border-wy-border-subtle pb-8">
          <h1 class="text-h1 font-semibold text-wy-text lg:text-h1-lg">{{ person }}</h1>
          <p class="mt-2 text-h3 font-medium text-wy-text-secondary lg:text-h3-lg">{{ jobTitle }}</p>
          <p v-if="bio" class="mt-4 text-body text-wy-text-secondary">{{ bio }}</p>
        </header>

        <section class="mt-8 break-inside-avoid-page">
          <h2 class="mb-4 text-h2 font-semibold text-wy-text lg:text-h2-lg">工作經歷</h2>
          <p v-if="status === 'pending'" class="text-body-sm text-wy-text-muted">載入中...</p>
          <p v-else-if="status === 'error'" class="text-body-sm text-wy-error">經歷載入失敗,請稍後再試。</p>
          <p v-else-if="experiences.length === 0" class="text-body-sm text-wy-text-muted">尚無經歷資料。</p>
          <ExperienceTimeline v-else :items="experiences" />
        </section>

        <section class="mt-8 break-inside-avoid-page">
          <h2 class="mb-4 text-h2 font-semibold text-wy-text lg:text-h2-lg">技能矩陣</h2>
          <p v-if="status === 'pending'" class="text-body-sm text-wy-text-muted">載入中...</p>
          <SkillMatrix v-else :items="skills" />
        </section>
      </PageContainer>
    </main>
  </div>
</template>
