// 案例總覽頁(如 /projects/wedding)列出的亮點卡片——純呈現用的靜態資料,不是 Notion
// 驅動(亮點本身是手刻客製元件,如彈幕引擎、故事時間軸),之後新增案例或新增亮點時,
// 套用同一個型別即可,不需要另外設計。
export interface ProjectHighlight {
  slug: string
  title: string
  summary: string
  // Website 設計文件 §4.4/§4.10:「案例預覽」由純文字按鈕改為圖示＋標題＋
  // 一句話的可點列表,icon 對應 HighlightIcon.vue 認得的圖示名稱。
  icon: 'book' | 'chat'
}
