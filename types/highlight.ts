// 案例總覽頁(如 /projects/wedding)列出的亮點卡片——純呈現用的靜態資料,不是 Notion
// 驅動(亮點本身是手刻客製元件,如彈幕引擎、故事時間軸),之後新增案例或新增亮點時,
// 套用同一個型別即可,不需要另外設計。
export interface ProjectHighlight {
  slug: string
  title: string
  summary: string
}
