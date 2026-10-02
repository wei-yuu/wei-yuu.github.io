// P1-05:把彈幕引擎的兩個核心行為抽成不依賴 Vue 的純函式,才能在 utils/**
// 底下用一般單元測試覆蓋(vitest.config.ts 的 coverage.include 只收
// scripts/**、utils/**,元件內邏輯不會被算進覆蓋率)。

// 空軌補位:忠實移植自 components/bullet/Screen.vue 的 fillEmptySlots——
// 逐一檢查每條軌道,軌道是空的且彈匣還有內容時,才把彈匣最前面一則接進去;
// 彈匣已經空了就跳過,不強行把 undefined 蓋回已經是 undefined 的軌道。
export function fillEmptySlots<T>(slots: Array<T | undefined>, magazine: T[]): void {
  for (let index = 0; index < slots.length; index++) {
    if (slots[index] === undefined && magazine.length > 0) {
      slots[index] = magazine.shift()
    }
  }
}

// 彈匣循環填補:忠實移植自 components/bullet/Playground.vue 的 magazine
// watcher——彈匣跑空時重新塞一輪新內容,讓 Demo 畫面永遠熱鬧、不會播到一半
// 突然安靜下來。
export function refillMagazineIfEmpty<T>(magazine: T[], createBatch: () => T[]): void {
  if (magazine.length === 0) {
    magazine.push(...createBatch())
  }
}
