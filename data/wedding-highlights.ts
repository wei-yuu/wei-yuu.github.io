import type { ProjectHighlight } from '~/types/highlight'

// 婚禮案例的亮點卡片資料——純呈現用的靜態資料,不是 Notion 驅動(亮點本身是
// 手刻客製元件,如彈幕引擎、故事時間軸)。抽成共用常數,/projects 列表頁的
// 案例預覽跟 /projects/wedding 總覽頁共用同一份,不重複宣告。順序依 Figma
// (node 19:1123「亮點列表」)為故事時間軸在前、互動彈幕在後。
export const WEDDING_HIGHLIGHTS: ProjectHighlight[] = [
  {
    slug: 'story-timeline',
    title: '故事時間軸',
    summary: '忠實移植 wei-yuu/wedding 的左右交錯式時間軸版面。',
    icon: 'book',
  },
  {
    slug: 'bullet-engine',
    title: '賓客祝福彈幕',
    summary: '忠實移植 wei-yuu/wedding 的彈匣循環填補模式,Demo-only 即時彈幕牆。',
    icon: 'chat',
  },
]
