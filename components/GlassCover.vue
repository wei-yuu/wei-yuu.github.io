<script setup lang="ts">
// Website 設計文件 §5.2(玻璃雙圓製作細則):正式封面待重新拍攝/繪製前,
// 先用文件本身允許的 SVG／CSS 路徑做近似——token 漸層 + 1px 細邊,不用
// backdrop-filter 疊加(只在這個小範圍內用一次,不是全站堆疊)。兩個完整圓形
// 略為交疊,圓內透出海紋;暖色/冷色邊線細而柔,重疊區靠低透明度自然疊加,
// 不是不透明色塊。海紋沿用首頁 A01/A02 素材,低透明度處理,不是另外的
// A07 拍攝素材(A07 現有生成版本文件本身也標示「待重製」)。
//
// §5.1/§5.3(A07 RWD 比對後修正):封面比例是 aspect-[7/3],手機也維持同一
// 橫幅比例,不是 aspect-video。圓形本身另外掛 aspect-square、只設寬度,
// 讓瀏覽器直接算出等比的高度——不能用「寬 %／高 %」各自寫死來湊圓,百分比
// 換算成 px 後的寬高比會跟著容器的 7:3 跑掉,變成橢圓。
</script>

<template>
  <div class="relative isolate aspect-[7/3] overflow-hidden rounded bg-wy-bg">
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 opacity-40 md:hidden">
      <NuxtImg
        src="/images/horizon-light-mobile.png"
        width="1086"
        height="1448"
        class="h-full w-full object-cover dark:hidden"
        alt=""
      />
      <NuxtImg
        src="/images/horizon-dark-mobile.png"
        width="1086"
        height="1448"
        class="hidden h-full w-full object-cover dark:block"
        alt=""
      />
    </div>
    <div aria-hidden="true" class="pointer-events-none absolute inset-0 hidden opacity-40 md:block">
      <NuxtImg
        src="/images/horizon-light.png"
        width="1672"
        height="941"
        class="h-full w-full object-cover dark:hidden"
        alt=""
      />
      <NuxtImg
        src="/images/horizon-dark.png"
        width="1672"
        height="941"
        class="hidden h-full w-full object-cover dark:block"
        alt=""
      />
    </div>

    <div
      aria-hidden="true"
      class="pointer-events-none absolute left-[6%] top-1/2 aspect-square w-[27%] -translate-y-1/2 rounded-full border border-wy-glass-cool bg-gradient-to-br from-wy-glass-start to-wy-glass-end backdrop-blur-[2px]"
    />
    <div
      aria-hidden="true"
      class="pointer-events-none absolute left-[20%] top-1/2 aspect-square w-[27%] -translate-y-1/2 rounded-full border border-wy-glass-warm bg-gradient-to-br from-wy-glass-start to-wy-glass-end backdrop-blur-[2px]"
    />

    <slot />
  </div>
</template>
