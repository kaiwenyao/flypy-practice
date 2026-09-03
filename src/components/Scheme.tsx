// 小鹤双拼键位表
import { FINAL_KEYS, INITIAL_KEYS, KEY_LAYOUT, KEY_ROWS, ZERO_INITIAL } from '../lib/flypy'

export function Scheme() {
  return (
    <section className="page">
      <div className="page-head">
        <h2>小鹤双拼键位表</h2>
        <p className="muted">任何汉字 = 声母一键 + 韵母一键，永远两次击键。</p>
      </div>

      <div className="scheme-rules">
        <div className="rule-card">
          <h3>声母规则</h3>
          <p>
            大部分声母就是拼音首字母。只有三个例外：
          </p>
          <ul>
            <li>
              zh → <code>V</code>
            </li>
            <li>
              ch → <code>I</code>
            </li>
            <li>
              sh → <code>U</code>
            </li>
          </ul>
        </div>
        <div className="rule-card">
          <h3>零声母音节</h3>
          <p>没有声母的音节：先打首字母，再打韵母键。</p>
          <ul className="zero-list">
            {Object.entries(ZERO_INITIAL).map(([syl, code]) => (
              <li key={syl}>
                {syl} → <code>{code}</code>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="scheme-grid">
        {KEY_ROWS.flat().map((k) => {
          const info = KEY_LAYOUT[k]
          return (
            <div key={k} className="scheme-cell">
              <div className="scheme-letter">{k.toUpperCase()}</div>
              <div className="scheme-mappings">
                {info.initial && (
                  <span className="tag initial">
                    {info.initial} <code>{INITIAL_KEYS[info.initial]}</code>
                  </span>
                )}
                {info.finals.map((f) => (
                  <span key={f} className="tag final">
                    {f} <code>{k}</code>
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="scheme-examples">
        <h3>例子</h3>
        <ul>
          <li>
            双 shuang = sh(<code>u</code>) + uang(<code>l</code>) → <code>ul</code>
          </li>
          <li>
            拼 pin = p(<code>p</code>) + in(<code>b</code>) → <code>pb</code>
          </li>
          <li>
            装 zhuang = zh(<code>v</code>) + uang(<code>l</code>) → <code>vl</code>
          </li>
          <li>
            爱 ai（零声母）= a + ai(<code>d</code>) → <code>ad</code>
          </li>
        </ul>
      </div>

      <details className="final-table-wrap">
        <summary>韵母 → 键位 速查表</summary>
        <div className="final-table">
          {Object.entries(FINAL_KEYS).map(([f, k]) => (
            <span key={f} className="tag final">
              {f} → <code>{k}</code>
            </span>
          ))}
        </div>
      </details>
    </section>
  )
}
