import { describe, expect, it } from 'vitest'
import { fillEmptySlots, refillMagazineIfEmpty } from '../../utils/bulletMagazine'

describe('fillEmptySlots(空軌補位)', () => {
  it('只補空的軌道,已經在播的軌道維持原樣', () => {
    const slots: Array<string | undefined> = ['playing-A', undefined, 'playing-C']
    const magazine = ['next-1']
    fillEmptySlots(slots, magazine)
    expect(slots).toEqual(['playing-A', 'next-1', 'playing-C'])
    expect(magazine).toEqual([])
  })

  it('多條軌道同時空著時,依彈匣順序(FIFO)依序補入', () => {
    const slots: Array<string | undefined> = [undefined, undefined, undefined]
    const magazine = ['msg-1', 'msg-2']
    fillEmptySlots(slots, magazine)
    expect(slots).toEqual(['msg-1', 'msg-2', undefined])
    expect(magazine).toEqual([])
  })

  it('彈匣已經空了,空軌維持 undefined,不會誤把 undefined 當成一則訊息', () => {
    const slots: Array<string | undefined> = [undefined, 'playing-B']
    const magazine: string[] = []
    fillEmptySlots(slots, magazine)
    expect(slots).toEqual([undefined, 'playing-B'])
  })

  it('沒有任何空軌時,彈匣內容原封不動', () => {
    const slots: Array<string | undefined> = ['playing-A', 'playing-B']
    const magazine = ['msg-1']
    fillEmptySlots(slots, magazine)
    expect(slots).toEqual(['playing-A', 'playing-B'])
    expect(magazine).toEqual(['msg-1'])
  })
})

describe('refillMagazineIfEmpty(彈匣循環填補)', () => {
  it('彈匣跑空時,塞入新一輪內容,達成無限循環播放', () => {
    const magazine: string[] = []
    refillMagazineIfEmpty(magazine, () => ['a', 'b', 'c'])
    expect(magazine).toEqual(['a', 'b', 'c'])
  })

  it('彈匣還有內容(包含使用者剛送出、正在排隊的彈幕)時,不重複塞入,避免蓋掉排隊中的內容', () => {
    const magazine = ['user-submitted']
    refillMagazineIfEmpty(magazine, () => ['a', 'b', 'c'])
    expect(magazine).toEqual(['user-submitted'])
  })
})
