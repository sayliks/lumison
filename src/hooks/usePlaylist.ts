import { useCallback, useState, useEffect, useRef } from "react";
import { Song, PlayMode } from "../types";
import { LyricLine } from "../services/lyrics/types";
import { extractCoverData } from "../services/utils";
import { audioResourceCache } from "../services/cache";
import {
  extractAudioTagData,
  findMatchingLRCFile,
  loadLRCFile,
} from "../services/lyrics/id3Parser";
import {
  saveQueueToPersistence,
  loadQueueFromPersistence,
} from "../services/cache/queuePersistence";

interface RestoredQueueState {
  queue: Song[];
  originalQueue: Song[];
  currentIndex: number;
  playMode: PlayMode;
  currentTime: number;
}

export const usePlaylist = () => {
  const [queue, setQueue] = useState<Song[]>([]);
  const [originalQueue, setOriginalQueue] = useState<Song[]>([]);
  const [isRestored, setIsRestored] = useState(false);
  
  const currentIndexRef = useRef(-1);
  const playModeRef = useRef(PlayMode.LOOP_ALL);
  const currentTimeRef = useRef(0);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);

  const loadPersistedState = useCallback(async (): Promise<RestoredQueueState | null> => {
    const state = await loadQueueFromPersistence();
    if (!state || state.queue.length === 0) {
      return null;
    }

    console.log(
      `[Playlist] Skipped ${state.queue.length} persisted song(s) in local-only mode - re-import local files to play them`,
    );
    return null;
  }, []);

  const applyRestoredState = useCallback((state: RestoredQueueState) => {
    setQueue(state.queue);
    setOriginalQueue(state.originalQueue);
    currentIndexRef.current = state.currentIndex;
    playModeRef.current = state.playMode;
    currentTimeRef.current = state.currentTime;
    setIsRestored(true);
  }, []);

  const updateSongInQueue = useCallback(
    (id: string, updates: Partial<Song>) => {
      setQueue((prev) =>
        prev.map((song) => (song.id === id ? { ...song, ...updates } : song)),
      );
      setOriginalQueue((prev) =>
        prev.map((song) => (song.id === id ? { ...song, ...updates } : song)),
      );
    },
    [],
  );

  const appendSongs = useCallback((songs: Song[]) => {
    if (songs.length === 0) return;
    setOriginalQueue((prev) => [...prev, ...songs]);
    setQueue((prev) => [...prev, ...songs]);
  }, []);

  const removeSongs = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    const idSet = new Set(ids);

    setQueue((prev) => {
      prev.forEach((song) => {
        if (idSet.has(song.id) && song.fileUrl && !song.fileUrl.startsWith("blob:")) {
          audioResourceCache.delete(song.fileUrl);
        }
      });
      return prev.filter((song) => !idSet.has(song.id));
    });
    setOriginalQueue((prev) => prev.filter((song) => !idSet.has(song.id)));
  }, []);

  const addLocalFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileList =
        files instanceof FileList ? Array.from(files) : Array.from(files);

      const audioFiles: File[] = [];
      const lyricsFiles: File[] = [];

      fileList.forEach((file) => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "lrc" || ext === "txt") {
          lyricsFiles.push(file);
          return;
        }

        audioFiles.push(file);
      });

      const newSongs: Song[] = [];

      // 并行处理所有音频文件（优化性能）
      const processingPromises = audioFiles.map(async (file) => {
        const url = URL.createObjectURL(file);
        const basename = file.name.replace(/\.[^/.]+$/, "");
        let title = basename;
        let artist = "Unknown Artist";
        let coverUrl: string | undefined;
        let blurhash: string | null | undefined;
        let embeddedLyrics: LyricLine[] = [];
        let sidecarLyrics: LyricLine[] = [];

        const nameParts = title.split("-");
        if (nameParts.length > 1) {
          artist = nameParts[0].trim();
          title = nameParts[1].trim();
        }

        try {
          const [tagData, matchingLyricsFile] = await Promise.all([
            extractAudioTagData(file),
            Promise.resolve(findMatchingLRCFile(file, lyricsFiles)),
          ]);

          // 处理元数据
          if (tagData.title) title = tagData.title;
          if (tagData.artist) artist = tagData.artist;
          if (tagData.picture) {
            coverUrl = tagData.picture;
            const coverData = await extractCoverData(coverUrl);
            blurhash = coverData.blurhash;
          }

          if (tagData.lyrics.length > 0) {
            embeddedLyrics = tagData.lyrics;
            console.log(`✓ Found ${tagData.source} embedded lyrics for: ${title}`);
          }

          if (matchingLyricsFile) {
            sidecarLyrics = await loadLRCFile(matchingLyricsFile);
            if (sidecarLyrics.length > 0) {
              console.log(`✓ Found local lyrics file for: ${title}`);
            }
          }

          let initialLyrics: LyricLine[] = [];

          if (embeddedLyrics.length > 0) {
            initialLyrics = embeddedLyrics;
            console.log(`Using embedded lyrics for: ${title}`);
          } else if (sidecarLyrics.length > 0) {
            initialLyrics = sidecarLyrics;
            console.log(`Using local lyrics file for: ${title}`);
          } else {
            initialLyrics = [];
            console.log(`No local lyrics found for: ${title}`);
          }

          const localLyrics =
            embeddedLyrics.length > 0
              ? embeddedLyrics
              : sidecarLyrics.length > 0
                ? sidecarLyrics
                : undefined;

          return {
            id: `local-${file.name}-${file.size}-${file.lastModified}`,
            title,
            artist,
            fileUrl: url,
            coverUrl,
            blurhash,
            lyrics: initialLyrics,
            needsLyricsMatch: false,
            localLyrics,
          };
        } catch (err) {
          console.warn(`Failed to process: ${file.name}`, err);

          return {
            id: `local-${file.name}-${file.size}-${file.lastModified}`,
            title,
            artist,
            fileUrl: url,
            coverUrl,
            blurhash,
            lyrics: [],
            needsLyricsMatch: false,
          };
        }
      });

      // 等待所有文件处理完成
      const processedSongs = await Promise.all(processingPromises);
      newSongs.push(...processedSongs);

      appendSongs(newSongs);
      return newSongs;
    },
    [appendSongs],
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveQueueToPersistence(
        queue,
        originalQueue,
        currentIndexRef.current,
        playModeRef.current,
        currentTimeRef.current
      );
    }, 1000);
  }, [queue, originalQueue]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    queue,
    originalQueue,
    isRestored,
    updateSongInQueue,
    removeSongs,
    addLocalFiles,
    setQueue,
    setOriginalQueue,
    loadPersistedState,
    applyRestoredState,
    setCurrentIndex: (index: number) => { currentIndexRef.current = index; },
    setPlayMode: (mode: PlayMode) => { playModeRef.current = mode; },
    setCurrentTime: (time: number) => { currentTimeRef.current = time; },
  };
};
