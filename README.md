# Omni Mind - AI 多媒体资料检索系统
<p align="center">
  <strong>AI 原生的全格式多媒体资料检索与管理平台</strong><br>
  基于大语言模型实现自然语言搜索，支持文本、图像、音频、视频、办公文档等15+种格式的在线预览与检索
</p>
<p align="center">
  <a href="https://github.com/wang-junjian/omni-mind/releases"><img src="https://img.shields.io/badge/version-v1.0.0-blue.svg" alt="Version"></a>
  <a href="https://github.com/wang-junjian/omni-mind/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License"></a>
  <a href="https://nodejs.org/en/"><img src="https://img.shields.io/badge/node-%3E%3D20-brightgreen.svg" alt="Node.js"></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/built%20with-Next.js-black.svg" alt="Built with Next.js"></a>
</p>

一个AI原生的多媒体资料检索应用，能够基于自然语言查询检索各种格式的资料（文本、图像、音频、视频、办公文档等），并支持全格式在线查看和播放，无需下载任何额外工具。

## 🎯 适用场景
- **个人知识库**：管理个人学习资料、影音收藏、文档素材、电子书库
- **家庭媒体中心**：统一管理家庭照片、视频、音乐、儿童教育资源
- **企业资料管理**：团队内部文档、产品资料、培训素材的检索与共享
- **媒体工作室**：快速查找设计素材、音视频素材、项目归档文件
- **教育机构**：教学资源、课件、视频教程的统一管理和检索

## ✨ 特性
### 🤖 核心功能
- **AI 语义检索**：支持自然语言查询，智能理解用户需求（需配置OpenAI API）
- **关键词检索**：默认支持高性能关键词搜索，无需额外配置即可使用
- **多格式支持**：支持文本、图片、音频、视频、表格等15+种文件格式
- **在线预览**：各种媒体格式无需下载，直接在线查看和播放
- **高性能索引**：基于SQLite数据库，快速检索数万级文件规模
- **增量更新**：自动检测文件变更，支持增量索引，无需重复扫描

### 🎯 管理功能
- **Web 管理界面**：可视化管理页面，无需登录服务器即可操作
- **在线索引**：网页端即可启动全量/自定义路径索引，实时查看进度
- **实时日志**：实时查看索引进度和系统运行日志
- **错误诊断**：详细的错误日志和问题排查工具，快速定位问题

### 💻 用户体验
- **现代界面**：基于Next.js和Tailwind CSS的现代化响应式界面，支持移动端
- **快速搜索**：毫秒级响应的搜索体验，支持结果筛选和排序
- **丰富展示**：缩略图、文件路径、分类、相似度等信息一目了然
- **播放控制**：音视频播放支持进度控制、音量调节、全屏播放等功能

## 🛠️ 技术栈
- **前端**：Next.js 14 + TypeScript + Tailwind CSS + Shadcn/UI
- **数据库**：SQLite + Drizzle ORM，无需额外部署数据库服务
- **AI 能力**：OpenAI Embedding API + 语义检索（可选配置）
- **媒体处理**：FFmpeg、Sharp、XLSX、Mammoth等开源工具
- **日志系统**：结构化日志记录 + 可视化日志查询页面

## 🚀 3分钟快速开始
### 前置依赖
```bash
# macOS 安装系统依赖
brew install ffmpeg

# Ubuntu/Debian 安装系统依赖
sudo apt install ffmpeg sqlite3
```

### 一键部署
```bash
# 1. 克隆项目
git clone https://github.com/wang-junjian/omni-mind.git
cd omni-mind

# 2. 安装项目依赖
npm install

# 3. 初始化数据库
npm run db:generate
npm run db:migrate

# 4. 把您的多媒体文件放入 resources/ 目录
mkdir resources
# 拷贝您的文件到 resources/ 目录下

# 5. 启动开发服务器
npm run dev
```

然后访问 http://localhost:3000/admin 点击"开始索引"，等待索引完成后即可访问 http://localhost:3000 开始使用！

---

## 📖 详细使用指南
### 环境变量配置
复制`.env.example`为`.env.local`并根据需要配置：
```env
# OpenAI配置（可选，配置后开启语义检索，默认使用关键词搜索）
OPENAI_BASE_URL=https://api.openai.com/v1/
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
TEMPERATURE=0.7
MAX_TOKENS=32000

# 应用配置
RESOURCE_PATH=./resources  # 资源文件默认目录
DATABASE_URL=file:./data/omni-mind.db  # 数据库文件路径
NEXT_PUBLIC_APP_URL=http://localhost:3000  # 应用访问地址
```

### 准备资源文件
**方式A（推荐）**：将您的多媒体资源文件放入项目根目录的 `resources/` 文件夹下，系统会自动识别。

**方式B**：保持原来的目录结构，在管理页面自定义路径进行索引，支持任意可读目录。

### 索引文件
##### 方式一：网页端索引（推荐）
启动开发服务器后，访问 http://localhost:3000/admin 点击"开始索引"，可以实时查看索引进度和日志。

##### 方式二：命令行索引
```bash
# 全量索引默认资源目录
npm run indexer:full

# 后台监听文件变更，自动增量索引（生产环境推荐）
npm run indexer:watch
```

### 功能使用
#### 🔍 搜索功能
在首页或搜索框中输入查询内容，系统会自动返回相关的文件。例如：
- "找关于圣诞节的歌曲"
- "宫崎骏的原画手稿"
- "巴巴爸爸的动画视频"
- "幼儿园课程指导文档"
- "2023年财务报表"

#### 👁️ 预览功能
点击搜索结果中的文件卡片，可以在线预览：
- 📄 **文本文件**：TXT、MD、CSV、JSON、XML、HTML等，支持语法高亮
- 🖼️ **图片文件**：JPG、JPEG、PNG、GIF、BMP、WebP等，支持缩放、旋转
- 🎵 **音频文件**：MP3、WAV、FLAC、AAC、OGG等，支持在线播放、进度控制
- 🎬 **视频文件**：MP4、AVI、MKV、MOV、WMV等，支持在线播放、全屏观看
- 📊 **表格文件**：XLS、XLSX、CSV，支持在线查看、多工作表切换

#### ⚙️ 管理功能
访问 http://localhost:3000/admin 进入管理页面：
- **文件索引**：启动全量索引或自定义路径索引
- **实时日志**：查看索引进度和详细运行日志
- **状态监控**：实时查看索引运行状态和系统资源使用
- **问题诊断**：查看错误信息和调试信息，快速排查问题

#### 📋 日志系统
访问 http://localhost:3000/logs 查看系统日志：
- 按日志级别筛选（DEBUG/INFO/WARN/ERROR）
- 自动刷新实时日志
- 结构化展示请求详情和错误信息
- 帮助排查预览和搜索问题

## 🏭 生产部署
### 直接部署
```bash
# 构建生产版本
npm run build

# 启动生产服务器
npm run start
```

### 使用 PM2 管理后台服务（推荐）
```bash
npm install -g pm2

# 启动应用服务
pm2 start npm --name "omni-mind" -- start

# 启动增量索引服务（可选，生产环境推荐）
pm2 start npm --name "omni-mind-indexer" -- run indexer:watch

# 保存配置，开机自启
pm2 save
pm2 startup
```

### Docker 部署
```dockerfile
FROM node:20-alpine
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache ffmpeg sqlite3

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

# 持久化数据卷
VOLUME ["/app/resources", "/app/data", "/app/logs"]

CMD ["npm", "start"]
```

构建并运行：
```bash
docker build -t omni-mind .
docker run -d -p 3000:3000 -v /path/to/your/resources:/app/resources -v omni-mind-data:/app/data omni-mind
```

## 📁 项目结构
```
omni-mind/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理页面
│   ├── api/               # API路由
│   │   ├── indexer/       # 索引API
│   │   ├── preview/       # 文件预览API
│   │   ├── search/        # 搜索API
│   │   └── logs/          # 日志API
│   ├── logs/              # 日志页面
│   ├── search/            # 搜索结果页面
│   ├── preview/           # 文件预览页面
│   ├── layout.tsx         # 全局布局
│   └── page.tsx           # 首页
├── components/            # React组件
│   ├── MediaPreview/      # 媒体预览组件
│   │   ├── TextPreview.tsx
│   │   ├── ImagePreview.tsx
│   │   ├── AudioPreview.tsx
│   │   ├── VideoPreview.tsx
│   │   └── SpreadsheetPreview.tsx
│   ├── SearchBar.tsx      # 搜索框组件
│   └── FileCard.tsx       # 文件卡片组件
├── lib/                   # 核心库
│   ├── db/                # 数据库操作
│   │   ├── schema.ts      # 数据库表结构
│   │   └── client.ts      # SQLite客户端
│   ├── embedding/         # 向量嵌入处理
│   │   └── openai.ts      # OpenAI API封装
│   ├── parser/            # 文件解析器
│   │   ├── text.ts        # 文本文件解析
│   │   ├── spreadsheet.ts # 表格文件解析
│   │   ├── image.ts       # 图片元数据解析
│   │   ├── audio.ts       # 音频元数据解析
│   │   └── video.ts       # 视频元数据解析
│   ├── utils/             # 工具函数
│   │   └── logger.ts      # 日志系统
│   └── vector/            # 搜索实现
│       └── sqlite.ts      # 关键词搜索实现
├── scripts/               # 工具脚本
│   └── indexer.ts         # 文件索引脚本
├── resources/             # 默认资源目录（您的多媒体文件放在这里）
├── data/                  # 数据库文件
├── logs/                  # 系统日志文件
├── drizzle/               # 数据库迁移文件
└── public/                # 静态资源
```

## 📊 支持的文件格式
| 类型 | 格式 | 预览支持 |
|------|------|----------|
| 文本 | TXT, MD, CSV, JSON, XML, HTML, HTM | ✅ 语法高亮 |
| 表格 | XLS, XLSX, CSV | ✅ 在线表格查看 |
| 图片 | JPG, JPEG, PNG, GIF, BMP, WebP | ✅ 缩放、旋转 |
| 音频 | MP3, WAV, FLAC, AAC, OGG, WMA | ✅ 在线播放 |
| 视频 | MP4, AVI, MKV, MOV, WMV, FLV, WebM | ✅ 在线播放 |

## 🧪 开发测试
### 运行单元测试
```bash
# 运行所有测试
npm test

# 查看测试覆盖率
npm run test:coverage

# 监听模式
npm run test:watch
```

### 测试覆盖范围
- ✅ 文件类型识别和MIME类型映射
- ✅ 文本分块和处理逻辑
- ✅ 工具函数正确性验证
- ✅ 路径安全校验

## 🖼️ 功能预览
### 🏠 首页
- 简洁的搜索界面，支持自然语言查询
- 实时统计各类文件数量
- 快速访问入口和使用说明

### 🔍 搜索结果页
- 网格/列表视图切换
- 按文件类型、分类筛选
- 显示文件路径、分类、相似度等信息
- 点击卡片直接跳转预览

### 👁️ 预览页面
- 支持所有媒体格式的在线预览
- 图片缩放/旋转、音视频播放控制
- 显示完整文件路径和元数据
- 一键下载功能

### ⚙️ 管理页面
- 可视化索引操作界面
- 支持自定义路径索引
- 实时索引日志输出
- 进度和状态监控

### 📋 日志页面
- 结构化系统日志展示
- 按日志级别筛选
- 自动刷新功能
- 详细的错误排查信息

---

## ⚙️ 高级配置
### 环境变量说明
| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `OPENAI_BASE_URL` | OpenAI API地址 | `https://api.openai.com/v1/` |
| `OPENAI_API_KEY` | OpenAI API密钥 | - |
| `OPENAI_MODEL` | 使用的大模型名称 | `gpt-3.5-turbo` |
| `RESOURCE_PATH` | 默认资源目录 | `./resources` |
| `DATABASE_URL` | 数据库文件路径 | `file:./data/omni-mind.db` |
| `NEXT_PUBLIC_APP_URL` | 应用访问地址 | `http://localhost:3000` |
| `TEMPERATURE` | 模型温度参数 | `0.7` |
| `MAX_TOKENS` | 最大Token限制 | `32000` |

### 索引配置
在 `scripts/indexer.ts` 中可以调整：
- `BATCH_SIZE`：并行处理的文件数量，默认10，可根据服务器性能调整
- `MAX_TOKENS_PER_CHUNK`：文本分块大小，默认8000
- 支持自定义忽略文件类型和目录

---

## 🚀 性能优化
### 索引优化
- **增量索引**：使用 `npm run indexer:watch` 监控文件变化，只处理变更文件
- **批量处理**：调整 `BATCH_SIZE` 适配不同性能的服务器
- **大文件优化**：视频、大图片等文件只索引元数据，不做内容解析
- **跳过已索引文件**：自动检测文件修改时间，跳过未变更的文件

### 搜索优化
- **结果缓存**：高频查询结果自动缓存，降低数据库压力
- **分页加载**：搜索结果支持分页，避免一次性加载过多数据
- **关键词优化**：支持模糊匹配和同义词扩展

### 部署优化
- **静态资源CDN**：将前端静态资源部署到CDN加速访问
- **数据库优化**：定期执行 `VACUUM` 命令优化SQLite数据库
- **内存配置**：Node.js内存上限调整为2GB以上，处理大文件更稳定

---

## 🔒 安全注意事项
### 访问控制
- 生产部署建议添加身份认证，避免未授权访问
- 不要将服务直接暴露在公网，建议放在内网使用或配置访问控制
- 资源目录不要包含敏感文件，系统会索引所有可读文件

### 文件安全
- 系统只读访问资源文件，不会修改或删除原始文件
- 所有文件操作都有权限校验，防止路径遍历攻击
- 预览API会校验文件路径合法性，禁止访问系统敏感文件

### 数据备份
- 定期备份 `data/omni-mind.db` 数据库文件
- 索引数据可以随时通过重新索引恢复
- 原始资源文件建议单独备份

---

## 📝 版本更新日志
### v1.0.0 (2026-03-16)
- ✅ 基础功能开发完成
- ✅ 支持5大类15+种文件格式预览
- ✅ 关键词搜索功能
- ✅ Web管理页面和在线索引
- ✅ 结构化日志系统
- ✅ 单元测试覆盖核心模块

### 计划功能
- 🔲 AI语义向量检索（开发中）
- 🔲 图片OCR文字识别
- 🔲 音频语音转文字（ASR）
- 🔲 视频内容理解和字幕提取
- 🔲 用户权限管理系统
- 🔲 文件标签和分类系统
- 🔲 多用户隔离支持
- 🔲 云端同步和备份功能

---

## 🤝 贡献指南
### 开发环境搭建
```bash
# Fork 项目到本地
git clone <your-fork-url>
cd omni-mind

# 安装依赖
npm install

# 初始化数据库
npm run db:generate
npm run db:migrate

# 启动开发服务器
npm run dev
```

### 提交规范
- `feat:` 新功能
- `fix:` 修复bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `perf:` 性能优化
- `test:` 测试相关

### 提交PR
1. 创建功能分支：`git checkout -b feature/your-feature`
2. 提交修改：`git commit -am 'feat: add some feature'`
3. 推送到分支：`git push origin feature/your-feature`
4. 提交Pull Request

---

## 🔧 常见问题
### 1. 图片/视频无法预览
- 访问 http://localhost:3000/logs 查看错误日志
- 检查资源文件路径是否正确，Node.js是否有读取权限
- 尝试直接访问API路径：`/api/preview/[文件ID]` 查看具体错误
- 访问 http://localhost:3000/admin 进行诊断测试

### 2. 搜索不到文件
- 确认已经完成文件索引，查看索引日志是否有错误
- 尝试使用更简单的关键词搜索
- 确认文件类型是否在支持列表中
- 检查资源文件是否有读取权限

### 3. 索引速度慢
- 首次索引大量文件需要较长时间，属于正常现象
- 索引过程中会自动跳过已索引且未修改的文件
- 大文件（如视频）的元数据解析会比较耗时
- 可以调整 `BATCH_SIZE` 参数提高并行处理数

### 4. 中文路径问题
- 新版本已经全面支持中文和特殊字符路径
- 如果还有问题，请将资源文件移动到 `resources/` 目录下
- 尽量避免路径中包含特殊字符和Emoji表情

### 5. 内存不足问题
- 索引大量大文件时可能出现内存不足
- 增加Node.js内存限制：`NODE_OPTIONS="--max-old-space-size=4096" npm run indexer:full`
- 减少 `BATCH_SIZE` 配置，降低并行处理数量

### 6. 端口占用问题
- 修改启动端口：`npm run dev -- -p 3001`
- 或者在 `package.json` 中修改启动命令

---

## ❓ 技术支持
如果在使用过程中遇到问题：
1. 先查看本文档的常见问题部分
2. 查看系统日志 `/logs` 页面获取详细错误信息
3. 在GitHub提交Issue，提供错误日志和复现步骤
4. 商业支持请联系开发者

---

## 📄 许可证
MIT License

Copyright (c) 2026 Omni Mind

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.