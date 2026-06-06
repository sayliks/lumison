import React, { useMemo, useRef } from "react";

import { CloudDownloadIcon, PlayIcon, QueueIcon, WaveformIcon } from "@/components/common/Icons";
import SmartImage from "@/components/common/SmartImage";
import { formatTime } from "@/services/utils";
import { Song } from "@/types";

interface HomePageProps {
  queue: Song[];
  currentSong?: Song | null;
  currentSongId?: string;
  isPlaying: boolean;
  onPlayIndex: (index: number) => void;
  onOpenQueue: () => void;
  onOpenLyrics: () => void;
  onFilesSelected: (files: FileList) => void;
  labels: {
    quickPicks: string;
    importLocal: string;
    openQueue: string;
    lyrics: string;
    sourceLocal: string;
    readyToPlay: string;
    emptyQuickPicks: string;
    nowPlaying: string;
    ready: string;
  };
}

interface ActionPick {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const createFallbackTone = (index: number) => {
  const tones = [
    "from-[#13a7c0] via-[#305a78] to-[#101318]",
    "from-[#e24d8e] via-[#8751a9] to-[#181018]",
    "from-[#f4c84b] via-[#ca6348] to-[#101010]",
    "from-[#6bd98f] via-[#25847d] to-[#0d1717]",
    "from-[#a58cff] via-[#5b71ce] to-[#10131f]",
    "from-[#f26666] via-[#825254] to-[#151010]",
  ];
  return tones[index % tones.length];
};

const HomePage: React.FC<HomePageProps> = ({
  queue,
  currentSong,
  currentSongId,
  isPlaying,
  onPlayIndex,
  onOpenQueue,
  onOpenLyrics,
  onFilesSelected,
  labels,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeSong = currentSong || queue[0] || null;

  const quickPickSongs = useMemo(() => {
    if (queue.length === 0) return [];
    const currentIndex = currentSongId ? queue.findIndex((song) => song.id === currentSongId) : -1;
    const ordered = currentIndex > 0
      ? [queue[currentIndex], ...queue.slice(0, currentIndex), ...queue.slice(currentIndex + 1)]
      : queue;
    return ordered.slice(0, 12);
  }, [currentSongId, queue]);

  const actionPicks: ActionPick[] = [
    {
      id: "import-local",
      title: labels.importLocal,
      description: labels.readyToPlay,
      icon: <CloudDownloadIcon className="h-5 w-5" />,
      onClick: () => fileInputRef.current?.click(),
    },
    {
      id: "queue",
      title: labels.openQueue,
      description: labels.emptyQuickPicks,
      icon: <QueueIcon className="h-5 w-5" />,
      onClick: onOpenQueue,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1540px] pb-10">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg,.opus,.wma,.ape,.alac,.aiff,.webm"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            onFilesSelected(event.target.files);
          }
          event.target.value = "";
        }}
      />

      <section className="mb-20 pt-8">
        <div className="mb-6 flex items-center gap-5">
          <div className="h-[62px] w-[62px] overflow-hidden rounded-full bg-white/[0.08]">
            {activeSong?.coverUrl ? (
              <SmartImage src={activeSong.coverUrl} alt={activeSong.title} imgClassName="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-red-500 to-fuchsia-500 text-2xl font-black text-white">
                L
              </div>
            )}
          </div>
          <h1 className="text-[42px] font-extrabold leading-none tracking-normal text-white md:text-[48px]">
            {labels.quickPicks}
          </h1>
        </div>

        {quickPickSongs.length > 0 ? (
          <div className="grid gap-x-12 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
            {quickPickSongs.map((song, visualIndex) => {
              const queueIndex = queue.findIndex((item) => item.id === song.id);
              const isCurrent = currentSongId === song.id;
              return (
                <button
                  key={`${song.id}-${visualIndex}`}
                  type="button"
                  onClick={() => queueIndex >= 0 && onPlayIndex(queueIndex)}
                  className={`group flex min-w-0 items-center gap-4 rounded-lg p-2 text-left transition-colors duration-200 ${
                    isCurrent ? "bg-white/[0.11]" : "hover:bg-white/[0.07]"
                  }`}
                >
                  <div className={`relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-md bg-gradient-to-br ${createFallbackTone(visualIndex)}`}>
                    {song.coverUrl && (
                      <SmartImage src={song.coverUrl} alt={song.title} imgClassName="h-full w-full object-cover" />
                    )}
                    <span className="absolute inset-0 grid place-items-center bg-black/35 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <PlayIcon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[16px] font-extrabold text-white">{song.title}</div>
                    <div className="truncate text-[15px] font-semibold text-white/58">
                      {song.artist}
                      {song.album ? ` - ${song.album}` : ""}
                      {song.duration ? ` - ${formatTime(song.duration / 1000)}` : ""}
                      {` - ${labels.sourceLocal}`}
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="ml-auto shrink-0 text-xs font-bold text-white/58">
                      {isPlaying ? labels.nowPlaying : labels.ready}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-x-12 gap-y-3 md:grid-cols-2 xl:grid-cols-3">
            {actionPicks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={item.onClick}
                className="group flex min-w-0 items-center gap-4 rounded-lg p-2 text-left transition-colors duration-200 hover:bg-white/[0.07]"
              >
                <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-md bg-white/[0.12] text-white/78 group-hover:text-white">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-[16px] font-extrabold text-white">{item.title}</div>
                  <div className="truncate text-[15px] font-semibold text-white/58">{item.description}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {activeSong && (
        <button
          type="button"
          onClick={onOpenLyrics}
          className="fixed bottom-[154px] right-5 z-20 grid h-12 w-12 place-items-center rounded-full bg-white text-black shadow-2xl transition-transform duration-200 hover:scale-105 lg:hidden"
          aria-label={labels.lyrics}
        >
          <WaveformIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default HomePage;
