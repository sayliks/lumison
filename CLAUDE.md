# CLAUDE.md

This file provides guidance to Claude Code when working in this repository.

## Project Overview

Lumison is a local-import music player built with React 19, TypeScript, Vite, and Tauri 2. It supports local audio playback, embedded metadata, local lyrics parsing, session queues, immersive visuals, and desktop integrations.

Remote catalog search, link imports, provider playback, and AI lyric generation are out of scope.

## Common Commands

```bash
npm run dev
npm run tauri:dev
npm run build
npm run tauri:build
npm test
npx tsc --noEmit
```

## Architecture

- `src/App.tsx` composes the app shell, views, player, and playlist hooks.
- `src/hooks/usePlaylist.ts` owns local file import and session queue state.
- `src/hooks/usePlayer.ts` owns the audio element, playback state, play mode, local lyric status, and album color extraction.
- `src/app/AppShell.tsx` wraps Home, Library, Queue, and Lyrics views.
- `src/services/lyrics/` parses embedded, plain text, and LRC lyrics.
- `src/services/cache.ts` and `src/services/cache/` provide local resource caching.
- `src/services/audio/` contains local Web Audio processing.
- Tauri commands provide local desktop helpers such as image cache access, monitor/window features, and localhost tag writing.

## Service Boundaries

Keep service logic local-only:

- Local file import and playback.
- Local metadata extraction.
- Local lyric parsing.
- Local queue persistence.
- Local cache/Tauri cache helpers.
- Localhost/Tauri tag writing.

Do not add:

- Provider search APIs.
- Link import services.
- Provider playback or audio URL resolution.
- Generic proxy/request helpers for remote services.
- AI lyric generation or translation calls.

## Testing

Tests use Vitest. The current local service test is:

```bash
npx vitest run src/services/utils.test.ts
```

For normal verification, run:

```bash
npx tsc --noEmit
npm run test -- --run
```
