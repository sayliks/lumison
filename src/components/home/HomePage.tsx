import React, { useMemo, useRef } from "react";

import seasonOne from "../../../images/img1.png";
import seasonTwo from "../../../images/img2.png";
import { CloudDownloadIcon, LinkIcon, PlayIcon, QueueIcon, SearchIcon, WaveformIcon } from "@/components/common/Icons";
import SmartImage from "@/components/common/SmartImage";
import { Song } from "@/types";
import { formatTime } from "@/services/utils";

interface HomePageProps {
  queue: Song[];
  currentSong?: Song | null;
  currentSongId?: string;
  isPlaying: boolean;
  onPlayIndex: (index: number) => void;
  onOpenSearch: () => void;
  onOpenImportDialog: () => void;
  onOpenQueue: () => void;
  onOpenLyrics: () => void;
  onFilesSelected: (files: FileList) => void;
  onSearchPreset: (query: string) => void;
  labels: {
    moods: string[];
    quickPicks: string;
    tunesForSeason: string;
    summer: string;
    exploreSources: string;
    importLocal: string;
    importUrl: string;
    searchOnline: string;
    openQueue: string;
    lyrics: string;
    noMusic: string;
    selectSong: string;
    sourceLocal: string;
    sourceNetease: string;
    sourceArchive: string;
    sourceKugou: string;
    sourceUrl: string;
    readyToPlay: string;
    emptyQuickPicks: string;
    nowPlaying: string;
    ready: string;
    shelfSummerParty: string;
    shelfKPop: string;
    shelfJPop: string;
    shelfArchive: string;
    shelfNetease: string;
    shelfKugou: string;
    shelfAlbums: string;
  };
}

interface ActionPick {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}

const getSongSourceLabel = (song: Song, labels: HomePageProps["labels"]) => {
  if (song.isNetease) return labels.sourceNetease;
  if (song.audioStreamSource === "internet-archive") return labels.sourceArchive;
  if (song.audioStreamSource === "kugou") return labels.sourceKugou;
  if (song.fileUrl?.startsWith("blob:")) return labels.sourceLocal;
  return labels.sourceUrl;
};

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
  onOpenSearch,
  onOpenImportDialog,
  onOpenQueue,
  onOpenLyrics,
  onFilesSelected,
  onSearchPreset,
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
      id: "search",
      title: labels.searchOnline,
      description: labels.emptyQuickPicks,
      icon: <SearchIcon className="h-5 w-5" />,
      onClick: onOpenSearch,
    },
    {
      id: "import-url",
      title: labels.importUrl,
      description: labels.readyToPlay,
      icon: <LinkIcon className="h-5 w-5" />,
      onClick: onOpenImportDialog,
    },
    {
      id: "queue",
      title: labels.openQueue,
      description: labels.emptyQuickPicks,
      icon: <QueueIcon className="h-5 w-5" />,
      onClick: onOpenQueue,
    },
  ];

  const shelves = [
    {
      title: labels.shelfSummerParty,
      query: "summer party",
      image: seasonOne,
      tone: "from-cyan-500/40 to-blue-950",
    },
    {
      title: labels.shelfKPop,
      query: "k-pop party hits",
      image: seasonTwo,
      tone: "from-pink-500/35 to-purple-950",
    },
    {
      title: labels.shelfJPop,
      query: "j-pop summer",
      image: seasonOne,
      tone: "from-rose-500/35 to-black",
    },
    {
      title: labels.shelfArchive,
      query: "live music archive",
      image: seasonTwo,
      tone: "from-emerald-500/30 to-slate-950",
    },
  ];

  const sources = [
    { title: labels.shelfNetease, query: "netease" },
    { title: labels.shelfKugou, query: "kugou" },
    { title: labels.shelfArchive, query: "internet archive music" },
    { title: labels.shelfAlbums, query: "album" },
  ];

  return (
    <div className="mx-auto w-full max-w-[1540px] pb-10">
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            onFilesSelected(event.target.files);
          }
          event.target.value = "";
        }}
      />

      <div className="mb-14 flex gap-3 overflow-x-auto pb-2 pt-7">
        {labels.moods.map((mood) => (
          <button
            key={mood}
            type="button"
            onClick={() => onSearchPreset(mood)}
            className="h-10 shrink-0 rounded-lg bg-white/[0.12] px-4 text-sm font-bold text-white/88 transition-colors duration-200 hover:bg-white/[0.18]"
          >
            {mood}
          </button>
        ))}
      </div>

      <section className="mb-20">
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
          <div className="grid gap-x-12 gap-y-3 xl:grid-cols-3 md:grid-cols-2">
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
                      {` - ${getSongSourceLabel(song, labels)}`}
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
          <div className="grid gap-x-12 gap-y-3 xl:grid-cols-3 md:grid-cols-2">
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

      <section className="mb-16">
        <div className="mb-5">
          <p className="mb-1 text-sm font-bold uppercase tracking-normal text-white/58">{labels.tunesForSeason}</p>
          <h2 className="text-[38px] font-extrabold leading-none tracking-normal text-white">{labels.summer}</h2>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-3">
          {shelves.map((tile) => (
            <button
              key={tile.title}
              type="button"
              onClick={() => onSearchPreset(tile.query)}
              className="relative h-[218px] w-[260px] shrink-0 overflow-hidden rounded-lg text-left shadow-[0_16px_38px_rgba(0,0,0,0.36)]"
            >
              <img src={tile.image} alt="" className="h-full w-full object-cover" />
              <div className={`absolute inset-0 bg-gradient-to-br ${tile.tone}`} />
              <div className="absolute inset-0 bg-black/18" />
              <div className="absolute inset-x-5 bottom-5 text-[28px] font-extrabold leading-[0.95] text-white drop-shadow">
                {tile.title}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-5 text-2xl font-extrabold text-white">{labels.exploreSources}</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {sources.map((source, index) => (
            <button
              key={source.title}
              type="button"
              onClick={() => onSearchPreset(source.query)}
              className={`h-[118px] overflow-hidden rounded-lg bg-gradient-to-br ${createFallbackTone(index + 2)} p-5 text-left shadow-[0_16px_38px_rgba(0,0,0,0.28)] transition-transform duration-200 hover:-translate-y-1`}
            >
              <div className="mb-6 grid h-8 w-8 place-items-center rounded-md bg-white/18">
                <SearchIcon className="h-4 w-4 text-white" />
              </div>
              <div className="text-xl font-extrabold leading-tight text-white">{source.title}</div>
            </button>
          ))}
        </div>
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
