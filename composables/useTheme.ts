export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'wy-theme'

// SRS §2.8/Website 設計文件 §3.4:日夜閱讀模式跟人物切換互相獨立,只管
// <html> 的 dark class(對應 tailwind.config.ts 的 darkMode: 'class')。
// 實際的「防閃爍」由 nuxt.config.ts 的 inline script 在 Vue 掛載前搶先處理;
// 這裡的 initTheme() 只是把 reactive 狀態同步成 DOM 上已經正確的 class,
// 不會、也不應該在這裡重新決定一次要不要加 dark class。
export function useTheme() {
  const isDark = useState<boolean>('wy-theme-is-dark', () => false)

  function applyClass(dark: boolean) {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('dark', dark)
  }

  function setTheme(mode: ThemeMode) {
    isDark.value = mode === 'dark'
    applyClass(isDark.value)
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch {
      // 無痕模式或封鎖 localStorage 時,退化成只在當前分頁記憶,不擋主流程。
    }
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  function initTheme() {
    if (typeof document === 'undefined') return
    isDark.value = document.documentElement.classList.contains('dark')

    // 使用者還沒手動選過時,系統偏好變了要跟著變;手動選過(localStorage 有值)
    // 就不再跟隨系統,直到使用者自己再切一次。
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => {
      let stored: string | null = null
      try {
        stored = localStorage.getItem(STORAGE_KEY)
      } catch {
        // 讀不到就當作沒手動選過,一樣跟隨系統。
      }
      if (!stored) {
        isDark.value = event.matches
        applyClass(event.matches)
      }
    }
    mql.addEventListener('change', handleChange)
  }

  return { isDark, setTheme, toggleTheme, initTheme }
}
