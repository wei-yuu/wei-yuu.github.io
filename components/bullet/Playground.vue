<template>
  <div class="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
    <div class="relative h-56 overflow-hidden rounded bg-slate-900">
      <BulletScreen v-model:magazine="magazine" :quantity="TRACK_COUNT" />
    </div>

    <form class="mt-3 flex gap-2" @submit.prevent="handleSubmit">
      <input
        v-model="inputText"
        :maxlength="MAX_LENGTH"
        type="text"
        placeholder="輸入祝福彈幕..."
        class="flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800"
      >
      <button
        type="submit"
        :disabled="isThrottled"
        class="rounded bg-slate-900 px-4 py-1.5 text-sm text-white disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900"
      >
        發送
      </button>
    </form>
    <p class="mt-2 text-xs text-slate-400">
      模擬演示模式,內容不會持久化——僅存於當前瀏覽器記憶體,重新整理即清空。
    </p>
  </div>
</template>

<script setup lang="ts">
import type { BulletMessage } from "~/types/bullet";

// SRS §4.2:DanmakuPlayground 資料語意與安全性規格,套在移植過來的 bullet/screen 引擎上。
const MAX_LENGTH = 30;
const THROTTLE_MS = 1500;
const TRACK_COUNT = 5;

// 預設彈幕:一開始畫面就有內容可看,不用等面試官先打字。跑完 14 則後自動從頭循環,
// 讓 Demo 畫面永遠熱鬧,不會播到一半突然安靜下來。
const DEFAULT_BULLETS = [
  "祝福新人百年好合、永浴愛河！",
  "早生貴子，幸福美滿～",
  "Yura & Wilson 恭喜你們，要一直這麼幸福喔！",
  "看著你們從相識、相戀，一直牽手走到婚禮這一天，真的很感動",
  "祝你們新婚快樂，未來的每一天都甜甜蜜蜜",
  "終於等到這一天了，恭喜恭喜！！",
  "願你們攜手到老，幸福永遠不遲到",
  "新婚愉快！記得要常常放閃喔～",
  "祝福你們像今天一樣，永遠這麼閃亮動人",
  "愛情長跑終於開花結果，太替你們開心了",
  "從朋友變家人，祝福滿滿送給你們！",
  "希望你們的婚姻生活可以像今天在婚禮現場放送的這些彈幕一樣，永遠熱鬧、永遠有新鮮事",
  "恭喜步入人生的下一個章節，加油！",
  "祝福新婚快樂，早日聽到好消息～",
];

function createBulletMessage(text: string): BulletMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    text,
  };
}

// Demo-Only:純前端記憶體陣列模擬,不寫入 Notion 或任何後端,重新整理即清空重置
// (預設彈幕也只是初始化時塞進記憶體,不是持久化內容)。
const magazine = ref<BulletMessage[]>(DEFAULT_BULLETS.map(createBulletMessage));
const inputText = ref("");
const isThrottled = ref(false);
let throttleTimer: ReturnType<typeof setTimeout> | undefined;

// 彈匣跑空時(預設 14 則全部進到軌道播放中),重新塞一輪預設彈幕,達成無限循環播放。
// 面試官自己輸入的彈幕會插進佇列尾端,不會被這個循環蓋掉,只是要排隊等目前這輪播完。
watch(
  magazine,
  (current) => {
    if (current.length === 0) {
      magazine.value.push(...DEFAULT_BULLETS.map(createBulletMessage));
    }
  },
  { deep: true },
);

function handleSubmit() {
  if (isThrottled.value) return;
  const text = inputText.value.trim().slice(0, MAX_LENGTH);
  if (!text) return;

  magazine.value.push(createBulletMessage(text));
  inputText.value = "";

  // 前端速率限制與濫用防護:1.5 秒節流,防止惡意連續點擊造成瀏覽器 DOM 暴增
  isThrottled.value = true;
  throttleTimer = setTimeout(() => {
    isThrottled.value = false;
  }, THROTTLE_MS);
}

onScopeDispose(() => {
  if (throttleTimer) clearTimeout(throttleTimer);
});
</script>
