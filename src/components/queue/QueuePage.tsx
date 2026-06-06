import React, { useRef } from "react";

import { CloudDownloadIcon, LinkIcon, PlayIcon, SearchIcon, TrashIcon } from "@/components/common/Icons";
import SmartImage from "@/components/common/SmartImage";
import { Song } from "@/types";
import { formatTime } from "@/services/utils";

interface QueuePageProps {
  queue: Song[];
  currentSongId?: string;
  onPlay: (index: number) => void;
  onRemove: (ids: string[]) => void;
  onFilesSelected: (files: FileList) => void;
  onImportClick: () => void;
  onSearchClick: () => void;
  labels: {
    title: string;
    empty: string;
    addSongs: string;
    importLocal: string;
    importUrl: string;
    search: string;
    remove: string;
    sourceLocal: string;
    sourceNetease: string;
    sourceArchive: string;
    sourceKugou: string;
    sourceUrl: string;
  };
}

const getSourceLabel = (song: Song, labels: QueuePageProps["labels"]) => {
  if (song.isNetease) return labels.sourceNetease;
  if (song.audioStreamSource === "internet-archive") return labels.sourceArchive;
  if (song.audioStreamSource === "kugou") return labels.sourceKugou;
  if (song.fileUrl?.startsWith("blob:")) return labels.sourceLocal;
  return labels.sourceUrl;
};

const QueuePage: React.FC<QueuePageProps> = ({
  queue,
  currentSongId,
  onPlay,
  onRemove,
  onFilesSelected,
  onImportClick,
  onSearchClick,
  labels,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mx-auto w-full max-w-[1220px] pb-10 pt-6">
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

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-normal text-white/52">{labels.addSongs}</p>
          <h1 className="text-[40px] font-extrabold leading-none text-white">{labels.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-10 items-center gap-2 rounded-lg bg-white/[0.12] px-4 text-sm font-bold text-white/82 hover:bg-white/[0.18]"
          >
            <CloudDownloadIcon className="h-4 w-4" />
            {labels.importLocal}
          </button>
          <button
            type="button"
            onClick={onImportClick}
            className="flex h-10 items-center gap-2 rounded-lg bg-white/[0.12] px-4 text-sm font-bold text-white/82 hover:bg-white/[0.18]"
          >
            <LinkIcon className="h-4 w-4" />
            {labels.importUrl}
          </button>
          <button
            type="button"
            onClick={onSearchClick}
            className="flex h-10 items-center gap-2 rounded-lg bg-white/[0.12] px-4 text-sm font-bold text-white/82 hover:bg-white/[0.18]"
          >
            <SearchIcon className="h-4 w-4" />
            {labels.search}
          </button>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="flex h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-white/12 bg-white/[0.04] text-center">
          <p className="mb-2 text-lg font-bold text-white/82">{labels.empty}</p>
          <p className="text-sm font-semibold text-white/45">{labels.addSongs}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
          {queue.map((song, index) => {
            const isCurrent = currentSongId === song.id;
            return (
              <div
                key={`${song.id}-${index}`}
                className={`grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/8 px-4 py-3 last:border-b-0 ${
                  isCurrent ? "bg-white/[0.09]" : "hover:bg-white/[0.05]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onPlay(index)}
                  className="grid h-9 w-9 place-items-center rounded-md text-white/62 hover:bg-white/10 hover:text-white"
                  aria-label={song.title}
                >
                  <PlayIcon className="h-4 w-4" />
                </button>
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-white/[0.08]">
                    {song.coverUrl ? (
                      <SmartImage src={song.coverUrl} alt={song.title} imgClassName="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-xs font-black text-white/42">L</div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-white">{song.title}</div>
                    <div className="truncate text-xs font-semibold text-white/48">
                      {song.artist}
                      {song.album ? ` - ${song.album}` : ""}
                      {` - ${getSourceLabel(song, labels)}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs font-semibold text-white/42 sm:block">
                    {song.duration ? formatTime(song.duration / 1000) : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove([song.id])}
                    className="grid h-9 w-9 place-items-center rounded-md text-white/46 hover:bg-white/10 hover:text-white"
                    aria-label={labels.remove}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default QueuePage;
