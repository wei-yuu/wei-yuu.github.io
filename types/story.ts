// 對應 wei-yuu/wedding 的 src/types/story.type.ts。故事資料目前沒有對應的 Notion
// 資料庫(SRS 沒有規劃),先在 pages/projects/wedding/story-timeline.vue 用固定陣列
// 撐版位,等 Yura 提供實際故事文案跟照片後直接替換陣列內容即可,型別跟元件結構都不需要改動。
export interface Story {
  year: string
  month: string
  title: string
  description?: string
  photo?: string
  majorEvent: boolean
  color: 'pink' | 'blue' | 'gray'
}
