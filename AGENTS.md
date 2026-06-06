# AGENTS.md - Lumison Development Guide

## Project Overview

Lumison is a local-import music player desktop application built with React, TypeScript, Vite, and Tauri. It supports local file playback, embedded metadata, local lyrics parsing, session queues, immersive visuals, and desktop integrations.

Remote catalog search, link import, provider playback, provider-specific service logic, and AI lyric calls are out of scope.

---

## Build & Development Commands

### Development
```bash
npm run dev
npm run tauri:dev
```

### Building
```bash
npm run build
npm run preview
npm run tauri:build
```

### Testing
```bash
npm run test
npm run test -- --run
npx vitest run src/services/utils.test.ts
npx tsc --noEmit
```

---

## Code Style Guidelines

- Use TypeScript and existing React patterns.
- Prefer `@/*` imports for `src/` modules.
- Keep user-facing strings in `src/i18n/locales/en.ts` and `src/i18n/locales/zh.ts`.
- Use Tailwind utility classes unless a component already has a CSS file.
- Keep service logic local-only.
- Do not add remote provider APIs, proxy helpers, or link import flows.

## Project Structure

```text
src/
├── app/              # App shell and view/controller hooks
├── components/       # React UI
├── contexts/         # Theme, i18n, toast
├── hooks/            # Player, playlist, layout, performance hooks
├── i18n/             # Locales
├── services/         # Local business logic
│   ├── audio/        # Local Web Audio processing
│   ├── cache/        # Local/Tauri image cache helpers
│   ├── lyrics/       # Local lyrics and metadata parsing
│   └── ui/           # Keyboard registry
├── types.ts
└── utils/
```

## Architecture

Player state is composed directly in `App.tsx`:

1. `usePlaylist()` manages local file import, queue state, shuffle/repeat queues, and session persistence.
2. `usePlayer()` owns the audio element, playback state, local lyric status, album colors, and buffering state.
3. App views receive state and callbacks through props.

React Context is reserved for cross-cutting concerns: theme, i18n, and toast.

## Important Notes

- Local imports are the only music entry point.
- Local lyrics come from embedded tags and local lyric files.
- Blob URLs from browser file imports are session-scoped; users re-import files in a new session.
- Run `npx tsc --noEmit` and `npm run test -- --run` before finishing source changes.
