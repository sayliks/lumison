# Lumison Local-Only Homepage and App Shell Plan

Status: Active local-only scope
Date: 2026-06-06
Owner: Lumison development

## Purpose

Lumison is now a local-import music player. The home page and app shell should make local files, embedded metadata, sidecar lyrics, queue editing, playback, and immersive lyrics feel like one coherent desktop music app.

## Scope

- Keep local audio import as the only music entry point.
- Support local audio formats accepted by the app file picker.
- Support embedded lyrics and matching `.lrc` / `.txt` lyric files.
- Keep session queue, playback controls, album art, color extraction, lyrics view, and Tauri desktop features.
- Keep local cache, local metadata parsing, local lyrics parsing, and localhost/Tauri tag-writing helpers.
- Remove catalog provider features, link import flows, provider search, provider playback, and provider identity fields from service logic.

## Goals

- Replace a player-only empty state with a real app home.
- Keep persistent navigation for Home, Library, Queue, and Lyrics.
- Make local import available from the top command bar, sidebar, home, library, queue, and playlist panel.
- Keep playback reachable through a compact player bar once a song is loaded.
- Keep immersive album/lyrics mode as a focused playback mode.
- Keep `App.tsx` focused on orchestration while feature logic lives in smaller hooks and components.

## Current Architecture

- `usePlaylist()` owns session queue state and local file import.
- `usePlayer()` owns the audio element, playback state, play mode, lyrics status, album color extraction, and media session integration.
- `AppShell` owns the persistent shell around Home, Library, Queue, and Lyrics views.
- `HomePage`, `LibraryPage`, and `QueuePage` render local queue-backed surfaces.
- Local lyrics are parsed through `src/services/lyrics`.
- Local metadata is parsed through `src/services/lyrics/id3Parser.ts`.

## Local Data Rules

- Song IDs are generated from local file name, size, and last modified time.
- Restoring prior blob URLs is not supported; users re-import local files for a new browser session.
- Metadata lines should use honest local fields: title, artist, album, duration, and local source.
- No fake catalog, popularity, discovery, or provider metadata should be displayed.

## Home Layout

- The first screen is the app home, not a marketing page.
- Quick picks are backed by the current session queue.
- Empty Quick picks show local import and queue actions.
- The top command bar import control opens the local file picker.
- Desktop navigation uses Home, Library, Queue, and Lyrics.
- Mobile navigation uses the same core views as compact bottom tabs.

## Service Boundaries

Retained local services:

- Playback and audio performance helpers.
- Local image/audio cache helpers.
- Local metadata and lyrics parsers.
- Local queue persistence.
- Tauri cache and tag-writing helpers.
- Keyboard registry and UI utilities.

Removed service categories:

- Provider search APIs.
- Provider audio resolution.
- Provider-specific playback managers.
- Link import services.
- AI lyric generation or translation services.
- Generic network request/proxy helpers used only by provider modules.

## Verification

For local-only changes, run:

```bash
npx tsc --noEmit
npm run test -- --run
```

When UI changes are included, also verify the running Vite app at `http://localhost:3000/` across desktop and mobile-sized viewports.
