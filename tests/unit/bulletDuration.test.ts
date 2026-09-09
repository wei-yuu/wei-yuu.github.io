import { describe, expect, it } from 'vitest'
import { estimateBulletDuration } from '../../utils/bulletDuration'

describe('estimateBulletDuration', () => {
  it('超過 60 字,固定回傳 45 秒', () => {
    const text = 'a'.repeat(61)
    expect(estimateBulletDuration(text)).toBe(45_000)
  })

  it('41-60 字,回傳 30~34 秒之間(注入固定亂數驗證邊界)', () => {
    const text = 'a'.repeat(41)
    expect(estimateBulletDuration(text, () => 0)).toBe(30_000)
    expect(estimateBulletDuration(text, () => 0.999)).toBe(34_000)
  })

  it('21-40 字,回傳 20~29 秒之間', () => {
    const text = 'a'.repeat(21)
    expect(estimateBulletDuration(text, () => 0)).toBe(20_000)
    expect(estimateBulletDuration(text, () => 0.999)).toBe(29_000)
  })

  it('1-20 字,回傳 15~19 秒之間', () => {
    const text = 'a'.repeat(20)
    expect(estimateBulletDuration(text, () => 0)).toBe(15_000)
    expect(estimateBulletDuration(text, () => 0.999)).toBe(19_000)
  })

  it('沒有注入 random 時預設用 Math.random,結果落在對應區間內', () => {
    const duration = estimateBulletDuration('a'.repeat(21))
    expect(duration).toBeGreaterThanOrEqual(20_000)
    expect(duration).toBeLessThanOrEqual(29_000)
  })
})
