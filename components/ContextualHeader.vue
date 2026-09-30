<script setup lang="ts">
// SRS §4(個人履歷頁規格)微縮導覽切換:保留跳去首頁或另一半履歷的彈性,
// 但列印時要整個消失,不能出現在 PDF 輸出裡——所以掛 no-print,由全域 print CSS 隱藏。
//
// Website 設計文件 §3.3/§3.2/§4.10(視覺回饋修正):桌機(≥768px)常駐顯示
// 「首頁／履歷／作品集」三個導覽項目,不重複列出兩個人名(人物切換交給履歷
// 頁自己的 PersonTabs);手機/平板收進漢堡選單,支援展開/收合、Escape 關閉、
// 關閉後焦點回到觸發鈕,主題切換則常駐在漢堡鈕旁,不用展開選單才能切換明暗。
// 導覽列高度手機 64px、桌機 72px;半透明玻璃底(bg-wy-nav)靠 sticky 疊在捲動
// 內容上方。
const menuOpen = ref(false)
const triggerRef = ref<HTMLButtonElement>()

// P0-01:「履歷」預設導向 /wilson,但 /wilson 與 /yura 都要標示為目前頁面
// ——NuxtLink 的 active-class 只認得連結本身的 to 目標(/wilson),/yura 是
// 平行路由不是它的子路由,不會被判定成同一個 active 狀態,所以改成自己判斷
// 目前路徑是不是屬於履歷這兩個路由(含子路由)。
//
// aria-current="page" 語意上代表「這個連結指到的就是目前這頁」,如果人在
// /yura 卻讓連結還連去 /wilson 又同時宣告 aria-current="page",讀屏器會
// 把一個實際會離開目前頁面的連結講成「目前頁面」,語意不正確(code review
// 抓到)。改成連結目標跟著目前路由動態決定:在 /yura(或其子路由)時連結
// 指回 /yura 本身,其餘情況維持預設 /wilson——不影響「從其他頁面點進來一律
// 先到 /wilson」的既有設計,只有已經在履歷頁時才會變成自我參照連結。
const route = useRoute()
const isResumeActive = computed(() => /^\/(wilson|yura)(\/|$)/.test(route.path))
const resumeTarget = computed(() => (/^\/yura(\/|$)/.test(route.path) ? '/yura' : '/wilson'))

function openMenu() {
  menuOpen.value = true
}

function closeMenu() {
  if (!menuOpen.value) return
  menuOpen.value = false
  triggerRef.value?.focus()
}

function toggleMenu() {
  if (menuOpen.value) closeMenu()
  else openMenu()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeMenu()
}
</script>

<template>
  <header class="no-print sticky top-0 z-40 border-b border-wy-border-subtle bg-wy-nav backdrop-blur">
    <PageContainer>
      <div class="flex h-16 items-center justify-between lg:h-[72px]">
        <NuxtLink to="/" class="font-display-en text-h3 font-semibold text-wy-text" @click="closeMenu">
          Wei Yu
        </NuxtLink>

        <!-- 桌機/平板:常駐顯示。「履歷」統一先導向 /wilson,人物間的切換交給
             履歷頁自己的 PersonTabs,導覽列不需要重複列出兩個人名。 -->
        <nav aria-label="主要導覽" class="hidden items-center gap-5 md:flex">
          <NuxtLink to="/" class="text-wy-text hover:underline" active-class="underline">首頁</NuxtLink>
          <NuxtLink
            :to="resumeTarget"
            class="text-wy-text hover:underline"
            :class="{ underline: isResumeActive }"
            :aria-current="isResumeActive ? 'page' : undefined"
          >履歷</NuxtLink>
          <NuxtLink to="/projects" class="text-wy-text hover:underline" active-class="underline">作品集</NuxtLink>
          <ThemeToggle />
        </nav>

        <!-- 手機:主題切換跟漢堡選單觸發鈕並列,都常駐在導覽列上,不用展開選單
             才能切換明暗。 -->
        <div class="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            ref="triggerRef"
            type="button"
            class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-wy-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-wy-focus"
            :aria-expanded="menuOpen"
            aria-controls="mobile-nav"
            @click="toggleMenu"
          >
            <span class="sr-only">{{ menuOpen ? '關閉選單' : '開啟選單' }}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" class="h-6 w-6" aria-hidden="true">
              <path v-if="!menuOpen" d="M4 7h16M4 12h16M4 17h16" />
              <path v-else d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
      </div>
    </PageContainer>

    <nav
      v-if="menuOpen"
      id="mobile-nav"
      aria-label="主要導覽"
      class="border-t border-wy-border-subtle bg-wy-surface md:hidden"
      @keydown="handleKeydown"
    >
      <PageContainer>
        <div class="flex flex-col gap-1 py-3">
          <NuxtLink to="/" class="flex min-h-[44px] items-center text-wy-text" active-class="underline" @click="closeMenu">
            首頁
          </NuxtLink>
          <NuxtLink
            :to="resumeTarget"
            class="flex min-h-[44px] items-center text-wy-text"
            :class="{ underline: isResumeActive }"
            :aria-current="isResumeActive ? 'page' : undefined"
            @click="closeMenu"
          >
            履歷
          </NuxtLink>
          <NuxtLink to="/projects" class="flex min-h-[44px] items-center text-wy-text" active-class="underline" @click="closeMenu">
            作品集
          </NuxtLink>
        </div>
      </PageContainer>
    </nav>
  </header>
</template>
