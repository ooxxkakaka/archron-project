# archron project — 出版物展示站

纯静态网站，没有构建步骤，也没有后台。改文件、提交到 GitHub，1–2 分钟后线上自动更新。

- `index.html` 出版物索引（书架：一排三本，板线通栏，滚动时逐排落架 + 悬停跨页预览）
- `work.html` 单本出版物详情（大图、并排跨页、灯箱、中英文简介、版权页）
- `people.html` 人物索引（按首字母分组）
- `person.html` 单个人物页（简介 + 参与的出版物）
- `events.html` 书展与活动（日期、地点、英文说明，标题可点进详情页）
- `event.html` 单个活动详情（日期地点 + 海报、宣传照、现场照片，排版与出版物详情页同一套）
- `about.html` 项目介绍（英文单栏，中文数据已预留）
- `works.json` 全部文字、人物与活动数据
- `style/main.css` 配色、字体、背景
- `script/main.js` 渲染与交互

## 文件结构

```text
archron-project/
├── .nojekyll              # 告诉 GitHub Pages 不要套用 Jekyll，保留隐藏文件
├── index.html             # 出版物索引
├── work.html              # 出版物详情
├── people.html            # 人物索引
├── person.html            # 人物详情
├── events.html            # 书展与活动
├── event.html             # 单个活动详情
├── about.html             # 关于
├── works.json             # 全部内容数据
├── favicon.svg            # 浏览器标签页图标
├── README.md              # 这份说明
├── style/
│   └── main.css           # 全站样式
├── script/
│   └── main.js            # 全站渲染与交互
├── assets/
│   ├── fonts/             # Inclusive Sans、Cabin 字体与 OFL 授权
│   ├── olivia/
│   │   ├── cover.jpg      # 封面 A5（1200 × 1702）
│   │   ├── 01.jpg         # 内页
│   │   ├── 02.jpg         # 内页
│   │   ├── 03.jpg         # 内页
│   │   ├── 04.jpg         # 内页
│   │   └── 05.jpg         # 内页
│   └── bonjour/           # 书展海报（01–03，1414 × 2000）
└── _ai-temp/              # 本地检查用的截图与探针脚本，不上传，用完移入回收站
```

## 每个文件放什么

| 文件 | 内容 | 修改频率 |
| --- | --- | --- |
| `works.json` | 书名、作者、年份、开本、页数、图片路径、中英文简介、版权页、人物简介、活动与活动照片、About 文字 | 最高 |
| `assets/<slug>/` | 一本书或一个活动一个文件夹，放封面 / 照片 | 加内容时 |
| `style/main.css` | 背景色、文字色、细线颜色、字体、留白 | 偶尔 |
| `index.html` / `work.html` / `people.html` / `person.html` / `events.html` / `event.html` / `about.html` | 页面骨架，一般不用动 | 很少 |
| `script/main.js` | 读取 JSON、生成页面、悬停预览、灯箱、人物关系、活动排序 | 很少 |

## 图片上传规范

站上只有两类图片内容：出版物的（封面 + 内页）和活动的（海报 + 现场图）。首页书架的书位和详情页的图版共用同一套方框配方：图片完整显示不裁切、四周 1px 结构线内描边。区别只在比例——首页书位一律锁 A5（148:210），这样每一排的板线才是直的；详情页的框仍按图片自己的比例撑开。以后加图按下面两张表走，不必再逐张调版式。

### 上传前怎么处理

| 用途 | 建议尺寸 | 现在站上的实际值 | 单张体积 |
| --- | --- | --- | --- |
| 封面 `cover` | A5 竖版，长边 1702 | 1200 × 1702 | 约 125KB |
| 内页 `images` | 横版长边 1800（A4 横版 3:2） | 1800 × 1200 | 30–200KB |
| 海报（活动） | 竖版长边 2000 | 1414 × 2000 | 300–500KB |
| 现场图（活动） | 横版长边 2000 | 待补 | 300–500KB |
| 悬停预览 `preview` | 长边 1600–2000 | 1800 × 1200 | 30–200KB |

- 统一口径：sRGB、JPG、长边不超过 2000px、单张不超过 500KB。Affinity 导出走 File → Export → JPEG，Quality 82，More → Long Edge 2000px。超过 500KB 就把质量降到 78 再导一次。
- 印刷稿直接上传会有 4961 × 7016、单张 3–4MB，网页用不到这个分辨率，一律先按上表缩放。
- 文件名用小写英文和连字符，不要空格、不要中文。每本书、每个活动各建一个文件夹，例如 `assets/bonjour/01.jpg`、`assets/new-book/01.jpg`。
- 不需要上传 PDF、PSD、TIFF、Indd；网页只读 JPG。
- 同格式同名直接覆盖即可，不用改 JSON；从 JPG 换成 PNG 才需要改路径。

### 图版三档（`layout`）

| `layout` | 用在 | 1440 下的宽度 | 说明 |
| --- | --- | --- | --- |
| `frame` | 竖幅单图：海报、封面 | 420px 方框，一行最多三张 | 框宽和首页书位同一档（1440 下首页每格 419px）。图片完整缩在框内，四周留白走 `--tone`；框比例默认 A5（148:210），比例差得多就在该项加 `"ratio": "4 / 5"` |
| `half` | 内页、现场图 | 约 645px，相邻两张并排 | 落单的一张仍只占半栏，不会自己铺满 |
| `full` | 横向大图、跨页全景 | 满幅 1312px | 竖版图不要用这一档，会撑出两层楼高的图 |

- 同一档的连续图片自动归成一行，换档就换行；顺序就是阅读顺序。
- 待补槽写 `"pending": true`：只占版不请求文件，也不进灯箱。`frame` 的空框按方框比例撑出，和真图上传后一模一样；`half` / `full` 的空框固定 300px 高。

### 两类内容分别放哪里

| 内容 | 放哪里 | 排法 |
| --- | --- | --- |
| 书籍封面 | `works[].cover` | 首页书位用，一律按 A5 竖版（148:210）出图，例如 1200×1702；比例不对时封面完整显示、书位上下露灰底，需要裁切填满时加 `coverFit: "cover"` |
| 书籍内页 | `works[].images` | 跨页用 `full`，单页与细节用 `half`，5–15 张 |
| 书展海报 | `events[].galleries` 里 `"label": "Posters"` 那一组 | 一律 `frame`，三张一行 |
| 活动现场图 | `events[].galleries` 里 `"label": "Installation views"` 那一组 | `half` 为主，横场照可给 `full` |

活动详情页 ABOUT 区右栏会自动取第一组的第一张真图，排成 260px 小方框（右缘收在 x=1382，和双语页中文栏同一竖轴）；那一组全是待补槽时右栏不显示图。

## 本地预览

在终端进入这个文件夹：

```bash
python3 -m http.server 8000
```

浏览器打开 <http://localhost:8000>。不要直接双击 HTML 文件，浏览器会拦截 `works.json` 的读取。

## 数据结构

`works.json` 分四块：`site`（全站信息与 About）、`people`（人物）、`events`（书展与活动）、`works`（出版物）。下面是一份完整示例（活动数据在 `events` 数组里，可以继续追加）。

```json
{
  "site": {
    "name": "archron project",
    "tagline": "Selected publications and printed matter.",
    "copyright": "Atelier Archron",
    "email": "archron.project@outlook.com",
    "links": [
      { "label": "Email", "href": "mailto:archron.project@outlook.com", "text": "archron.project@outlook.com" },
      { "label": "Instagram", "href": "https://www.instagram.com/archronproject", "text": "@archronproject" }
    ],
    "about": {
      "languages": ["en"],
      "en": {
        "lead": "Archron project is a project of Atelier Archron, a studio for image production and visual culture.",
        "paragraphs": [
          "The project develops publications with artists, writers and institutions. Format, paper, sequence and distribution are agreed title by title, with the people involved.",
          "This index gathers a selection of those publications. Each title opens onto a sequence of plates; the People index lists the authors, artists and collaborators behind them."
        ]
      },
      "zh": {
        "lead": "Archron project 是 Atelier Archron 的项目计划。Atelier Archron 关注图像生产及视觉文化。",
        "paragraphs": [
          "我们与艺术家、写作者和机构共同出版。开本、纸张、编排与发行方式，由参与者针对每一本书逐一商定。",
          "这里收录其中的一部分出版物。每本书展开为一组版面；People 索引列出参与其中的作者、艺术家与合作者。"
        ]
      }
    }
  },
  "people": [
    {
      "slug": "jialing-sun",
      "name": "Jialing Sun",
      "role": "Poet, Artist",
      "bio": {
        "en": [
          "Yichang Sun was born in the waterside towns of Jiangsu, China in 1995, later studied at the School of the Art Institute of Chicago, and currently lives and works in Changzhou. …",
          "This cross-cultural experience has rooted her work in the space between two worlds. …",
          "Her artist books A Long Day and Olivia’s Little Stones are held in the permanent collections …"
        ]
      },
      "links": []
    },
    {
      "slug": "changming-lin",
      "name": "Changming Lin",
      "role": "Image-maker",
      "bio": {
        "en": ["Changming Lin is an image-maker based in Chengdu. …"],
        "zh": ["林常名，图像工作者，现居成都。……"]
      },
      "links": []
    }
  ],
  "events": [
    {
      "slug": "bonjour-art-book-fair",
      "title": { "en": "Bonjour Art Book Fair", "zh": "不熟艺术书展" },
      "city": { "en": "Shanghai", "zh": "上海" },
      "venue": "World Expo Exhibition Hall",
      "start": "2026-12-04",
      "end": "2026-12-06",
      "description": {
        "en": ["Now in its 54th edition, the fair opens in Shanghai on 4 December 2026 …", "Atelier Archron appears with recent titles from the archron project."],
        "zh": ["不熟艺术书展第 54 届将于 12 月 4 日在上海开幕……", "Atelier Archron 携 archron project 近年出版物及周边参加。"]
      },
      "galleries": [
        {
          "label": { "en": "Posters", "zh": "海报" },
          "images": [
            { "src": "assets/bonjour/01.jpg", "layout": "frame", "caption": "" },
            { "src": "assets/bonjour/02.jpg", "layout": "frame", "caption": "" }
          ]
        },
        {
          "label": "Installation views",
          "images": [
            { "pending": true, "layout": "half", "caption": "" },
            { "pending": true, "layout": "half", "caption": "" }
          ]
        }
      ],
      "link": ""
    }
  ],
  "works": [
    {
      "slug": "olivia",
      "title": "Olivia’s Little Stones",
      "people": ["jialing-sun"],
      "year": "2026",
      "format": "A5 (148 × 210 mm)",
      "pages": "",
      "place": "Chengdu",
      "publisher": "Atelier Archron",
      "cover": "assets/olivia/cover.jpg",
      "preview": "assets/olivia/02.jpg",
      "description": {
        "en": "On a mountaintop live Olivia and her family. One day, an evil warlock descends on their little home and stirs up a storm. Olivia, who has never ventured far, must walk alone into the dark forest — a place of magic and sorcery, where forest spirits dwell. Can she find a way to repel the warlock? Sit back, relax, and fall into an adventure that begins by accident, following this wonderfully expressive little girl’s steps.",
        "zh": "山顶上住着奥利薇一家。有一天，邪恶巫师降临这个小家，掀起风浪。从未远行的奥利薇只能独自走进黑森林——那里既有魔法与巫术，也有森林精灵栖息。她能从中找到驱散巫师的办法吗？你可以放轻松，跟着这个神情诙谐的小女孩，掉进一次意外开启的冒险旅程。"
      },
      "colophon": {
        "title": "Olivia’s Little Stones",
        "groups": [
          [
            "Written and illustrated by Jialing Sun",
            "Edited and designed by Changming Lin"
          ],
          [
            "Text and illustrations © 2018 Jialing Sun",
            "This edition © 2026 Jialing Sun",
            "All rights reserved."
          ],
          [
            "Published by Atelier Archron, Chengdu, 2026",
            "Published as part of Archron Project",
            "This edition published 2026",
            "First published in 2018 by Jialing Sun"
          ],
          [
            "Artist’s book · A5 (148 × 210 mm)",
            "Printed in Chengdu, 2026"
          ]
        ]
      },
      "images": [
        { "src": "assets/olivia/01.jpg", "layout": "full", "caption": "" },
        { "src": "assets/olivia/02.jpg", "layout": "half", "caption": "" },
        { "src": "assets/olivia/03.jpg", "layout": "half", "caption": "" },
        { "src": "assets/olivia/04.jpg", "layout": "full", "caption": "" },
        { "src": "assets/olivia/05.jpg", "layout": "full", "caption": "" }
      ]
    }
  ]
}
```

### `site`

| 字段 | 作用 |
| --- | --- |
| `name` | 站点名，显示在页头和浏览器标题里 |
| `tagline` | 副标题，显示在首页标题右侧 |
| `copyright` | 页脚 © 后面的名称，填 `Atelier Archron`；它和站点名 `name` 分开，不要把 archron project 写进版权行 |
| `email` | 联系邮箱；填了会显示在页脚右侧。About 页的联系信息读下面的 `links`，两处独立 |
| `links` | About 页底部的关注信息（邮箱、Instagram 等），数组；留空则整块不显示，每项 `{ "label": "...", "href": "...", "text": "..." }`。`text` 可省，省略时直接显示 `href` |
| `about.languages` | About 页要显示哪些语言，数组；现在填 `["en"]`，只显示英文。以后要加中文，改成 `["en", "zh"]`，中文会接在英文下方，排版规格相同 |
| `about.en` | About 页英文内容：`lead` 是开篇第一段（和正文同档），`paragraphs` 是其余正文段落数组 |
| `about.zh` | About 页中文内容，字段同上；已写好但当前不显示，等 `languages` 加上 `"zh"` 才出现 |

### `people`

| 字段 | 作用 |
| --- | --- |
| `slug` | 人物网址标识，小写英文，例如 `jialing-sun`。不能重复 |
| `name` | 显示名，例如 `Jialing Sun`；出现在 People 列表、详情页署名和人物页标题 |
| `role` | 身份，可写一项或多项，例如 `"Poet, Artist"`、`"Image-maker"`；显示在人物页姓名正下方，只这一行，不并城市 |
| `bio` | 简介，写成 `{ "en": [段落…], "zh": [段落…] }`；英文段在前、中文段接在下面，两种语言各自一段一个字符串。旧的纯数组写法仍按英文处理。留空则人物页显示 “Biography forthcoming.”。英文走全站长文档（15px / 380 / 1.5 / 行宽 490px），中文 14px / 400 / 1.6 / +0.01em、行宽 35em，和详情页简介同一档 |
| `links` | 相关链接，例如个人网站、Instagram；留空则人物页只留简介一栏 |

`links` 的每一项：

```json
{ "label": "Website", "href": "https://example.com" }
```

### `events`

| 字段 | 作用 |
| --- | --- |
| `slug` | 活动网址标识，小写英文加连字符，例如 `bonjour-art-book-fair`。填了它，活动列表的标题才会指向详情页 `event.html?id=<slug>`；不填就没有详情页 |
| `title` | 活动名，中英文各一项：`{ "en": "...", "zh": "..." }`；列表行和详情页都只显示英文，`zh` 暂时留着不显示 |
| `city` | 城市，中英文各一项；列表行和详情页显示英文城市名 |
| `venue` | 展馆名或展位号，例如 `"World Expo Exhibition Hall"` 或 `"Booth A10"`。留空就只显示城市；填了则和城市用 ` · ` 合成一行（`Shanghai · Booth A10`），列表行和详情页都是这一行。展馆名里不要再重复写城市，否则会出现 `Shanghai · Shanghai World Expo…` 这种绕口的行 |
| `start` / `end` | 开始、结束日期，格式 `YYYY-MM-DD`；只有一天就填 `start`，或让 `end` 与 `start` 相同 |
| `description` | 详情页 ABOUT 区块的活动简介，字段名和出版物一样。写成段落数组，段落之间自动留 17px；内容按两段式组织：先书展本身（第几届、时间地点、规模、主题、板块），再写我们带过去的东西（书目、周边、有没有工作坊或分享）。也可以写成 `{ "en": [...], "zh": [...] }`，两种语言都填时简介自动左右分栏，此时右栏的海报缩略图让位给中文 |
| `galleries` | 图片按组分：每组 `{ "label": "Posters", "images": [...] }`，`images` 里每一项的字段和出版物的完全一样（`src` / `layout` / `caption` / `pending` / `ratio`）。每组上方一个小标签，组与组之间留一大档间距；张数不限。标签写复数给人看（Posters），灯箱里的读屏文本自动改成单数（Poster 1、Poster 2），不用另写一份。只有一组时也可以直接写 `imageLabel` + `images`，渲染时归成一组，两种写法版式相同 |
| `link` | 活动或书展官网。没有 `slug` 时标题直接指向它；有 `slug` 时标题指向详情页，这个字段当前不显示 |

活动页自动把未结束的活动排在前面，按日期从近到远；结束日期早于今天的整行标灰（`.event--past` 只把名称改回 `--muted`），排在后面。目录行不再放 Upcoming / Past 小标签，状态仍写在详情页元数据表的 `STATUS` 一行里。日期显示为英文（如 `04–06 December 2026`）。

目录行和详情页的简介只出英文：中英文混排在同一列里字面差太大，中文夹在英文标题下面会显得比标题还重。`title.zh` / `city.zh` 仍留在 `works.json` 里但当前不显示；`description` 是例外——填了 `zh` 就按双语双栏排，和出版物详情页同一套。

### `works`

| 字段 | 作用 |
| --- | --- |
| `slug` | 出版物网址标识，例如 `work.html?id=olivia`。不能重复 |
| `title` / `year` | 作品名、年份；英文名按下面的规则大写 |
| `people` | 参与者的人物 `slug` 数组，例如 `["jialing-sun"]` |
| `format` / `pages` | 开本、页数；留空则不显示 |
| `place` | 出版地，例如 `Chengdu`；单独一行，不要和出版方写在一起 |
| `publisher` | 出版机构，例如 `Atelier Archron`；单独一行 |
| `description` | 中英文简介，见下文；留空则不显示 About 区块。每种语言可以是一整段字符串，也可以写成段落数组，段落之间自动留 17px |
| `colophon` | 版权页，见下文；留空则不显示 Colophon 区块 |
| `cover` | 封面图路径；首页书位一律 A5 竖框，图片完整显示不裁切。留空（`""`）时那一格仍是同尺寸书位，中间标 “Cover to follow”，详情页文字照常显示 |
| `coverFit` | 可选，默认完整显示；填 `"cover"` 会裁切填满 A5 书位，用来处理不是 A5 的封面 |
| `no` | 书架编号，可选；填了就固定用这个号（删掉前面一本时，后面的编号不会跟着往前挪），不填就按 `works` 数组顺序排 |
| `preview` | 悬停索引封面时跟随光标的图，按原图比例完整显示 |
| `images` | 详情页图，按顺序排列 |

`images` 里的每一项：

| 字段 | 作用 |
| --- | --- |
| `src` | 图片路径 |
| `layout` | `frame` 420px 方框（竖幅单图：海报、封面）；`half` 相邻两张并排；`full` 满幅（横向大图、跨页）。见「图片上传规范」 |
| `caption` | 图注；留空则不显示 |
| `pending` | 可选。填 `true` 表示这一格先占位、图片还没上传 |
| `ratio` | 可选，只在 `layout: "frame"` 时用，例如 `"4 / 5"`；留空默认 A5（`148 / 210`） |

数组顺序就是展示顺序。同一档的连续图片自动归成一行：`half` 两张一组，落单的一张仍然只占半栏，不会自己铺满；`frame` 一行最多三张；`full` 一张一行。竖版图不要用 `full`，会撑出两层楼高的图。

预留图位：把 `src` 写成将来要用的路径，再加 `"pending": true`，页面就按同一套 `layout` 排出空框、中间标 “IMAGE TO FOLLOW”，浏览器不会去请求还不存在的文件，灯箱也不会把空框算进张数。`half` / `full` 的空框固定 300px 高，`frame` 的空框按方框比例撑出、和真图上传后一模一样。图片上传到那个路径后，只删掉 `"pending": true` 这一项，其余不动，空框就变成真图并自动进灯箱。《I’m the Curator of My Own Fucking Boring Life》现在就是 5 格预留（`full` + `half`×2 + `full` + `full`，和 Olivia 的排法一致），不熟艺术书展的现场图先留了 6 格 `half`。

### 作品名的英文大小写

英文书名用 title case（标题式大写）：

- 实词首字母大写：名词、动词、形容词、副词，以及首尾两个单词。
- 虚词小写：`a`、`an`、`the`、`and`、`or`、`of`、`in`、`on`、`at`、`to`、`for`、`with` 等，除非它们出现在开头或结尾。
- 撇号用弯撇号 `’`（U+2019），引号用 `“ ”`、`‘ ’`。直撇号 `'` 偏方，弯撇号更接近印刷效果。
- 冒号后的副标题，第一个词大写。
- 人名、地名、机构名按官方拼写，不按规则改。

`olivia's little stones` 应写作 `Olivia’s Little Stones`。`works.json` 的 `title` 和 `colophon.title` 要一致；封面上的字形按封面设计处理，目录、详情页和版权页用规范标题。

### 中英文简介

`description` 分 `en` 和 `zh` 两项。两种语言同时存在时左右分栏——左英文、右中文；只填一项就单栏显示，两项都删掉则整个 About 区块不出现。

- 双语分栏共用 `.bilingual` 这一套：两栏各按正文栏宽 `--measure` 490px，左栏起点落在全站内容列 x=210，右栏右沿贴页面右边 1382，中间余量由 `justify-content: space-between` 分配（1440px 下约 192px）。窄于 1260px 时改为上下堆叠，英文在上、中文在下。
- 两栏的段落数最好一致，第一行才能同高（1440px 下详情页 y=460、人物页 y=299）。内容对不齐时按语义重新分段，不要改动文字。
- 单语时不分栏，正文仍占原来的内容列（最大 642px 的那条栏），所以只写英文的旧条目版式不变。
- 英文用英文标点，逗号、句号后加空格；破折号用 `—`，前后各空一格。
- 中文用全角标点，破折号用 `——`。
- 中文的行高和行宽在 CSS 里单独设置，不要用 `<br>` 手动断行。
- 这里只放纯文字，不要写 HTML 标签。

人物页的 `bio` 和详情页的 `description` 走的是同一条渲染路径（`script/main.js` 的 `renderLongText`）和同一套栏，所以两页的双语版式天然一致；人物简介同样从 x=210 起排，和详情页、About 同一列。

### 版权页

`colophon` 由 `title` 和 `groups` 组成：

- `title` 是版权页顶部重复的书名，可以留空。
- `groups` 是数组，每一项是一组文字；组与组之间会自动留出 12px。
- 每组里的每一行写成数组中的一项，渲染成独立一行。版权行不要合并，方便逐行核对。
- 文字照印刷版权页原样抄录，不改写、不翻译。

```json
{
  "colophon": {
    "title": "Olivia’s Little Stones",
    "groups": [
      ["Written and illustrated by Jialing Sun", "Edited and designed by Changming Lin"],
      ["Text and illustrations © 2018 Jialing Sun", "All rights reserved."]
    ]
  }
}
```

页脚的 © 后面是 `site.copyright`，年份由脚本取当年；它和作品里的版权页是两件事：前者是全站归属，后者是每本书的印刷版权信息。

## 增加一本出版物

1. 建 `assets/<slug>/`，放入封面和内页图；封面按 A5 竖版处理，内页按 A4 横版或实际版面处理。
2. 在 `works.json` 的 `works` 数组里复制一份 `olivia` 的条目。
3. 改 `slug`、`title`（英文按 title case）、`year`、`format`、`place`、`publisher`、图片路径。出版地写 `place`，出版机构写 `publisher`，不要合并成一行。封面按 A5 竖版出图（148:210，例如 1200×1702），首页书位就是这个比例，不用填尺寸。`description` 和 `colophon` 要换成新书的内容；新书还没有简介或版权页，就删掉这两个字段，不要留着 Olivia 的文字。
4. 把 `people` 改成参与者的 `slug`，多个用逗号隔开：`["jialing-sun", "another-person"]`。
5. 刷新本地页面确认，再推送到 GitHub。

先只上文字、图片以后再补：把 `cover`、`preview` 留成 `""`，`images` 按将来的排法写好每一条的 `src` 路径并加 `"pending": true`。索引里那一格会保留同样大小的 A5 书位、中间标 “Cover to follow”，详情页按 `layout` 排出同样数量的空框、中间标 “IMAGE TO FOLLOW”，文字、元数据、版权页照常排版；图片和封面到位后，把路径填回同一条目、删掉 `pending` 即可，不需要改代码。《I’m the Curator of My Own Fucking Boring Life》就是按这个状态上传的。

首页是一面书架，不是一张网格。`works` 里有几本就排几本，一排三本（窄屏两本、手机一本），只有最后一排不满时用空书位补齐，所以每一排的板线都是完整一条通栏线，架子永远收在整排上。空书位只有板下的编号，不画矩形、不写文字，表示这一格还空着；不为将来预留整排空架子，两本就只有一排。

编号按 `works` 数组顺序生成；不想让某本书的号跟着数组变动，给它加 `"no": 7`。

滚动是逐排落架：板线先从左到右扫出来，书再从左到右一本本站上去，每一排只在自己滚进视野时演一次，已经上架的不重复；系统开了「减弱动效」就直接是成品状态。书多了不用改任何东西，18 本是六排（约五屏），往下滚就是往下翻架子。

## 增加一个人物

1. 在 `works.json` 的 `people` 数组里加一个对象。
2. 填 `slug`、`name`、`role`；身份有多项就写成 `"Poet, Artist"`，只有一项就写 `"Image-maker"`。`bio` 写成 `{ "en": […], "zh": […] }`，只要一种语言就只填那一项；可以先留空，段落之间会自动留 17px。两种语言都填时自动左右分栏，和出版物详情页同一套版式，段落数尽量对齐。
3. 在相关的 `works[].people` 里加上这个 `slug`，人物页会自动列出 TA 参与的出版物。
4. 人物页地址是 `person.html?id=<slug>`，例如 `person.html?id=jialing-sun`。

人物页在姓名下方单独一行显示 `role`（18px Cabin 400，和详情页署名同档），左对齐、和姓名同栏；常驻城市写进简介正文，不再拼到这一行，因为两项连在一起太长、右对齐又容易被忽略。简介沿用详情页同一套栏位：左边 120px 标签列留空，正文从 x=210 起排（`.person__bio { grid-column: 2 }`），双语时再按 `.bilingual` 分左右两栏；人物如果填了 `links`，链接排在简介下方同一列。People 页按姓名首字母分组。字母跳转条只在出现 3 个以上首字母时显示，人少时保持干净。

别名只留一个主名：`jialing-sun` 的 `name` 是 Jialing Sun，Yichang Sun（孙艺畅）是她的另一个名字，所以英文简介正文的第一句也已改成 "Jialing Sun was born…"，避免同一个人在姓名行和简介首句用两个写法。中文简介仍按中文行文习惯以"孙艺畅"开头。以后如果要把别名亮出来，写在 `bio` 正文里，不要再往 `name` 或 `role` 里加第二个名字。

## 增加一个活动

1. 在 `works.json` 的 `events` 数组里加一个对象。
2. 填 `slug`（例如 `bonjour-art-book-fair`）、`title`、`city`、`start`、`end`，中英文都用 `{ "en": "...", "zh": "..." }`。`slug` 决定有没有详情页，务必小写英文加连字符。
3. 写 `description`：详情页 ABOUT 区块的活动简介，段落数组，段落之间自动留 17px。按两段式组织——先写书展本身（第几届、时间地点、规模、主题、板块），再写我们带过去的东西（书目、周边、有没有工作坊或分享）。只出英文即可；两种语言都填时简介自动左右分栏，右栏的海报缩略图会让位给中文。
4. 建 `assets/<slug>/`，把海报和现场图分组写进 `galleries`：`{ "label": "Posters", "images": [...] }` 一组、`{ "label": "Installation views", "images": [...] }` 一组。海报一律 `"layout": "frame"`（420px 方框，一行三张），现场图用 `half`，横场照可给 `full`；尺寸口径见「图片上传规范」。现场照片还没到位时按 `pending` 预留空框，框宽和真图一致，上传后删掉 `"pending": true` 即可。
5. `venue` 和 `link` 不确定时先留空；页面会只显示城市，不生成空链接，之后再补。`venue` 里不要重复写城市。
6. 活动结束后不用手动删除，脚本会把整行标灰并排到后面；也可以直接删掉这条记录。

示例是 2026 年 12 月 4–6 日在上海参加不熟艺术书展（世博展览馆）。日期必须写成 `YYYY-MM-DD`，否则排序和 Past / Upcoming 判断会失效。这一场已经放了 3 张海报（`assets/bonjour/01–03.jpg`，全部 `frame`）和 6 格待补的现场图；以后往对应组里追加条目即可，两组之间的间距和标签会自动跟上。

活动列表是档案式目录，和 People 页同一张表：`DATES / EVENT / PLACE` 三列，日期列 160px、地点列 240px、名称列吸收剩余，行线铺满整栏；≤760px 时三列拆成纵向堆叠。

活动详情页地址是 `event.html?id=<slug>`。它的版式就是出版物详情页那一套：大标题 → `DATES / PLACE / STATUS` 元数据表 → ABOUT 简介（右栏可带一张 260px 海报）→ 分组图版 → 上一场 / 下一场，左沿同样落在 210（窄屏 116），灯箱、键盘左右键、`frame` / `half` 配对、`pending` 预留框都和详情页共用同一段代码；区块标签和读屏文字按每组的 `label` 取（`Posters` → `Poster 1`）。想改活动页的排版，改 `.work__*` 会同时影响出版物详情页；只想动活动页，用 `.event-page` 这个根类和 `.gallery` / `.event-lede`。

## 修改 About

所有 About 文字都在 `works.json` 的 `site.about` 里：

- `languages` 决定显示哪些语言。现在填 `["en"]`，页面只显示英文；中文数据已经在 `zh` 里写好，但不会出现。
- 以后要显示中文，把 `languages` 改成 `["en", "zh"]`。中文会接在英文下方，用同样的字号层级，不会变成左右两栏。
- 两种语言各有 `lead`（开篇第一段，和正文同样大小）和 `paragraphs`（其余段落数组）。现在 `paragraphs` 已经删掉：那两段（出版物如何逐一商定、这个索引收录什么）和 `lead` 以及各本书的详情页重复，About 只留一句定位。要恢复就在 `en` / `zh` 下重新写 `"paragraphs": […]`，样式 `.about__text p` 还在。
- About 不进双语分栏：它只有一句 `lead`，和详情页、人物页的多段长文不是同一类内容，仍按单栏编辑排版显示。
- About 是单栏编辑排版：正文占内容列（1440px 下 x=210、行宽 490px，约 60 个字符），不再拉到整页宽。左边的 `--col-label` 120px 栏不再放 `PROJECT` 小标签——它和页面标题重复，删掉后正文仍留在同一内容列上（`.about__body { grid-column: 2 }`）。
- 页头右侧原来那句 “A project of Atelier Archron.” 也删了，同一句话在正文第一段开头已经写过。
- 联系信息在正文下面，用 `site.links` 一项一项列成档案行，和详情页 YEAR / FORMAT 那张表完全同一套：整块占 642px 内容带（1440px 下 x=58→700），左列 10px Cabin 600 大写标签落在 x=58，右列 13px 值落在 x=210，行线 `--line-soft`，上下各一道 `--line` 分区线。它写在 `about.html` 里 `.about__body` 的外面（`.about-grid` 的直接子元素，`grid-column: 1 / -1`），这样才不会被正文列再缩进一栏。`site.email` 只管页脚，About 里显示什么完全由 `links` 决定；`href` 不是 `mailto:` 的会自动新窗口打开。
- 邮箱已是真实地址 `archron.project@outlook.com`，同时写在 `site.email`（页脚）和 `links` 里的 `mailto:` 一项（About 页），换地址时这两处一起改。Instagram `@archronproject` 仍是占位账号。

## 品牌标识（暂未上线）

`archron_v1.svg` 目前是 160 × 160 的方形画板，实际墨迹只占 x 46→114、y 71→89，也就是 68 × 18 的横条（约 3.8:1），画板四周大片留白。放进方形槽位（`favicon.svg` 的 64 × 64、页头名号旁）时，图形实际高度只剩 2–3px，等于看不见，所以这一版先不放，`favicon.svg` 仍是占位图形。

要用它，二选一：

- 在 Affinity 里把画板裁到内容框（约 `0 0 68 18`，或四边各留 4px 的 `0 0 76 26`）再导出，这样横版字标可以按宽度放进 About 正文下方或页脚，例如 `width: 160px`；
- 另出一版方形（把字标缩进 160 × 160 并居中），才能同时用作 favicon 和页头图标。

## 改背景与配色

打开 `style/main.css`，最上面的 `:root`：

```css
--paper: #ffffff;        /* 页面背景 */
--ink: #000000;          /* 文字 */
--muted: #666666;        /* 次要文字 */
--line-strong: #ffb3b3;  /* 结构线：页头、页脚、图像外框 */
--line: #ffcccc;         /* 分区线：页标题、区块边界、占位图框 */
--line-soft: #ffe6e6;    /* 行线：逐行的列表与档案行、链接下划线 */
--tone: #f2f2f2;         /* 图片占位底色 */
--accent: #ffaaaa;       /* 悬停颜色 */
```

细线只有这三档，按区块级别选，同一级别全站同一深浅：

| 档 | 用在哪里 | 画多宽 |
| --- | --- | --- |
| `--line-strong` 结构线 | 页头下线、页脚上线、实体封面的四边外框、图版方框（`frame` 档）与首页书位的内描边、鼠标悬停预览框 | 页头页脚通栏；图像外框跟着图框 |
| `--line` 分区线 | 页标题下线、归档表表头下线、首页书架的板线、详情页档案行上下两道、COLOPHON 上线、上一页/下一页上线、提示条上下、待补图框四边 | 目录页（Publications、People、Events）通栏；详情页的档案行、提示条走内容带 642px（120 + 32 + 490）；页标题那道因为右边还有说明文字，所以通栏 |
| `--line-soft` 行线 | 归档表逐行（People、Events）、档案行 dt/dd、About 关注行、链接下划线 | 跟它所属的那一块同宽：目录页的区块是整栏，行线就通栏；档案行的区块是 642 带，行线就 642 |

同一道边界只画一道线：详情页档案行的上下两道都是 642 带内的分区线，标题区自己不再补一道通栏线；简介和版权页之间只留版权页上方那一道。以前"满幅线夹着带线""两道深浅不同的线挨着"就是这么来的。

常用背景：纯白 `#ffffff`，浅灰 `#f2f2f0`，冷灰 `#f3f4f5`。

深色版整套替换：

```css
--paper: #141412;
--ink: #eceae4;
--muted: #9b958a;
--line: #4a3b3b;
--line-strong: #5f4a4a;
--line-soft: #332c2c;
--tone: #1d1c19;
--accent: #ffaaaa;
```

字体在同一块：

```css
--font-sans: "Inclusive Sans", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
--font-display: "Cabin", "Gill Sans", "Gill Sans MT", "PingFang SC", "Hiragino Sans GB", sans-serif;
```

- 正文、图注、导航、说明用 **Inclusive Sans**（可变字重 300–700）。它是一款开放授权的无衬线字体，字形清楚、窄屏可读性好。
- 标题、作品名、栏目名、标签用 **Cabin**，气质接近 Gill Sans：同样出自英国人文主义无衬线传统，但它是 Google Fonts 的开放字体，可以随网站一起托管，不依赖访客电脑里有没有 Gill Sans。
- 两款字体都放在 `assets/fonts/`，用 `@font-face` 自托管；授权文件 `inclusive-sans-OFL.txt`、`cabin-OFL.txt` 也放在同一目录，部署时一起上传。
- 中文没有专门的展示字体，标题和正文里的中文会依次落到 PingFang SC、Hiragino Sans GB、Microsoft YaHei。Windows 上如果觉得中文偏细，可以在 `--font-sans` 里把 `"Microsoft YaHei"` 往前挪。
- 系统里的 Gill Sans 不能上传到网站（授权不允许分发），所以只作为访客电脑恰好安装时的后备，不作为主字体。

关于 "jill sans"：她指的应该是 **Gill Sans**（Eric Gill，1928，现归 Monotype），是商业授权字体。google/fonts 这个开源字库里没有它（仓库里没有 `ofl/gill-sans` 这个目录），本机 `/Library/Fonts`、`~/Library/Fonts` 和 Adobe CoreSync 也都没装，浏览器取不到。字库里同源的就是 **Cabin**：`ofl/cabin/DESCRIPTION.en_us.html` 原文写着 "Cabin is a humanist sans inspired by Edward Johnston's and Eric Gill's typefaces"，即约翰斯顿—吉尔这一支的开放复刻，也正是本站已经自托管的那一款。所以站名不必换字体，只改大小写和字号即可。字库里另外两个同风格候选：`ofl/raleway`（Matt McInerney 等，OFL，吉尔味更浓但字身偏窄）和 `ofl/lato`（OFL，更圆更温和）；真要换，只动 `--font-display` 并把 WOFF2 放进 `assets/fonts/`。

字号、字距：

```css
--text-micro: 10px;    /* 大写小标签统一档：PROJECT、COLOPHON、YEAR、活动日期 */
--text-meta: 11px;     /* 图注、页脚等更轻的辅助文字 */
--text-ui: 12px;       /* 导航、元数据、说明文字、索引编号 01/02 */
--text-body: 13px;     /* 版权页、活动地址等次级短说明 */
--text-read: 15px;     /* 长文阅读档：简介、传记、About 正文 */
--text-entry: 14px;    /* 条目标题：作品名、人名、书目 */
--text-credit: 18px;   /* 详情页创作者署名 */
--text-page: clamp(30px, 3vw, 44px);      /* Publications / People / Events / About 页标题 */
--text-display: clamp(36px, 4.8vw, 72px); /* 单本作品标题 */

--track-label: 0.12em;     /* 大写小标签统一放宽到这里 */
--track-read: -0.01em;     /* 正文、条目标题统一收紧 */
--track-tight: -0.012em;   /* 页标题收紧 */
--track-display: -0.02em;  /* 作品大标题收紧 */

--weight-read: 380;    /* 长文用可变字体的 380 档 */
--text-read-zh: 14px;  /* 中文长文比英文小 1pt：汉字字面大，同字号下灰度更重 */
--lh-read-zh: 1.6;     /* 14 × 1.6 = 22.4px 行槽，和英文 15 × 1.5 = 22.5px 基本同网格 */
--measure: 490px;      /* 英文长文行宽，约 60 个字符 */
--measure-zh: 35em;    /* 中文长文行宽，35 字 × 14px = 490px，右沿和英文对齐 */

--col-label: 120px;    /* 标签列：YEAR / FORMAT / PROJECT / 日期 */
--gap-col: 32px;       /* 标签列与内容列之间的栏距 */
```

全站只有一套栏位坐标：`左边距 + --col-label + --gap-col = 内容列左沿`。1440px 下内容列一律落在 x=210（左边距 58 + 120 + 32），About 的正文、详情页的元数据表、ABOUT 简介、COLOPHON、人物简介、活动的说明列全部对齐到这条线，右沿都是 210 + 490 = 700。图片、表格、页标题这类通栏元素才用左边距 58。窄屏（≤760px）标签列收为 96px、栏距 20px，内容列左沿变成 116。要改这套位置，只改这两个变量，不要在单个页面里补 `max-width` 或 `margin: 0 auto`。

只有双语长文会用到第二列：英文仍占 210→700，中文另起一栏、右沿贴页面右边 1382（892→1382），中间余量不写死。这一栏靠 `.bilingual` 的 `space-between` 得到，不是新增的坐标变量，所以单语页面完全不受影响。

字重的分工：长文 380（Inclusive Sans 是可变字体，380 比 400 轻一档但不虚）；短说明、图注、导航 400；中文长文 400（中文落到系统字体，没有 380 这一档）；作品名、栏目名、活动名称、小标签用 600；页标题、作品大标题和左上角 `archron project` 用 700。Cabin 的 600 比 700 收一点，放在 14–22px 的标题上不会糊成一团；真正的大标题再用 700。层级靠字重和位置拉开，不靠字号跳。

长文（详情页简介、人物传记、About 正文）统一走 `--text-read`：15px / 380 / 行高 1.5 / 字距 -0.01em，行宽 `--measure` 490px（约 60 个拉丁字符）。中文长文单独 `--text-read-zh` / 400 / `--lh-read-zh` / +0.01em，即 14px / 400 / 1.6 / +0.01em，行宽 `--measure-zh` 35em。中文比英文小 1pt 是因为汉字字面大，同字号并排放着中文会显重；行高给到 1.6 之后，14 × 1.6 = 22.4px 的行槽和英文 15 × 1.5 = 22.5px 几乎落在同一格网格上，两段挨在一起才配得齐。不要把中文行高压到英文的 1.5，也不要给中文用 380，否则字会挤在一起。段落间距 17px，写在 `p + p` 上，不用 `<br>` 断行。

About 的 `lead` 不再做大字导语，和正文走同一档（15px / 380 / 1.5 / -0.01em），只是开篇第一段；`A project of Atelier Archron.` 保持在页标题右侧，和其他页面的标题行一致。

左上角站名是全小写 `archron project`，20px / 700 / 字距 0.02em，不做 `text-transform`。小写没有大写那一排齐整的帽高，同样的字号看着比大写小一圈，所以从原来的 14px 大写放大到 20px 才压得住页头；字距也从大写用的 0.085em 收到 0.02em，小写排紧了才不散。它比导航（12px / 400，未选中为灰色）重一档，第一眼先读到站名，再读到 Publications。当前位置用 600 加下划线，颜色回到黑色。站名文字来自 `works.json` 的 `site.name`，七个 HTML 里的 `<title>`、`og:title` 和 `<a class="site-head__name">` 兜底文本一起写成小写，浏览器标签页和页头才是同一个标识。书架编号 12px / 700 / 0.02em 只出现在首页每一排板线下面；详情页大标题上方不再放编号——那一页只有一本作品，编号既没有参照也没有用处。

首页是一面书架：`<ol class="index-grid">` 里每一排是一个 `<li class="shelf">`，里面 `<ul class="shelf__row">` 排三格（≤980px 两格、≤620px 一格，脚本按同一个断点重排）。板线不属于排，而属于每一格——`.tile__meta::before` 各画一道 `--line`，左右各溢出半个 `--gap`，相邻两段在栏距正中接上，首格收到左沿、末格收到右沿，三格拼成一条 x=58→1382 的通栏线。正因为板线要直，书位高必须一致，所以首页书位一律锁 A5（148:210），不再跟随每张封面自己的比例；封面比例不对时完整显示，多出来的是 `--tone` 灰底。板下那一行左边是编号、右边是书名与署名，和归档表同一档字号。最后一排不满时用空书位补齐：空位只有一个透明占块撑住高度和板下的编号，不画矩形。

作品详情页分两段结构。头部是一列块：大标题 → 署名，全部贴在左边距 58 上，不做居中。署名用 18px Cabin 400 / -0.01em，紧贴在标题下沿、和标题同一个左栏，默认不带下划线，悬停才变粉色加下划线——这是参考站的做法，Set Margins 把作者名放在标题自己的左栏里，用字重和位置做层级，而不是把名字推到右边。头部以下（YEAR / FORMAT 元数据表、ABOUT 简介、COLOPHON）改成全站那一套 `标签列 + 栏距 + 阅读列` 网格，左沿和 About、活动页一样是 210，右沿 700；图片仍然通栏。之前这里同时存在两套坐标（居中 1180 色带 + 全幅 58 边距），桌面端就会出现"正文在中间、年份和 ABOUT 小字在很左边"的错位，现在不要再用 `max-width: 1180px; margin: 0 auto` 把某一块单独居中。

People 页只有一列名字：`<table>` + `<thead>` 里只留 NAME 一个列标题，`<colgroup>` 两列——首字母 30px、姓名列不指定宽度、吸收剩余空间，`table-layout: fixed` 保证每行名字位置完全一致，行线铺满页面。单元格内边距 9px / 20px，页面标题线到表头 22px。姓名 14px Cabin 600 黑色，悬停变粉色加下划线。首字母放在每组的第一个单元格（`<th scope="rowgroup">`），宽 30px（含 14px 右内边距），读起来像行号；人数少于 3 个字母组时，顶部的 A–Z 跳转条自动不显示。身份、参与出版物这些字段仍然写在 `works.json` 里，只在人物详情页和人物页底部的列表里显示，索引页不再摊成列。常驻城市不再单列一个字段：它写在 `bio` 正文里（“currently lives and works in Changzhou” / “现居成都”），页面顶部那一行只放 `role`。想恢复多列归档表，在 `script/main.js` 的 `colgroup` 数组和表头那一段把列加回来即可。

移动端（≤760px）People 表不再拆行，姓名列直接跟着 24px 的首字母列走，一行一个名字。同一断点把 `--col-label` 收到 96px、`--gap-col` 收到 20px，Events 表则整张拆成纵向堆叠：隐藏表头，日期、名称、地点各占一行，行线仍然铺满整栏；≤620px 时英文长文行高放宽到 1.6，因为窄屏每行只剩 45 个字符左右——中文本来就是 1.6，所以这一档不再单独覆盖中文。

活动列表改成和 People 同一张档案表：`<table class="events-table">` + `<thead>` 三个列标题 DATES / EVENT / PLACE，`<colgroup>` 里日期列锁 160px、地点列锁 240px、名称列吸收剩余，`table-layout: fixed` 保证每行三项位置完全一致，行线铺满整栏。表头 10px Cabin 600 大写灰色、下线用 `--line` 分区线；行内边距上下各 11px，行线 `--line-soft`。日期格内部两端对齐：左边是区间（10px 大写、等宽数字，`04–06 DECEMBER` 排得下一行，跨年区间才折行），右边贴着 160px 列的右沿是年份（同字号但用墨色），一排看下来年份自成一条可以扫的竖轴，按年份找活动不用逐行读日期。名称 14px Cabin 600 黑色，和首页作品名、People 姓名同一档，有 `slug` 时可点进详情页；地点 12px 灰色，`城市 · 展馆`（或展位号）合成一行，末列取消内边距、右对齐到 x=1382，和页头右侧那句说明共用同一条右沿，PLACE 这个列标题也就落在书名那一行的正上方。已结束的行把名称和年份一起退回 `--muted`。中文标题和 Upcoming / Past 标签都不再出现在目录行里。以后新增活动一律套这张表，条目再多也只是往下加长（每行 41px，12 场仍在一屏内），不要再往目录行里加字段——要加信息就加列，列宽写在 `colgroup` 里，`script/main.js` 的 `initEvents` 和表头那一段一起补。窄屏（≤760px）三列拆成纵向堆叠，末列退回左对齐，年份仍留在日期那一行的右端。

人物页在姓名下方一行只显示 `role`（18px Cabin 400，和详情页署名同档，左对齐同栏），下面的出版物列表不带编号，只保留书名（Cabin 600 / 14px）和右侧年份、开本（12px 灰色）。

作品详情页的 ABOUT 正文、活动详情页的说明、人物简介、About 正文都走同一档长文：15px / 380 / 1.5 / -0.01em，行宽由 `--measure` 490px 的内容列决定（不再单独给 `max-width`）。中文接在同一元素下面，用 14px / 400 / 1.6 / +0.01em、行宽 35em（`--measure-zh`）。版权页和活动地址属于次级短说明，用 13px / 1.5，不跟长文抢字号。

想换字体：把新的 WOFF2 放进 `assets/fonts/`，改文件顶部的 `@font-face` 和这两个变量即可。不要直接引用电脑本地字体路径，别人打开会看不到。

想用纸纹或图片背景，把 CSS 里 `body { background-image: ... }` 那行注释打开，换成你的图片路径（相对 `style/` 目录，例如 `../assets/background.jpg`）。

注意：改了背景色之后，顺手把七个 HTML 文件里的 `<meta name="theme-color" content="#ffffff">` 改成同样的颜色，手机浏览器地址栏才会跟着变。

## 版式模板（同类页面必须一致）

全站只有四类页面，每一类的字号、间距、线宽都是固定的。新增页面属于哪一类，就复用那一类现成的类名，不要新起字号或自己补 `max-width`。

| 类别 | 现有页面 | 标题 | 正文 | 辅助 | 内容带宽 | 区块线 |
| --- | --- | --- | --- | --- | --- | --- |
| 索引页 | `index.html` `people.html` `events.html` `about.html` | 页标题 44px（`--text-page`，窄屏收到 30px） | 无长文 | 页头右侧说明 12px，右对齐 | 通栏（x=58→1382） | 页标题下线通栏 `--line` |
| 条目列表 | 首页书架、People 归档表、Events 归档表 | 名称 14px / 600（`--text-entry`） | — | 编号 12px / 700、署名与地点 12px（`--text-ui`）、表头与日期 10px 大写（`--text-micro`） | 两张归档表都通栏（x=58→1382），列宽写在 `<colgroup>` 里（People 字母列 30px；Events 日期 160px、地点 240px）；首页一排三格，格宽由栅格平分、格距 `--gap`，板线通栏 | 表头下线 `--line`，逐行 `--line-soft`，首页板线 `--line`，行高由固定内边距控制（Events 上下各 11px） |
| 详情页 | `work.html` `event.html` `person.html` | 大标题 72px（`--text-display`） | 长文 15px / 380（双语时中文 14px / 400 另起右栏） | 署名 18px（`--text-credit`）、档案行 dt 10px 大写 + dd 13px | 档案行与简介 642px（x=58→700）；双语正文铺满到 1382；活动页 ABOUT 右栏可挂一张 260px 海报，收在 x=1382 | 档案行上下各一道 `--line`，行内 `--line-soft`；简介与版权页之间只留版权页上方那道 |
| 单栏编辑页 | About 正文 | 页标题同索引页 | 长文 15px / 380，行宽 490px | 关注档案行同详情页 | 内容列 x=210→700；档案行 642px | 档案行上下各一道 `--line` |

四条硬规则：

1. 同一个类别里，标题、正文、辅助文字的字号只能来自 `:root` 的档位变量；要调整就改变量，全站一起变。
2. 段落间距一律 17px（写在 `p + p` 上），区块间距只用 `clamp()` 里现成的那几档，不新增数值。
3. 一道边界只画一道线，线的深浅按上面那张三档表选，线的宽度跟它所属区块的宽度。目录页（People、Events）的区块就是整栏，行线一律铺满整栏，不收进 642px 内容带；详情页里的档案行仍是 642px 一条带。
4. 图片只有三档框：`frame` 420px 方框（竖幅单图）、`half` 半栏并排、`full` 满幅，宽度分别锁 420px / 645px / 1312px。新增图片只在这三档里选，不写单独的内联宽度；方框配方全站同一套（完整显示 + 1px `--line-strong` 内描边 + 灰底），首页书位用的是同一套配方，只是比例锁死 A5、不跟随原图。

## 发布到 GitHub Pages

1. 注册或登录 <https://github.com>。用户名会出现在网址里，想好再定（比如 `archron`）。
2. 右上角 **+** → **New repository**。Repository name 填 `archron-project`，选 **Public**，点 **Create repository**。
3. 进入仓库，点 **Add file** → **Upload files**。打开项目文件夹，选中网站文件整体拖进浏览器：
   - 需要上传：七个 HTML（`index` / `work` / `people` / `person` / `events` / `event` / `about`）、`works.json`、`favicon.svg`、`style/`、`script/`、`assets/`、`.nojekyll`。
   - 不需要上传：`_ai-temp/`、`README.md`。
   - `.nojekyll` 是隐藏文件，Finder 里按 `Cmd + Shift + .` 显示；如果没传上，点 **Add file** → **Create new file**，文件名填 `.nojekyll`，内容留空，提交即可。
4. 点 **Commit changes** 完成第一次上传。
5. 进入 **Settings** → 左侧 **Pages**。**Source** 选 **Deploy from a branch**，**Branch** 选 `main`，文件夹选 `/(root)`，点 **Save**。
6. 等 1–2 分钟，访问：

   ```text
   https://你的用户名.github.io/archron-project/
   ```

## 给别人看的链接

- 出版物索引：`https://你的用户名.github.io/archron-project/`
- 单本出版物：`https://你的用户名.github.io/archron-project/work.html?id=olivia`
- 人物索引：`https://你的用户名.github.io/archron-project/people.html`
- 单个人物：`https://你的用户名.github.io/archron-project/person.html?id=jialing-sun`
- 活动：`https://你的用户名.github.io/archron-project/events.html`
- 单个活动：`https://你的用户名.github.io/archron-project/event.html?id=bonjour-art-book-fair`
- 关于：`https://你的用户名.github.io/archron-project/about.html`

想做二维码，把主页地址粘进任意“网址二维码”生成器即可。

想用独立域名（例如 `archronproject.com`）：买域名后回到 Pages 设置，在 **Custom domain** 填入并保存，按提示到域名商添加 DNS 记录。GitHub 会自动签发 HTTPS 证书。

## 上线后还能改吗

能，所有内容都能改，包括文字、封面、内页、顺序、人物、About、背景、删除占位格。

网页端修改：

- 改文字或人物关系：仓库里点开 `works.json` → 右上角铅笔图标 → 修改 → **Commit changes**。
- 换图片：**Add file** → **Upload files**，拖入同名文件覆盖 → **Commit changes**。
- 改样式：点开 `style/main.css` → 铅笔图标 → 修改 → 提交。

每次提交后 1–2 分钟自动重新发布。没看到变化时按 `Cmd + Shift + R` 强制刷新。

也可以装 **GitHub Desktop**：把仓库 Clone 到本地，改完文件点 Commit → Push。图片多的时候比网页上传顺手。

GitHub 会保留每一次提交记录。改坏了可以在 **Commits** 里找到之前的版本提交，或在仓库里查看历史后改回来。

注意：改仓库名或 GitHub 用户名会改变网址；绑定独立域名后不受影响。

## 容量

GitHub Pages 单个仓库建议控制在 1GB 以内，每月约 100GB 流量。10 本书、每本 6 张 300KB 的 JPG，大约 18MB，完全够用。不要把整本 PDF 或原始大图放进仓库。