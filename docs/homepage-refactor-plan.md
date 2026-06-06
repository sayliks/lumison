# Lumison Homepage and App Shell Refactor

Status: Superseded by local-only scope  
Date: 2026-06-06  
Owner: Lumison development

## 2026-06-06 Scope Update

Lumison is now local-import only. Online search, URL import, Netease/Kugou/Internet Archive discovery, and `Ctrl+K` search behavior are removed from the active product scope. Any older search/discovery references in this planning document should be treated as historical context, not implementation guidance.

## Purpose

Lumison currently opens like a single-screen player: when no song is loaded, `App.tsx` shows a centered welcome state with import and search actions. That works as a first-run entry point, but it does not feel like a full media player in the style of Spotify, QQ Music, or YouTube Music. A proper music app needs a persistent shell, a real home surface, library and discovery entry points, and playback controls that remain available without taking over the whole interface.

This document defines the product direction and refactoring plan for replacing the current homepage while protecting the existing playback, queue, search, lyrics, and Tauri behavior.

## Goals

- Replace the empty welcome/player-first homepage with a real media-player home.
- Introduce a persistent app shell with navigation, content, queue, and player regions.
- Preserve the immersive current-player and lyrics experiences as dedicated modes, not the only main screen.
- Refactor `App.tsx` into smaller orchestration, layout, view, and feature modules.
- Keep the first implementation shippable with existing data sources: local files, URL import, queue persistence, Netease, Kugou, Internet Archive, and lyrics matching.
- Prepare the codebase for future features such as playlists, favorites, recently played, recommendations, and album/artist pages.

## Non-Goals

- Do not clone any single commercial player UI exactly.
- Do not add paid streaming, account sync, or licensing-dependent catalog features.
- Do not replace the audio engine, lyrics parser, queue semantics, or Tauri command layer in the first phase.
- Do not introduce a heavy routing/state-management framework unless the first implementation proves it is needed.

## Current State

The current homepage is not a separate page. It is embedded inside `src/App.tsx`:

- `App.tsx` owns playlist restoration, player creation, modal state, keyboard shortcuts, top bar wiring, responsive layout, import actions, queue actions, and view switching.
- `controlsSection` is the current home/player surface. If no song is loaded, it renders `player.welcomeTitle`, `playlist.importLocal`, `search.title`, and `playlist.importUrl`.
- Once playback has happened, the desktop layout becomes a two-column controls plus lyrics view.
- Mobile layout uses a swipeable controls/lyrics pair through `useMobilePanelSwipe`.
- `TopBar` is a hover/auto-hide control area, not a standard app navigation shell.
- `SearchModal` contains queue search and online source search, but it is still modal-first rather than app-navigation-first.
- `PlaylistPanel` is a floating panel, not a library or queue page.
- `src/components/layout/Layout.tsx` and `DesktopLayout.tsx` are thin wrappers and are not currently driving the main application structure.

The strongest existing assets are worth keeping:

- `usePlaylist()` already handles queue, import, local files, URL import, Netease links, direct streams, and persistence.
- `usePlayer()` already centralizes audio element state, play mode, lyrics matching, colors, buffering, and playback actions.
- `SearchModal` and `useSearchModal()` already connect queue, Netease, Kugou, Internet Archive, album search, and search history.
- `Controls`, `LyricsView`, `AlbumMode`, `MediaSessionController`, and `KeyboardShortcuts` are mature enough to preserve while the shell changes around them.

## Product Direction

Lumison should open into a usable music home, not an empty landing page. The first screen should answer three questions:

- What can I play now?
- Where can I search or import music?
- What is already in my library or queue?

The home should feel like a desktop music application:

- Persistent navigation on desktop.
- Compact bottom navigation on mobile.
- A content area with music shelves and lists.
- A persistent player bar or compact player region.
- A queue/library surface that can be opened without covering the whole app by default.
- Fullscreen/lyrics/album mode as an intentional playback mode.

## Target Visual Direction

The requested home reference is a dark streaming-music shell similar in structure to YouTube Music: fixed left navigation, prominent search, mood chips, a "Quick picks" grid, and horizontal discovery shelves. Lumison should use that structure while keeping its own identity and avoiding a direct clone.

### Desktop Layout Target

- Left sidebar:
  - Fixed-width black rail around 240-280px.
  - Lumison brand mark at the top with a compact menu button.
  - Primary navigation: Home, Explore/Search, Library, Queue, Lyrics.
  - Secondary action: New playlist or Import music, depending on MVP scope.
  - Small library/auto-playlist entries can appear below the divider once library data exists.
- Top command area:
  - Search input near the top-left of the content column, visually prominent.
  - Right-side compact icons for output/window actions, settings/profile/about as appropriate for Lumison.
  - Keep Tauri window controls and fullscreen/exhibition behavior shell-level.
- Main content:
  - Mood/search chips near the top: Relax, Feel good, Energize, Commute, Workout, Romance, Sad, Party, Focus, Sleep.
  - Large "Quick picks" section with a user/avatar or current profile visual beside the heading.
  - Quick picks should render as a dense 3-column desktop grid, roughly 4 rows, with small square cover art, title, and metadata.
  - Horizontal discovery shelves below Quick picks with large image tiles and carousel arrows.
  - The viewport should feel scrollable and content-rich immediately, not like a centered empty state.
- Player:
  - A compact persistent player bar should appear once a playable item exists.
  - If no song exists, the bottom region can stay quiet; Home actions should still make playback reachable.

### Mobile Layout Target

- Replace the desktop sidebar with bottom tabs: Home, Explore/Search, Library, Queue.
- Keep search accessible from the top of Home and from `Ctrl+K`/command behavior where available.
- Show mood chips as a horizontally scrollable row.
- Quick picks become a single-column or two-column compact list depending on width.
- Discovery shelves remain horizontal carousels.
- Lyrics can be opened as a focused/fullscreen mode, but it should not be the only main screen.

### Data Rules For The Reference Layout

- Do not fabricate YouTube-style play counts, popularity, subscriptions, or premium/upgrade concepts.
- Quick picks should be backed by real available data in this order:
  - Current/restored queue.
  - Recently imported or recently played tracks once available.
  - Recent search history and source-backed search shortcuts.
  - Provider search results only after the user selects a mood/search chip or enters a query.
- Metadata lines should use honest fields: artist, album, source, duration, queue status, or import/search origin.
- Discovery shelf tiles can initially be search presets, not fixed playlists. For example, "Summer Party" opens Search with a preset query instead of pretending Lumison owns a curated catalog.
- Use real cover art when available. For generic discovery tiles, use tasteful generated/static imagery or dominant-color artwork, but keep it visually distinct from commercial player assets.
- Every visible string in this layout needs `en.ts` and `zh.ts` keys.

## Target Information Architecture

Initial app views:

- Home: default view with now playing, quick actions, recent queue, and discovery entry points.
- Now Playing: opened from the album cover/current track area, with large media art, queue, lyrics, related content, and track details.
- Search: full-page search experience, with modal behavior retained temporarily for keyboard command use.
- Library: local and imported music, initially backed by the current queue/imported songs.
- Queue: current queue with edit, remove, play, import, and search actions.
- Lyrics: focused lyrics view for the current song.
- Settings/About: existing top-bar dialogs can remain dialogs.

Suggested desktop shell:

- Left rail: Home, Search, Library, Queue, Lyrics.
- Top command row: prominent search entry, import action, visual/view controls, window controls.
- Main content: active view.
- Right panel, optional: now playing context or queue preview.
- Bottom player: current song, progress, transport, volume, queue button, lyrics button.

Suggested mobile shell:

- Main content fills the viewport above a mini player.
- Bottom tabs: Home, Search, Library, Queue.
- Lyrics remains a swipe/fullscreen mode.
- Import and settings move into compact icon buttons or menus.

## Now Playing Page

Clicking the album cover or current-track artwork should open a dedicated Now Playing page inside the app shell. This should be the default playback-page interaction. Fullscreen `AlbumMode` remains useful, but it should be a separate immersive action rather than the only result of clicking artwork.

The target structure follows the provided playback-page reference:

- Persistent left navigation rail.
- Persistent top command/search area.
- Large current-media area on the left, using album art, visual media, or an adaptive artwork backdrop.
- Context panel on the right with tabs:
  - Up Next: queue list with the active track highlighted.
  - Lyrics: synced lyrics for the current track.
  - Related: source-aware search/discovery shortcuts.
  - Details: album, artist, source, duration, lyrics status, and track metadata.
- Persistent bottom player bar with transport controls, progress, current track identity, volume, play mode, queue, and lyrics actions.

Mobile behavior:

- The mini player expands into Now Playing.
- Artwork becomes the primary surface.
- Up Next, Lyrics, Related, and Details are exposed through tabs or a segmented control.
- The page can collapse back to the current app view without stopping playback.

## Homepage MVP

The first replacement homepage can be built from existing data:

The first Home should follow the requested reference hierarchy:

1. Left navigation and top search.
2. Mood/search chips.
3. Quick picks.
4. Seasonal/discovery shelves.
5. Persistent or conditional compact player.

### 1. Now Playing / Continue Listening

Show current song or restored queue state:

- Cover art, title, artist, source, and playback status.
- Primary play/pause action.
- Secondary actions: open lyrics, open queue, search related music.
- If no current song exists but queue has songs, show the first restorable queue item.

### 2. Quick Actions

Show compact action tiles:

- Import local files.
- Import URL.
- Search online.
- Open queue.

These replace the current welcome buttons, but live inside the home grid rather than the center of an empty screen.

### 3. Queue Preview

Show the current queue or restored queue:

- Current song highlighted.
- Play item action.
- Add/import shortcut when empty.
- Link to full Queue view.

In the visual target, Queue Preview and Continue Listening can be represented inside "Quick picks" rather than as a separate large card. The goal is a dense music list, not dashboard cards.

### 4. Discovery Entry Points

Use existing providers before building recommendation systems:

- Netease search entry.
- Kugou search entry.
- Internet Archive entry.
- Album search entry.
- Recent search history, if available from `useSearchHistory()`.

This should be honest: until recommendations exist, these are discovery shortcuts, not personalized recommendations.

Mood chips should be implemented as preset searches first. Selecting a chip should open or update Search with a query/provider preset, and later can drive Home shelves when a real recommendation/library model exists.

### 4a. Quick Picks Reference Grid

The requested reference puts Quick picks at the center of the home. MVP behavior:

- Render up to 12 items on desktop.
- Prefer queue/current/restored songs, then recent search history-derived entries.
- Use a 3-column grid on desktop and compact responsive rows on smaller widths.
- Each item shows cover art, title, artist, and a short honest metadata line.
- Clicking an existing queue item plays it immediately.
- Clicking a search-derived item opens Search for that query or provider.
- Empty state should keep the same section shape and offer Import local, Import URL, and Search online actions.

### 4b. Discovery Shelves

Below Quick picks, add one or two horizontal shelves:

- "Tunes for the season" / "Summer" as search preset tiles.
- "Explore by source" with Netease, Kugou, Internet Archive, and Album Search tiles.
- Tiles should use real or generated imagery and open provider/search presets.
- Carousel arrows are optional in the first pass if horizontal scrolling is clear and accessible.

### 5. Lyrics Spotlight

If a song is loaded:

- Show a small current lyric/lyrics availability card.
- Action to open Lyrics mode.
- Display match status when lyrics are loading or failed.

If no song is loaded:

- Show a subdued prompt to play music for synced lyrics.

Lyrics Spotlight should be visually secondary in this reference-style home. It can appear as a small quick action or player-bar action rather than a large homepage block.

## Refactoring Plan

### New Structure

Proposed files:

```text
src/
  app/
    AppRoot.tsx
    AppShell.tsx
    appTypes.ts
    useAppController.ts
    useAppViewState.ts
  components/
    navigation/
      DesktopSidebar.tsx
      MobileTabBar.tsx
      TopCommandBar.tsx
    now-playing/
      NowPlayingPage.tsx
      NowPlayingArtwork.tsx
      NowPlayingTabs.tsx
      UpNextPanel.tsx
    player/
      MiniPlayer.tsx
      PlayerBar.tsx
      NowPlayingCard.tsx
    home/
      HomePage.tsx
      HomeQuickActions.tsx
      HomeQueuePreview.tsx
      HomeDiscovery.tsx
      HomeLyricsSpotlight.tsx
    queue/
      QueuePage.tsx
    library/
      LibraryPage.tsx
    search/
      SearchPage.tsx
```

This is a direction, not a requirement to create all files in one commit.

### App Orchestration

Move state orchestration out of `App.tsx` in stages:

- `useAppController`: owns `usePlaylist`, `usePlayer`, import handlers, add/play handlers, queue lookup maps, volume, speed indicator, and Media Session callbacks.
- `useAppViewState`: owns active view, modal visibility, lyrics mode, fullscreen, mobile panel state, and lazy preloading.
- `AppShell`: renders persistent navigation, command bar, active view, player bar, modals, audio element, shortcuts, and media session.
- `HomePage`: consumes a focused prop contract instead of reaching into every player/playlist state object.

The goal is for `App.tsx` to become a thin composition component.

### View State

Use a simple local view state first:

```ts
type AppView = "home" | "search" | "library" | "queue" | "lyrics";
```

After adding the dedicated playback page, this becomes:

```ts
type AppView = "home" | "nowPlaying" | "search" | "library" | "queue" | "lyrics";
```

The project can add React Router later if deep linking, browser history, or shareable internal URLs become important.

### Playback UI

Split current `Controls` usage into two layers:

- Full player controls: preserve existing `Controls` for immersive/default player regions during transition.
- Compact player bar: new component for app-shell playback. It should expose play/pause, previous/next, current song, progress, volume, queue, and lyrics actions.

`Controls` may later be simplified once `PlayerBar` and `NowPlayingCard` exist.

### Search

Short term:

- Keep `SearchModal` for `Ctrl+K`.
- Create `SearchPage` that can reuse `useSearchModal` logic or extract shared search state into a view-agnostic hook.

Medium term:

- Rename `useSearchModal` to a more neutral `useMusicSearch`.
- Split modal-only behavior such as focus trap, context menu placement, and keyboard scope from provider/query logic.

### Queue and Library

Short term:

- Queue view is backed by `playlist.queue`.
- Library view can initially show imported/restorable queue items grouped by source.

Medium term:

- Add a real library store for imported tracks, favorites, and recently played.
- Keep queue persistence separate from library persistence.

Suggested persistence additions:

```text
lumison_library_v1
lumison_recently_played_v1
lumison_favorites_v1
lumison_home_state_v1
```

Queue persistence currently opens IndexedDB but stores in `sessionStorage`; this should be reviewed when persistent library work starts.

## Design Principles

- The home is the app, not marketing.
- Playback must always be reachable.
- Search and import should be first-class, because Lumison relies on user-supplied and multi-source music.
- Empty states should offer actions without looking like a temporary splash screen.
- Dense music lists should be easy to scan: artwork, title, artist, source, duration, and actions.
- Keep the dark immersive identity, but avoid making every surface a floating glass card.
- Use album art and song colors as accents, not as the entire layout.
- Every user-facing string needs i18n keys in `src/i18n/locales/en.ts` and `zh.ts`.

## Accessibility and Keyboard

Required behavior:

- `Ctrl+K` opens search from any view.
- Space/playback shortcuts continue working unless focus is inside an input.
- Navigation buttons expose clear labels.
- Lists support keyboard selection in Search and should eventually support it in Queue.
- Mini player buttons need accessible labels.
- Text must fit in compact player, nav, cards, and queue rows at desktop and mobile widths.

## Performance Notes

- Keep lazy loading for heavy views such as Search, Queue, Lyrics/Album mode, and Import dialogs.
- Preserve current prefetch-on-idle behavior, but move it into `useAppViewState` or `AppShell`.
- Avoid rendering Search and Queue heavy lists if they have not been opened.
- Reuse existing virtualization in `PlaylistPanel` when building `QueuePage`.
- Keep audio element mounted across view changes to avoid playback interruption.

## Implementation Phases

### Phase 0: Planning and Agreement

- Review this document.
- Decide MVP scope: shell-only, homepage-only, or shell plus player bar.
- Decide whether Search becomes a page immediately or remains modal-first for the first pass.
- Confirm desktop and mobile navigation model.

### Phase 1: Safe Extraction

- Remove dead `usePlayerContext` import from `App.tsx` if it still exists.
- Extract import/add/play handlers from `App.tsx` into a hook.
- Extract modal/view state into a hook.
- Keep rendered UI functionally identical.
- Verify with `npx tsc --noEmit` and `npm run test -- --run`.

### Phase 2: App Shell

- Add `AppShell`, `DesktopSidebar`, `MobileTabBar`, and `TopCommandBar`.
- Keep current player/lyrics layout available as a view.
- Add local `AppView` state.
- Keep audio element, media session, keyboard shortcuts, and modal roots mounted at shell level.
- Match the requested reference structure at shell level: fixed desktop sidebar, prominent top search, content scroller, and conditional compact player region.
- Keep the old immersive player as an internal player/lyrics view during the transition.

### Phase 3: Homepage MVP

- Add `HomePage` and its sections.
- Replace the current no-song centered welcome state with the reference-style Home.
- Add mood/search chips, Quick picks, discovery shelves, quick actions, queue-backed items, and a secondary lyrics entry.
- Add i18n keys.
- Test empty queue, restored queue, loaded song, playing song, and failed lyrics states.

### Phase 4: Player Bar and Queue Page

- Add persistent `PlayerBar`.
- Make album-cover/current-track artwork click open `nowPlaying`.
- Add `NowPlayingPage` with large artwork, Up Next, Lyrics, Related, and Details tabs.
- Create full `QueuePage` from existing playlist panel behavior.
- Keep floating `PlaylistPanel` only as a transitional quick panel or remove it after Queue page parity.

### Phase 5: Search and Library Pages

- Build `SearchPage` from existing search providers.
- Create initial `LibraryPage` from imported/restorable tracks.
- Extract search provider state from modal-specific UI.

### Phase 6: Persistent Library Features

- Add recently played, favorites, and saved imported tracks.
- Add home shelves backed by real library data.
- Revisit queue persistence and IndexedDB usage.

## Acceptance Criteria for First Shippable Refactor

- App opens to Home, not the centered welcome/player placeholder.
- Home visually follows the requested dark streaming shell: left desktop navigation, top search, mood chips, Quick picks, and horizontal shelves.
- Clicking album art/current-track artwork opens Now Playing inside the app shell, with Up Next and Lyrics available beside the artwork on desktop.
- User can import local files, import URL, search online, open queue, and start playback from Home.
- Existing playback controls, lyrics mode, keyboard shortcuts, media session, and queue persistence still work.
- Audio keeps playing while switching between Home, Search, Queue, Library, and Lyrics views.
- Desktop and mobile have intentional navigation.
- Empty states are useful and do not feel like a landing page.
- Home does not show fake play counts, fake personalization, or licensing-dependent catalog claims.
- TypeScript passes.
- Existing tests pass.

## Risks

- `App.tsx` has many coupled callbacks, so visual refactor and state refactor should not happen in the same first commit.
- `SearchModal` is large and modal-specific; extracting it too early could slow the project.
- Persistent player bar may duplicate logic from `Controls` at first. This is acceptable if the prop contract is clear.
- Queue persistence currently stores in `sessionStorage`; a real library will require more deliberate persistence.
- Tauri fullscreen/window controls should remain shell-level to avoid broken desktop behavior.

## Open Questions

- Should Home show online discovery shelves as preset search tiles, or only search/import/queue until real recommendation data exists?
- Should Queue be a full page immediately, or remain a panel during the first homepage pass?
- Should the player bar always be visible when no song is loaded, or hidden until the first playable item exists?
- Should Library mean "all imported/restorable tracks" in MVP, or should it wait for a real saved-library model?
- Should Lyrics be a route/view inside the shell, a fullscreen mode, or both?
- Should the left sidebar include "New playlist" in MVP, or should that become "Import music" until playlist creation exists?

## Recommended Next Development Step

Start with Phase 1. It creates safer boundaries without changing the user experience. After that, implement Phase 2 and Phase 3 together only if the extracted controller/view state feels stable.

Suggested next commit sequence:

1. `App.tsx` cleanup and controller extraction.
2. App shell skeleton with reference-style sidebar, top search, and local view state.
3. HomePage MVP with mood chips, Quick picks, and discovery shelves using existing queue/search/import/player data.
4. PlayerBar and QueuePage.
5. SearchPage and LibraryPage.
