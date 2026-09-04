import fs from 'fs-extra'
import { describe, expect, it } from 'vitest'

// 迴歸測試:fs-extra 是 CJS 模組,readJson/outputJson 等方法是動態掛載到
// module.exports,`import * as fs from 'fs-extra'` 合成出來的 namespace 會缺這些方法,
// 且因為別的測試都 mock 掉 fs-extra,這個問題不會在 mock 測試裡曝露,只會在真實執行
// (例如接上真的 Notion API 時)才炸開。這裡刻意不 mock,直接檢查真實套件的形狀。
describe('fs-extra ESM default import 形狀', () => {
  it.each(['readJson', 'outputJson', 'pathExists', 'ensureDir'] as const)(
    'fs.%s 必須是函式',
    (method) => {
      expect(typeof fs[method]).toBe('function')
    },
  )
})
