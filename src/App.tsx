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
    isMobileLayout,
    paneWidth,
    activePanel,
    dragOffsetX,
    isDragging,
    swipeHandlers,
    mobileViewportRef,
    toggleIndicator,
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

  const fallbackWidth = typeof window !== "undefined" ? window.innerWidth : 0;
  const effectivePaneWidth = paneWidth || fallbackWidth;
  const baseOffset = activePanel === "lyrics" ? -effectivePaneWidth : 0;
  const mobileTranslate = baseOffset + dragOffsetX;

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

      {/* Top Bar - Hidden in lyrics mode and fullscreen */}
      {viewMode !== 'lyrics' && !isFullscreen && (
        <TopBar
          lyricsFontSize={lyricsFontSize}
          onLyricsFontSizeChange={setLyricsFontSize}
          onImportUrl={handleImportUrl}
          onSearchClick={handleOpenSearch}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          currentSong={currentSong ? {
            title: currentSong.title,
            artist: currentSong.artist,
            coverUrl: currentSong.coverUrl,
          } : null}
          isPlaying={playState === PlayState.PLAYING}
          audioElement={audioRef.current}
        />
      )}

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

      {/* Main Content Split */}
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
      ) : isMobileLayout ? (
        <div className="flex-1 relative w-full h-full">
          <div
            ref={mobileViewportRef}
            className="w-full h-full overflow-hidden"
            {...swipeHandlers}
          >
            <div
              className={`flex h-full ${isDragging ? "transition-none" : "transition-transform duration-300"}`}
              style={{
                width: `${effectivePaneWidth * 2}px`,
                transform: `translateX(${mobileTranslate}px)`,
              }}
            >
              <div
                className="flex-none h-full"
                style={{ width: effectivePaneWidth }}
              >
                <div
                  className={isFullscreen ? "w-full h-full transition-transform duration-300" : "w-full h-full"}
                  style={isFullscreen ? { transform: "scale(1.2)", transformOrigin: "center center" } : undefined}
                >
                  {controlsSection}
                </div>
              </div>
              <div
                className="flex-none h-full"
                style={{ width: effectivePaneWidth }}
              >
                {lyricsSection}
              </div>
            </div>
          </div>
          {hasLoadedSong && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <button
                type="button"
                onClick={toggleIndicator}
                className="relative flex h-4 w-28 items-center justify-center rounded-full bg-white/10 backdrop-blur-2xl border border-white/15 transition-transform duration-200 active:scale-105"
                style={{
                  transform: `translateX(${isDragging ? dragOffsetX * 0.04 : 0}px)`,
                }}
              >
                <span
                  className={`absolute inset-0 rounded-full bg-white/25 backdrop-blur-[30px] transition-opacity duration-200 ${activePanel === "controls" ? "opacity-90" : "opacity-60"
                    }`}
                />
              </button>
            </div>
          )}
        </div>
      ) : (
        // Desktop Layout - Center when not playing, split when playing
        <div className="flex-1 relative w-full h-full overflow-hidden">
          {/* Controls Section - Centered or left side */}
          <div
            className={`absolute inset-0 flex items-center justify-center ${hasEverPlayed ? '' : 'transition-all duration-1000 ease-in-out'
              } ${hasEverPlayed
                ? 'lg:w-1/2 lg:justify-center'
                : 'w-full'
              }`}
            style={{
              willChange: hasEverPlayed ? 'auto' : 'width',
            }}
          >
            <div
              className={isFullscreen ? 'transition-transform duration-300' : ''}
              style={isFullscreen ? { transform: 'scale(1.2)', transformOrigin: 'center center' } : undefined}
            >
              {controlsSection}
            </div>
          </div>

          {/* Lyrics Section - Slides in from right */}
          <div
            className={`absolute inset-y-0 right-0 w-1/2 ${hasEverPlayed ? '' : 'transition-all duration-1000'
              } ${hasEverPlayed
                ? 'translate-x-0 opacity-100'
                : 'translate-x-full opacity-0 pointer-events-none'
              }`}
            style={{
              willChange: hasEverPlayed ? 'auto' : 'transform, opacity',
              transitionTimingFunction: hasEverPlayed ? 'auto' : 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {lyricsSection}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
