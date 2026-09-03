# 小鹤双拼练习 · Flypy Practice

一个免费、开源的 [小鹤双拼](https://flypy.com) 在线打字练习网站（复刻自 ulpb.app 的功能形态），基于 **Vite + React + TypeScript** 构建，使用 **pnpm** 管理依赖，通过 GitHub Actions 自动部署到 **GitHub Pages**。

**在线访问：https://kaiwenyao.github.io/flypy-practice/**

## 功能

- **四种练习模式**
  - 单字练习：看汉字打双拼，内置 常用字 100 / 300 / 500 三档字库
  - 编码练习：看全拼音节打双拼编码（覆盖 412 个普通话音节）
  - 词组练习：常用词 20 / 60 / 全部 187 词
  - 文章练习：4 篇原创短文，逐字流式输入
- **练习辅助**
  - 虚拟键盘：完整 26 键小鹤键位标注（声母 / 韵母分色），支持点击输入、下一键高亮、一键遮盖盲打
  - 快捷开关：拼音提示、键帽提示、键盘、声音、闭眼（隐藏汉字）
  - 逐键判定：按错即抖动提示并清空当前字重打
  - `Space` 朗读当前字词（TTS）· `Esc` 重打当前条目
- **统计**：已练、连击、最佳连击（本地持久化）+ 准确率、字/分、键/分（会话实时）
- **错字本**：打错的字自动收集，可一键针对练习
- **键位表**：声母规则、零声母音节、26 键速查、韵母对照表
- **教程**：五步入门路径（原创内容）
- **深色模式**：跟随系统 / 手动浅色 / 手动深色
- 所有进度保存在浏览器 localStorage，无账号、无后端、数据不出设备

## 开发

```bash
pnpm install        # 安装依赖
pnpm dev            # 本地开发 http://localhost:5173
pnpm check-data     # 校验音节字典与字/词/文章数据完整性
pnpm lint           # oxlint
pnpm build          # 类型检查 + 产线构建到 dist/
pnpm preview        # 本地预览构建产物
```

## 部署

推送到 `main` 分支后，[GitHub Actions](.github/workflows/deploy.yml) 自动执行：安装依赖（pnpm）→ 数据校验 → 构建 → 部署到 GitHub Pages。

在仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions** 即可启用。

## 项目结构

```
src/
  lib/
    flypy.ts        # 小鹤双拼编码引擎：412 音节 → 两键编码、键位表数据
    data.ts         # 常用字（536）、词组（187）、文章（4）、提示语
    store.ts        # localStorage 持久化：设置 / 各模式统计 / 错字本
    audio.ts        # WebAudio 按键音
    speech.ts       # TTS 朗读
  components/
    Practice.tsx    # 练习引擎（reducer 状态机）+ 四种模式界面
    Keyboard.tsx    # 虚拟键盘
    Scheme.tsx      # 键位表
    Tutorial.tsx    # 教程
    MistakeBook.tsx # 错字本
  App.tsx           # 框架：导航 / 轮播提示 / 主题切换
scripts/
  check-data.ts     # 数据完整性校验（CI 同步执行）
```

## 小鹤双拼速记

- 声母只有三个例外：`zh→V`、`ch→I`、`sh→U`
- 韵母各占一键：`iu→Q`、`ei→W`、`uan→R`、`ue→T`、`un→Y`、`uo→O`、`ie→P`、`ong/iong→S`、`ai→D`、`en→F`、`eng→G`、`ang→H`、`an→J`、`ing/uai→K`、`iang/uang→L`、`ou→Z`、`ia/ua→X`、`ao→C`、`ui/ü→V`、`in→B`、`iao→N`、`ian→M`
- 零声母音节：首字母 + 韵母键，如 `ai→ad`、`ou→oz`、`er→er`

## 许可

MIT。小鹤双拼方案版权归作者所有，本站仅作键位引用用于打字练习。
