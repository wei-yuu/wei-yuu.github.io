<template>
  <div ref="trackRef" class="relative h-8 overflow-hidden">
    <p
      ref="textRef"
      class="absolute left-full top-0 whitespace-nowrap text-2xl font-semibold text-white [text-shadow:1px_1px_5px_black]"
      :style="{ animationDuration: `${duration}ms`, '--bullet-travel': `${travelPx}px` }"
      @animationend="$emit('hide')"
    >
      {{ bullet.text }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type { BulletMessage } from '~/types/bullet'

// 跟前一版的差異:不再用固定的 ±100% 位移(不管基準是文字自己寬度還是軌道寬度,
// 固定 200% 的總位移量對短文字來說,有將近一半的時間文字早就跑出畫面了,程式卻
// 還在空等計時器跑完才補下一句)。改成在 onMounted 時量測「軌道寬度 + 文字寬度」,
// 這剛好是文字從完全在右邊外面跑到完全在左邊外面所需的最小位移量,不管文字多長、
// 軌道多寬都不會多跑或跑不夠。改用純 CSS animation + animationend,不用 Vue
// <transition> 的 enter/leave——每則彈幕本來就只播一次,不需要那套機制。
const props = defineProps<{ bullet: BulletMessage }>()
defineEmits<{ hide: [] }>()

const trackRef = ref<HTMLElement>()
const textRef = ref<HTMLElement>()
const travelPx = ref(0)
const duration = computed(() => estimateBulletDuration(props.bullet.text))

onMounted(() => {
  const trackWidth = trackRef.value?.clientWidth ?? 0
  const textWidth = textRef.value?.offsetWidth ?? 0
  travelPx.value = trackWidth + textWidth
})
</script>

<style scoped>
p {
  animation-name: bullet-slide;
  animation-timing-function: linear;
  animation-fill-mode: forwards;
  will-change: transform;
}

@keyframes bullet-slide {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(-1 * var(--bullet-travel)));
  }
}
</style>
