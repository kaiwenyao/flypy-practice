// 数据校验：pnpm check-data
// 验证音节字典抽查值 + 全表规则推导一致性 + 字/词/文章数据的每个拼音都能解析出合法双拼编码
import { CHARS, CHAR_TIERS, WORDS, WORD_TIERS, ARTICLES } from '../src/lib/data'
import { flypyCode, ALL_SYLLABLES, SYLLABLE_CODES, FINAL_KEYS, INITIAL_KEYS } from '../src/lib/flypy'

let failed = 0
function expect(code: string | null, want: string, label: string) {
  if (code !== want) {
    console.error(`✗ ${label}: 期望 ${want}，实际 ${code}`)
    failed++
  }
}

// 已知编码抽查
expect(flypyCode('shuang'), 'ul', '双 shuang')
expect(flypyCode('pin'), 'pb', '拼 pin')
expect(flypyCode('zhuan'), 'vr', '专 zhuan')
expect(flypyCode('yang'), 'yh', '样 yang')
expect(flypyCode('wan'), 'wj', '弯 wan')
expect(flypyCode('yu'), 'yu', '雨 yu')
expect(flypyCode('ju'), 'ju', '句 ju')
expect(flypyCode('ai'), 'ad', '爱 ai')
expect(flypyCode('ou'), 'oz', '欧 ou')
expect(flypyCode('er'), 'er', '二 er')
expect(flypyCode('lve'), 'lt', '略 lve')
expect(flypyCode('zhui'), 'vv', '追 zhui')
expect(flypyCode('shui'), 'uv', '水 shui')
expect(flypyCode('niang'), 'nl', '娘 niang')
expect(flypyCode('yo'), 'yo', '哟 yo')
expect(flypyCode('den'), 'df', '嗯 den')
expect(flypyCode('nv'), 'nv', '女 nv')
expect(flypyCode('lv'), 'lv', '绿 lv')
expect(flypyCode('rang'), 'rh', '让 rang')

// y/w 开头的音节：y/w 作声母，其余字母按书写形式取韵母键
expect(flypyCode('you'), 'yz', '有 you')
expect(flypyCode('yan'), 'yj', '烟 yan')
expect(flypyCode('yang'), 'yh', '央 yang')
expect(flypyCode('yao'), 'yc', '要 yao')
expect(flypyCode('ya'), 'ya', '压 ya')
expect(flypyCode('ye'), 'ye', '也 ye')
expect(flypyCode('wa'), 'wa', '蛙 wa')
expect(flypyCode('wai'), 'wd', '外 wai')
expect(flypyCode('wan'), 'wj', '弯 wan')
expect(flypyCode('wang'), 'wh', '王 wang')

// 全表规则推导校验：每个音节的编码必须等于「声母键 + 书写韵母键」机械推导的结果
const SINGLE_INITIALS = 'bpmfdtnlgkhjqxrzcsyw'
function ruleCode(s: string): string | null {
  // 零声母 a/e/o 行：首字母 + 韵母键，er 除外
  if (/^(a|ai|an|ang|ao|e|ei|en|eng|er|o|ou)$/.test(s)) {
    if (s === 'er') return 'er'
    return s[0] + (FINAL_KEYS[s] ?? '')
  }
  let initial: string
  let rest: string
  if (/^(zh|ch|sh)/.test(s)) {
    initial = INITIAL_KEYS[s.slice(0, 2)]
    rest = s.slice(2)
  } else if (s.length > 1 && SINGLE_INITIALS.includes(s[0])) {
    initial = s[0]
    rest = s.slice(1)
  } else {
    return null
  }
  if (!initial || !rest) return null
  const key = FINAL_KEYS[rest]
  return key ? initial + key : null
}
for (const [syl, code] of Object.entries(SYLLABLE_CODES)) {
  const want = ruleCode(syl)
  if (want !== code) {
    console.error(`✗ 音节 ${syl}: 表内编码 ${code}，按规则应为 ${want}`)
    failed++
  }
}

// 数据完整性
if (CHARS.length < 500) {
  console.error(`✗ 常用字不足 500（当前 ${CHARS.length}）`)
  failed++
}
for (const c of CHARS) {
  if (!flypyCode(c.pinyin)) {
    console.error(`✗ 字 ${c.char}(${c.pinyin}) 无编码`)
    failed++
  }
}
if (WORDS.length < WORD_TIERS[0].size) {
  console.error(`✗ 词组数量异常（当前 ${WORDS.length}）`)
  failed++
}
for (const w of WORDS) {
  w.codes.forEach((c, i) => {
    if (!c) {
      console.error(`✗ 词 ${w.word}(${w.pinyin}) 第 ${i + 1} 字无编码`)
      failed++
    }
  })
}
for (const a of ARTICLES) {
  const syls = a.pinyin.split(/\s+/)
  const hanzi = a.text.replace(/[^\u4e00-\u9fff]/g, '')
  if (syls.length !== hanzi.length) {
    console.error(`✗ 文章《${a.title}》汉字 ${hanzi.length} 个，拼音 ${syls.length} 个，数量不一致`)
    failed++
  }
  for (const s of syls) {
    if (!flypyCode(s)) {
      console.error(`✗ 文章《${a.title}》音节 ${s} 无编码`)
      failed++
    }
  }
}

console.log(`音节字典共 ${ALL_SYLLABLES.length} 个音节`)
console.log(`常用字 ${CHARS.length} 个（分层 ${CHAR_TIERS.map((t) => t.size).join('/')}）`)
console.log(`词组 ${WORDS.length} 个，文章 ${ARTICLES.length} 篇`)
if (failed) {
  console.error(`校验失败：${failed} 处问题`)
  process.exit(1)
}
console.log('✓ 全部校验通过')
