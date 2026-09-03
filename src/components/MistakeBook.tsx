// 错字本：自动收集打错的字，支持针对性练习
import { flypyCode } from '../lib/flypy'
import type { MistakeEntry } from '../lib/store'

type Props = {
  entries: MistakeEntry[]
  onClear: () => void
  onPractice: () => void
}

function fmtTime(ts: number) {
  const d = new Date(ts)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function MistakeBook({ entries, onClear, onPractice }: Props) {
  return (
    <section className="page">
      <div className="page-head">
        <h2>错字本</h2>
        <p className="muted">练习中打错的字会自动收集到这里，共 {entries.length} 个。</p>
      </div>

      {entries.length === 0 ? (
        <div className="empty">
          <p>还没有错字，很棒！🎉</p>
          <p className="muted">去练习里挑战更快的速度吧。</p>
        </div>
      ) : (
        <>
          <div className="toolbar">
            <button type="button" className="btn primary" onClick={onPractice}>
              练习错字
            </button>
            <button
              type="button"
              className="btn danger"
              onClick={() => {
                if (window.confirm('确定清空错字本？')) onClear()
              }}
            >
              清空
            </button>
          </div>
          <table className="mistake-table">
            <thead>
              <tr>
                <th>字</th>
                <th>拼音</th>
                <th>双拼</th>
                <th>错误次数</th>
                <th>最近</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => (
                <tr key={`${e.char}(${e.pinyin})`}>
                  <td className="char">{e.char}</td>
                  <td>{e.pinyin}</td>
                  <td>
                    <code>{flypyCode(e.pinyin) ?? '??'}</code>
                  </td>
                  <td>{e.count}</td>
                  <td className="muted">{fmtTime(e.last)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  )
}
