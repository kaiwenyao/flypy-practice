// 小鹤双拼编码引擎
// 声母规则：zh→v  ch→i  sh→u，其余声母取原字母
// 韵母规则：每个韵母映射到一个键（见 FINAL_KEYS）
// 零声母音节（a/ai/an/...）：首字母 + 韵母键，如 ai→ad、ou→oz、er→er

/** 单韵母/复韵母 → 键位 */
export const FINAL_KEYS: Record<string, string> = {
  iu: 'q', ei: 'w', e: 'e', uan: 'r', ue: 't', ve: 't',
  un: 'y', vn: 'y', u: 'u', i: 'i', o: 'o', uo: 'o',
  ie: 'p', a: 'a', ong: 's', iong: 's', ai: 'd', en: 'f',
  eng: 'g', ang: 'h', an: 'j', ing: 'k', uai: 'k',
  iang: 'l', uang: 'l', ou: 'z', ia: 'x', ua: 'x', ao: 'c',
  ui: 'v', v: 'v', in: 'b', iao: 'n', ian: 'm',
}

/** 声母 zh/ch/sh 的键位 */
export const INITIAL_KEYS: Record<string, string> = { zh: 'v', ch: 'i', sh: 'u' }

/** 零声母音节的输入码 */
export const ZERO_INITIAL: Record<string, string> = {
  a: 'aa', ai: 'ad', an: 'aj', ang: 'ah', ao: 'ac',
  e: 'ee', ei: 'ew', en: 'ef', eng: 'eg', er: 'er',
  o: 'oo', ou: 'oz',
}

/**
 * 全部普通话音节 → 小鹤双拼编码（两键）。
 * 键为规范拼音写法（ü 写作 v，j/q/x/y 后的 ü 写作 u）。
 */
const RAW_SYLLABLES = `
ba=ba bai=bd ban=bj bang=bh bao=bc bei=bw ben=bf beng=bg bi=bi bian=bm biao=bn bie=bp bin=bb bing=bk bo=bo bu=bu
pa=pa pai=pd pan=pj pang=ph pao=pc pei=pw pen=pf peng=pg pi=pi pian=pm piao=pn pie=pp pin=pb ping=pk po=po pou=pz pu=pu
ma=ma mai=md man=mj mang=mh mao=mc me=me mei=mw men=mf meng=mg mi=mi mian=mm miao=mn mie=mp min=mb ming=mk miu=mq mo=mo mou=mz mu=mu
fa=fa fan=fj fang=fh fei=fw fen=ff feng=fg fo=fo fou=fz fu=fu
da=da dai=dd dan=dj dang=dh dao=dc de=de dei=dw den=df deng=dg di=di dia=dx dian=dm diao=dn die=dp ding=dk diu=dq dong=ds dou=dz du=du duan=dr dui=dv dun=dy duo=do
ta=ta tai=td tan=tj tang=th tao=tc te=te teng=tg ti=ti tian=tm tiao=tn tie=tp ting=tk tong=ts tou=tz tu=tu tuan=tr tui=tv tun=ty tuo=to
na=na nai=nd nan=nj nang=nh nao=nc ne=ne nei=nw nen=nf neng=ng ni=ni nian=nm niang=nl niao=nn nie=np nin=nb ning=nk niu=nq nong=ns nou=nz nu=nu nuan=nr nuo=no nv=nv nve=nt nue=nt
la=la lai=ld lan=lj lang=lh lao=lc le=le lei=lw leng=lg li=li lia=lx lian=lm liang=ll liao=ln lie=lp lin=lb ling=lk liu=lq lo=lo long=ls lou=lz lu=lu luan=lr lun=ly luo=lo lv=lv lue=lt lve=lt
ga=ga gai=gd gan=gj gang=gh gao=gc ge=ge gei=gw gen=gf geng=gg gong=gs gou=gz gu=gu gua=gx guai=gk guan=gr guang=gl gui=gv gun=gy guo=go
ka=ka kai=kd kan=kj kang=kh kao=kc ke=ke kei=kw ken=kf keng=kg kong=ks kou=kz ku=ku kua=kx kuai=kk kuan=kr kuang=kl kui=kv kun=ky kuo=ko
ha=ha hai=hd han=hj hang=hh hao=hc he=he hei=hw hen=hf heng=hg hong=hs hou=hz hu=hu hua=hx huai=hk huan=hr huang=hl hui=hv hun=hy huo=ho
ji=ji jia=jx jian=jm jiang=jl jiao=jn jie=jp jin=jb jing=jk jiong=js jiu=jq ju=jv juan=jr jue=jt jun=jy
qi=qi qia=qx qian=qm qiang=ql qiao=qn qie=qp qin=qb qing=qk qiong=qs qiu=qq qu=qv quan=qr que=qt qun=qy
xi=xi xia=xx xian=xm xiang=xl xiao=xn xie=xp xin=xb xing=xk xiong=xs xiu=xq xu=xv xuan=xr xue=xt xun=xy
ran=rj rang=rl rao=rc re=re rei=rw ren=rf reng=rg ri=ri rong=rs rou=rz ru=ru rua=rx ruan=rr rui=rv run=ry ruo=ro
za=za zai=zd zan=zj zang=zh zao=zc ze=ze zei=zw zen=zf zeng=zg zi=zi zong=zs zou=zz zu=zu zuan=zr zui=zv zun=zy zuo=zo
ca=ca cai=cd can=cj cang=ch cao=cc ce=ce cen=cf ceng=cg ci=ci cong=cs cou=cz cu=cu cuan=cr cui=cv cun=cy cuo=co
sa=sa sai=sd san=sj sang=sh sao=sc se=se sen=sf seng=sg si=si song=ss sou=sz su=su suan=sr sui=sv sun=sy suo=so
zha=va zhai=vd zhan=vj zhang=vh zhao=vc zhe=ve zhen=vf zheng=vg zhi=vi zhong=vs zhou=vz zhu=vu zhua=vx zhuai=vk zhuan=vr zhuang=vl zhui=vv zhun=vy zhuo=vo
cha=ia chai=id chan=ij chang=ih chao=ic che=ie chen=if cheng=ig chi=ii chong=is chou=iz chu=iu chua=ix chuai=ik chuan=ir chuang=il chui=iv chun=iy chuo=io
sha=ua shai=ud shan=uj shang=uh shao=uc she=ue shei=uw shen=uf sheng=ug shi=ui shou=uz shu=uu shua=ux shuai=uk shuan=ur shuang=ul shui=uv shun=uy shuo=uo
ya=yx yan=ym yang=yl yao=yn ye=yp yi=yi yin=yb ying=yk yo=yo yong=ys you=yq yu=yv yuan=yr yue=yt yun=yy
wa=wx wai=wk wan=wr wang=wl wei=ww wen=wf weng=wg wo=wo wu=wu
`

export const SYLLABLE_CODES: Record<string, string> = (() => {
  const map: Record<string, string> = { ...ZERO_INITIAL }
  for (const token of RAW_SYLLABLES.trim().split(/\s+/)) {
    const [syl, code] = token.split('=')
    if (syl && code) map[syl] = code
  }
  return map
})()

/** 供「编码练习」使用的音节表 */
export const ALL_SYLLABLES = Object.keys(SYLLABLE_CODES)

/** 规范化拼音音节：小写、ü→v */
export function normalizeSyllable(s: string): string {
  return s.toLowerCase().trim().replace(/ü/g, 'v')
}

/** 查询单个音节的小鹤双拼编码（两键），未知音节返回 null */
export function flypyCode(syllable: string): string | null {
  const syl = normalizeSyllable(syllable)
  return SYLLABLE_CODES[syl] ?? null
}

/** 查询多个音节（空格分隔）的编码数组 */
export function flypyCodes(pinyin: string): (string | null)[] {
  return normalizeSyllable(pinyin).split(/\s+/).filter(Boolean).map(flypyCode)
}

/** 拆分音节为 声母/韵母，用于键位表展示 */
export function splitSyllable(syl: string): { initial: string; final: string } {
  const s = normalizeSyllable(syl)
  if (s.startsWith('zh') || s.startsWith('ch') || s.startsWith('sh')) {
    return { initial: s.slice(0, 2), final: s.slice(2) }
  }
  const singles = 'bpmdtnlgkhjqxrzcsyw'
  if (s.length > 1 && singles.includes(s[0])) {
    return { initial: s[0], final: s.slice(1) }
  }
  return { initial: '', final: s }
}

/** 虚拟键盘键位数据：每键的声母标注与韵母标注 */
export const KEY_LAYOUT: Record<string, { initial?: string; finals: string[] }> = {
  q: { finals: ['iu'] },
  w: { finals: ['ei'] },
  e: { finals: ['e'] },
  r: { finals: ['uan'] },
  t: { finals: ['ue ve'] },
  y: { finals: ['un vn'] },
  u: { initial: 'sh', finals: ['u'] },
  i: { initial: 'ch', finals: ['i'] },
  o: { finals: ['o uo'] },
  p: { finals: ['ie'] },
  a: { finals: ['a'] },
  s: { finals: ['ong iong'] },
  d: { finals: ['ai'] },
  f: { finals: ['en'] },
  g: { finals: ['eng'] },
  h: { finals: ['ang'] },
  j: { finals: ['an'] },
  k: { finals: ['ing uai'] },
  l: { finals: ['iang uang'] },
  z: { finals: ['ou'] },
  x: { finals: ['ia ua'] },
  c: { finals: ['ao'] },
  v: { initial: 'zh', finals: ['ui v'] },
  b: { finals: ['in'] },
  n: { finals: ['iao'] },
  m: { finals: ['ian'] },
}

export const KEY_ROWS: string[][] = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
]
