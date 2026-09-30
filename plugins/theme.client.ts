// 只在客戶端跑一次,把 nuxt.config.ts 的防閃爍 inline script 已經設好的
// <html class="dark"> 狀態同步進 useTheme() 的 reactive state。
//
// P0-02:這裡不能在 mount/hydration 之前就同步——plugin 本體是在
// vueApp.mount() 之前執行,如果在這裡直接呼叫 initTheme(),使用者已存
// dark 偏好時,isDark 會在 hydration 比對開始前就被改成 true,但 SSR
// 輸出永遠是用 isDark=false 算出來的(伺服器不知道 localStorage 內容),
// 兩邊用不同的 isDark 值各自算出一次 vdom,結構對不上就是 hydration
// mismatch。onNuxtReady 保證整頁 hydrate 完成後才執行,第一次 hydration
// 比對用的仍是跟 SSR 一致的 isDark=false,校正動作變成一次單純的
// reactive 更新,不會再跟 hydration 比對衝突。
export default defineNuxtPlugin(() => {
  const { initTheme } = useTheme()
  onNuxtReady(() => {
    initTheme()
  })
})
