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
      // Website 設計文件 §3.1:字體與尺度。中文標題可選 Noto Serif TC 增加編
      // 輯感,英文展示標題可選 Georgia,兩者都只是可選的強調用字,正文/導覽一律
      // Noto Sans TC——所以只把這兩個獨立成 font-serif-tc / font-display-en,
      // 不動預設的 font-sans。h1/h2/h3 各自拆桌機(-lg)/手機兩組數值,套用方式
      // 是 `text-h1 lg:text-h1-lg`,對應文件給的手機╱桌機兩個尺寸區間。
      fontFamily: {
        sans: ['Noto Sans TC', 'system-ui', 'sans-serif'],
        'serif-tc': ['Noto Serif TC', 'serif'],
        'display-en': ['Georgia', 'serif'],
      },
      fontSize: {
        h1: ['38px', { lineHeight: '1.25' }],
        'h1-lg': ['60px', { lineHeight: '1.15' }],
        h2: ['26px', { lineHeight: '1.3' }],
        'h2-lg': ['32px', { lineHeight: '1.3' }],
        h3: ['20px', { lineHeight: '1.35' }],
        'h3-lg': ['22px', { lineHeight: '1.35' }],
        body: ['16px', { lineHeight: '1.75' }],
        'body-sm': ['14px', { lineHeight: '1.6' }],
        btn: ['15px', { lineHeight: '1.4' }],
      },
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
