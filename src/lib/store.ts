// 本地持久化：设置、各模式统计、错字本（全部存 localStorage）
import { useCallback, useEffect, useState } from 'react'

const PREFIX = 'flypy.'

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return { ...fallback, ...(JSON.parse(raw) as object) } as T
  } catch {
    return fallback
  }
}

export function saveJSON(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    /* 存储不可用时静默降级 */
  }
}

/** 持久化 state（对象合并式恢复） */
export function usePersistentState<T extends object>(key: string, fallback: T) {
  const [state, setState] = useState<T>(() => loadJSON(key, fallback))
  useEffect(() => {
    saveJSON(key, state)
  }, [key, state])
  return [state, setState] as const
}

// ---------- 设置 ----------

export type Settings = {
  theme: 'auto' | 'light' | 'dark'
  pinyinHint: boolean
  keyHint: boolean
  showKeyboard: boolean
  sound: boolean
  blind: boolean
  covered: boolean // 键盘遮盖（隐藏键位标注）
}

export const DEFAULT_SETTINGS: Settings = {
  theme: 'auto',
  pinyinHint: true,
  keyHint: true,
  showKeyboard: true,
  sound: true,
  blind: false,
  covered: false,
}

export function useSettings() {
  return usePersistentState<Settings>('settings', DEFAULT_SETTINGS)
}

// ---------- 各模式累计统计 ----------

export type ModeStats = {
  practiced: number // 累计已练条目数
  bestStreak: number // 历史最佳连击
  keys: number // 累计击键
  keysCorrect: number // 累计正确击键
}

export const EMPTY_STATS: ModeStats = { practiced: 0, bestStreak: 0, keys: 0, keysCorrect: 0 }

export function useModeStats(mode: string) {
  const [stats, setStats] = usePersistentState<ModeStats>(`stats.${mode}`, EMPTY_STATS)
  const update = useCallback(
    (patch: Partial<ModeStats> | ((s: ModeStats) => Partial<ModeStats>)) => {
      setStats((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }))
    },
    [setStats],
  )
  return [stats, update] as const
}

// ---------- 错字本 ----------

export type MistakeEntry = { char: string; pinyin: string; count: number; last: number }
export type MistakeMap = Record<string, MistakeEntry>

export function useMistakes() {
  const [map, setMap] = usePersistentState<MistakeMap>('mistakes', {})

  const record = useCallback(
    (char: string, pinyin: string) => {
      setMap((m) => {
        const key = `${char}(${pinyin})`
        const prev = m[key]
        return {
          ...m,
          [key]: { char, pinyin, count: (prev?.count ?? 0) + 1, last: Date.now() },
        }
      })
    },
    [setMap],
  )

  const clear = useCallback(() => setMap({}), [setMap])

  const entries = Object.values(map).sort((a, b) => b.count - a.count || b.last - a.last)
  return { entries, record, clear }
}
