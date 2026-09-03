// 练习引擎与界面：单字 / 编码 / 词组 / 文章 / 错字
// 逐键判定：按对推进，按错清空当前字并重打；Space 朗读、Esc 重打当前条目
import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { ALL_SYLLABLES, flypyCode } from '../lib/flypy'
import {
  ARTICLES,
  CHAR_TIERS,
  WORD_TIERS,
  charsOfTier,
  wordsOfTier,
  type Article,
  type WordItem,
} from '../lib/data'
import {
  useModeStats,
  usePersistentState,
  type MistakeEntry,
  type Settings,
} from '../lib/store'
import { sfx } from '../lib/audio'
import { speak } from '../lib/speech'
import { Keyboard } from './Keyboard'

export type PracticeMode = 'chars' | 'codes' | 'words' | 'articles' | 'mistakes'

export type Piece = { hanzi: string; pinyin: string; code: string }
export type PracticeItem = { pieces: Piece[]; speakText: string }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function charItems(chars: { char: string; pinyin: string }[]): PracticeItem[] {
  return chars.map((c) => ({
    pieces: [{ hanzi: c.char, pinyin: c.pinyin, code: flypyCode(c.pinyin) ?? '??' }],
    speakText: c.char,
  }))
}

function codeItems(syls: string[]): PracticeItem[] {
  return syls.map((s) => ({
    pieces: [{ hanzi: '', pinyin: s, code: flypyCode(s) ?? '??' }],
    speakText: s,
  }))
}

function wordItems(words: WordItem[]): PracticeItem[] {
  return words.map((w) => ({
    pieces: w.word
      .split('')
      .map((hanzi, i) => ({
        hanzi,
        pinyin: w.pinyin.split(/\s+/)[i] ?? '',
        code: w.codes[i] ?? '??',
      })),
    speakText: w.word,
  }))
}

function articleItem(a: Article): PracticeItem {
  const syls = a.pinyin.split(/\s+/)
  const pieces: Piece[] = []
  let si = 0
  for (const ch of a.text) {
    if (/[\u4e00-\u9fff]/.test(ch)) {
      const pinyin = syls[si++] ?? ''
      pieces.push({ hanzi: ch, pinyin, code: flypyCode(pinyin) ?? '??' })
    } else {
      pieces.push({ hanzi: ch, pinyin: '', code: '' })
    }
  }
  return { pieces, speakText: a.text.replace(/[^\u4e00-\u9fff，。！？、；：]/g, '') }
}

// ---------- 状态机 ----------

type State = {
  perm: number[]
  pos: number
  pieceIdx: number
  keyIdx: number
  keys: number
  correct: number
  chars: number
  streak: number
  completed: number
  startedAt: number | null
  flash: number
}

type Action =
  | { type: 'input'; key: string; items: PracticeItem[]; random: boolean }
  | { type: 'rebuild'; items: PracticeItem[]; random: boolean }
  | { type: 'resetSession'; items: PracticeItem[]; random: boolean }
  | { type: 'resetItem' }

function makePerm(size: number, random: boolean): number[] {
  const ids = Array.from({ length: size }, (_, i) => i)
  return random ? shuffle(ids) : ids
}

function initState(size: number, random: boolean): State {
  return {
    perm: makePerm(size, random),
    pos: 0,
    pieceIdx: 0,
    keyIdx: 0,
    keys: 0,
    correct: 0,
    chars: 0,
    streak: 0,
    completed: 0,
    startedAt: null,
    flash: 0,
  }
}

/** 跳过无编码的标点片段 */
function nextCodePiece(pieces: Piece[], from: number): number {
  let i = from
  while (i < pieces.length && !pieces[i].code) i++
  return i
}

function reducer(s: State, action: Action): State {
  switch (action.type) {
    case 'rebuild':
      return initState(action.items.length, action.random)
    case 'resetSession':
      return initState(action.items.length, action.random)
    case 'resetItem':
      return { ...s, pieceIdx: 0, keyIdx: 0 }
    case 'input': {
      const item = action.items[s.perm[s.pos % s.perm.length]]
      if (!item) return s
      // 无论对错，总击键数都 +1（准确率、键/分依赖它）
      const startedAt = s.startedAt ?? Date.now()
      const base = { ...s, startedAt, keys: s.keys + 1 }
      const pi = nextCodePiece(item.pieces, s.pieceIdx)
      const piece = item.pieces[pi]
      if (!piece) {
        // 条目已处于完成态（异常保护）：直接跳到下一条
        return { ...base, pieceIdx: 0, keyIdx: 0, pos: s.pos + 1 }
      }
      const expected = piece.code[s.keyIdx]
      if (action.key === expected) {
        const correct = s.correct + 1
        const keyIdx = s.keyIdx + 1
        if (keyIdx < piece.code.length) return { ...base, correct, keyIdx }
        // 当前字完成
        const chars = s.chars + (piece.hanzi ? 1 : 0)
        const nextPi = nextCodePiece(item.pieces, pi + 1)
        if (nextPi < item.pieces.length) {
          return { ...base, correct, keyIdx: 0, pieceIdx: nextPi, chars }
        }
        // 条目完成，进入下一条（随机模式换洗牌顺序）
        let pos = s.pos + 1
        let perm = s.perm
        if (pos >= s.perm.length) {
          pos = 0
          perm = makePerm(action.items.length, action.random)
        }
        return {
          ...base,
          correct,
          keyIdx: 0,
          pieceIdx: 0,
          chars,
          streak: s.streak + 1,
          completed: s.completed + 1,
          pos,
          perm,
        }
      }
      // 按错：清空当前字、连击归零、计入错误闪烁
      return { ...base, keyIdx: 0, streak: 0, flash: s.flash + 1 }
    }
  }
}

// ---------- 组件 ----------

type Props = {
  mode: PracticeMode
  settings: Settings
  onSettings: (patch: Partial<Settings>) => void
  mistakes: { entries: MistakeEntry[]; record: (char: string, pinyin: string) => void }
}

type Opts = { tier: string; order: 'seq' | 'random'; article: number }

const DEFAULT_OPTS: Record<PracticeMode, Partial<Opts>> = {
  chars: { tier: '100' },
  codes: { tier: 'all' },
  words: { tier: '20' },
  articles: { article: 0 },
  mistakes: {},
}

const MODE_UNIT: Record<PracticeMode, string> = {
  chars: '字',
  codes: '音节',
  words: '词',
  articles: '字',
  mistakes: '字',
}

export function Practice({ mode, settings, onSettings, mistakes }: Props) {
  const [opts, setOpts] = usePersistentState<Opts>(`opts.${mode}`, {
    tier: '100',
    order: 'seq',
    article: 0,
    ...DEFAULT_OPTS[mode],
  })
  const [stats, updateStats] = useModeStats(mode)
  const [toast, setToast] = useState('')
  const toastTimer = useRef<number | undefined>(undefined)
  const mistakeSnapshot = useRef<MistakeEntry[]>(mistakes.entries)

  const items = useMemo<PracticeItem[]>(() => {
    if (mode === 'chars') return charItems(charsOfTier(opts.tier))
    if (mode === 'codes') return codeItems(shuffle(ALL_SYLLABLES).slice(0, 100))
    if (mode === 'words') return wordItems(wordsOfTier(opts.tier))
    if (mode === 'articles') return [articleItem(ARTICLES[opts.article] ?? ARTICLES[0])]
    // 错字练习：只在进入页面时快照一次，练习中新打的错字不会打断当前会话
    return charItems(
      mistakeSnapshot.current.slice(0, 100).map((m) => ({ char: m.char, pinyin: m.pinyin })),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, opts.tier, opts.article])

  const random = opts.order === 'random'
  const [state, dispatch] = useReducer(reducer, undefined, () => initState(items.length, random))

  // 条目集或顺序变化时重建会话
  useEffect(() => {
    dispatch({ type: 'rebuild', items, random })
  }, [items, random])

  const item = items[state.perm[state.pos % Math.max(1, items.length)]]
  const piece = item?.pieces[nextCodePiece(item?.pieces ?? [], state.pieceIdx)]

  // 速度计时
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(t)
  }, [])

  // 物理键盘输入
  // 练习时占用键盘：捕获阶段拦截所有练习相关按键并 preventDefault，
  // 防止字母/方向键改动下拉框、Space/Enter 误触聚焦按钮、Tab 跳焦点、
  // 方向键/翻页键滚动页面、引号与斜杠触发 Firefox 快捷查找等冲突。
  // 带 Modifier（meta/ctrl/alt）的组合键不拦截，系统与浏览器快捷键照常可用。
  useEffect(() => {
    const swallow = new Set([
      'Tab',
      'Enter',
      'Backspace',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'PageUp',
      'PageDown',
      'Home',
      'End',
      "'",
      '/',
      '`',
    ])
    const onKey = (e: KeyboardEvent) => {
      // 输入法组词中的按键不处理（提示用户切英文输入法）
      if (e.isComposing || e.keyCode === 229) return
      // 系统级快捷键（Cmd/Ctrl/Alt 组合）不占用
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault()
        if (settings.sound) sfx.key()
        dispatch({ type: 'input', key: e.key.toLowerCase(), items, random })
        return
      }
      if (e.key === ' ') {
        e.preventDefault()
        if (item) speak(item.speakText)
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        dispatch({ type: 'resetItem' })
        return
      }
      // 其余按键只吞掉默认行为（焦点移动 / 滚动 / 快捷查找），不产生输入
      if (swallow.has(e.key)) e.preventDefault()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [items, random, settings.sound, item])

  // 出错反馈：音效 + 错字本
  const prevFlash = useRef(0)
  useEffect(() => {
    if (state.flash === prevFlash.current) return
    prevFlash.current = state.flash
    if (settings.sound) sfx.error()
    if (mode !== 'codes' && piece && piece.hanzi && piece.pinyin) {
      mistakes.record(piece.hanzi, piece.pinyin)
    }
  }, [state.flash, piece, mode, settings.sound, mistakes])

  // 条目完成：累计统计 + 完成提示
  const prevCompleted = useRef(0)
  useEffect(() => {
    if (state.completed === prevCompleted.current) return
    const delta = state.completed - prevCompleted.current
    prevCompleted.current = state.completed
    updateStats((s) => ({
      practiced: s.practiced + delta,
      bestStreak: Math.max(s.bestStreak, state.streak),
    }))
    if (settings.sound) sfx.done()
    if (mode === 'articles') {
      const a = ARTICLES[opts.article] ?? ARTICLES[0]
      setToast(`已完成《${a.title}》`)
      window.clearTimeout(toastTimer.current)
      toastTimer.current = window.setTimeout(() => setToast(''), 2000)
    }
  }, [state.completed, state.streak, mode, opts.article, settings.sound, updateStats])

  // 虚拟键盘点击输入
  const virtualKey = (k: string) => {
    if (settings.sound) sfx.key()
    dispatch({ type: 'input', key: k, items, random })
  }

  const minutes = state.startedAt ? (now - state.startedAt) / 60000 : 0
  const cpm = minutes > 0 ? Math.round(state.chars / minutes) : 0
  const kpm = minutes > 0 ? Math.round(state.keys / minutes) : 0
  const accuracy = state.keys > 0 ? Math.round((state.correct / state.keys) * 100) : 100

  const nextExpectedKey = settings.keyHint && piece ? piece.code[state.keyIdx] : null

  if (!items.length) {
    return (
      <section className="page">
        <div className="empty">
          <p>错字本还是空的。</p>
          <p className="muted">在单字、词组或文章练习中打错的字会自动收集到这里，用于针对性练习。</p>
        </div>
      </section>
    )
  }

  return (
    <section className="page practice">
      <div className="stats-top">
        <div className="stat">
          <em>{stats.practiced}</em>
          <span>已练</span>
        </div>
        <div className="stat">
          <em>{state.streak}</em>
          <span>连击</span>
        </div>
        <div className="stat">
          <em>{stats.bestStreak}</em>
          <span>最佳</span>
        </div>
        <div className="stat">
          <em>{accuracy}%</em>
          <span>准确率</span>
        </div>
        <div className="stat">
          <em>{cpm}</em>
          <span>{MODE_UNIT[mode]}/分</span>
        </div>
        <div className="stat">
          <em>{kpm}</em>
          <span>键/分</span>
        </div>
      </div>

      <div className="options">
        {mode === 'chars' && (
          <Select
            value={opts.tier}
            onChange={(tier) => setOpts((o) => ({ ...o, tier }))}
            options={CHAR_TIERS.map((t) => [t.id, t.name])}
            label="字库"
          />
        )}
        {mode === 'words' && (
          <Select
            value={opts.tier}
            onChange={(tier) => setOpts((o) => ({ ...o, tier }))}
            options={WORD_TIERS.map((t) => [t.id, t.name])}
            label="词库"
          />
        )}
        {mode === 'articles' && (
          <Select
            value={String(opts.article)}
            onChange={(v) => setOpts((o) => ({ ...o, article: Number(v) }))}
            options={ARTICLES.map((a, i) => [String(i), `《${a.title}》`])}
            label="文章"
          />
        )}
        <Select
          value={opts.order}
          onChange={(order) => setOpts((o) => ({ ...o, order: order as Opts['order'] }))}
          options={[
            ['seq', '顺序'],
            ['random', '随机'],
          ]}
          label="顺序"
        />
        <button type="button" className="btn-reset" onClick={() => dispatch({ type: 'resetSession', items, random })}>
          ↺ 重来
        </button>
      </div>

      <div className="quick-toggles">
        <ToggleChip on={settings.pinyinHint} onClick={() => onSettings({ pinyinHint: !settings.pinyinHint })}>
          拼音提示
        </ToggleChip>
        <ToggleChip on={settings.keyHint} onClick={() => onSettings({ keyHint: !settings.keyHint })}>
          键帽提示
        </ToggleChip>
        <ToggleChip on={settings.showKeyboard} onClick={() => onSettings({ showKeyboard: !settings.showKeyboard })}>
          键盘
        </ToggleChip>
        <ToggleChip on={settings.sound} onClick={() => onSettings({ sound: !settings.sound })}>
          声音
        </ToggleChip>
        <ToggleChip on={settings.blind} onClick={() => onSettings({ blind: !settings.blind })}>
          闭眼
        </ToggleChip>
        {settings.showKeyboard && (
          <ToggleChip on={settings.covered} onClick={() => onSettings({ covered: !settings.covered })}>
            遮盖
          </ToggleChip>
        )}
      </div>

      <div className="stage">
        {mode === 'chars' || mode === 'mistakes' || mode === 'codes' ? (
          <SingleStage
            piece={piece}
            keyIdx={state.keyIdx}
            mode={mode}
            settings={settings}
            flash={state.flash}
            progress={`${state.pos + 1}/${items.length}`}
          />
        ) : mode === 'words' ? (
          <WordsStage item={item} state={state} settings={settings} flash={state.flash} />
        ) : (
          <ArticleStage item={item} state={state} settings={settings} flash={state.flash} />
        )}
      </div>

      <p className="key-hints">
        <kbd>Space</kbd> 朗读 · <kbd>Esc</kbd> 重打当前 · 请切换到英文输入法输入 ·
        练习时键盘已占用，<kbd>⌘</kbd>/<kbd>Ctrl</kbd> 快捷键不受影响
      </p>

      {settings.showKeyboard && (
        <Keyboard
          highlight={nextExpectedKey}
          covered={settings.covered}
          onKey={virtualKey}
          onUncover={() => onSettings({ covered: false })}
        />
      )}

      {toast && <div className="toast">{toast}</div>}
    </section>
  )
}

function SingleStage({
  piece,
  keyIdx,
  mode,
  settings,
  flash,
  progress,
}: {
  piece?: Piece
  keyIdx: number
  mode: PracticeMode
  settings: Settings
  flash: number
  progress: string
}) {
  if (!piece) return null
  const isCodes = mode === 'codes'
  const target = isCodes ? piece.pinyin : settings.blind && piece.hanzi ? '□' : piece.hanzi
  return (
    <div className={'stage-single' + (flash > 0 ? ' shake' : '')} key={flash}>
      <div className="target-pinyin">{!isCodes && settings.pinyinHint ? piece.pinyin || '\u00a0' : '\u00a0'}</div>
      <div className={'target-hanzi' + (isCodes ? ' as-code' : '')}>{target}</div>
      <Slots piece={piece} keyIdx={keyIdx} keyHint={settings.keyHint} />
      <div className="progress">{progress}</div>
    </div>
  )
}

function WordsStage({
  item,
  state,
  settings,
  flash,
}: {
  item?: PracticeItem
  state: State
  settings: Settings
  flash: number
}) {
  if (!item) return null
  const currentAbs = nextCodePiece(item.pieces, state.pieceIdx)
  return (
    <div className={'stage-flow shakeable' + (flash > 0 ? ' shake' : '')} key={flash}>
      {item.pieces.map((p, i) => {
        const isCurrent = i === currentAbs
        const isDone = i < currentAbs
        return (
          <span key={i} className={'unit' + (isCurrent ? ' is-current' : '') + (isDone ? ' is-done' : '')}>
            <span className="unit-pinyin">{settings.pinyinHint && p.pinyin ? p.pinyin : '\u00a0'}</span>
            <span className="unit-hanzi">{settings.blind && p.hanzi ? '□' : p.hanzi}</span>
            {isCurrent ? (
              <Slots piece={p} keyIdx={state.keyIdx} keyHint={settings.keyHint} />
            ) : isDone && settings.keyHint ? (
              <span className="unit-code">{p.code}</span>
            ) : (
              <span className="unit-code empty">{'\u00a0'}</span>
            )}
          </span>
        )
      })}
      <div className="progress">
        {state.pos + 1}/{state.perm.length}
      </div>
    </div>
  )
}

function ArticleStage({
  item,
  state,
  settings,
  flash,
}: {
  item?: PracticeItem
  state: State
  settings: Settings
  flash: number
}) {
  if (!item) return null
  const currentAbs = nextCodePiece(item.pieces, state.pieceIdx)
  const totalHanzi = item.pieces.filter((p) => p.hanzi).length
  const doneHanzi = item.pieces.slice(0, currentAbs).filter((p) => p.hanzi).length
  return (
    <div className={'stage-article shakeable' + (flash > 0 ? ' shake' : '')} key={flash}>
      <div className="article-text">
        {item.pieces.map((p, i) => {
          const isCurrent = i === currentAbs
          const isDone = i < currentAbs
          if (!p.code) {
            return (
              <span key={i} className="unit punct-unit">
                <span className="unit-pinyin">{'\u00a0'}</span>
                <span className="unit-hanzi">{p.hanzi}</span>
                <span className="unit-code empty">{'\u00a0'}</span>
              </span>
            )
          }
          return (
            <span key={i} className={'unit' + (isCurrent ? ' is-current' : '') + (isDone ? ' is-done' : '')}>
              <span className="unit-pinyin">{settings.pinyinHint && p.pinyin ? p.pinyin : '\u00a0'}</span>
              <span className="unit-hanzi">{settings.blind && p.hanzi ? '□' : p.hanzi}</span>
              {isCurrent ? (
                <Slots piece={p} keyIdx={state.keyIdx} keyHint={settings.keyHint} />
              ) : isDone && settings.keyHint ? (
                <span className="unit-code">{p.code}</span>
              ) : (
                <span className="unit-code empty">{'\u00a0'}</span>
              )}
            </span>
          )
        })}
      </div>
      <div className="progress">
        {doneHanzi}/{totalHanzi}
      </div>
    </div>
  )
}

/** 当前字的两格键位槽：已按的键显示字母，键帽提示时预告目标键 */
function Slots({ piece, keyIdx, keyHint }: { piece: Piece; keyIdx: number; keyHint: boolean }) {
  return (
    <span className="slots">
      {[0, 1].map((i) => {
        const typed = i < keyIdx
        const expected = piece.code[i] ?? ''
        return (
          <span key={i} className={'slot' + (typed ? ' is-typed' : '') + (keyHint && i === keyIdx ? ' is-next' : '')}>
            {typed ? expected : keyHint ? expected : '·'}
          </span>
        )
      })}
    </span>
  )
}

function Select({
  value,
  onChange,
  options,
  label,
}: {
  value: string
  onChange: (v: string) => void
  options: [string, string][]
  label: string
}) {
  return (
    <label className="select">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(([v, name]) => (
          <option key={v} value={v}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}

function ToggleChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={'chip' + (on ? ' is-on' : '')} onClick={onClick}>
      {children}
    </button>
  )
}
