<script setup lang="ts">
// Website 設計文件 §5.3(A04):潮汐線條共用元件,原始素材見
// public/images/tide-lines.svg / tide-lines-mobile.svg(路徑資料已逐字核對
// 一致)。SVG 原始碼直接內嵌在 template 裡,不是 <img src> 載入——用 img 載入
// 的話,SVG 裡的 currentColor 沒辦法繼承外層的 text-wy-tide,明暗模式就沒辦法
// 自動換色,所以每次要用都得像這樣內嵌,不能直接引用檔案本身。
//
// 桌機/手機是不同 viewBox 的曲線(不是同一張圖縮放),用 md:hidden / hidden
// md:block 切換。定位(absolute/top 偏移等)交給呼叫端透過 class 決定,這個
// 元件只負責線條本身、斷點切換跟顏色繼承——多 root 元件預設不會自動吃到外層
// 傳入的 class,所以兩個 <svg> 都要另外接 v-bind="$attrs"。
</script>

<template>
  <svg
    viewBox="0 0 390 160"
    fill="none"
    class="h-auto w-full text-wy-tide md:hidden"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <g stroke="currentColor" stroke-width="1" stroke-linecap="round">
      <path d="M -20 40 C 100 10, 160 155, 280 85 S 355 55, 410 75" vector-effect="non-scaling-stroke" />
      <path d="M -20 52 C 100 21, 160 161, 280 95 S 355 65, 410 87" vector-effect="non-scaling-stroke" />
      <path d="M -20 64 C 100 32, 160 167, 280 105 S 355 75, 410 99" vector-effect="non-scaling-stroke" />
      <path d="M -20 76 C 100 43, 160 173, 280 115 S 355 85, 410 111" vector-effect="non-scaling-stroke" />
      <path d="M -20 88 C 100 54, 160 179, 280 125 S 355 95, 410 123" vector-effect="non-scaling-stroke" />
    </g>
  </svg>
  <svg
    viewBox="0 0 1440 240"
    fill="none"
    class="hidden h-auto w-full text-wy-tide md:block"
    aria-hidden="true"
    v-bind="$attrs"
  >
    <g stroke="currentColor" stroke-width="1" stroke-linecap="round">
      <path d="M -40 60 C 240 -15, 400 250, 740 130 S 1170 30, 1480 105" vector-effect="non-scaling-stroke" />
      <path d="M -40 73 C 240 -5, 400 255, 740 138 S 1170 42, 1480 118" vector-effect="non-scaling-stroke" />
      <path d="M -40 86 C 240 5, 400 260, 740 146 S 1170 54, 1480 131" vector-effect="non-scaling-stroke" />
      <path d="M -40 99 C 240 15, 400 265, 740 154 S 1170 66, 1480 144" vector-effect="non-scaling-stroke" />
      <path d="M -40 112 C 240 25, 400 270, 740 162 S 1170 78, 1480 157" vector-effect="non-scaling-stroke" />
      <path d="M -40 125 C 240 35, 400 275, 740 170 S 1170 90, 1480 170" vector-effect="non-scaling-stroke" />
      <path d="M -40 138 C 240 45, 400 280, 740 178 S 1170 102, 1480 183" vector-effect="non-scaling-stroke" />
    </g>
  </svg>
</template>
