import React from "react";

import { PauseIcon, PlayIcon, PrevIcon, NextIcon, QueueIcon, WaveformIcon } from "@/components/common/Icons";
import SmartImage from "@/components/common/SmartImage";
import { Song } from "@/types";
import { formatTime } from "@/services/utils";

interface PlayerBarProps {
  currentSong?: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  accentColor: string;
  onPlayPause: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onOpenQueue: () => void;
  onOpenLyrics: () => void;
  labels: {
    play: string;
    pause: string;
    previous: string;
    next: string;
    queue: string;
    lyrics: string;
    noMusic: string;
    selectSong: string;
    progress: string;
  };
}

const PlayerBar: React.FC<PlayerBarProps> = ({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  accentColor,
  onPlayPause,
  onPrev,
  onNext,
  onSeek,
  onOpenQueue,
  onOpenLyrics,
  labels,
}) => {
  const hasSong = Boolean(currentSong);
  const progress = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="fixed inset-x-0 bottom-[70px] z-30 border-t border-white/10 bg-black/88 px-4 py-3 backdrop-blur-2xl lg:left-[264px] lg:bottom-0 lg:px-8">
      <div className="grid h-[58px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 lg:grid-cols-[minmax(220px,1fr)_minmax(280px,520px)_minmax(220px,1fr)]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-white/[0.08]">
            {currentSong?.coverUrl ? (
              <SmartImage
                src={currentSong.coverUrl}
                alt={currentSong.title}
                imgClassName="h-full w-full object-cover"
              />
            ) : (
              <div className="grid h-full w-full place-items-center text-lg font-black text-white/45">L</div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-white">
              {currentSong?.title || labels.noMusic}
            </div>
            <div className="truncate text-xs font-semibold text-white/48">
              {currentSong?.artist || labels.selectSong}
            </div>
          </div>
        </div>

        <div className="hidden min-w-0 flex-col items-center gap-2 lg:flex">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={onPrev}
              disabled={!hasSong}
              className="grid h-8 w-8 place-items-center rounded-md text-white/68 transition-colors duration-200 hover:text-white disabled:text-white/20"
              aria-label={labels.previous}
            >
              <PrevIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onPlayPause}
              disabled={!hasSong}
              className="grid h-10 w-10 place-items-center rounded-full text-black transition-transform duration-200 hover:scale-105 disabled:opacity-40"
              style={{ backgroundColor: hasSong ? accentColor : "rgba(255,255,255,0.35)" }}
              aria-label={isPlaying ? labels.pause : labels.play}
            >
              {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!hasSong}
              className="grid h-8 w-8 place-items-center rounded-md text-white/68 transition-colors duration-200 hover:text-white disabled:text-white/20"
              aria-label={labels.next}
            >
              <NextIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="grid w-full grid-cols-[44px_1fr_44px] items-center gap-3 text-[11px] font-semibold text-white/42">
            <span className="text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={duration ? currentTime : 0}
              onChange={(event) => onSeek(Number(event.target.value))}
              disabled={!hasSong || !duration}
              className="h-1 w-full accent-white"
              style={{
                background: `linear-gradient(90deg, ${accentColor} ${progress}%, rgba(255,255,255,0.16) ${progress}%)`,
              }}
              aria-label={labels.progress}
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onPlayPause}
            disabled={!hasSong}
            className="grid h-10 w-10 place-items-center rounded-full text-black transition-transform duration-200 hover:scale-105 disabled:opacity-40 lg:hidden"
            style={{ backgroundColor: hasSong ? accentColor : "rgba(255,255,255,0.35)" }}
            aria-label={isPlaying ? labels.pause : labels.play}
          >
            {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={onOpenLyrics}
            className="grid h-10 w-10 place-items-center rounded-md text-white/64 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            aria-label={labels.lyrics}
            title={labels.lyrics}
          >
            <WaveformIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={onOpenQueue}
            className="grid h-10 w-10 place-items-center rounded-md text-white/64 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            aria-label={labels.queue}
            title={labels.queue}
          >
            <QueueIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
