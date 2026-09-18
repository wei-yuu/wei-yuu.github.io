<script setup lang="ts">
// Figma(Wei Yu Website,node 19:1097「婚禮封面 / 7:3 / 原生玻璃雙環」)比對後
// 修正:封面目前是格線 + 潮汐線條 + 雙圓,背景是純色 wy-bg——海景照片圖層在
// 設計稿裡被同色不透明的「封面霧化底」完全蓋住,畫面上看不到任何海紋,所以
// 這裡不放照片,避免多載入用不到的圖。
//
// §5.2(玻璃雙圓製作細則):正式封面待重新拍攝/繪製前,先用文件允許的
// SVG／CSS 路徑做近似——token 漸層 + 1px 細邊,不用 backdrop-filter 疊加
// (只在這個小範圍內用一次,不是全站堆疊)。
//
// 封面比例 aspect-[7/3],格線/線條/雙圓的位置與尺寸皆為比對 Figma 桌機
// (1120×480)與手機(350×150)兩組frame 算出的相對百分比,兩組數值幾乎一致,
// 因此不需要另外寫響應式覆寫。圓形用 aspect-square + 只設寬度,避免百分比
// 寬高各自寫死時,換算成 px 的寬高比跟著容器的 7:3 跑掉變成橢圓。
//
// bg-wy-grid 本身只定義了漸層圖案,沒有 background-size 就不會重複鋪成
// 方格(單一漸層預設鋪滿整個容器,只會看到兩條線),必須額外補 32px 方格。
</script>

<template>
  <div class="relative isolate aspect-[7/3] overflow-hidden rounded bg-wy-bg">
    <div
      aria-hidden="true"
      class="absolute bottom-0 left-0 h-[78%] w-[26%] bg-wy-grid [background-size:32px_32px]"
    />
    <TideLines aria-hidden="true" class="absolute inset-x-0 bottom-0 opacity-80" />

    <div
      aria-hidden="true"
      class="absolute left-[22%] top-[12%] aspect-square w-[31%] rounded-full border border-wy-glass-warm bg-gradient-to-br from-wy-glass-start to-wy-glass-end backdrop-blur-[2px]"
    />
    <div
      aria-hidden="true"
      class="absolute left-[36%] top-[7%] aspect-square w-[32%] rounded-full border border-wy-glass-cool bg-gradient-to-br from-wy-glass-start to-wy-glass-end backdrop-blur-[2px]"
    />

    <slot />
  </div>
</template>
