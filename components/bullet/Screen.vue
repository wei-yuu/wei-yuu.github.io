<template>
  <div class="grid h-full items-center gap-2">
    <template v-for="(bullet, index) in bullets" :key="bullet?.id ?? `empty-${index}`">
      <Bullet v-if="bullet" :bullet="bullet" @hide="fillBullet(index)" />
    </template>
  </div>
</template>

<script setup lang="ts">
import type { BulletMessage } from '~/types/bullet'

// 忠實移植自 wei-yuu/wedding 的 src/components/bullet/screen.vue:
// 固定 quantity 條軌道(CSS Grid 等高格子),每條軌道播完一則就從彈匣(magazine)
// 補下一則進同一格——天生序列化,同一軌道永遠只有一則在跑,不需要碰撞演算法。
//
// 跟原版的差異:原版的 messages 在畫面顯示前就已經非同步抓好資料(有 loading gate
// 確保 onMounted 時彈匣不是空的),但我們的 Demo-only 情境是「使用者要送出彈幕才有
// 東西」,一開始彈匣必定是空的。純粹照搬 onMounted 一次性 splice 的話,之後陸續送出
// 的彈幕會永遠沒有機制被抽出來播放(因為空格子沒有 <Bullet> 在跑,不會觸發 hide
// 事件)。所以額外 watch magazine,一有新資料就檢查有沒有空格子可以立刻填入。
//
// :key 用彈幕自己的 id,不是軌道編號(index)——Bullet 元件在 onMounted 時要量測
// 軌道跟文字的實際寬度來算動畫位移量(見 bullet/Bullet.vue),如果 key 不變、Vue
// 重複使用同一個元件實例,onMounted 只會在第一則彈幕時跑一次,後面換的彈幕會沿用
// 舊的量測結果。用 id 當 key,換彈幕時 Vue 會整個重新建立元件,每則都重新量測。
const magazine = defineModel<BulletMessage[]>('magazine', { default: () => [] })

const props = defineProps<{ quantity: number }>()

const bullets = ref<Array<BulletMessage | undefined>>(Array.from({ length: props.quantity }))

function fillBullet(index: number) {
  const next = magazine.value.shift()
  bullets.value.splice(index, 1, next)
}

function fillEmptySlots() {
  for (let index = 0; index < bullets.value.length; index++) {
    if (bullets.value[index] === undefined && magazine.value.length > 0) {
      fillBullet(index)
    }
  }
}

watch(magazine, fillEmptySlots, { deep: true })

onMounted(fillEmptySlots)
</script>
