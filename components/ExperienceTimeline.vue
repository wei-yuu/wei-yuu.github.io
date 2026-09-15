<script setup lang="ts">
import type { ExperienceItem } from '~/types/notion'

defineProps<{ items: ExperienceItem[] }>()
</script>

<template>
  <!-- Website 設計文件 §4.2/4.3:桌機採窄資訊欄(公司/期間)加寬內容欄(角色/成就/
       技術),兩欄以格線對齊;內容欄左側時間軸用清晰直線,暖石色(wy-warm-glint)
       僅點綴用在圓點標記上,不整條上色。手機不分欄,按原閱讀順序單欄呈現。 -->
  <ol class="space-y-10 md:space-y-12">
    <li
      v-for="item in items"
      :key="item.id"
      class="break-inside-avoid-page md:grid md:grid-cols-[180px_1fr] md:gap-8"
    >
      <div class="mb-2 md:mb-0 md:pt-1">
        <p class="text-h3 font-semibold text-wy-text lg:text-h3-lg">{{ item.company }}</p>
        <p class="mt-1 text-body-sm text-wy-text-muted">
          {{ item.period?.start }} – {{ item.isCurrent ? '現職' : item.period?.end ?? '' }}
        </p>
      </div>

      <div class="relative border-l border-wy-border-subtle pl-6">
        <span aria-hidden="true" class="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-wy-warm-glint" />
        <p class="text-body font-medium text-wy-text">{{ item.role }}</p>
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
      </div>
    </li>
  </ol>
</template>
