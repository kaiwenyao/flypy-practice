// 虚拟键盘：小鹤双拼键位标注、遮盖、点击输入、下一键高亮
import { KEY_LAYOUT, KEY_ROWS } from '../lib/flypy'

type Props = {
  highlight?: string | null
  covered?: boolean
  onKey?: (k: string) => void
  onUncover?: () => void
}

export function Keyboard({ highlight, covered, onKey, onUncover }: Props) {
  return (
    <div className="kb">
      <div className={`kb-rows${covered ? ' is-covered' : ''}`}>
        {KEY_ROWS.map((row) => (
          <div className="kb-row" key={row[0] + row.length}>
            {row.map((k) => {
              const info = KEY_LAYOUT[k]
              return (
                <button
                  type="button"
                  key={k}
                  className={
                    'kb-key' + (highlight === k ? ' is-hint' : '') + (info.initial ? ' has-initial' : '')
                  }
                  onClick={() => onKey?.(k)}
                  tabIndex={-1}
                  aria-label={`键 ${k}`}
                >
                  <span className="kb-initial">{info.initial ?? ''}</span>
                  <span className="kb-letter">{k.toUpperCase()}</span>
                  <span className="kb-final">{info.finals.join(' ')}</span>
                </button>
              )
            })}
          </div>
        ))}
        {covered && (
          <button type="button" className="kb-cover" onClick={onUncover}>
            键盘已遮盖 · 点此恢复
          </button>
        )}
      </div>
      <div className="kb-legend">
        <span>
          <i className="dot dot-initial" />声母
        </span>
        <span>
          <i className="dot dot-final" />韵母
        </span>
        <span>
          <i className="dot dot-hint" />下一键位
        </span>
      </div>
    </div>
  )
}
