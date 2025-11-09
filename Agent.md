# VSCode Portfolio 项目代码结构文档

## 项目概述

这是一个基于 Next.js 构建的 VSCode 主题个人作品集网站，模拟了 Visual Studio Code 的界面外观和交互体验。该项目使用 TypeScript、React 和 CSS Modules 构建，支持多种主题切换。

## 技术栈

- **框架**: Next.js 15.2.3
- **前端**: React 19.0.0, React DOM 19.0.0
- **语言**: TypeScript 5.8.2
- **样式**: CSS Modules
- **图标**: React Icons 5.5.0
- **GitHub 集成**: React GitHub Calendar 4.5.6
- **代码规范**: ESLint 9.22.0

## 项目结构

```
vscode-portfolio/
├── .github/              # GitHub Actions 配置
├── .idea/                # IDE 配置文件
├── .next/                # Next.js 构建输出
├── components/           # React 组件目录
├── data/                 # 静态数据文件
├── pages/                # Next.js 页面文件
├── public/               # 静态资源
├── styles/               # 样式文件
├── types/                # TypeScript 类型定义
├── .env.example          # 环境变量示例
├── .gitignore            # Git 忽略配置
├── CODE_OF_CONDUCT.md    # 行为准则
├── LICENSE               # 许可证
├── README.md             # 项目说明
├── eslint.config.mjs     # ESLint 配置
├── next-env.d.ts         # Next.js 类型定义
├── next.config.ts        # Next.js 配置
├── package.json          # 项目依赖配置
├── rule.mdc              # 项目规则文档
└── tsconfig.json         # TypeScript 配置
```

## 核心文件详解

### 根目录配置文件

#### [package.json](package.json)
- 定义项目名称、版本和脚本命令
- 管理项目依赖关系（Next.js、React、TypeScript 等）
- 提供开发、构建、启动和代码检查脚本

#### [next.config.ts](next.config.ts)
- Next.js 框架配置文件
- 配置图片域名白名单，允许加载外部图片资源
- 支持 Cloudinary、GitHub、Imgur、Dev.to 等域名

#### [tsconfig.json](tsconfig.json)
- TypeScript 编译器配置
- 设置路径别名 `@/*` 指向根目录
- 配置严格的类型检查和现代 ES 特性支持

#### [eslint.config.mjs](eslint.config.mjs)
- ESLint 代码规范配置
- 继承 Next.js 推荐的代码规范配置
- 支持 TypeScript 类型检查

### 页面文件 (pages/)

#### [pages/_app.tsx](pages/_app.tsx)
- Next.js 应用程序的入口组件
- 管理全局主题设置，从 localStorage 读取用户主题偏好
- 为每个页面设置统一的布局和头部信息

#### [pages/index.tsx](pages/index.tsx)
- 网站首页，模拟 VSCode 欢迎界面
- 展示个人信息和快速导航

#### [pages/about.tsx](pages/about.tsx)
- 关于页面，展示个人简介和技能信息

#### [pages/projects.tsx](pages/projects.tsx)
- 项目展示页面，使用 ProjectCard 组件展示个人项目

#### [pages/github.tsx](pages/github.tsx)
- GitHub 活动展示页面
- 集成 GitHub 贡献图表和仓库信息

#### [pages/articles.tsx](pages/articles.tsx)
- 文章页面，从 Dev.to API 获取个人文章

#### [pages/contact.tsx](pages/contact.tsx)
- 联系方式页面，展示各种联系方式和社交平台

#### [pages/settings.tsx](pages/settings.tsx)
- 设置页面，允许用户切换不同的 VSCode 主题

### React 组件 (components/)

#### 布局组件
- **[Layout.tsx](components/Layout.tsx)**: 主布局组件，管理整体页面结构
- **[Titlebar.tsx](components/Titlebar.tsx)**: 模拟 VSCode 标题栏
- **[Sidebar.tsx](components/Sidebar.tsx)**: 侧边栏组件，显示文件树
- **[Explorer.tsx](components/Explorer.tsx)**: 资源管理器组件
- **[Tabsbar.tsx](components/Tabsbar.tsx)**: 标签栏组件
- **[Bottombar.tsx](components/Bottombar.tsx)**: 底部状态栏组件

#### 页面组件
- **[Tab.tsx](components/Tab.tsx)**: 单个标签页组件
- **[ThemeInfo.tsx](components/ThemeInfo.tsx)**: 主题信息展示组件

#### 内容组件
- **[RepoCard.tsx](components/RepoCard.tsx)**: GitHub 仓库卡片组件
- **[ProjectCard.tsx](components/ProjectCard.tsx)**: 项目展示卡片组件
- **[ArticleCard.tsx](components/ArticleCard.tsx)**: 文章卡片组件
- **[ContactCode.tsx](components/ContactCode.tsx)**: 联系信息代码展示组件

#### 工具组件
- **[Head.tsx](components/Head.tsx)**: 页面头部元数据管理
- **[Illustration.tsx](components/Illustration.tsx)**: 插图组件

### 数据层 (data/ & types/)

#### [data/projects.ts](data/projects.ts)
- 项目数据的定义和导出
- 包含项目名称、描述、logo、链接等信息

#### [types/index.ts](types/index.ts)
- TypeScript 类型定义文件
- 定义 Article、Project、Repo、User 等数据结构

### 样式文件 (styles/)

#### 全局样式
- **[globals.css](styles/globals.css)**: 全局 CSS 样式
- **[themes.css](styles/themes.css)**: 主题相关样式定义

#### 模块化样式
每个组件都有对应的 CSS Module 文件：
- **[Layout.module.css](styles/Layout.module.css)**: 布局样式
- **[HomePage.module.css](styles/HomePage.module.css)**: 首页样式
- **[Sidebar.module.css](styles/Sidebar.module.css)**: 侧边栏样式
- 以及其他页面和组件的专属样式文件

### 静态资源 (public/)

- **[favicon.ico](public/favicon.ico)**: 网站图标
- **[logos/](public/logos/)**: 项目和技能相关的 logo 文件
- **[themes/](public/themes/)**: 主题相关的静态资源

## 环境配置

### [.env.example](.env.example)
环境变量配置示例文件：
- `DEV_TO_API_KEY`: Dev.to API 密钥
- `GITHUB_API_KEY`: GitHub API 密钥
- `NEXT_PUBLIC_GITHUB_USERNAME`: GitHub 用户名

## 功能特性

### 主题系统
- 支持多种 VSCode 主题：GitHub Dark、Dracula、Ayu、Nord
- 主题偏好保存在 localStorage 中
- CSS 变量实现主题切换

### 响应式设计
- 适配不同屏幕尺寸
- 移动端友好的交互设计

### 外部集成
- GitHub API 集成：获取仓库信息和贡献数据
- Dev.to API 集成：获取个人文章列表
- React GitHub Calendar：展示贡献图表

## 开发指南

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 代码检查
```bash
npm run lint
```

## 部署

项目设计为部署在 Vercel 平台，支持 Next.js 的 Server-Side Rendering 和静态站点生成特性。

## 扩展开发

### 添加新页面
1. 在 `pages/` 目录创建新的页面文件
2. 在 `components/Sidebar.tsx` 中添加文件树条目
3. 在 `components/Tabsbar.tsx` 中添加标签页
4. 创建对应的样式模块文件

### 添加新主题
1. 在 `styles/themes.css` 中定义新的主题 CSS 变量
2. 在 `public/themes/` 中添加主题相关资源
3. 在设置页面中添加主题切换选项

### 自定义内容
- 修改 `data/projects.ts` 更新项目信息
- 修改各个页面组件更新个人内容
- 更新样式文件调整外观

这个项目巧妙地将个人作品集与 VSCode 界面结合，创造了一个独特且专业的个人展示平台。