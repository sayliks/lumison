import React from "react";

import { AppView } from "@/app/appTypes";
import {
  AuraLogo,
  CloudDownloadIcon,
  InfoIcon,
  PlusIcon,
  QueueIcon,
  SearchIcon,
  WaveformIcon,
} from "@/components/common/Icons";

interface DesktopSidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  onSearchClick: () => void;
  onImportClick: () => void;
  labels: {
    home: string;
    explore: string;
    library: string;
    queue: string;
    lyrics: string;
    importMusic: string;
    playingNext: string;
    emptyLibrary: string;
  };
}

interface NavItem {
  id: AppView | "search";
  label: string;
  icon: React.ReactNode;
}

const HomeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3.2 3.5 10v10.2h6.2v-6.1h4.6v6.1h6.2V10L12 3.2Z" />
  </svg>
);

const LibraryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 4h12a1 1 0 0 1 1 1v16l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
  </svg>
);

const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeView,
  onViewChange,
  onSearchClick,
  onImportClick,
  labels,
}) => {
  const navItems: NavItem[] = [
    { id: "home", label: labels.home, icon: <HomeIcon className="h-6 w-6" /> },
    { id: "search", label: labels.explore, icon: <SearchIcon className="h-6 w-6" /> },
    { id: "library", label: labels.library, icon: <LibraryIcon className="h-6 w-6" /> },
    { id: "queue", label: labels.queue, icon: <QueueIcon className="h-6 w-6" /> },
    { id: "lyrics", label: labels.lyrics, icon: <WaveformIcon className="h-6 w-6" /> },
  ];

  const handleNavClick = (id: NavItem["id"]) => {
    if (id === "search") {
      onSearchClick();
      return;
    }
    onViewChange(id);
  };

  return (
    <aside
      className="hidden lg:flex h-full w-[264px] shrink-0 flex-col border-r border-white/10 bg-black text-white"
      data-tauri-drag-region
    >
      <div className="flex h-20 items-center gap-4 px-7">
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-md text-white/90 transition-colors duration-200 hover:bg-white/10"
          aria-label="Menu"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
        <div className="flex items-center gap-2">
          <AuraLogo className="h-8 w-8 rounded-md text-white" />
          <span className="text-lg font-extrabold tracking-tight">Lumison</span>
        </div>
      </div>

      <nav className="flex flex-col gap-2 px-2">
        {navItems.map((item) => {
          const isActive = item.id !== "search" && activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className={`flex h-[54px] items-center gap-5 rounded-lg px-6 text-[16px] font-semibold transition-colors duration-200 ${
                isActive
                  ? "bg-white/[0.12] text-white"
                  : "text-white/88 hover:bg-white/[0.07] hover:text-white"
              }`}
            >
              <span className="grid h-7 w-7 place-items-center">{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mx-7 my-7 h-px bg-white/10" />

      <div className="px-5">
        <button
          type="button"
          onClick={onImportClick}
          className="flex h-10 w-full items-center justify-center gap-3 rounded-full bg-white/[0.13] px-5 text-sm font-bold text-white transition-colors duration-200 hover:bg-white/[0.18]"
        >
          <PlusIcon className="h-6 w-6" />
          <span>{labels.importMusic}</span>
        </button>
      </div>

      <div className="mt-auto space-y-5 px-7 pb-8 text-sm">
        <div>
          <div className="mb-1 flex items-center gap-2 font-bold text-white/90">
            <CloudDownloadIcon className="h-4 w-4" />
            <span>{labels.playingNext}</span>
          </div>
          <p className="text-xs font-medium text-white/55">{labels.emptyLibrary}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/45">
          <InfoIcon className="h-4 w-4" />
          <span>Lumison 1.0.3</span>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
