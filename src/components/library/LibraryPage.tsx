import React, { useMemo, useRef } from "react";

import { CloudDownloadIcon, PlayIcon } from "@/components/common/Icons";
import SmartImage from "@/components/common/SmartImage";
import { Song } from "@/types";

interface LibraryPageProps {
  queue: Song[];
  currentSongId?: string;
  onPlay: (index: number) => void;
  onFilesSelected: (files: FileList) => void;
  labels: {
    title: string;
    subtitle: string;
    empty: string;
    importLocal: string;
    sourceLocal: string;
  };
}

const LibraryPage: React.FC<LibraryPageProps> = ({
  queue,
  currentSongId,
  onPlay,
  onFilesSelected,
  labels,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const grouped = useMemo(() => {
    if (queue.length === 0) return [];
    return [[labels.sourceLocal, queue.map((song, index) => ({ song, index }))] as const];
  }, [labels.sourceLocal, queue]);

  return (
    <div className="mx-auto w-full max-w-[1220px] pb-10 pt-6">
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

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-normal text-white/52">{labels.subtitle}</p>
          <h1 className="text-[40px] font-extrabold leading-none text-white">{labels.title}</h1>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-10 w-fit items-center gap-2 rounded-lg bg-white/[0.12] px-4 text-sm font-bold text-white/82 hover:bg-white/[0.18]"
        >
          <CloudDownloadIcon className="h-4 w-4" />
          {labels.importLocal}
        </button>
      </div>

      {queue.length === 0 ? (
        <div className="flex h-[360px] flex-col items-center justify-center rounded-lg border border-dashed border-white/12 bg-white/[0.04] text-center">
          <p className="mb-2 text-lg font-bold text-white/82">{labels.empty}</p>
          <p className="text-sm font-semibold text-white/45">{labels.subtitle}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {grouped.map(([source, songs]) => (
            <section key={source}>
              <h2 className="mb-4 text-2xl font-extrabold text-white">{source}</h2>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {songs.map(({ song, index }) => {
                  const isCurrent = currentSongId === song.id;
                  return (
                    <button
                      key={`${song.id}-${index}`}
                      type="button"
                      onClick={() => onPlay(index)}
                      className={`flex min-w-0 items-center gap-3 rounded-lg p-2 text-left transition-colors duration-200 ${
                        isCurrent ? "bg-white/[0.10]" : "hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-white/[0.08]">
                        {song.coverUrl ? (
                          <SmartImage src={song.coverUrl} alt={song.title} imgClassName="h-full w-full object-cover" />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-xs font-black text-white/42">L</div>
                        )}
                        <span className="absolute inset-0 grid place-items-center bg-black/35 text-white opacity-0 transition-opacity duration-200 hover:opacity-100">
                          <PlayIcon className="h-4 w-4" />
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white">{song.title}</div>
                        <div className="truncate text-xs font-semibold text-white/48">{song.artist}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
