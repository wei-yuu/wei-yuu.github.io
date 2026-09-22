<template>
  <div class="rounded border border-wy-border-subtle bg-wy-surface p-4">
    <!-- 舞台固定用深底,不隨站點日夜模式切換——這是忠實移植自真實 repo 的彈幕
         引擎視覺(見 bullet/Bullet.vue 白字+陰影的做法),固定深底才能維持文字
         對比,不是漏改 token。 -->
    <div class="relative h-56 overflow-hidden rounded bg-slate-900">
      <!-- SRS §2.3/Website 設計文件 §4.6:減弱動態偏好要降級成靜態列表,不是
           只把 CSS animation-duration 壓到 0.01ms——那樣動畫瞬間播完只會讓
           animationend 立刻觸發、Screen.vue 立刻補下一則進同一軌道,變成極
           高速的閃爍循環,比原本的平移動畫更不舒服,也不是「靜態」。這裡改成
           偏好啟用時完全不掛載會平移的 BulletScreen,改成不會動的純文字列表。
           動畫版另外掛 aria-hidden:§4.6 明訂「不讓讀屏器不停播報整個彈幕
           舞台」,舞台上的文字持續飛入飛出、消失又補新的,讀屏器沒有意義去
           逐條自動播報。但「不要自動播報」跟「完全藏起來讀不到」是兩件不同
           的事——之前只掛 aria-hidden 卻沒補別的,等於連內容本身都讀不到,
           矯枉過正。下面固定存在同一份訊息列表,用 sr-only 視覺隱藏但留在
           無障礙樹裡,讀屏器使用者可以自己主動瀏覽/讀取,只是不會被強制
           自動播報(沒有 aria-live/role)。 -->
      <BulletScreen v-if="!prefersReducedMotion" v-model:magazine="magazine" :quantity="TRACK_COUNT" aria-hidden="true" />
      <ul :class="prefersReducedMotion ? 'flex h-full flex-col gap-1.5 overflow-y-auto p-3 text-body-sm text-white' : 'sr-only'">
        <li v-for="bullet in staticMessages" :key="bullet.id">{{ bullet.text }}</li>
      </ul>
    </div>

    <form class="mt-4" @submit.prevent="handleSubmit">
      <label for="bullet-input" class="block text-body-sm font-medium text-wy-text">輸入祝福彈幕</label>
      <div class="mt-1.5 flex gap-2">
        <input
          id="bullet-input"
          v-model="inputText"
          :maxlength="MAX_LENGTH"
          type="text"
          placeholder="輸入祝福彈幕..."
          aria-describedby="bullet-input-error bullet-input-status"
          class="min-w-0 flex-1 rounded border border-wy-border-control bg-wy-surface px-3 py-1.5 text-body-sm text-wy-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wy-focus"
        >
        <AppButton type="submit" :disabled="isThrottled">發送</AppButton>
      </div>
      <div class="mt-1.5 flex items-center justify-between text-body-sm">
        <!-- §4.6:送出成功跟節流狀態都要有明確回饋,不能只靠清空輸入框跟按鈕
             變灰讓使用者自己猜。ARIA22 要求 live region 要在訊息出現「之前」
             就已經存在於 DOM,用 v-if/v-else-if 讓 role="status" 跟著訊息一起
             建立不算數(讀屏器觀察不到「新增」這個動作)——改成兩個一開始就
             永遠存在的空容器,送出時只改文字內容,才會被正確播報。輸入框額外
             用 aria-describedby 指到這兩個 id,使用者聚焦回輸入框時也能重新
             聽到目前的錯誤/狀態說明,不是只有訊息剛出現那一瞬間才播報到。 -->
        <div>
          <span id="bullet-input-error" role="alert" class="text-wy-error">{{ errorMessage }}</span>
          <span id="bullet-input-status" role="status" class="text-wy-text-muted">{{ statusMessage }}</span>
        </div>
        <span class="text-wy-text-muted">{{ inputText.length }}/{{ MAX_LENGTH }}</span>
      </div>
    </form>
    <p class="mt-2 text-body-sm text-wy-text-muted">
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
const errorMessage = ref("");
const statusMessage = ref("");
let throttleTimer: ReturnType<typeof setTimeout> | undefined;

const MAX_DISPLAY_MESSAGES = 20;

// SRS §2.3:讀屏器/減弱動態模式共用的靜態訊息列表,跟 magazine 是兩份獨立
// 資料——magazine 會被 Screen.vue 的播放引擎 shift() 消耗,正在播/播過的
// 訊息會從 magazine 消失,如果這份列表直接讀 magazine,使用者主動閱讀時
// 會看到內容隨播放不斷「被刪除」。這份列表只在初始化跟使用者送出時更新,
// 播放引擎的補位/消耗完全不會動到它;超過上限就從最舊的開始丟,避免無限
// 長期使用下越滾越大。
const displayMessages = ref<BulletMessage[]>(DEFAULT_BULLETS.map(createBulletMessage));

function pushDisplayMessage(message: BulletMessage) {
  const next = [...displayMessages.value, message];
  displayMessages.value = next.length > MAX_DISPLAY_MESSAGES ? next.slice(-MAX_DISPLAY_MESSAGES) : next;
}

// SRS §2.3:減弱動態偏好要整段降級成靜態列表,不是只把動畫壓快——見上方
// template 的說明。SSR 階段沒有 window,先當作沒有這個偏好,掛載後用真實值
// 校正(跟 composables/useTheme.ts 的 matchMedia 用法一致)。
const prefersReducedMotion = ref(false);
const staticMessages = computed(() => displayMessages.value);
let motionQuery: MediaQueryList | undefined;

function handleMotionChange(event: MediaQueryListEvent) {
  prefersReducedMotion.value = event.matches;
}

onMounted(() => {
  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  prefersReducedMotion.value = motionQuery.matches;
  motionQuery.addEventListener("change", handleMotionChange);
});

// §4.6:空白/未輸入要給具體訊息,不能直接無聲吞掉;使用者重新輸入時清掉舊訊息。
watch(inputText, () => {
  if (errorMessage.value) errorMessage.value = "";
});

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
  if (!text) {
    errorMessage.value = "請輸入內容再送出。";
    return;
  }

  const message = createBulletMessage(text);
  magazine.value.push(message);
  pushDisplayMessage(message);
  inputText.value = "";
  statusMessage.value = "已加入播放佇列,請稍候片刻再送出下一則。";

  // 前端速率限制與濫用防護:1.5 秒節流,防止惡意連續點擊造成瀏覽器 DOM 暴增
  isThrottled.value = true;
  throttleTimer = setTimeout(() => {
    isThrottled.value = false;
    statusMessage.value = "";
  }, THROTTLE_MS);
}

onScopeDispose(() => {
  if (throttleTimer) clearTimeout(throttleTimer);
  motionQuery?.removeEventListener("change", handleMotionChange);
});
</script>
