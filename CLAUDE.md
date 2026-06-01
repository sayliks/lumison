# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lumison is a minimalist music player built with **React 19 + TypeScript + Vite** on the frontend and **Tauri 2 + Rust** for desktop packaging. It features local audio playback, synced lyrics, visual backgrounds (Gradient/Fluid/Melt modes), and multi-source music search (Netease, Kugou, Internet Archive).

## Common Commands

```bash
# Development
npm run dev              # Start Vite dev server (web only)
npm run tauri:dev        # Start Tauri dev mode (desktop app with Rust backend)

# Building
npm run build            # Build web version to dist/
npm run tauri:build      # Build desktop app for current platform
npm run tauri:build:windows   # Windows x64
npm run tauri:build:macos     # macOS universal
npm run tauri:build:linux     # Linux x64

# Testing
npm test                 # Run Vitest tests

# Icons
npm run generate:all-icons    # Regenerate all app icons from public/icon.svg
```

## Architecture

### Frontend-Backend Bridge

Tauri commands are registered in `src-tauri/src/lib.rs` (`AppBuilder::run`) and invoked via `@tauri-apps/api`. Commands are grouped across three Rust modules:
- `lib.rs`: `open_external_url` (open URLs in system browser), `write_audio_tags` (POSTs tag-write requests to a local tagging HTTP service on `127.0.0.1:28883`)
- `sqlite_cache.rs`: `get_cached_image`, `put_cached_image`, `delete_cached_image`, `list_cached_keys`, `clear_cached_images`
- `features.rs`: system audio capture (`list_audio_devices`, `start_audio_capture`, `stop_audio_capture`, `list_capture_sessions`), monitor enumeration (`get_available_monitors`), and multi-window/exhibition mode (`create_output_window`, `enter_exhibition_mode`, `exit_exhibition_mode`). Note: several `features.rs` commands are platform-gated (audio capture is Windows-only) and partially stubbed.

### State Management Pattern

Player state is **composed directly in `App.tsx`** via custom hooks (there is no PlayerContext — note that the `usePlayerContext` import in `App.tsx` is dead code referencing a non-existent file):

1. **usePlaylist hook** (`src/hooks/usePlaylist.ts`) - Queue management, shuffle/repeat logic. Called first.
2. **usePlayer hook** (`src/hooks/usePlayer.ts`) - Core player logic (~800 lines): manages the audio element, playback state, and lyrics matching. Receives the playlist's `queue`/`originalQueue`/setters as arguments.
3. Resulting player state is destructured in `App.tsx` and passed down to components as props.

React Context is used for cross-cutting concerns only: `ThemeContext`, `I18nContext`, and `ToastContext` (`src/hooks/useToast.ts`).

State flows: User interaction → hook (usePlayer/usePlaylist) → service → audio element

### Service Layer Structure

Services are organized by domain in `src/services/`:

- `audio/` - SpatialAudioEngine for Web Audio API processing
- `music/` - Audio streaming, lyrics fetching, and per-platform search APIs (`neteaseApi.ts`, `kugouApi.ts`, `multiPlatformLyrics.ts`)
- `lyrics/` - Lyrics parsing (LRC/plain/word-level), multi-platform matching, and AI translation (`aiLyrics.ts` via `@google/genai`)
- `streaming/` - `StreamingManager` unifies external streaming platforms behind one interface (currently only Internet Archive is implemented)
- `cache.ts` / `cache/` - In-memory resource caching plus IndexedDB (lyrics) and Tauri SQLite (images) adapters
- `request.ts` / `streamingProxy.ts` - HTTP fetch helpers and a proxy for CORS-restricted external audio

Key pattern: Services export pure functions or class instances, not React hooks.

### Search Provider Abstraction

Multi-source search is unified by the `SearchProvider` interface (`src/hooks/useSearchProvider.ts`). Each source (local files, Netease, Kugou, Internet Archive) implements a provider hook (`useNeteaseSearchProvider`, `useKugouSearchProvider`, `useInternetArchiveSearch`) exposing a common `search`/`loadMore` shape. Results are a union type `SearchResultItem = Song | NeteaseTrackInfo | KugouTrack`, normalized into the playlist when selected.

### Lyrics System

Multi-layered lyrics fetching with fallback:
1. Check local embedded lyrics (ID3 tags loaded during scan, `src/services/lyrics/id3Parser.ts`)
2. Fetch from Netease Cloud Music API by ID match (preferred — supports word-level `yrc` and translated `tLrc`)
3. Fall back to third-party providers; failing sources are temporarily blacklisted (5 min cooldown)
4. Cache successful matches (`matchCache.ts`) to avoid repeated API calls

Implementation: orchestration in `src/services/music/multiPlatformLyrics.ts` and `lyricsService.ts`; parsing/format detection in `src/services/lyrics/index.ts` (`parseLyrics` auto-detects LRC vs plain text).

**AI translation**: `src/services/lyrics/aiLyrics.ts` optionally translates lyrics via Google Gemini (`gemini-2.0-flash`). Gated on the `GEMINI_API_KEY` env var — check `isAIAvailable()` before use; it no-ops without a key.

### Image Caching

Desktop builds use SQLite for persistent image caching:
- Rust: `src-tauri/src/sqlite_cache.rs`
- Keys are hashed (SHA256), blobs stored in SQLite
- Web builds fallback to in-memory Map

### i18n

Simple object-based translation in `src/i18n/`:
- `index.ts` - Translation loader with interpolation
- `locales/en.ts`, `locales/zh.ts` - Translation dictionaries
- Use `I18nContext` for translations in components

## File Organization

```
src/
  components/
    common/          # Reusable UI (Icons, SmartImage, Toast)
    layout/          # Layout shell (TopBar, FluidBackground, ShaderBackground)
    modals/          # Dialog components
    player/          # Player UI pieces
    ui/              # Feature UI (AlbumMode, KeyboardShortcuts)
  hooks/             # All custom hooks (usePlayer, usePlaylist, etc.)
  contexts/          # React contexts (Theme, I18n)
  services/          # Business logic layer
  utils/             # Pure utility functions
  vendor/            # Third-party code (shaders, etc.)
  config/            # App configuration (performance settings)
src-tauri/
  src/
    lib.rs           # Tauri commands (open_external_url, write_audio_tags) and AppBuilder
    sqlite_cache.rs  # SQLite image cache implementation
    features.rs      # Audio capture, monitor enumeration, multi-window/exhibition mode
    mobile.rs        # Mobile (Android/iOS) entry point, gated on #[cfg(mobile)]
    main.rs          # Binary entry point
```

## Important Patterns

### Visual Modes

The background visual mode is one of `gradient` | `fluid` | `melt`, read via the `useVisualMode()` hook (`src/hooks/useVisualMode.ts`). It is persisted in `localStorage` under the key `lumison-visual-mode`. Changing it elsewhere must dispatch a `visual-mode-changed` window event so subscribed components re-read the value. (The README lists more modes than are currently implemented — trust the hook's `VALID_VISUAL_MODES`.)

### Song ID Generation

Songs use deterministic IDs based on file path hash: `generateSongId(path)` in `src/services/utils.ts`. This ensures stable identity across playlist operations.

### Audio Element Reference

The audio element is created and managed in `usePlayer.ts` and stored in a ref (`audioRef`). The ref and control callbacks are returned from `usePlayer()` in `App.tsx` and passed down to player components as props.

### Color Extraction

Album art colors are extracted using `extractColors()` in `src/services/utils.ts`, which uses `colorthief` and feeds into the Fluid background shader uniforms.

### Performance Config

Global performance settings (animation quality, background FPS) are in `src/config/performance.ts`.

## Testing

Tests use Vitest. Run with `npm test` (`vitest run`). Tests are colocated with source files (e.g., `neteaseRequest.test.ts` next to `neteaseRequest.ts`).

Run a single test file: `npx vitest run src/services/music/neteaseRequest.test.ts`. Filter by test name: `npx vitest run -t "<name>"`. Watch mode: `npx vitest`.

Note: `npm run build` runs `vite build` only (no separate `tsc` typecheck step), so type errors do not fail the build — run `npx tsc --noEmit` to typecheck.

## Desktop vs Web

- **Web**: Runs without Tauri APIs, some features disabled (external URL opening uses `window.open`)
- **Desktop**: Full Tauri integration, SQLite cache, auto-updater support

Check for Tauri availability with `typeof window.__TAURI__ !== 'undefined'` where needed.