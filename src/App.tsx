import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AppView } from "./app/appTypes";
import AppShell from "./app/AppShell";
import { useAppController } from "./app/useAppController";
import { useAppViewState } from "./app/useAppViewState";
import LoadingScreen from "./components/common/LoadingScreen";
import Onboarding from "./components/common/Onboarding";
import SpeedIndicator from "./components/common/SpeedIndicator";
import HomePage from "./components/home/HomePage";
import LibraryPage from "./components/library/LibraryPage";
import Controls from "./components/player/Controls";
import LyricsView from "./components/player/LyricsView";
import MediaSessionController from "./components/player/MediaSessionController";
import PlayerBar from "./components/player/PlayerBar";
import QueuePage from "./components/queue/QueuePage";
import KeyboardShortcuts from "./components/ui/KeyboardShortcuts";
import { useI18n } from "./contexts/I18nContext";
import { usePerformanceOptimization } from "./hooks/usePerformanceOptimization";
import { useOptimizedBackdropFilter, useWebViewOptimization } from "./hooks/useWebViewOptimization";
import { getSupportedAudioFormats } from "./services/utils";
import { keyboardRegistry } from "./services/ui/keyboardRegistry";
import { PlayState } from "./types";

const importPlaylistPanel = () => import("./components/player/PlaylistPanel");
const importAlbumMode = () => import("./components/ui/AlbumMode");

const LazyPlaylistPanel = lazy(importPlaylistPanel);
const LazyAlbumMode = lazy(importAlbumMode);

const LOCAL_FILE_ACCEPT = "audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg,.opus,.wma,.ape,.alac,.aiff,.webm,.lrc,.txt";
const isLocalPlaybackUrl = (url?: string | null) =>
  Boolean(url && (url.startsWith("blob:") || url.startsWith("data:") || url.startsWith("file:")));

const App: React.FC = () => {
  const { t } = useI18n();
  const [activeView, setActiveView] = useState<AppView>("home");
  const shellFileInputRef = useRef<HTMLInputElement>(null);

  usePerformanceOptimization();
  useWebViewOptimization();
  useOptimizedBackdropFilter(true);

  useEffect(() => {
    const formats = getSupportedAudioFormats();
    console.log("Supported Audio Formats:");
    Object.entries(formats).forEach(([format, supported]) => {
      console.log(`   ${supported ? "[OK]" : "[NO]"} ${format.toUpperCase()}`);
    });
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

  const preloadAlbumMode = useCallback(() => {
    void importAlbumMode();
  }, []);

  const {
    showPlaylist,
    setShowPlaylist,
    hasOpenedPlaylist,
    showVolumePopup,
    setShowVolumePopup,
    showSettingsPopup,
    setShowSettingsPopup,
    lyricsFontSize,
    setLyricsFontSize,
    viewMode,
    setViewMode,
    hasEnteredLyricsMode,
    hasEverPlayed,
    isLoading,
    hasSeenOnboarding,
    setHasSeenOnboarding,
    handleLoadingComplete,
    handleOpenPlaylist,
    handleTogglePlaylist,
    handleViewModeChange,
  } = useAppViewState({
    currentSong,
    playState,
    hasLoadedSong,
    preloadPlaylistPanel,
    preloadAlbumMode,
  });

  const handleOpenLocalImport = useCallback(() => {
    shellFileInputRef.current?.click();
  }, []);

  const handleShellFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        handleFileChange(event.target.files);
      }
      event.target.value = "";
    },
    [handleFileChange],
  );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => keyboardRegistry.handle(event);
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const controlsSection = useMemo(() => {
    if (!hasLoadedSong) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-2xl font-semibold tracking-tight text-white/90">{t("player.welcomeTitle")}</p>
            <p className="text-sm text-white/40">{t("player.selectSong")}</p>
          </div>
          <button
            type="button"
            onClick={handleOpenLocalImport}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-5 py-2.5 text-sm font-medium text-white/90 backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H5a2 2 0 0 0-2 2z" />
            </svg>
            {t("playlist.importLocal")}
          </button>
        </div>
      );
    }

    return (
      <div className={`relative z-30 flex h-full w-full flex-col items-center justify-center ${hasEverPlayed ? "pt-0" : "pt-32"}`}>
        <div className="relative flex w-full max-w-[520px] flex-col items-center gap-8 px-4">
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

          {(hasOpenedPlaylist || showPlaylist) && (
            <Suspense fallback={null}>
              <LazyPlaylistPanel
                isOpen={showPlaylist}
                onClose={() => setShowPlaylist(false)}
                queue={playlist.queue}
                currentSongId={currentSong?.id}
                onPlay={playIndex}
                onRemove={playlist.removeSongs}
                accentColor={accentColor}
                onFilesSelected={handleFileChange}
              />
            </Suspense>
          )}
        </div>
      </div>
    );
  }, [
    accentColor,
    audioRef,
    currentSong?.album,
    currentSong?.artist,
    currentSong?.blurhash,
    currentSong?.coverUrl,
    currentSong?.id,
    currentSong?.title,
    currentTime,
    duration,
    handleFileChange,
    handleOpenLocalImport,
    handleOpenPlaylist,
    handleSeek,
    handleSpeedChange,
    hasEverPlayed,
    hasLoadedSong,
    hasOpenedPlaylist,
    isBuffering,
    playIndex,
    playMode,
    playNext,
    playPrev,
    playState,
    player.preservesPitch,
    player.speed,
    player.togglePreservesPitch,
    playlist.queue,
    playlist.removeSongs,
    setShowPlaylist,
    setShowSettingsPopup,
    setShowVolumePopup,
    setVolume,
    showPlaylist,
    showSettingsPopup,
    showVolumePopup,
    t,
    toggleMode,
    togglePlay,
    volume,
  ]);

  const lyricsVersion = currentSong?.lyrics ? currentSong.lyrics.length : 0;
  const lyricsKey = currentSong ? `${currentSong.id}-${lyricsVersion}` : "no-song";

  const lyricsSection = useMemo(() => {
    if (!hasLoadedSong) {
      return null;
    }

    return (
      <div className="relative z-20 flex h-full w-full flex-col justify-center px-4 lg:pl-4">
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
  }, [
    accentColor,
    audioRef,
    currentSong?.lyrics,
    currentTime,
    handleSeek,
    hasLoadedSong,
    lyricsFontSize,
    lyricsKey,
    matchStatus,
    playState,
  ]);

  const handleOpenQueueView = useCallback(() => {
    setActiveView("queue");
  }, []);

  const handleOpenLyricsView = useCallback(() => {
    setActiveView("lyrics");
  }, []);

  const shellLabels = useMemo(
    () => ({
      home: t("home.navHome"),
      library: t("home.navLibrary"),
      queue: t("home.navQueue"),
      lyrics: t("home.navLyrics"),
      import: t("topBar.import"),
      importMusic: t("home.importMusic"),
      playingNext: t("playlist.playingNext"),
      emptyLibrary: t("home.emptyLibrary"),
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
      quickPicks: t("home.quickPicks"),
      importLocal: t("playlist.importLocal"),
      openQueue: t("home.openQueue"),
      lyrics: t("home.navLyrics"),
      sourceLocal: t("playlist.sourceLocal"),
      readyToPlay: t("home.readyToPlay"),
      emptyQuickPicks: t("home.emptyQuickPicks"),
      nowPlaying: t("home.nowPlaying"),
      ready: t("home.ready"),
    }),
    [t],
  );

  const queueLabels = useMemo(
    () => ({
      title: t("playlist.title"),
      empty: t("playlist.empty"),
      addSongs: t("playlist.addSongs"),
      importLocal: t("playlist.importLocal"),
      remove: t("playlist.remove"),
      sourceLocal: t("playlist.sourceLocal"),
    }),
    [t],
  );

  const libraryLabels = useMemo(
    () => ({
      title: t("home.navLibrary"),
      subtitle: t("home.librarySubtitle"),
      empty: t("home.libraryEmpty"),
      importLocal: t("playlist.importLocal"),
      sourceLocal: t("playlist.sourceLocal"),
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
          onFilesSelected={handleFileChange}
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
        onOpenQueue={handleOpenQueueView}
        onOpenLyrics={handleOpenLyricsView}
        onFilesSelected={handleFileChange}
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
    homeLabels,
    libraryLabels,
    lyricsSection,
    playIndex,
    playState,
    playlist.queue,
    playlist.removeSongs,
    queueLabels,
    t,
  ]);

  if (isLoading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  if (!hasSeenOnboarding) {
    return <Onboarding onComplete={() => setHasSeenOnboarding(true)} />;
  }

  const audioSrc = isLocalPlaybackUrl(resolvedAudioSrc)
    ? resolvedAudioSrc
    : isLocalPlaybackUrl(currentSong?.fileUrl)
      ? currentSong?.fileUrl
      : undefined;

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-black theme-transition">
      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnded}
        crossOrigin="anonymous"
      />

      <input
        ref={shellFileInputRef}
        type="file"
        accept={LOCAL_FILE_ACCEPT}
        multiple
        className="hidden"
        onChange={handleShellFileChange}
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

      {viewMode === "lyrics" ? (
        <div className="h-full w-full flex-1">
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
                  setViewMode("default");
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
          onImportClick={handleOpenLocalImport}
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
