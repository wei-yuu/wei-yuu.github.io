<script setup lang="ts">
import type { ExperienceItem } from '~/types/notion'

const props = defineProps<{
  items: ExperienceItem[]
  person: 'Yura' | 'Wilson'
}>()

// Website 設計文件 §4.10(視覺回饋修正):人物裝飾色分開,Wilson 暖石色、
// Yura 霧藍色,不共用同一個節點顏色。
const nodeColorClass = computed(() =>
  props.person === 'Wilson' ? 'border-wy-warm-glint' : 'border-wy-mist',
)
</script>

<template>
  <!-- Website 設計文件 §4.10(視覺回饋修正):時間軸是一條貫穿所有項目的
       連續直線(掛在 <ol> 本身的左邊框上,不逐筆斷開),公司與職務都在線的
       右側;桌機日期靠右對齊同一列,手機日期移到公司名稱下方。節點維持
       空心圓,顏色依人物決定。 -->
  <ol class="space-y-10 border-l border-wy-border-subtle pl-6 md:space-y-12">
    <li v-for="item in items" :key="item.id" class="relative break-inside-avoid-page">
      <span
        aria-hidden="true"
        :class="nodeColorClass"
        class="absolute -left-[29px] top-1 h-2.5 w-2.5 rounded-full border-2 bg-wy-bg"
      />

      <div class="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-4">
        <p class="text-h3 font-semibold text-wy-text lg:text-h3-lg">{{ item.company }}</p>
        <p class="shrink-0 text-body-sm text-wy-text-muted">
          {{ item.period?.start }} – {{ item.isCurrent ? '現職' : item.period?.end ?? '' }}
        </p>
      </div>
      <p class="mt-1 text-body font-medium text-wy-text">{{ item.role }}</p>

      <ul v-if="item.highlights.length" class="mt-2 list-disc space-y-1 pl-5 text-body-sm text-wy-text-secondary">
        <li v-for="(point, index) in item.highlights" :key="index">
          {{ point.text }}
          <ul v-if="point.children.length" class="mt-1 list-[circle] space-y-0.5 pl-5 text-wy-text-muted">
            <li v-for="(child, childIndex) in point.children" :key="childIndex">{{ child }}</li>
          </ul>
        </li>
      </ul>
      <ul v-if="item.techUsed.length" class="mt-3 flex flex-wrap gap-1.5">
        <li
          v-for="tech in item.techUsed"
          :key="tech"
          class="rounded-full border border-wy-border-subtle bg-wy-surface px-2.5 py-0.5 text-body-sm text-wy-text-secondary"
        >
          {{ tech }}
        </li>
      </ul>
    </li>
  </ol>
</template>
