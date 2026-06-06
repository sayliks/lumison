import { useCallback, useEffect, useRef, useState } from "react";

import { useMobilePanelSwipe } from "@/hooks/useMobilePanelSwipe";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";
import { PlayState, Song } from "@/types";

type ViewMode = "default" | "lyrics";

interface UseAppViewStateParams {
  currentSong: Song | null;
  playState: PlayState;
  hasLoadedSong: boolean;
  preloadPlaylistPanel: () => void;
  preloadAlbumMode: () => void;
}

export const useAppViewState = ({
  currentSong,
  playState,
  hasLoadedSong,
  preloadPlaylistPanel,
  preloadAlbumMode,
}: UseAppViewStateParams) => {
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [hasOpenedPlaylist, setHasOpenedPlaylist] = useState(false);
  const [showVolumePopup, setShowVolumePopup] = useState(false);
  const [showSettingsPopup, setShowSettingsPopup] = useState(false);
  const [lyricsFontSize, setLyricsFontSize] = useState(42);
  const [viewMode, setViewMode] = useState<ViewMode>("default");
  const [hasEnteredLyricsMode, setHasEnteredLyricsMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasEverPlayed, setHasEverPlayed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const hasPrefetchedLazyChunksRef = useRef(false);
  const mobileViewportRef = useRef<HTMLDivElement>(null);

  const { isMobileLayout, viewportWidth: paneWidth } = useResponsiveLayout({
    mobileBreakpoint: 1024,
    initialIsMobile: false,
  });

  const {
    activePanel,
    setActivePanel,
    dragOffsetX,
    isDragging,
    handlers: swipeHandlers,
  } = useMobilePanelSwipe({
    enabled: isMobileLayout,
  });

  useEffect(() => {
    const seen = localStorage.getItem("lumison-onboarding-seen");
    setHasSeenOnboarding(seen === "true");
  }, []);

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false);

    if (!hasSeenOnboarding) {
      localStorage.setItem("lumison-onboarding-seen", "true");
    }
  }, [hasSeenOnboarding]);

  const handleOpenPlaylist = useCallback(() => {
    preloadPlaylistPanel();
    setShowPlaylist(true);
  }, [preloadPlaylistPanel]);

  const handleTogglePlaylist = useCallback(() => {
    preloadPlaylistPanel();
    setShowPlaylist((prev) => !prev);
  }, [preloadPlaylistPanel]);

  const handleViewModeChange = useCallback(
    (mode: ViewMode) => {
      if (mode === "lyrics") {
        preloadAlbumMode();

        if (!document.fullscreenElement) {
          document.documentElement
            .requestFullscreen()
            .catch((err) => console.error("Failed to enter fullscreen:", err));
        }
      } else if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }

      setViewMode(mode);
    },
    [preloadAlbumMode],
  );

  const toggleIndicator = useCallback(() => {
    const next = activePanel === "controls" ? "lyrics" : "controls";
    setActivePanel(next);
  }, [activePanel, setActivePanel]);

  useEffect(() => {
    if (currentSong && (playState === PlayState.PLAYING || hasLoadedSong)) {
      setHasEverPlayed(true);
    }
  }, [playState, currentSong, hasLoadedSong]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const win = window as Window & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    let idleId: number | null = null;
    let timeoutId: number | null = null;

    const runPrefetch = () => {
      if (hasPrefetchedLazyChunksRef.current) {
        return;
      }

      hasPrefetchedLazyChunksRef.current = true;
      preloadPlaylistPanel();
      preloadAlbumMode();
    };

    const onFirstInteraction = () => {
      runPrefetch();
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
    };

    window.addEventListener("pointerdown", onFirstInteraction, { passive: true });
    window.addEventListener("keydown", onFirstInteraction);
    window.addEventListener("touchstart", onFirstInteraction, { passive: true });

    if (typeof win.requestIdleCallback === "function") {
      idleId = win.requestIdleCallback(() => {
        runPrefetch();
      }, { timeout: 3000 });
    } else {
      timeoutId = window.setTimeout(() => {
        runPrefetch();
      }, 1500);
    }

    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);

      if (idleId !== null && typeof win.cancelIdleCallback === "function") {
        win.cancelIdleCallback(idleId);
      }

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [preloadAlbumMode, preloadPlaylistPanel]);

  useEffect(() => {
    if (showPlaylist) {
      setHasOpenedPlaylist(true);
    }
  }, [showPlaylist]);

  useEffect(() => {
    if (viewMode === "lyrics") {
      setHasEnteredLyricsMode(true);
    }
  }, [viewMode]);

  useEffect(() => {
    if (!isMobileLayout) {
      setActivePanel("controls");
    }
  }, [isMobileLayout, setActivePanel]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (event.key === "l" || event.key === "L") {
        event.preventDefault();
        handleViewModeChange(viewMode === "lyrics" ? "default" : "lyrics");
      }

      if (event.key === "Escape" && viewMode === "lyrics") {
        event.preventDefault();

        if (document.fullscreenElement) {
          document.exitFullscreen?.();
        }

        setViewMode("default");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, handleViewModeChange]);

  return {
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
    isFullscreen,
    hasEverPlayed,
    isLoading,
    hasSeenOnboarding,
    setHasSeenOnboarding,
    handleLoadingComplete,
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
  };
};
