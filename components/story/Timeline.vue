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
      <template #default="{ item: { title, photo, description } }">
        <!-- 原版標題底色依 pink/blue/gray 分類換色,但那三色只在淺色模式讀得出來
             ——深色模式下文字繼承 wy-text(暖白),疊在同一批淺底上會變成淺字配
             淺底。這裡不是漏改深色版,是結構性問題:淺色分類底色天生不會有跟
             它配套的深色模式版本。改用不分類別、隨主題切換的 wy-surface-subtle
             +wy-text,確保兩種模式都可讀——分類色只留在時間軸節點小圓點
             (ui/timeline/Item.vue 的 dotColor),不影響閱讀對比。 -->
        <h2 class="rounded-t-lg bg-wy-surface-subtle px-4 pt-4 text-3xl text-wy-text">
          {{ title }}
        </h2>
        <div
          class="flex w-full flex-wrap items-center justify-evenly gap-4 rounded-b-lg bg-white/70 p-4 text-2xl dark:bg-slate-800/70"
        >
          <!-- 照片版位:待 Yura 提供實際照片後,把這個 placeholder 換成 <NuxtImg :src="photo">。
               Website 設計文件 §4.8:缺圖用固定比例的中性色占位,不能顯示破圖——
               這裡分成兩種「缺圖」:一開始就沒有網址(!photo),跟有網址但載入
               失敗(@error,例如連結失效或圖檔被移除),兩種都要落到同一個占位,
               不能只處理前者。failedPhotos 記的是索引,不是網址,因為同一個
               網址理論上不會又失敗又成功,用索引比對照片陣列的位置更直接。 -->
          <div
            v-if="!photo || failedPhotos.has(index)"
            class="flex aspect-video w-4/5 items-center justify-center rounded border border-dashed border-slate-300 text-base text-wy-text-muted dark:border-slate-600"
          >
            照片待補
          </div>
          <!-- SRS §2.3:這張是真實故事節點照片(相識/交往/求婚/婚禮),不是裝
               飾圖,alt 不能留空——用節點標題當替代文字,不是完美的圖片內容
               描述,但至少是真實資訊,不是憑空編造的敘述。 -->
          <img v-else class="w-4/5" :src="photo" :alt="title" @error="handlePhotoError(index)">
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
const props = defineProps<{ stories: Story[] }>()

// 跟 ui/timeline/Item.vue 同一類問題:讀 window.innerWidth 算 computed 在 SSG
// 下會有 SSR/hydration 不一致(SSR 一律當手機版,client 端算出的結果卻不會被
// 拿去重新套用)。改成手機版直書 class 不加前綴(預設套用),桌機版直接用
// md: 前綴覆寫回橫書,交給 CSS media query 判斷,不讀 window。
const oppositeClass = '[writing-mode:vertical-lr] [text-orientation:upright] md:[writing-mode:horizontal-tb] md:[text-orientation:mixed]'

// §4.8:有網址但實際載入失敗(連結失效/圖檔被刪)也要降級成中性色占位,不能
// 顯示瀏覽器預設的破圖圖示。記錄「哪個索引失敗過」;這裡重新賦值整個 Set
// 只是配合專案裡 collapsedSlugs(pages/projects/index.vue)已經在用的同一種
// 寫法保持風格一致——Vue 3 的 reactive Set 本身就能追蹤 .add()/.delete() 這類
// 原地修改,不是因為原地修改沒有反應性。
const failedPhotos = ref(new Set<number>())

function handlePhotoError(index: number) {
  const next = new Set(failedPhotos.value)
  next.add(index)
  failedPhotos.value = next
}

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
