<script setup lang="ts">
// SRS §4(個人履歷頁規格)微縮導覽切換:保留跳去首頁或另一半履歷的彈性,
// 但列印時要整個消失,不能出現在 PDF 輸出裡——所以掛 no-print,由全域 print CSS 隱藏。
//
// Website 設計文件 §3.3/§3.2:桌機(≥768px)常駐顯示導覽項目;手機/平板收進
// 漢堡選單,支援展開/收合、Escape 關閉、關閉後焦點回到觸發鈕。導覽列高度
// 手機 64px、桌機 72px;半透明玻璃底(bg-wy-nav)靠 sticky 疊在捲動內容上方。
const menuOpen = ref(false)
const triggerRef = ref<HTMLButtonElement>()

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
        <NuxtLink to="/" class="text-h3 font-semibold text-wy-text" @click="closeMenu">Wei Yu</NuxtLink>

        <!-- 桌機/平板:常駐顯示 -->
        <nav aria-label="主要導覽" class="hidden items-center gap-5 md:flex">
          <NuxtLink to="/projects" class="text-wy-text hover:underline" active-class="underline">作品集</NuxtLink>
          <NuxtLink to="/yura" class="text-wy-text hover:underline" active-class="underline">Yura</NuxtLink>
          <NuxtLink to="/wilson" class="text-wy-text hover:underline" active-class="underline">Wilson</NuxtLink>
          <ThemeToggle />
        </nav>

        <!-- 手機:漢堡選單觸發鈕 -->
        <button
          ref="triggerRef"
          type="button"
          class="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-wy-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-wy-focus md:hidden"
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
          <NuxtLink to="/projects" class="flex min-h-[44px] items-center text-wy-text" active-class="underline" @click="closeMenu">
            作品集
          </NuxtLink>
          <NuxtLink to="/yura" class="flex min-h-[44px] items-center text-wy-text" active-class="underline" @click="closeMenu">
            Yura
          </NuxtLink>
          <NuxtLink to="/wilson" class="flex min-h-[44px] items-center text-wy-text" active-class="underline" @click="closeMenu">
            Wilson
          </NuxtLink>
          <ThemeToggle class="mt-1 self-start" />
        </div>
      </PageContainer>
    </nav>
  </header>
</template>
