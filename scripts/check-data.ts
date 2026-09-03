// 数据校验：pnpm check-data
// 验证音节字典抽查值 + 字/词/文章数据的每个拼音都能解析出合法双拼编码
import { CHARS, CHAR_TIERS, WORDS, WORD_TIERS, ARTICLES } from '../src/lib/data'
import { flypyCode, ALL_SYLLABLES } from '../src/lib/flypy'

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
expect(flypyCode('yang'), 'yl', '样 yang')
expect(flypyCode('wan'), 'wr', '弯 wan')
expect(flypyCode('yu'), 'yv', '雨 yu')
expect(flypyCode('ju'), 'jv', '句 ju')
expect(flypyCode('ai'), 'ad', '爱 ai')
expect(flypyCode('ou'), 'oz', '欧 ou')
expect(flypyCode('er'), 'er', '二 er')
expect(flypyCode('lve'), 'lt', '略 lve')
expect(flypyCode('zhui'), 'vv', '追 zhui')
expect(flypyCode('shui'), 'uv', '水 shui')
expect(flypyCode('niang'), 'nl', '娘 niang')
expect(flypyCode('yo'), 'yo', '哟 yo')
expect(flypyCode('den'), 'df', '嗯 den')

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
