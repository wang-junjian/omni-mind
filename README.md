# Omni Mind - AI 多媒体资料检索系统

一个AI原生的多媒体资料检索应用，能够基于LLM检索各种格式的资料（文本、图像、音频、视频、办公文档等），并支持在线查看和播放。

## ✨ 特性

### 🤖 核心功能
- **AI 语义检索**：基于大语言模型的自然语言查询，智能理解用户需求
- **多格式支持**：支持文本、图片、音频、视频、表格等15+种文件格式
- **在线预览**：各种媒体格式无需下载，直接在线查看和播放
- **高性能索引**：基于SQLite数据库，快速检索海量文件
- **增量更新**：自动检测文件变更，支持增量索引

### 🎯 管理功能
- **Web 管理界面**：可视化管理页面，无需登录服务器即可操作
- **在线索引**：网页端即可启动全量/自定义路径索引
- **实时日志**：实时查看索引进度和系统日志
- **错误诊断**：详细的错误日志和问题排查工具

### 💻 用户体验
- **现代界面**：基于Next.js和Tailwind CSS的现代化响应式界面
- **快速搜索**：毫秒级响应的搜索体验
- **文件预览**：缩略图、路径、分类、相似度等丰富信息展示
- **播放控制**：音视频播放支持进度控制、音量调节等功能

## 🛠️ 技术栈

- **前端**：Next.js 14 + TypeScript + Tailwind CSS
- **数据库**：SQLite + Drizzle ORM
- **AI 能力**：OpenAI Embedding API + 语义检索
- **媒体处理**：FFmpeg、Sharp、XLSX等开源工具
- **日志系统**：结构化日志记录 + 可视化日志页面

## 📦 安装

### 系统依赖
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg sqlite3
```

### 项目依赖
```bash
npm install
```

### 环境变量配置
复制`.env.local`文件并配置：
```env
# OpenAI配置（可选，当前使用关键词搜索）
OPENAI_BASE_URL=https://api.longcat.chat/openai/
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=LongCat-Flash-Lite
TEMPERATURE=0.7
MAX_TOKENS=320000

# 应用配置
RESOURCE_PATH=./resources  # 资源文件目录
DATABASE_URL=file:./data/omni-mind.db
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 快速开始

### 1. 初始化数据库
```bash
npm run db:generate
npm run db:migrate
```

### 2. 准备资源文件
将您的多媒体资源文件放入项目根目录的 `resources/` 文件夹下，或者保持原来的目录结构，在管理页面自定义路径。

### 3. 索引文件
#### 方式一：命令行索引
```bash
# 全量索引默认资源目录
npm run indexer:full

# 后台监听文件变更（可选）
npm run indexer:watch
```

#### 方式二：网页端索引（推荐）
启动开发服务器后，访问 http://localhost:3000/admin 点击"开始索引"。

### 4. 启动开发服务器
```bash
npm run dev
```
访问 http://localhost:3000

## 📖 功能使用

### 🔍 搜索功能
在首页或搜索框中输入自然语言查询，系统会自动返回相关的文件。例如：
- "找关于圣诞节的歌曲"
- "宫崎骏的原画手稿"
- "巴巴爸爸的动画视频"
- "幼儿园课程指导文档"

### 👁️ 预览功能
点击搜索结果中的文件卡片，可以在线预览：
- 📄 **文本文件**：TXT、MD、CSV、JSON、XML、HTML等，支持语法高亮
- 🖼️ **图片文件**：JPG、JPEG、PNG、GIF、BMP、WebP等，支持缩放、旋转
- 🎵 **音频文件**：MP3、WAV、FLAC、AAC、OGG等，支持在线播放、进度控制
- 🎬 **视频文件**：MP4、AVI、MKV、MOV、WMV等，支持在线播放、全屏观看
- 📊 **表格文件**：XLS、XLSX、CSV，支持在线查看、多工作表切换

### ⚙️ 管理功能
访问 http://localhost:3000/admin 进入管理页面：
- **文件索引**：启动全量索引或自定义路径索引
- **实时日志**：查看索引进度和详细日志
- **状态监控**：实时查看索引运行状态
- **问题诊断**：查看错误信息和调试信息

### 📋 日志系统
访问 http://localhost:3000/logs 查看系统日志：
- 按日志级别筛选（DEBUG/INFO/WARN/ERROR）
- 自动刷新实时日志
- 结构化展示请求详情和错误信息
- 帮助排查预览和搜索问题

## 🏭 生产部署

### 构建应用
```bash
npm run build
```

### 启动生产服务器
```bash
npm run start
```

### 使用 PM2 管理后台服务
```bash
npm install -g pm2

# 启动应用
pm2 start npm --name "omni-mind" -- start

# 启动增量索引服务（可选）
pm2 start npm --name "omni-mind-indexer" -- run indexer:watch

# 保存配置
pm2 save
pm2 startup
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

## 🔧 常见问题

### 1. 图片/视频无法预览
- 访问 http://localhost:3000/logs 查看错误日志
- 检查资源文件路径是否正确
- 确认Node.js有读取资源文件的权限
- 尝试直接访问API路径：`/api/preview/[文件ID]` 查看具体错误

### 2. 搜索不到文件
- 确认已经完成文件索引
- 尝试使用更简单的关键词搜索
- 检查索引日志是否有文件解析错误

### 3. 索引速度慢
- 首次索引大量文件需要较长时间，耐心等待
- 索引过程中会自动跳过已索引且未修改的文件
- 大文件（如视频）的元数据解析会比较耗时

### 4. 中文路径问题
- 新版本已经全面支持中文和特殊字符路径
- 如果还有问题，请将资源文件移动到 `resources/` 目录下

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
