import { useCallback, useEffect, useRef, useState } from "react";

import { useOptimizedAudio } from "@/hooks/usePerformanceOptimization";
import { usePlayer } from "@/hooks/usePlayer";
import { usePlaylist } from "@/hooks/usePlaylist";

export const useAppController = () => {
  const playlist = usePlaylist();
  const player = usePlayer({
    queue: playlist.queue,
    originalQueue: playlist.originalQueue,
    updateSongInQueue: playlist.updateSongInQueue,
    setQueue: playlist.setQueue,
    setOriginalQueue: playlist.setOriginalQueue,
  });

  const {
    audioRef,
    currentSong,
    handlePlaylistAddition,
    setSpeed,
  } = player;

  const [volume, setVolume] = useState(1);
  const [showSpeedIndicator, setShowSpeedIndicator] = useState(false);
  const speedIndicatorTimerRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (playlist.isRestored) {
      return;
    }

    playlist.loadPersistedState().then((state) => {
      if (cancelled || !state) {
        return;
      }

      playlist.applyRestoredState(state);
      player.setCurrentIndex(state.currentIndex);
      player.setPlayMode(state.playMode);
    });

    return () => {
      cancelled = true;
    };
  }, [
    playlist.isRestored,
    playlist.loadPersistedState,
    playlist.applyRestoredState,
    player.setCurrentIndex,
    player.setPlayMode,
  ]);

  useOptimizedAudio(audioRef);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume, audioRef]);

  useEffect(() => {
    return () => {
      if (speedIndicatorTimerRef.current) {
        window.clearTimeout(speedIndicatorTimerRef.current);
      }
    };
  }, []);

  const hasLoadedSong = Boolean(currentSong) || playlist.queue.length > 0;

  const handleSpeedChange = useCallback(
    (newSpeed: number) => {
      setSpeed(newSpeed);
      setShowSpeedIndicator(true);

      if (speedIndicatorTimerRef.current) {
        window.clearTimeout(speedIndicatorTimerRef.current);
      }

      speedIndicatorTimerRef.current = window.setTimeout(() => {
        setShowSpeedIndicator(false);
      }, 1500);
    },
    [setSpeed],
  );

  const handleFileChange = useCallback(
    async (files: FileList) => {
      const wasEmpty = playlist.queue.length === 0;
      const addedSongs = await playlist.addLocalFiles(files);

      if (addedSongs.length > 0) {
        setTimeout(() => {
          handlePlaylistAddition(addedSongs, wasEmpty);
        }, 0);
      }
    },
    [playlist.queue.length, playlist.addLocalFiles, handlePlaylistAddition],
  );

  return {
    playlist,
    player,
    hasLoadedSong,
    volume,
    setVolume,
    showSpeedIndicator,
    handleSpeedChange,
    handleFileChange,
  };
};
