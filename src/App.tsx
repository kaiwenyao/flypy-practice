import { useEffect, useState } from 'react'
import { TIPS } from './lib/data'
import { useMistakes, useSettings, type Settings } from './lib/store'
import { Practice, type PracticeMode } from './components/Practice'
import { MistakeBook } from './components/MistakeBook'
import { Scheme } from './components/Scheme'
import { Tutorial } from './components/Tutorial'

type Tab = PracticeMode | 'scheme' | 'tutorial' | 'mistakes-practice'

const NAV: { id: Tab; label: string }[] = [
  { id: 'chars', label: '单字练习' },
  { id: 'codes', label: '编码练习' },
  { id: 'words', label: '词组练习' },
  { id: 'articles', label: '文章练习' },
  { id: 'scheme', label: '键位表' },
  { id: 'tutorial', label: '教程' },
  { id: 'mistakes', label: '错字本' },
]

function useTheme(theme: 'auto' | 'light' | 'dark') {
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false,
  )
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  const resolved = theme === 'auto' ? (systemDark ? 'dark' : 'light') : theme
  useEffect(() => {
    document.documentElement.dataset.theme = resolved
  }, [resolved])
}

export default function App() {
  const [settings, setSettings] = useSettings()
  const [tab, setTab] = useState<Tab>('chars')
  const [tipIdx, setTipIdx] = useState(() => Math.floor(Math.random() * TIPS.length))
  const mistakes = useMistakes()
  useTheme(settings.theme)

  useEffect(() => {
    const t = window.setInterval(() => setTipIdx((i) => (i + 1) % TIPS.length), 5000)
    return () => window.clearInterval(t)
  }, [])

  const patchSettings = (patch: Partial<Settings>) => setSettings((s) => ({ ...s, ...patch }))

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a
            className="brand"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setTab('chars')
            }}
          >
            <span className="brand-logo">鹤</span>
            <span className="brand-text">
              小鹤双拼练习
              <small>flypy practice</small>
            </span>
          </a>
          <nav className="nav">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                className={'nav-item' + (tab === n.id || (tab === 'mistakes-practice' && n.id === 'mistakes') ? ' is-active' : '')}
                onClick={() => setTab(n.id)}
              >
                {n.label}
                {n.id === 'mistakes' && mistakes.entries.length > 0 && (
                  <span className="nav-badge">{mistakes.entries.length}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="theme-switch">
            {(['auto', 'light', 'dark'] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={'theme-btn' + (settings.theme === t ? ' is-active' : '')}
                onClick={() => patchSettings({ theme: t })}
                title={t === 'auto' ? '跟随系统' : t === 'light' ? '浅色' : '深色'}
              >
                {t === 'auto' ? '◐' : t === 'light' ? '☀' : '☾'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="banner">
        <span className="banner-icon">💡</span>
        <span key={tipIdx} className="banner-text">
          {TIPS[tipIdx]}
        </span>
      </div>

      <main className="main">
        {tab === 'scheme' ? (
          <Scheme />
        ) : tab === 'tutorial' ? (
          <Tutorial />
        ) : tab === 'mistakes' ? (
          <MistakeBook
            entries={mistakes.entries}
            onClear={mistakes.clear}
            onPractice={() => setTab('mistakes-practice')}
          />
        ) : (
          <Practice
            mode={tab === 'mistakes-practice' ? 'mistakes' : (tab as PracticeMode)}
            settings={settings}
            onSettings={patchSettings}
            mistakes={mistakes}
          />
        )}
      </main>

      <footer className="footer">
        <p>开源小鹤双拼练习站 · 进度保存在本地浏览器 · 数据不出设备</p>
        <p className="muted">键位表速查 · 错字本自动收集 · Space 朗读 / Esc 重打</p>
      </footer>
    </div>
  )
}
