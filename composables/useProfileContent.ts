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

  return { experiences, skills, status, error }
}
