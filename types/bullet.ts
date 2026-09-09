// 對應 wei-yuu/wedding 的 src/types/message.type.ts Message 介面,
// 只留彈幕顯示需要的欄位(Demo-only 情境不需要留言者姓名這類額外資訊)。
export interface BulletMessage {
  id: string
  text: string
}
