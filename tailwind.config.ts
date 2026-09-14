import type { Config } from 'tailwindcss'

// SRS §2.1/§2.8:Tailwind CSS 3.x + CSS 變數,人物識別與日夜閱讀模式分離。
// 色票 token 命名與 RGB 數值直接沿用 Website 設計文件(Design v1.0)§2.3,
// 不要自己另外發明一套命名——新增用途時先在設計文件 §2.1 命名,再回頭加這裡。
const color = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './app.vue',
    './error.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
  ],
  theme: {
    extend: {
      colors: {
        wy: {
          bg: color('bg'),
          surface: color('surface'),
          'surface-raised': color('surface-raised'),
          'surface-subtle': color('surface-subtle'),
          text: color('text'),
          'text-secondary': color('text-secondary'),
          'text-muted': color('text-muted'),
          'border-subtle': color('border-subtle'),
          'border-control': color('border-control'),
          accent: color('accent'),
          'accent-hover': color('accent-hover'),
          'accent-active': color('accent-active'),
          'on-accent': color('on-accent'),
          focus: color('focus'),
          'selected-bg': color('selected-bg'),
          'selected-text': color('selected-text'),
          'disabled-bg': color('disabled-bg'),
          'disabled-text': color('disabled-text'),
          wilson: color('wilson'),
          yura: color('yura'),
          'warm-glint': color('warm-glint'),
          mist: color('mist'),
          success: color('success'),
          'success-bg': color('success-bg'),
          warning: color('warning'),
          'warning-bg': color('warning-bg'),
          error: color('error'),
          'error-bg': color('error-bg'),
          info: color('info'),
          'info-bg': color('info-bg'),
          'print-bg': color('print-bg'),
          'print-text': color('print-text'),
          nav: 'var(--fx-nav)',
          'hero-start': 'var(--fx-hero-start)',
          'hero-end': 'var(--fx-hero-end)',
          'fade-start': 'var(--fx-fade-start)',
          tide: 'var(--fx-tide)',
          grid: 'var(--fx-grid)',
          'glass-start': 'var(--fx-glass-start)',
          'glass-end': 'var(--fx-glass-end)',
          'glass-cool': 'var(--fx-glass-cool)',
          'glass-warm': 'var(--fx-glass-warm)',
          scrim: 'var(--fx-scrim)',
        },
      },
      boxShadow: {
        'wy-card': '0 8px 24px var(--fx-card-shadow)',
      },
      backgroundImage: {
        'wy-grid':
          'linear-gradient(to right, var(--fx-grid) 1px, transparent 1px), linear-gradient(to bottom, var(--fx-grid) 1px, transparent 1px)',
      },
    },
  },
}
