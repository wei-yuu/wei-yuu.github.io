<script setup lang="ts">
import type { NuxtError } from '#app'

// Website 設計文件 §4.8(共用異常與空資料狀態):404/一般錯誤只用簡短說明
// 跟回首頁／作品集入口,裝飾僅限抽象潮汐線條,不新增大海景——這個頁面因此
// 不套用首頁/作品集那種帶海景照片的頁首,只用 TideLines 當低調裝飾。
const props = defineProps<{ error: NuxtError }>()

const isNotFound = computed(() => props.error.statusCode === 404)

const code = computed(() => `${props.error.statusCode}`)
const statusText = computed(() => (isNotFound.value ? '找不到頁面' : '發生錯誤'))
const description = computed(() =>
  isNotFound.value
    ? '這個網址可能打錯了,或內容已經搬走。'
    : '發生了一些問題,請稍後再試,或先回到首頁。',
)

// 錯誤頁本身也要有語意標題(h1)跟分頁 title,不能只靠視覺上的大數字——沒有
// h1、分頁 title 又跟前一頁一樣時,讀屏器使用者沒辦法辨識自己已經進入錯誤
// 情境。
useHead({
  title: () => `${code.value} — ${statusText.value} ｜ Wei Yu`,
})

// SSG 下多數情況是靜態 404.html 被直接當一般頁面提供,不是真的伺服器端錯誤;
// 但使用者也可能在已經 hydrate 的 SPA 內點到失效連結觸發同一個元件,這時
// 用 clearError() 才能正確清掉錯誤狀態再導頁,單純 NuxtLink 可能讓錯誤狀態
// 卡住不放。
function goTo(path: string) {
  clearError({ redirect: path })
}
</script>

<template>
  <div>
    <ContextualHeader />
    <main>
      <PageContainer class="flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <TideLines aria-hidden="true" class="pointer-events-none max-w-md opacity-60" />

        <h1 class="mt-8 font-display-en text-h1 font-semibold text-wy-text lg:text-h1-lg">
          {{ code }} — {{ statusText }}
        </h1>
        <p class="mt-3 max-w-md text-body text-wy-text-secondary">{{ description }}</p>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <AppButton type="button" @click="goTo('/')">回首頁</AppButton>
          <AppButton type="button" variant="secondary" @click="goTo('/projects')">作品集</AppButton>
        </div>
      </PageContainer>
    </main>
  </div>
</template>
