<div align="center">
<img src="../public/icon.svg" alt="Lumison Logo" width="120">

# Lumison

**没入感のあるミニマリスト音楽プレーヤー**

インポートした音声ファイルとローカル歌詞のためのローカル優先デスクトッププレーヤー。

</div>

---

## ✨ 機能

### 🎵 ローカル音楽
- **ローカルファイル**: MP3、FLAC、WAV、OGG、M4A、AAC 対応
- **ローカル歌詞**: 埋め込み歌詞と一致する `.lrc` / `.txt` 歌詞ファイルに対応
- **セッションキュー**: ローカルインポートから再生キューを作成・編集

### 🎨 没入感のあるビジュアル
- **6つの背景モード**: Gradient（グラデーション）、Fluid（フロー）、Melt（溶解）、Wave（波）、Halo（ハロー）、Swirl（渦巻）
- **ダイナミックテーマ**: アルバムアートに応じて色が自動調整
- **アルバムアート表示**: フルスクリーンアルバムビューと進捗バー

### 🎤 同期歌詞
- **リアルタイム同期**: 単語単位の歌詞ハイライト
- **自動スクロール**: スムーズな歌詞追跡
- **クリックでシーク**: 任意の歌詞行にジャンプ

### 🖥️ デスクトップ体験
- **クロスプラットフォーム**: Windows、macOS、Linux
- **キーボードショートカット**: 完全なホットキーサポート
- **マルチウィンドウ**: マルチスクリーン対応
- **システム統合**: メディアセッションAPIとネイティブデスクトップウィンドウ

---

## 📸 スクリーンショット

<div align="center">

<img src="../images/img1.png" alt="Lumison プレーヤー" width="800">

<img src="../images/img2.png" alt="歌詞ビュー" width="800">

</div>

---

## 🚀 クイックスタート

### ローカルWebプレビュー

```bash
npm install
npm run dev
```

### デスクトップアプリ

```bash
npm install
npm run tauri:dev
npm run tauri:build
```

---

## ⌨️ キーボードショートカット

| ショートカット | 操作 |
|----------|--------|
| `Space` | 再生/一時停止 |
| `←` / `→` | 前へ/次へ |
| `↑` / `↓` | 音量アップ/ダウン |
| `M` | ミュート切替 |
| `P` | プレイリスト切替 |
| `F` | フルスクリーン切替 |
| `L` | 歌詞ビュー切替 |
| `Esc` | ダイアログを閉じる |

---

## 🛠️ 開発

### 必要条件

- Node.js 20+
- npm
- Rustツールチェーン（デスクトップビルド用）

### コマンド

```bash
# 開発
npm run dev              # Web開発サーバー起動
npm run tauri:dev        # Tauri開発モード起動

# ビルド
npm run build            # Webバージョンビルド
npm run tauri:build      # デスクトップアプリビルド

# テスト
npm run test             # テスト実行
vitest                   # ウォッチモード
```

---

## 📁 プロジェクト構造

```
lumison/
├── src/                    # フロントエンド (React)
│   ├── components/         # UIコンポーネント
│   │   ├── common/         # アイコン、SmartImage、Toast
│   │   ├── navigation/     # アプリシェルナビゲーション
│   │   ├── modals/         # About と共有ダイアログ
│   │   └── player/         # コントロール、歌詞、プレイリスト
│   ├── hooks/              # カスタムReactフック
│   ├── services/           # ビジネスロジック
│   │   ├── audio/          # オーディオ処理
│   │   ├── cache/          # IndexedDBキャッシュ
│   │   ├── lyrics/          # 歌詞解析
│   │   ├── music/          # ローカル音楽ヘルパー
│   ├── contexts/           # Reactコンテキスト
│   ├── i18n/              # 国際化
│   └── utils/             # ユーティリティ関数
├── src-tauri/              # バックエンド (Rust/Tauri)
│   ├── src/                # Rustソース
│   └── icons/              # アプリアイコン
├── config/                 # 設定ファイル
├── docs/                   # ドキュメント
└── public/                 # 静的アセット
```

---

## 🌐 技術スタック

| レイヤー | 技術 |
|-------|--------|
| **フロントエンド** | React 19、TypeScript 5.8、Vite 6 |
| **スタイリング** | Tailwind CSS 3.4 |
| **アニメーション** | @react-spring/web |
| **デスクトップ** | Tauri 2.0、Rust |
| **テスト** | Vitest |
| **国際化** | カスタム実装 (EN/ZH/JA) |

---

## 🌍 国際化

Lumisonは多言語をサポート:
- English
- 中文 (简体)
- 日本語

設定 → 言語 で言語を切り替えられます。

---

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) をご覧ください。

---

## 🙏 クレジット

- Apple Music からインスピレーションを得たデザイン
- ローカルファイル再生と歌詞解析

---

<div align="center">

❤️ で製作、React + Tauri 使用

</div>
