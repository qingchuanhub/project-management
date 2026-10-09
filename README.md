# ProjectFlow - 项目管理系统

现代化、Apple 风格的项目管理 Web 应用，支持看板、甘特图、团队协作、数据统计等功能。

## ✨ 特性

- 🎨 **Apple 设计语言** - 毛玻璃效果、流畅动画、精致交互
- 📋 **看板视图** - 拖拽式任务管理，支持多列自定义
- 📊 **甘特图** - 项目时间线可视化，进度追踪
- 👥 **团队协作** - 成员管理、角色权限、实时状态
- 📈 **数据统计** - 任务分布、完成趋势、贡献榜
- 🌙 **深色模式** - 系统跟随/手动切换
- 📱 **响应式设计** - 适配桌面端与移动端
- ⚡ **高性能** - Vite + Vue 3 + Pinia，按需加载
- 🚀 **GitHub Pages 部署** - 零成本静态托管

## 🛠 技术栈

- **框架**: Vue 3.4+ (Composition API)
- **构建**: Vite 5+
- **路由**: Vue Router 4 (Hash 模式)
- **状态**: Pinia 2+
- **UI**: Element Plus + Lucide Icons
- **样式**: 原生 CSS (CSS Variables + Glassmorphism)
- **工具**: @vueuse/core, TypeScript 就绪

## 📦 快速开始

### 安装依赖
```bash
npm install
```

### 开发模式
```bash
npm run dev
```
访问 http://localhost:3000

### 生产构建
```bash
npm run build
```
输出目录: `dist/`

### 预览构建结果
```bash
npm run preview
```

## 🚀 GitHub Pages 部署

### 1. 启用 GitHub Pages
- 仓库 Settings → Pages
- Source: **GitHub Actions**

### 2. 创建工作流文件
在 `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### 3. 推送触发部署
```bash
git add .
git commit -m "feat: initial commit"
git push origin main
```

### 4. 访问地址
部署完成后访问: `https://<username>.github.io/项目管理/`

> **注意**: `vite.config.js` 中已配置 `base: '/项目管理/'`，确保与仓库名一致。

## 📁 项目结构

```
src/
├── assets/           # 静态资源
├── components/
│   ├── layout/       # 布局组件
│   ├── kanban/       # 看板组件
│   ├── projects/     # 项目组件
│   ├── stats/        # 统计组件
│   └── ui/           # 通用 UI 组件
├── composables/      # 组合式函数
├── router/           # 路由配置
├── stores/           # Pinia 状态
├── styles/           # 全局样式
├── views/            # 页面视图
├── App.vue           # 根组件
└── main.js           # 入口文件
```

## 🎯 核心功能

| 模块 | 功能 |
|------|------|
| **仪表盘** | 项目概览、统计卡片、紧急任务、团队动态 |
| **项目管理** | 网格/列表视图、创建编辑、进度追踪 |
| **看板** | 拖拽排序、多列状态、快速创建、搜索筛选 |
| **甘特图** | 时间线视图、月/周/日切换、项目筛选 |
| **团队** | 成员网格/列表、角色权限、在线状态、邀请 |
| **统计** | 任务分布、优先级、周趋势、项目进度、贡献榜 |
| **设置** | 个人资料、通知偏好、主题外观、安全、集成、数据 |

## 🎨 自定义主题

修改 `src/styles/main.css` 中的 CSS 变量:

```css
:root {
  --accent-blue: #0071e3;    /* 主品牌色 */
  --accent-green: #30d158;   /* 成功色 */
  --accent-orange: #ff9f0a;  /* 警告色 */
  --accent-red: #ff3b30;     /* 危险色 */
  --accent-purple: #bf5af2;  /* 紫色 */
  /* ... 更多变量 */
}
```

## 📝 许可证

MIT License - 可自由用于个人及商业项目

## 🤝 贡献

欢迎提交 Issue 和 PR！

---

**ProjectFlow** - 让项目管理更优雅 🍎