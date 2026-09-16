import type { ProfileContent } from '~/types/notion'

export function useProfileContent(person: 'Yura' | 'Wilson') {
  // key 一定要帶 person——否則 SPA 導航在 /yura 與 /wilson 之間切換時,
  // useAsyncData 會共用同一份 cache,導致換頁後資料沒更新還顯示上一個人的內容。
  const { data, status, error } = useAsyncData<ProfileContent>(`profile-content-${person}`, () =>
    $fetch('/api/content'),
  )

  const experiences = computed(() =>
    (data.value?.experiences ?? [])
      .filter((item) => isForPerson(item.targetUsers, person))
      .sort((a, b) => (b.period?.start ?? '').localeCompare(a.period?.start ?? '')),
  )

  const skills = computed(() =>
    (data.value?.skills ?? [])
      .filter((item) => isForPerson(item.targetUsers, person))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  )

  // People 資料庫的 Name 就是單一人名(不是 Owner/TargetUser 那種多人 Relation),
  // 直接用大小寫無關比對取那一筆,不需要 isForPerson 的陣列比對邏輯。
  const profile = computed(() =>
    (data.value?.people ?? []).find((item) => item.name.toLowerCase() === person.toLowerCase()),
  )

  // §4.2 內容順序「相關作品入口」:用 RoleAttribution 判斷此人是否參與該專案,
  // 未填 Slug 的佔位列跟著濾掉,不產生 /projects/(空字串) 這種連結。
  const relatedProjects = computed(() =>
    (data.value?.projects ?? [])
      .filter((item) => item.slug.length > 0)
      .filter((item) => item.roleAttribution.some((r) => r.person.toLowerCase() === person.toLowerCase()))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
  )

  return { experiences, skills, profile, relatedProjects, status, error }
}
