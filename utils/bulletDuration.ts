// 忠實移植自 wei-yuu/wedding 的 src/components/bullet/index.vue 的 duration computed:
// 不精算文字寬度/畫面寬度/速度,依文字長度分桶給一個粗略但視覺上合理的播放時長,
// 搭配隨機亂數增加變化,避免同長度的彈幕看起來一模一樣。
// random 參數預設是 Math.random,測試時可以注入固定值讓結果可預期。
export function estimateBulletDuration(text: string, random: () => number = Math.random): number {
  const length = text.length
  if (length > 60) return 45_000
  if (length > 40) return Math.floor(random() * 5 + 30) * 1000
  if (length > 20) return Math.floor(random() * 10 + 20) * 1000
  return Math.floor(random() * 5 + 15) * 1000
}
