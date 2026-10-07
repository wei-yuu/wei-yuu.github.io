// 對應 wei-yuu/wedding 的 src/types/story.type.ts。資料來源是婚禮 Projects 頁面內文的
// story-events 模組(SRS §3.2.2),由 utils/projectContent.ts 的 toStoryItems 轉成這個型別。
export interface Story {
  year: string
  month: string
  title: string
  description?: string
  photo?: string
  photoAlt?: string
  majorEvent: boolean
  color: 'pink' | 'blue' | 'gray'
}
