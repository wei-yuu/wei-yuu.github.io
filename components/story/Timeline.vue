<template>
  <UiTimeline align="center">
    <UiTimelineItem
      v-for="(item, index) in timelineItems"
      :key="index"
      :index="index"
      :item="item"
      :full-dot="item.fullDot"
      :color="item.color"
    >
      <template #opposite="{ item: { year, month } }">
        <span class="text-2xl" :class="[oppositeClass]">{{ year }} 年 {{ month }} 月</span>
      </template>
      <template #default="{ item: { title, photo, description, color } }">
        <h2
          class="rounded-t-lg px-4 pt-4 text-3xl"
          :class="{
            'bg-pink-100': color === 'pink',
            'bg-blue-100': color === 'blue',
            'bg-gray-100': color === 'gray',
          }"
        >
          {{ title }}
        </h2>
        <div
          class="flex w-full flex-wrap items-center justify-evenly gap-4 rounded-b-lg bg-white/70 p-4 text-2xl dark:bg-slate-800/70"
        >
          <!-- 照片版位:待 Yura 提供實際照片後,把這個 placeholder 換成 <NuxtImg :src="photo">。 -->
          <div
            v-if="!photo"
            class="flex aspect-video w-4/5 items-center justify-center rounded border border-dashed border-slate-300 text-base text-slate-400 dark:border-slate-600"
          >
            照片待補
          </div>
          <img v-else class="w-4/5" :src="photo" alt="">
          <span v-if="description" class="w-full whitespace-pre-line text-center text-wrap break-all">
            {{ description }}
          </span>
        </div>
      </template>
    </UiTimelineItem>
  </UiTimeline>
</template>

<script setup lang="ts">
import type { Story } from '~/types/story'

// 忠實移植自 wei-yuu/wedding 的 src/components/story/timeline.vue,對照組件是
// components/ui/timeline/ 這組通用時間軸版面;唯一的資料差異是原版故事資料來自
// Google Sheets/Drive 執行期抓取,我們的 SRS 沒有規劃對應資料庫,改成由呼叫端
// (pages/projects/wedding/story-timeline.vue)傳入固定 stories 陣列撐版位。
//
// 跟原版一樣,oppositeClass 直接讀 window.innerWidth,這裡加了 SSR 防護
// (見 components/ui/timeline/Item.vue 同樣的說明)。
const props = defineProps<{ stories: Story[] }>()

const oppositeClass = computed(() => {
  if (typeof window === 'undefined' || window.innerWidth >= 768) return ''
  return '[writing-mode:vertical-lr] [text-orientation:upright]'
})

const timelineItems = computed(() =>
  props.stories.map((story) => ({
    year: story.year,
    month: story.month,
    title: story.title,
    description: story.description,
    photo: story.photo,
    fullDot: story.majorEvent,
    color: story.color,
  })),
)
</script>
