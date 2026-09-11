import type { ProfileContent, ProjectItem } from '~/types/notion'

// §4.1:Projects 資料庫還留著一筆內容全空的佔位列(Notion 裡新增資料庫預設會有的
// 空白第一列),沒有 Slug 就代表還沒真的建好,直接濾掉,不要讓它出現在列表或
// 被拿去產生 /projects/(空字串) 這種連結。
function isPublished(project: ProjectItem): boolean {
  return project.slug.length > 0
}

export function useProjects() {
  const { data, status, error } = useAsyncData<ProfileContent>('site-content-projects', () =>
    $fetch('/api/content'),
  )

  const projects = computed(() =>
    (data.value?.projects ?? [])
      .filter(isPublished)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  )

  const featuredProjects = computed(() => projects.value.filter((item) => item.featured))

  function findProjectBySlug(slug: string) {
    return computed(() => projects.value.find((item) => item.slug === slug))
  }

  return { projects, featuredProjects, findProjectBySlug, status, error }
}
