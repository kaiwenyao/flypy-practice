// 双拼入门教程（原创内容）
type Step = { title: string; body: React.ReactNode }

const STEPS: Step[] = [
  {
    title: '第 1 步 · 为什么要学双拼',
    body: (
      <>
        <p>
          全拼打一个字平均要按 4–5 个键，而双拼把每个字固定成 <strong>2 次击键</strong>：声母一键、韵母一键。
          以日均 5000 字计算，一年能省下几十个小时，而且击键节奏稳定，手指更不容易累。
        </p>
        <p>学习成本大约是一周的阵痛期，换来的是往后几十年的输入提速——这是很划算的「投资」。</p>
      </>
    ),
  },
  {
    title: '第 2 步 · 双拼的原理',
    body: (
      <>
        <p>
          汉语拼音都可以拆成「声母 + 韵母」。双拼把每个韵母压缩到一个键位上，例如：
        </p>
        <ul>
          <li>
            双 shuang = sh + uang → <code>U</code> + <code>L</code>
          </li>
          <li>
            拼 pin = p + in → <code>P</code> + <code>B</code>
          </li>
          <li>
            装 zhuang = zh + uang → <code>V</code> + <code>L</code>
          </li>
        </ul>
        <p>
          声母里只有三个需要特别记：<code>zh→V</code>、<code>ch→I</code>、<code>sh→U</code>。
          没有声母的音节（如「爱 ai」「欧 ou」）先打首字母再打韵母键。
        </p>
      </>
    ),
  },
  {
    title: '第 3 步 · 七天上手路径',
    body: (
      <ul>
        <li>Day 1–3：开着键位提示练「单字练习」，让手指找到每个韵母的位置。</li>
        <li>Day 4–5：练「词组练习」，培养两键一字的节奏感。</li>
        <li>Day 6：练「文章练习」，适应真实输入。</li>
        <li>Day 7：遮住键盘、开启闭眼模式，逼自己回想键位。</li>
      </ul>
    ),
  },
  {
    title: '第 4 步 · 练习技巧',
    body: (
      <>
        <ul>
          <li>✅ 少量多次：每天 20 分钟好过一周练一次 3 小时。</li>
          <li>✅ 先准后快：准确率上 98% 之前不追求速度。</li>
          <li>✅ 用错字本：打错的字隔天再练一遍。</li>
          <li>❌ 不要边看键盘边打，尽快过渡到盲打。</li>
          <li>❌ 不要频繁更换双拼方案，肌肉记忆经不起重装。</li>
        </ul>
        <p>前三天觉得慢是完全正常的，一般第 10 天左右就会「突然变顺」。</p>
      </>
    ),
  },
  {
    title: '第 5 步 · 在输入法里启用小鹤双拼',
    body: (
      <p>
        主流输入法都内置了双拼：搜狗 / 微软 / 讯飞在「设置 → 输入习惯 → 双拼」里选择「小鹤双拼」；macOS
        自带输入法在「键盘 → 输入法 → 双拼」里选择；Rime 用户使用 <code>flypy</code> 方案即可。
      </p>
    ),
  },
]

export function Tutorial() {
  return (
    <section className="page">
      <div className="page-head">
        <h2>双拼入门教程</h2>
        <p className="muted">15 分钟读完，7 天上手，然后用一辈子。</p>
      </div>
      <div className="tutorial">
        {STEPS.map((s, i) => (
          <article key={i} className="tutorial-step">
            <h3>{s.title}</h3>
            {s.body}
          </article>
        ))}
      </div>
    </section>
  )
}
