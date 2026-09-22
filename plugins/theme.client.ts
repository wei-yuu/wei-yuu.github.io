// 只在客戶端跑一次,把 nuxt.config.ts 的防閃爍 inline script 已經設好的
// <html class="dark"> 狀態同步進 useTheme() 的 reactive state,讓
// ThemeToggle 一開始就顯示正確的圖示/文字,不用等使用者互動才校正。
export default defineNuxtPlugin(() => {
  const { initTheme } = useTheme()
  initTheme()
})
