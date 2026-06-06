import React, { useCallback, useState } from "react";
import { Window } from "@tauri-apps/api/window";

import { Song } from "@/types";
import {
  AuraLogo,
  CloseIcon,
  CloudDownloadIcon,
  FullscreenIcon,
  MinimizeIcon,
  SettingsIcon,
} from "@/components/common/Icons";
import AboutDialog from "@/components/modals/AboutDialog";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";

interface TopCommandBarProps {
  currentSong?: Song | null;
  lyricsFontSize: number;
  onLyricsFontSizeChange: (size: number) => void;
  onImportClick: () => void;
  onEnterImmersiveLyrics: () => void;
  labels: {
    import: string;
    settings: string;
    language: string;
    about: string;
    lyrics: string;
    fontSize: string;
    minimize: string;
    fullscreen: string;
    close: string;
    output: string;
  };
}

const OutputIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 6h16v10H4z" />
    <path d="M8 20h8" />
    <path d="M12 16v4" />
    <path d="M4 13a6 6 0 0 1 6 6" opacity=".55" />
  </svg>
);

const TopCommandBar: React.FC<TopCommandBarProps> = ({
  currentSong,
  lyricsFontSize,
  onLyricsFontSizeChange,
  onImportClick,
  onEnterImmersiveLyrics,
  labels,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleMinimize = useCallback(async () => {
    try {
      await Window.getCurrent().minimize();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug("Window minimize failed:", error);
      }
    }
  }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((error) => {
        console.error("Failed to enter fullscreen:", error);
      });
      return;
    }
    document.exitFullscreen?.();
  }, []);

  const handleClose = useCallback(async () => {
    try {
      await Window.getCurrent().close();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug("Window close failed:", error);
      } else {
        window.close();
      }
    }
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center justify-between gap-2 bg-gradient-to-b from-black/80 via-black/55 to-transparent px-4 pt-3 sm:gap-3 lg:px-8" data-tauri-drag-region>
      <button
        type="button"
        onClick={onImportClick}
        className="flex h-12 min-w-0 flex-1 items-center gap-4 rounded-lg border border-white/10 bg-white/[0.12] px-5 text-left text-[16px] font-semibold text-white/55 shadow-[0_8px_32px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-colors duration-200 hover:bg-white/[0.16] hover:text-white/75 md:max-w-[530px]"
        aria-label={labels.import}
        data-tauri-drag-region={false}
      >
        <CloudDownloadIcon className="h-5 w-5 shrink-0" />
        <span className="truncate">{labels.import}</span>
      </button>

      <div className="flex shrink-0 items-center gap-3" data-tauri-drag-region={false}>
        <button
          type="button"
          className="hidden h-10 w-10 place-items-center rounded-md text-white/82 transition-colors duration-200 hover:bg-white/10 hover:text-white sm:grid"
          aria-label={labels.output}
          title={labels.output}
        >
          <OutputIcon className="h-5 w-5" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsSettingsOpen((value) => !value)}
            className="grid h-10 w-10 place-items-center rounded-md text-white/82 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            aria-label={labels.settings}
            title={labels.settings}
          >
            <SettingsIcon className="h-5 w-5" />
          </button>

          {isSettingsOpen && (
            <div className="absolute right-0 top-12 w-72 rounded-lg border border-white/10 bg-[#171717]/95 p-4 shadow-2xl backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold text-white">{labels.settings}</h2>
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="grid h-7 w-7 place-items-center rounded-md text-white/60 hover:bg-white/10 hover:text-white"
                  aria-label={labels.close}
                >
                  <CloseIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white/65">
                    <span>{labels.fontSize}</span>
                    <span>{lyricsFontSize}px</span>
                  </div>
                  <input
                    type="range"
                    min={30}
                    max={60}
                    step={2}
                    value={lyricsFontSize}
                    onChange={(event) => onLyricsFontSizeChange(Number(event.target.value))}
                    className="w-full accent-white"
                    aria-label={labels.fontSize}
                  />
                </div>

                <button
                  type="button"
                  onClick={onEnterImmersiveLyrics}
                  className="h-10 w-full rounded-lg bg-white/[0.10] px-3 text-left text-sm font-semibold text-white/80 transition-colors duration-200 hover:bg-white/[0.16]"
                >
                  {labels.lyrics}
                </button>

                <div>
                  <div className="mb-2 text-xs font-semibold text-white/65">{labels.language}</div>
                  <LanguageSwitcher variant="settings" />
                </div>

                <button
                  type="button"
                  onClick={() => setIsAboutOpen(true)}
                  className="h-10 w-full rounded-lg bg-white/[0.10] px-3 text-left text-sm font-semibold text-white/80 transition-colors duration-200 hover:bg-white/[0.16]"
                >
                  {labels.about}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="hidden items-center gap-1 xl:flex">
          <button
            type="button"
            onClick={handleMinimize}
            className="grid h-9 w-9 place-items-center rounded-md text-white/58 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            aria-label={labels.minimize}
            title={labels.minimize}
          >
            <MinimizeIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleFullscreen}
            className="grid h-9 w-9 place-items-center rounded-md text-white/58 transition-colors duration-200 hover:bg-white/10 hover:text-white"
            aria-label={labels.fullscreen}
            title={labels.fullscreen}
          >
            <FullscreenIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="grid h-9 w-9 place-items-center rounded-md text-white/58 transition-colors duration-200 hover:bg-red-500/75 hover:text-white"
            aria-label={labels.close}
            title={labels.close}
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="hidden h-10 w-10 place-items-center overflow-hidden rounded-full bg-white/[0.10] sm:grid">
          {currentSong?.coverUrl ? (
            <img src={currentSong.coverUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <AuraLogo className="h-full w-full text-white" />
          )}
        </div>
      </div>

      <AboutDialog isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </header>
  );
};

export default TopCommandBar;
