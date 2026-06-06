<div align="center">
<img src="../public/icon.svg" alt="Lumison Logo" width="120">

# Lumison

**一款极简的沉浸式音乐播放器**

本地优先的桌面播放器，面向导入音频文件与本地歌词。

</div>

---

## ✨ 功能特性

### 🎵 本地音乐
- **本地文件**: MP3、FLAC、WAV、OGG、M4A、AAC 等格式
- **本地歌词**: 支持内嵌歌词以及匹配的 `.lrc` / `.txt` 歌词文件
- **会话队列**: 从本地导入构建和编辑播放队列

### 🎨 视觉体验
- **六种背景模式**: Gradient（渐变）、Fluid（流体）、Melt（融化）、Wave（波浪）、Halo（光环）、Swirl（漩涡）
- **动态主题**: 颜色根据专辑封面自动调整
- **专辑封面展示**: 全屏专辑视图与进度条

### 🎤 同步歌词
- **实时同步**: 逐字歌词高亮
- **自动滚动**: 平滑歌词跟踪
- **点击跳转**: 跳转到任意歌词行

### 🖥️ 桌面体验
- **跨平台**: Windows、macOS、Linux
- **键盘快捷键**: 完整的快捷键支持
- **多窗口支持**: 多屏幕扩展
- **系统集成**: 媒体会话 API 与原生桌面窗口

---

## 📸 界面截图

<div align="center">

<img src="../images/img1.png" alt="Lumison 播放器" width="800">

<img src="../images/img2.png" alt="歌词视图" width="800">

</div>

---

## 🚀 快速开始

### 本地网页预览

```bash
npm install
npm run dev
```

### 桌面应用

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

---

## ⌨️ 键盘快捷键

| 快捷键 | 操作 |
|----------|--------|
| `Space` | 播放/暂停 |
| `←` / `→` | 上一首/下一首 |
| `↑` / `↓` | 音量增加/减少 |
| `M` | 静音切换 |
| `P` | 切换播放列表 |
| `F` | 切换全屏 |
| `L` | 切换歌词视图 |
| `Esc` | 关闭对话框 |

---

## 🛠️ 开发指南

### 前置要求

- Node.js 20+
- npm
- Rust 工具链 (桌面应用构建需要)

### 开发命令

```bash
# 开发
npm run dev              # 启动 Web 开发服务器
npm run tauri:dev        # 启动 Tauri 开发模式

# 构建
npm run build            # 构建 Web 版本
npm run tauri:build      # 构建桌面应用

# 测试
npm run test             # 运行测试
vitest                   # 监视模式
```

---

## 📁 项目结构

```
lumison/
├── src/                    # 前端 (React)
│   ├── components/         # UI 组件
│   │   ├── common/         # 图标、SmartImage、Toast
│   │   ├── navigation/     # 应用导航外壳
│   │   ├── modals/         # 关于及共享对话框
│   │   └── player/         # 控件、歌词、播放列表
│   ├── hooks/              # 自定义 React Hooks
│   ├── services/           # 业务逻辑
│   │   ├── audio/          # 音频处理
│   │   ├── cache/          # IndexedDB 缓存
│   │   ├── lyrics/         # 歌词解析
│   │   ├── music/          # 本地音乐辅助逻辑
│   ├── contexts/           # React 上下文
│   ├── i18n/               # 国际化
│   └── utils/              # 工具函数
├── src-tauri/              # 后端 (Rust/Tauri)
│   ├── src/                # Rust 源码
│   └── icons/              # 应用图标
├── config/                 # 配置文件
├── docs/                   # 文档
└── public/                 # 静态资源
```

---

## 🌐 技术栈

| 层次 | 技术 |
|-------|-----------|
| **前端** | React 19、TypeScript 5.8、Vite 6 |
| **样式** | Tailwind CSS 3.4 |
| **动画** | @react-spring/web |
| **桌面端** | Tauri 2.0、Rust |
| **测试** | Vitest |
| **国际化** | 自定义实现 (EN/ZH) |

---

## 🌍 国际化

Lumison 支持多语言:
- English
- 中文 (简体)

在 设置 → 语言 中切换语言。

---

## 📄 许可证

MIT License - 详情请查看 [LICENSE](LICENSE)。

---

## 🙏 致谢

- 设计灵感来自 Apple Music
- 本地文件播放与歌词解析

---

<div align="center">

用 ❤️ 制作，基于 React + Tauri

</div>
