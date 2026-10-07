import type { WeddingPageContent } from '~/types/projectContent'

// 婚禮三條路由共用:專案欄位來自 Projects 資料庫,客製內容來自頁面內文的 wedding 契約。
export function useWeddingContent() {
  const { findProjectBySlug, findProjectContent } = useProjects()
  const project = findProjectBySlug('wedding')
  const raw = findProjectContent('wedding')
  const content = computed<WeddingPageContent | undefined>(() =>
    isWeddingContent(raw.value) ? raw.value : undefined,
  )

  function findHighlight(slug: string) {
    return computed(() => content.value?.highlights.find((item) => item.slug === slug))
  }

  function findPreview(key: string) {
    return computed(() => content.value?.previews.find((item) => item.key === key))
  }

  return { project, content, findHighlight, findPreview }
}
