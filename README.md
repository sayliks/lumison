<div align="center">
<img src="public/icon.svg" alt="Lumison Logo" width="120">

# Lumison

**A Minimalist Music Player with Immersive Visuals**

Local-first desktop player for imported audio files and local lyrics.

[Documentation](docs/README.md)

</div>

---

## ✨ Features

- **Local Music**: Local audio files, embedded lyrics, sidecar `.lrc` / `.txt` lyrics, and session queues
- **Immersive Visuals**: Dynamic shader background (Gradient, Fluid, Melt, Wave, Halo, Swirl modes)
- **Synchronized Lyrics**: Word-by-word highlighting with auto-scroll
- **Desktop Experience**: Tauri 2.0 with keyboard shortcuts and multi-window support
- **Internationalization**: English, Chinese, and Japanese language support

---

## 📸 Screenshots

<div align="center">

<img src="images/img1.png" alt="Lumison Player" width="800">

<img src="images/img2.png" alt="Lyrics View" width="800">

</div>

---

## 🚀 Quick Start

### Local Web Preview

```bash
npm install
npm run dev
```

### Desktop App

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

---

## 📖 Documentation

For detailed documentation, see:
- [English Documentation](docs/README.md)
- [中文文档](docs/README.zh-CN.md)

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 19, TypeScript 5.8, Vite 6 |
| Styling | Tailwind CSS 3.4 |
| Animation | @react-spring/web |
| Desktop | Tauri 2.0, Rust |
| Testing | Vitest |

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

---

<div align="center">

Made with ❤️ using React + Tauri

</div>
