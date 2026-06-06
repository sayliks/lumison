import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useToast } from "@/hooks/useToast";
import { useOptimizedAudio } from "@/hooks/usePerformanceOptimization";
import { usePlayer } from "@/hooks/usePlayer";
import { usePlaylist } from "@/hooks/usePlaylist";
import { Song } from "@/types";
import { buildSongLookupIndexMap, getSongLookupKey } from "@/utils/songLookup";

export const useAppController = () => {
  const { toast } = useToast();
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
    playIndex,
    addSongAndPlay,
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

  const queueLookupIndexMap = useMemo(
    () => buildSongLookupIndexMap(playlist.queue),
    [playlist.queue],
  );
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

  const handleImportUrl = useCallback(
    async (input: string): Promise<boolean> => {
      const trimmed = input.trim();

      if (!trimmed) {
        return false;
      }

      const wasEmpty = playlist.queue.length === 0;
      const result = await playlist.importFromUrl(trimmed);

      if (!result.success) {
        toast.error(result.message ?? "Failed to load songs from URL");
        return false;
      }

      if (result.songs.length > 0) {
        setTimeout(() => {
          handlePlaylistAddition(result.songs, wasEmpty);
        }, 0);
        toast.success(`Successfully imported ${result.songs.length} songs`);
        return true;
      }

      return false;
    },
    [
      playlist.queue.length,
      playlist.importFromUrl,
      handlePlaylistAddition,
      toast,
    ],
  );

  const handleImportAndPlay = useCallback(
    (song: Song) => {
      const existingIndex = queueLookupIndexMap.get(getSongLookupKey(song)) ?? -1;

      if (existingIndex !== -1) {
        playIndex(existingIndex);
      } else {
        addSongAndPlay(song);
      }
    },
    [queueLookupIndexMap, playIndex, addSongAndPlay],
  );

  const handleAddToQueue = useCallback(
    (song: Song) => {
      console.log("[App] handleAddToQueue called", {
        songId: song.id,
        title: song.title,
        isNetease: song.isNetease,
        neteaseId: song.neteaseId,
        needsLyricsMatch: song.needsLyricsMatch,
        lyricsLength: song.lyrics?.length,
      });

      if (queueLookupIndexMap.has(getSongLookupKey(song))) {
        console.log("[App] Song already in queue, skipping");
        return;
      }

      playlist.setQueue((prev) => [...prev, song]);
      playlist.setOriginalQueue((prev) => [...prev, song]);
      console.log("[App] Song added to queue successfully");
    },
    [queueLookupIndexMap, playlist.setQueue, playlist.setOriginalQueue],
  );

  return {
    playlist,
    player,
    queueLookupIndexMap,
    hasLoadedSong,
    volume,
    setVolume,
    showSpeedIndicator,
    handleSpeedChange,
    handleFileChange,
    handleImportUrl,
    handleImportAndPlay,
    handleAddToQueue,
  };
};
