// 练习数据：常用字、词组、文章、轮播提示
import { flypyCode } from './flypy'

/** 常用字（按频率排序，字后直接跟拼音）。运行时去重，保证各层字数准确。 */
const CHARS_RAW = `
的de 一yi 是shi 在zai 不bu 了le 有you 和he 人ren 这zhe 中zhong 大da 为wei
上shang 个ge 国guo 我wo 以yi 要yao 他ta 时shi 到dao 出chu 们men 地di 也ye 子zi
你ni 说shuo 生sheng 着zhe 会hui 就jiu 自zi 那na 里li 后hou 过guo 多duo 学xue
么me 发fa 成cheng 好hao 事shi 心xin 家jia 可ke 下xia 而er 于yu 天tian 能neng
对dui 小xiao 些xie 主zhu 样yang 所suo 又you 年nian 去qu 之zhi 点dian 作zuo
看kan 想xiang 文wen 无wu 开kai 手shou 十shi 用yong 行xing 方fang 前qian 经jing
马ma 面mian 它ta 分fen 位wei 动dong 与yu 从cong 还hai 她ta 起qi 把ba 没mei
两liang 等deng 很hen 间jian 种zhong 当dang 日ri 走zou 长chang
儿er 头tou 口kou 耳er 目mu 见jian 闻wen 声sheng 音yin 信xin 息xi 水shui 火huo
山shan 石shi 田tian 土tu 金jin 木mu 米mi 竹zhu 花hua 草cao 树shu 叶ye 鸟niao
鱼yu 虫chong 猫mao 狗gou 牛niu 羊yang 风feng 雨yu 云yun 雪xue 雷lei 电dian
光guang 明ming 白bai 黑hei 红hong 蓝lan 绿lv 黄huang 灰hui 紫zi 粉fen 春chun
夏xia 秋qiu 冬dong 冷leng 暖nuan 热re 凉liang 早zao 晚wan 夜ye 东dong 西xi
南nan 北bei 左zuo 右you 师shi 朋peng 友you 同tong 谢xie 请qing 问wen 坐zuo
茶cha 奶nai 糖tang 酒jiu 果guo 肉rou 菜cai 饭fan 吃chi 喝he 路lu 车che 飞fei
机ji 船chuan 票piao 钱qian 买mai 卖mai 店dian 贵gui 宜yi 书shu 本ben 字zi
话hua 读du 写xie 语yu 词ci 句ju 段duan 篇pian 页ye 号hao 数shu 课ke 题ti 考kao
试shi 卷juan 答da 案an 身shen 体ti 健jian 康kang 病bing 药yao 医yi 院yuan
护hu 士shi 工gong 农nong 商shang 军jun 民min 城cheng 市shi 乡xiang 村cun
街jie 道dao 桥qiao 房fang 门men 窗chuang 墙qiang 楼lou 层ceng 钟zhong 刻ke
今jin 昨zuo 周zhou 季ji 节jie 假jia 岁sui 情qing 爱ai 恨hen 喜xi 怒nu 哀ai
惧ju 乐le 悲bei 愁chou 跑pao 跳tiao 落luo 站zhan 躺tang 睡shui 醒xing 听ting
望wang 叫jiao 喊han 唱chang 笑xiao 哭ku 咬yao 拿na 放fang 拉la 推tui 抬tai
提ti 扔reng 擦ca 洗xi 刷shua 扫sao 挂gua 摘zhai 换huan 关guan 送song 接jie
新xin 旧jiu 高gao 低di 矮ai 粗cu 细xi 胖pang 瘦shou 强qiang 弱ruo 快kuai
慢man 真zhen 深shen 浅qian 浓nong 淡dan 干gan 湿shi 软ruan 硬ying 稳wen
乱luan 齐qi 全quan 半ban 双shuang 单dan 孤gu 独du 二er 三san 四si 五wu 六liu
七qi 八ba 九jiu 百bai 千qian 万wan 零ling 只zhi 张zhang 件jian 支zhi 份fen
倍bei 群qun 堆dui 都dou 才cai 刚gang 已yi 正zheng 将jiang 立li 必bi 须xu
应ying 该gai 需xu 敢gan 愿yuan 但dan 然ran 且qie 或huo 虽sui 吗ma 呢ne 吧ba
啊a 呀ya 哦o 嘛ma 讲jiang 谈tan 论lun 议yi 意yi 器qi 械xie 脑nao 网wang
络luo 码ma 程cheng 序xu 编bian 译yi 母mu 父fu 亲qin 女nv 兄xiong 弟di 姐jie
妹mei 爷ye 伯bo 叔shu 姑gu 舅jiu 婶shen 娘niang 服fu 装zhuang 裤ku 裙qun
帽mao 鞋xie 袜wa 包bao 报bao 纸zhi 笔bi 墨mo 桌zhuo 椅yi 床chuang 灯deng
荷he 梅mei 兰lan 菊ju 松song 柏bai 柳liu 桂gui 枝zhi 根gen 茎jing 瓣ban
猪zhu 鸡ji 鸭ya 鹅e 兔tu 龙long 虎hu 象xiang 狼lang 熊xiong 蜂feng 蚁yi
游you 泳yong 球qiu 篮lan 足zu 赛sai 队dui 员yuan 练lian 习xi 拼pin 输shu
入ru 键jian 盘pan 屏ping 幕mu 鼠shu 标biao 打da 敲qiao 击ji 按an 遥yao
控kong 连lian 断duan 线xian 波bo 形xing 状zhuang 颜yan 色se 味wei 思si
记ji 忆yi 忘wang 决jue 定ding 计ji 划hua 始shi 终zhong 末mo 跟gen 随sui
帮bang 助zhu 教jiao 懂dong 错cuo 坏huai 少shao 太tai 非fei 极ji 最zui
更geng 越yue 拼pin 练lian 习xi 汉han 拼pin 音yin 输shu 入ru 法fa 方fang
案an 键jian 帽mao 击ji 双shuang 拼pin 速su 度du 准zhun 确que 肌ji 肉rou
记ji 忆yi 蓝lan 图tu 星xing 期qi 礼li 拜bai 访fang 谈tan 话hua 店dian
场chang 站zhan 台tai 湖hu 海hai 洋yang 岛dao 滩tan 岸an 浪lang 潮chao 沙sha
舟zhou 帆fan 桨jiang 篇pian 章zhang 节jie 段duan 落luo 款kuan
式shi 型xing 类lei 别bie 组zu
`.trim()

export type CharItem = { char: string; pinyin: string }

export const CHARS: CharItem[] = (() => {
  const seen = new Set<string>()
  const out: CharItem[] = []
  for (const token of CHARS_RAW.split(/\s+/)) {
    const m = token.match(/^(\S)([a-z]+)$/)
    if (!m) continue
    if (seen.has(m[1])) continue
    seen.add(m[1])
    out.push({ char: m[1], pinyin: m[2] })
  }
  return out
})()

/** 字库分层（前 100 / 300 / 500 个不重复常用字） */
export const CHAR_TIERS = [
  { id: '100', name: '常用字 100', size: 100 },
  { id: '300', name: '常用字 300', size: 300 },
  { id: '500', name: '常用字 500', size: 500 },
] as const

export function charsOfTier(tierId: string): CharItem[] {
  const tier = CHAR_TIERS.find((t) => t.id === tierId) ?? CHAR_TIERS[0]
  return CHARS.slice(0, tier.size)
}

/** 词组（每行一个词，词后跟空格分隔的拼音） */
const WORDS_RAW = `
双拼shuang pin 拼音pin yin 键盘jian pan 汉字han zi 练习lian xi 学习xue xi
电脑dian nao 手机shou ji 键位jian wei 声母sheng mu 韵母yun mu 输入shu ru
打字da zi 速度su du 准确zhun que 快乐kuai le 时间shi jian 朋友peng you
老师lao shi 学生xue sheng 工作gong zuo 生活sheng huo 中国zhong guo
北京bei jing 上海shang hai 城市cheng shi 早晨zao chen 晚上wan shang
今天jin tian 明天ming tian 昨天zuo tian 上午shang wu 下午xia wu 中午zhong wu
天气tian qi 下雨xia yu 晴天qing tian 太阳tai yang 月亮yue liang 星星xing xing
春天chun tian 夏天xia tian 秋天qiu tian 冬天dong tian 花朵hua duo 草地cao di
森林sen lin 河流he liu 大海da hai 山峰shan feng 天空tian kong 白云bai yun
美丽mei li 漂亮piao liang 干净gan jing 温暖wen nuan 凉快liang kuai
咖啡ka fei 牛奶niu nai 面包mian bao 鸡蛋ji dan 米饭mi fan 青菜qing cai
水果shui guo 苹果ping guo 香蕉xiang jiao 西瓜xi gua 橘子ju zi 葡萄pu tao
樱桃ying tao 图书tu shu 报纸bao zhi 音乐yin yue 电影dian ying 电视dian shi
游戏you xi 旅行lv xing 火车huo che 飞机fei ji 地铁di tie 公交gong jiao
马路ma lu 步行bu xing 跑步pao bu 游泳you yong 篮球lan qiu 足球zu qiu
唱歌chang ge 跳舞tiao wu 画画hua hua 写字xie zi 读书du shu 睡觉shui jiao
起床qi chuang 洗澡xi zao 刷牙shua ya 吃饭chi fan 喝茶he cha 说话shuo hua
听力ting li 问题wen ti 答案da an 方法fang fa 道理dao li 知识zhi shi
文化wen hua 历史li shi 科学ke xue 数学shu xue 英语ying yu 日语ri yu
语言yu yan 文字wen zi 词语ci yu 句子ju zi 文章wen zhang 故事gu shi
小说xiao shuo 诗歌shi ge 风景feng jing 照片zhao pian 记录ji lu 世界shi jie
未来wei lai 过去guo qu 现在xian zai 开始kai shi 结束jie shu 原因yuan yin
结果jie guo 目的mu di 计划ji hua 决定jue ding 选择xuan ze 机会ji hui
能力neng li 水平shui ping 成绩cheng ji 进步jin bu 成功cheng gong 失败shi bai
努力nu li 坚持jian chi 放弃fang qi 勇气yong qi 信心xin xin 耐心nai xin
细心xi xin 开心kai xin 高兴gao xing 生气sheng qi 难过nan guo 害怕hai pa
紧张jin zhang 放松fang song 安静an jing 热闹re nao 方便fang bian
简单jian dan 复杂fu za 容易rong yi 困难kun nan 重要zhong yao 特别te bie
一般yi ban 非常fei chang 经常jing chang 偶尔ou er 总是zong shi
从来cong lai 马上ma shang 立刻li ke 忽然hu ran 慢慢man man 渐渐jian jian
终于zhong yu 仍然reng ran 依然yi ran 果然guo ran 居然ju ran 记忆ji yi
肌肉ji rou 击键ji jian 盲打mang da 指法zhi fa 词组ci zu 文练wen lian
`.trim()

export type WordItem = { word: string; pinyin: string; codes: (string | null)[] }

export const WORDS: WordItem[] = (() => {
  const tokens = WORDS_RAW.split(/\s+/)
  const out: WordItem[] = []
  let i = 0
  while (i < tokens.length) {
    const m = tokens[i].match(/^([^\sA-Za-z]+)((?:[a-zü]+)?)$/)
    if (!m) {
      i++
      continue
    }
    const word = m[1]
    const syls: string[] = m[2] ? [m[2]] : []
    i++
    while (i < tokens.length && syls.length < word.length) {
      if (/^[a-zü]+$/.test(tokens[i])) syls.push(tokens[i])
      i++
    }
    if (syls.length === word.length) {
      out.push({
        word,
        pinyin: syls.join(' '),
        codes: syls.map(flypyCode),
      })
    }
  }
  return out
})()

/** 词库分层 */
export const WORD_TIERS = [
  { id: '20', name: '常用词 20', size: 20 },
  { id: '60', name: '常用词 60', size: 60 },
  { id: 'all', name: '全部词组', size: Infinity },
] as const

export function wordsOfTier(tierId: string): WordItem[] {
  const tier = WORD_TIERS.find((t) => t.id === tierId) ?? WORD_TIERS[0]
  return WORDS.slice(0, tier.size)
}

/** 文章练习 */
export type Article = { title: string; text: string; pinyin: string }

export const ARTICLES: Article[] = [
  {
    title: '双拼练习',
    text: '双拼是一种高效的输入方式。每个汉字只需要两次击键，声母一个，韵母一个。刚开始练习的时候，速度可能会比全拼还慢，这是正常的现象。只要坚持每天练习二十分钟，两周以后，你的手指就会形成记忆。先求准确，再求速度，这是练习双拼最重要的原则。',
    pinyin:
      'shuang pin shi yi zhong gao xiao de shu ru fang shi mei ge han zi zhi xu yao liang ci ji jian sheng mu yi ge yun mu yi ge gang kai shi lian xi de shi hou su du ke neng hui bi quan pin hai man zhe shi zheng chang de xian xiang zhi yao jian chi mei tian lian xi er shi fen zhong liang zhou yi hou ni de shou zhi jiu hui xing cheng ji yi xian qiu zhun que zai qiu su du zhe shi lian xi shuang pin zui zhong yao de yuan ze',
  },
  {
    title: '春天来了',
    text: '春天来了，公园里的花都开了。孩子们在草地上放风筝，小鸟在树枝上唱歌。微风吹过湖面，阳光洒在脸上，让人心情愉快。周末的时候，很多人喜欢出门走走，感受大自然的美好。',
    pinyin:
      'chun tian lai le gong yuan li de hua dou kai le hai zi men zai cao di shang fang feng zheng xiao niao zai shu zhi shang chang ge wei feng chui guo hu mian yang guang sa zai lian shang rang ren xin qing yu kuai zhou mo de shi hou hen duo ren xi huan chu men zou zou gan shou da zi ran de mei hao',
  },
  {
    title: '我的键盘',
    text: '我的键盘用了五年，键帽已经磨得发亮。朋友问我为什么不换一个新的，我说习惯了。每次敲击键盘，听到清脆的声音，就觉得踏实。工具和人一样，相处久了，会产生感情。',
    pinyin:
      'wo de jian pan yong le wu nian jian mao yi jing mo de fa liang peng you wen wo wei shen me bu huan yi ge xin de wo shuo xi guan le mei ci qiao ji jian pan ting dao qing cui de sheng yin jiu jue de ta shi gong ju he ren yi yang xiang chu jiu le hui chan sheng gan qing',
  },
  {
    title: '一杯茶',
    text: '烧一壶水，等水开的时候，把茶杯洗好。茶叶放进杯里，热水冲下去，叶子慢慢舒展开来。屋里飘着淡淡的香气。喝一杯茶，休息一下，再继续做事情，效率反而更高。',
    pinyin:
      'shao yi hu shui deng shui kai de shi hou ba cha bei xi hao cha ye fang jin bei li re shui chong xia qu ye zi man man shu zhan kai lai wu li piao zhe dan dan de xiang qi he yi bei cha xiu xi yi xia zai ji xu zuo shi qing xiao lv fan er geng gao',
  },
]

/** 顶部轮播提示 */
export const TIPS = [
  '每天 20 分钟、先准后快，2–4 周就能形成双拼肌肉记忆。',
  '任何汉字都只需两次击键：声母一键 + 韵母一键。',
  'zh→V、ch→I、sh→U，先记这三个声母键。',
  '先开着提示练熟键位，再遮住键盘靠自己回想。',
  '打错的字会自动进入错字本，针对性练习更高效。',
]
