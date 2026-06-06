import React, { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { AppView } from "./app/appTypes";
import AppShell from "./app/AppShell";
import LoadingScreen from "./components/common/LoadingScreen";
import Onboarding from "./components/common/Onboarding";
import Controls from "./components/player/Controls";
import LyricsView from "./components/player/LyricsView";
import KeyboardShortcuts from "./components/ui/KeyboardShortcuts";
import SpeedIndicator from "./components/common/SpeedIndicator";
import HomePage from "./components/home/HomePage";
import LibraryPage from "./components/library/LibraryPage";
import { keyboardRegistry } from "./services/ui/keyboardRegistry";
import MediaSessionController from "./components/player/MediaSessionController";
import PlayerBar from "./components/player/PlayerBar";
import QueuePage from "./components/queue/QueuePage";
import { useI18n } from "./contexts/I18nContext";
import { getSupportedAudioFormats } from "./services/utils";
import { usePerformanceOptimization } from "./hooks/usePerformanceOptimization";
import { getPlatformConfig } from "./services/music/multiPlatformLyrics";
import { PlayState } from "./types";
import { useWebViewOptimization, useOptimizedBackdropFilter } from "./hooks/useWebViewOptimization";

import { useAppController } from "./app/useAppController";
import { useAppViewState } from "./app/useAppViewState";
import GlassButton from "./components/ui/GlassButton";

const importPlaylistPanel = () => import("./components/player/PlaylistPanel");
const importSearchModal = () => import("./components/modals/SearchModal");
const importAlbumMode = () => import("./components/ui/AlbumMode");
const importImportMusicDialog = () => import("./components/modals/ImportMusicDialog");

const LazyPlaylistPanel = lazy(importPlaylistPanel);
const LazySearchModal = lazy(importSearchModal);
const LazyAlbumMode = lazy(importAlbumMode);
const LazyImportMusicDialog = lazy(importImportMusicDialog);

const App: React.FC = () => {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState<AppView>("home");

  // Performance monitoring
  usePerformanceOptimization();
  useWebViewOptimization();
  useOptimizedBackdropFilter(true);

  // Log supported audio formats and platform config on app start
  useEffect(() => {
    // Log supported audio formats
    const formats = getSupportedAudioFormats();
    console.log('Supported Audio Formats:');
    Object.entries(formats).forEach(([format, supported]) => {
      console.log(`   ${supported ? '[OK]' : '[NO]'} ${format.toUpperCase()}`);
    });

    // Log lyrics platform configuration
    const platformConfig = getPlatformConfig();
    console.log('\nLyrics Platform Configuration:');
    console.log('   Primary sources (parallel search):');
    console.log(`     ${platformConfig.netease ? '[OK]' : '[NO]'} Netease Music (网易云音乐) - Word-by-word lyrics`);
    console.log(`     ${platformConfig.thirdParty ? '[OK]' : '[NO]'} Third-party APIs (7 sources)`);
    console.log('       • LrcLib, LRCAPI, Lyrics.ovh, Syair.info');
    console.log('       • ChartLyrics, Musixmatch, OpenLyrics');
  }, []);

  const {
    playlist,
    player,
    hasLoadedSong,
    volume,
    setVolume,
    showSpeedIndicator,
    handleSpeedChange,
    handleFileChange,
    handleImportUrl,
    handleImportAndPlay,
    handleAddToQueue,
  } = useAppController();

  const {
    audioRef,
    currentSong,
    playState,
    currentTime,
    duration,
    playMode,
    matchStatus,
    accentColor,
    togglePlay,
    toggleMode,
    handleSeek,
    playNext,
    playPrev,
    handleTimeUpdate,
    handleLoadedMetadata,
    playIndex,
    handleAudioEnded,
    play,
    pause,
    resolvedAudioSrc,
    isBuffering,
  } = player;

  const preloadPlaylistPanel = useCallback(() => {
    void importPlaylistPanel();
  }, []);

  const preloadSearchModal = useCallback(() => {
    void importSearchModal();
  }, []);

  const preloadAlbumMode = useCallback(() => {
    void importAlbumMode();
  }, []);

  const {
    showPlaylist,
    setShowPlaylist,
    showSearch,
    setShowSearch,
    showImportDialog,
    setShowImportDialog,
    hasOpenedPlaylist,
    hasOpenedSearch,
    showVolumePopup,
    setShowVolumePopup,
    showSettingsPopup,
    setShowSettingsPopup,
    lyricsFontSize,
    setLyricsFontSize,
    viewMode,
    setViewMode,
    hasEnteredLyricsMode,
    isFullscreen,
    hasEverPlayed,
    isLoading,
    hasSeenOnboarding,
    setHasSeenOnboarding,
    handleLoadingComplete,
    handleOpenSearch,
    handleOpenPlaylist,
    handleTogglePlaylist,
    handleViewModeChange,
  } = useAppViewState({
    currentSong,
    playState,
    hasLoadedSong,
    preloadPlaylistPanel,
    preloadSearchModal,
    preloadAlbumMode,
  });

  // Global Keyboard Registry Initialization
  useEffect(() => {
    const handler = (e: KeyboardEvent) => keyboardRegistry.handle(e);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Memoize controls section to prevent unnecessary re-renders
  const controlsSection = useMemo(() => {
    if (!hasLoadedSong) {
      return (
        <div className="flex flex-col items-center justify-center w-full h-full gap-8 px-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-white/90 text-2xl font-semibold tracking-tight">{t("player.welcomeTitle")}</p>
            <p className="text-white/40 text-sm">{t("player.selectSong")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white text-sm font-medium cursor-pointer transition-all duration-200 backdrop-blur-sm border border-white/10">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              {t("playlist.importLocal")}
              <input type="file" accept="audio/*" multiple className="hidden" onChange={(e) => e.target.files && handleFileChange(e.target.files)} />
            </label>
            <GlassButton
              onClick={handleOpenSearch}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              }
            >
              {t("search.title")}
            </GlassButton>
            <GlassButton
              onClick={() => setShowImportDialog(true)}
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 005.656 0l4 4a4 4 0 01-5.656 5.656l-1.101-1.102" />
                </svg>
              }
            >
              {t("playlist.importUrl")}
            </GlassButton>
          </div>
        </div>
      );
    }

    return (
      <div className={`flex flex-col items-center justify-center w-full h-full z-30 relative ${hasEverPlayed ? 'pt-0' : 'pt-32'}`}>
        <div className="relative flex flex-col items-center gap-8 w-full max-w-[520px] px-4">
          <Controls
            isPlaying={playState === PlayState.PLAYING}
            onPlayPause={togglePlay}
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            title={currentSong?.title || t("player.welcomeTitle")}
            artist={currentSong?.artist || t("player.selectSong")}
            album={currentSong?.album}
            audioRef={audioRef}
            onNext={playNext}
            onPrev={playPrev}
            playMode={playMode}
            onToggleMode={toggleMode}
            onTogglePlaylist={handleOpenPlaylist}
            accentColor={accentColor}
            volume={volume}
            onVolumeChange={setVolume}
            speed={player.speed}
            preservesPitch={player.preservesPitch}
            onSpeedChange={handleSpeedChange}
            onTogglePreservesPitch={player.togglePreservesPitch}
            coverUrl={currentSong?.coverUrl}
            coverBlurhash={currentSong?.blurhash}
            isBuffering={isBuffering}
            showVolumePopup={showVolumePopup}
            setShowVolumePopup={setShowVolumePopup}
            showSettingsPopup={showSettingsPopup}
            setShowSettingsPopup={setShowSettingsPopup}
          />

          {/* Floating Playlist Panel */}
          {(hasOpenedPlaylist || showPlaylist) && (
            <Suspense fallback={null}>
              <LazyPlaylistPanel
                isOpen={showPlaylist}
                onClose={() => setShowPlaylist(false)}
                queue={playlist.queue}
                currentSongId={currentSong?.id}
                onPlay={playIndex}
                onImport={handleImportUrl}
                onRemove={playlist.removeSongs}
                accentColor={accentColor}
                onFilesSelected={handleFileChange}
                onSearchClick={handleOpenSearch}
              />
            </Suspense>
          )}
        </div>
      </div>
    );
  }, [hasLoadedSong, playState, currentTime, duration, currentSong?.title, currentSong?.artist, currentSong?.id, currentSong?.coverUrl, t, playNext, playPrev, playMode, accentColor, volume, player.speed, player.preservesPitch, isBuffering, showVolumePopup, showSettingsPopup, showPlaylist, playlist.queue, playlist.removeSongs, hasEverPlayed, handleOpenPlaylist, handleOpenSearch, handleImportUrl, handleFileChange, setShowImportDialog]);

  const lyricsVersion = currentSong?.lyrics ? currentSong.lyrics.length : 0;
  const lyricsKey = currentSong ? `${currentSong.id}-${lyricsVersion}` : "no-song";

  // Memoize lyrics section to prevent unnecessary re-renders
  const lyricsSection = useMemo(() => {
    if (!hasLoadedSong) {
      return null;
    }

    return (
      <div className="w-full h-full relative z-20 flex flex-col justify-center px-4 lg:pl-4">
        <LyricsView
          key={lyricsKey}
          lyrics={currentSong?.lyrics || []}
          audioRef={audioRef}
          isPlaying={playState === PlayState.PLAYING}
          currentTime={currentTime}
          onSeekRequest={handleSeek}
          matchStatus={matchStatus}
          fontSize={lyricsFontSize}
          accentColor={accentColor}
        />
      </div>
    );
  }, [hasLoadedSong, lyricsKey, currentSong?.lyrics, playState, currentTime, matchStatus, lyricsFontSize, accentColor]);

  const handleOpenQueueView = useCallback(() => {
    setActiveView("queue");
  }, []);

  const handleOpenLyricsView = useCallback(() => {
    setActiveView("lyrics");
  }, []);

  const handleSearchPreset = useCallback(
    (_query: string) => {
      handleOpenSearch();
    },
    [handleOpenSearch],
  );

  const shellLabels = useMemo(
    () => ({
      home: t("home.navHome"),
      explore: t("home.navExplore"),
      library: t("home.navLibrary"),
      queue: t("home.navQueue"),
      lyrics: t("home.navLyrics"),
      import: t("topBar.import"),
      importMusic: t("home.importMusic"),
      playingNext: t("playlist.playingNext"),
      emptyLibrary: t("home.emptyLibrary"),
      searchPlaceholder: t("home.searchPlaceholder"),
      settings: t("topBar.settings"),
      language: t("topBar.language"),
      about: t("topBar.about"),
      fontSize: t("lyrics.fontSize"),
      minimize: t("topBar.minimize"),
      fullscreen: t("topBar.enterFullscreen"),
      close: t("topBar.close"),
      output: t("home.output"),
    }),
    [t],
  );

  const homeLabels = useMemo(
    () => ({
      moods: [
        t("home.moodRelax"),
        t("home.moodFeelGood"),
        t("home.moodEnergize"),
        t("home.moodCommute"),
        t("home.moodWorkout"),
        t("home.moodRomance"),
        t("home.moodSad"),
        t("home.moodParty"),
        t("home.moodFocus"),
        t("home.moodSleep"),
      ],
      quickPicks: t("home.quickPicks"),
      tunesForSeason: t("home.tunesForSeason"),
      summer: t("home.summer"),
      exploreSources: t("home.exploreSources"),
      importLocal: t("playlist.importLocal"),
      importUrl: t("playlist.importUrl"),
      searchOnline: t("search.online"),
      openQueue: t("home.openQueue"),
      lyrics: t("home.navLyrics"),
      noMusic: t("player.noMusicLoaded"),
      selectSong: t("player.selectSong"),
      sourceLocal: t("playlist.sourceLocal"),
      sourceNetease: t("playlist.sourceNetease"),
      sourceArchive: t("search.archive"),
      sourceKugou: t("home.sourceKugou"),
      sourceUrl: t("home.sourceUrl"),
      readyToPlay: t("home.readyToPlay"),
      emptyQuickPicks: t("home.emptyQuickPicks"),
      nowPlaying: t("home.nowPlaying"),
      ready: t("home.ready"),
      shelfSummerParty: t("home.shelfSummerParty"),
      shelfKPop: t("home.shelfKPop"),
      shelfJPop: t("home.shelfJPop"),
      shelfArchive: t("home.shelfArchive"),
      shelfNetease: t("home.shelfNetease"),
      shelfKugou: t("home.shelfKugou"),
      shelfAlbums: t("home.shelfAlbums"),
    }),
    [t],
  );

  const queueLabels = useMemo(
    () => ({
      title: t("playlist.title"),
      empty: t("playlist.empty"),
      addSongs: t("playlist.addSongs"),
      importLocal: t("playlist.importLocal"),
      importUrl: t("playlist.importUrl"),
      search: t("search.title"),
      remove: t("playlist.remove"),
      sourceLocal: t("playlist.sourceLocal"),
      sourceNetease: t("playlist.sourceNetease"),
      sourceArchive: t("search.archive"),
      sourceKugou: t("home.sourceKugou"),
      sourceUrl: t("home.sourceUrl"),
    }),
    [t],
  );

  const libraryLabels = useMemo(
    () => ({
      title: t("home.navLibrary"),
      subtitle: t("home.librarySubtitle"),
      empty: t("home.libraryEmpty"),
      search: t("search.title"),
      sourceLocal: t("playlist.sourceLocal"),
      sourceNetease: t("playlist.sourceNetease"),
      sourceArchive: t("search.archive"),
      sourceKugou: t("home.sourceKugou"),
      sourceUrl: t("home.sourceUrl"),
    }),
    [t],
  );

  const playerBarLabels = useMemo(
    () => ({
      play: t("player.play"),
      pause: t("player.pause"),
      previous: t("player.prev"),
      next: t("player.next"),
      queue: t("home.navQueue"),
      lyrics: t("home.navLyrics"),
      noMusic: t("player.noMusicLoaded"),
      selectSong: t("player.selectSong"),
      progress: t("home.playbackProgress"),
    }),
    [t],
  );

  const shellPlayerBar = useMemo(
    () => (
      <PlayerBar
        currentSong={currentSong}
        isPlaying={playState === PlayState.PLAYING}
        currentTime={currentTime}
        duration={duration}
        accentColor={accentColor}
        onPlayPause={togglePlay}
        onPrev={playPrev}
        onNext={playNext}
        onSeek={handleSeek}
        onOpenQueue={handleOpenQueueView}
        onOpenLyrics={handleOpenLyricsView}
        labels={playerBarLabels}
      />
    ),
    [
      accentColor,
      currentSong,
      currentTime,
      duration,
      handleOpenLyricsView,
      handleOpenQueueView,
      handleSeek,
      playNext,
      playPrev,
      playState,
      playerBarLabels,
      togglePlay,
    ],
  );

  const appContent = useMemo(() => {
    if (activeView === "library") {
      return (
        <LibraryPage
          queue={playlist.queue}
          currentSongId={currentSong?.id}
          onPlay={playIndex}
          onSearchClick={handleOpenSearch}
          labels={libraryLabels}
        />
      );
    }

    if (activeView === "queue") {
      return (
        <QueuePage
          queue={playlist.queue}
          currentSongId={currentSong?.id}
          onPlay={playIndex}
          onRemove={playlist.removeSongs}
          onFilesSelected={handleFileChange}
          onImportClick={() => setShowImportDialog(true)}
          onSearchClick={handleOpenSearch}
          labels={queueLabels}
        />
      );
    }

    if (activeView === "lyrics") {
      return (
        <div className="min-h-[640px]">
          {lyricsSection || (
            <div className="flex h-[420px] items-center justify-center text-lg font-bold text-white/45">
              {t("lyrics.playMusicToViewLyrics")}
            </div>
          )}
        </div>
      );
    }

    if (activeView === "player") {
      return <div className="min-h-[640px]">{controlsSection}</div>;
    }

    return (
      <HomePage
        queue={playlist.queue}
        currentSong={currentSong}
        currentSongId={currentSong?.id}
        isPlaying={playState === PlayState.PLAYING}
        onPlayIndex={playIndex}
        onOpenSearch={handleOpenSearch}
        onOpenImportDialog={() => setShowImportDialog(true)}
        onOpenQueue={handleOpenQueueView}
        onOpenLyrics={handleOpenLyricsView}
        onFilesSelected={handleFileChange}
        onSearchPreset={handleSearchPreset}
        labels={homeLabels}
      />
    );
  }, [
    activeView,
    controlsSection,
    currentSong,
    handleFileChange,
    handleOpenLyricsView,
    handleOpenQueueView,
    handleOpenSearch,
    handleSearchPreset,
    homeLabels,
    libraryLabels,
    lyricsSection,
    playIndex,
    playState,
    playlist.queue,
    playlist.removeSongs,
    queueLabels,
    t,
    setShowImportDialog,
  ]);

  // Show loading screen while initializing
  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  // Show onboarding for first-time users
  if (!hasSeenOnboarding) {
    return <Onboarding onComplete={() => setHasSeenOnboarding(true)} />;
  }

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden theme-transition bg-black">
      <audio
        ref={audioRef}
        src={resolvedAudioSrc && resolvedAudioSrc.trim() ? resolvedAudioSrc : (currentSong?.fileUrl && currentSong.fileUrl.trim() ? currentSong.fileUrl : undefined)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
        crossOrigin="anonymous"
      />

      <KeyboardShortcuts
        isPlaying={playState === PlayState.PLAYING}
        onPlayPause={togglePlay}
        onNext={playNext}
        onPrev={playPrev}
        onSeek={handleSeek}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        onVolumeChange={setVolume}
        onToggleMode={toggleMode}
        onTogglePlaylist={handleTogglePlaylist}
        speed={player.speed}
        onSpeedChange={handleSpeedChange}
        onToggleVolumeDialog={() => setShowVolumePopup((prev) => !prev)}
        onToggleSpeedDialog={() => setShowSettingsPopup((prev) => !prev)}
      />

      <SpeedIndicator speed={player.speed} show={showSpeedIndicator} />

      <MediaSessionController
        currentSong={currentSong ?? null}
        playState={playState}
        currentTime={currentTime}
        duration={duration}
        playbackRate={player.speed}
        onPlay={play}
        onPause={pause}
        onNext={playNext}
        onPrev={playPrev}
        onSeek={handleSeek}
      />

      {/* Search Modal - Always rendered to preserve state, visibility handled internally */}
      {(hasOpenedSearch || showSearch) && (
        <Suspense fallback={null}>
          <LazySearchModal
            isOpen={showSearch}
            onClose={() => setShowSearch(false)}
            queue={playlist.queue}
            onPlayQueueIndex={playIndex}
            onImportAndPlay={handleImportAndPlay}
            onAddToQueue={handleAddToQueue}
            currentSong={currentSong}
            isPlaying={playState === PlayState.PLAYING}
            accentColor={accentColor}
          />
        </Suspense>
      )}

      {/* Import Music Dialog - for welcome screen */}
      {showImportDialog && (
        <Suspense fallback={null}>
          <LazyImportMusicDialog
            isOpen={showImportDialog}
            onClose={() => setShowImportDialog(false)}
            onImport={handleImportUrl}
          />
        </Suspense>
      )}

      {/* Main Content */}
      {viewMode === 'lyrics' ? (
        // Lyrics Mode - Full screen centered lyrics view
        <div className="flex-1 w-full h-full">
          {(hasEnteredLyricsMode || viewMode === "lyrics") && (
            <Suspense fallback={null}>
              <LazyAlbumMode
                coverUrl={currentSong?.coverUrl}
                title={currentSong?.title || t("player.welcomeTitle")}
                artist={currentSong?.artist || t("player.selectSong")}
                isPlaying={playState === PlayState.PLAYING}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                accentColor={accentColor}
                lyrics={currentSong?.lyrics}
                showLyrics={true}
                onExit={() => {
                  if (document.fullscreenElement) {
                    document.exitFullscreen?.();
                  }
                  setViewMode('default');
                }}
              />
            </Suspense>
          )}
        </div>
      ) : (
        <AppShell
          activeView={activeView}
          currentSong={currentSong}
          lyricsFontSize={lyricsFontSize}
          onLyricsFontSizeChange={setLyricsFontSize}
          onViewChange={setActiveView}
          onSearchClick={handleOpenSearch}
          onImportClick={() => setShowImportDialog(true)}
          onEnterImmersiveLyrics={() => handleViewModeChange("lyrics")}
          playerBar={currentSong ? shellPlayerBar : undefined}
          labels={shellLabels}
        >
          {appContent}
        </AppShell>
      )}
    </div>
  );
};

export default App;
