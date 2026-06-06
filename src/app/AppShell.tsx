import React from "react";

import { AppView } from "@/app/appTypes";
import { Song } from "@/types";
import DesktopSidebar from "@/components/navigation/DesktopSidebar";
import MobileTabBar from "@/components/navigation/MobileTabBar";
import TopCommandBar from "@/components/navigation/TopCommandBar";

interface AppShellProps {
  activeView: AppView;
  currentSong?: Song | null;
  lyricsFontSize: number;
  children: React.ReactNode;
  playerBar?: React.ReactNode;
  onViewChange: (view: AppView) => void;
  onImportClick: () => void;
  onEnterImmersiveLyrics: () => void;
  onLyricsFontSizeChange: (size: number) => void;
  labels: {
    home: string;
    library: string;
    queue: string;
    lyrics: string;
    import: string;
    importMusic: string;
    playingNext: string;
    emptyLibrary: string;
    settings: string;
    language: string;
    about: string;
    fontSize: string;
    minimize: string;
    fullscreen: string;
    close: string;
    output: string;
  };
}

const AppShell: React.FC<AppShellProps> = ({
  activeView,
  currentSong,
  lyricsFontSize,
  children,
  playerBar,
  onViewChange,
  onImportClick,
  onEnterImmersiveLyrics,
  onLyricsFontSizeChange,
  labels,
}) => {
  return (
    <div className="flex h-full min-h-0 w-full bg-black text-white">
      <DesktopSidebar
        activeView={activeView}
        onViewChange={onViewChange}
        onImportClick={onImportClick}
        labels={{
          home: labels.home,
          library: labels.library,
          queue: labels.queue,
          lyrics: labels.lyrics,
          importMusic: labels.importMusic,
          playingNext: labels.playingNext,
          emptyLibrary: labels.emptyLibrary,
        }}
      />

      <div className="relative min-w-0 flex-1 overflow-hidden bg-[#020202]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_0%,rgba(50,118,125,0.36),transparent_28%),radial-gradient(circle_at_64%_8%,rgba(97,78,116,0.22),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_40%)]" />
        <div className="relative z-10 flex h-full min-h-0 flex-col">
          <TopCommandBar
            currentSong={currentSong}
            lyricsFontSize={lyricsFontSize}
            onLyricsFontSizeChange={onLyricsFontSizeChange}
            onImportClick={onImportClick}
            onEnterImmersiveLyrics={onEnterImmersiveLyrics}
            labels={{
              import: labels.import,
              settings: labels.settings,
              language: labels.language,
              about: labels.about,
              lyrics: labels.lyrics,
              fontSize: labels.fontSize,
              minimize: labels.minimize,
              fullscreen: labels.fullscreen,
              close: labels.close,
              output: labels.output,
            }}
          />

          <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 lg:px-8 lg:pb-24">
            {children}
          </main>

          {playerBar}
          <MobileTabBar
            activeView={activeView}
            onViewChange={onViewChange}
            labels={{
              home: labels.home,
              library: labels.library,
              queue: labels.queue,
              lyrics: labels.lyrics,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default AppShell;
