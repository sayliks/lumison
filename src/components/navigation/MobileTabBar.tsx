import React from "react";

import { AppView } from "@/app/appTypes";
import { QueueIcon, SearchIcon, WaveformIcon } from "@/components/common/Icons";

interface MobileTabBarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  onSearchClick: () => void;
  labels: {
    home: string;
    explore: string;
    library: string;
    queue: string;
    lyrics: string;
  };
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

const MobileTabBar: React.FC<MobileTabBarProps> = ({
  activeView,
  onViewChange,
  onSearchClick,
  labels,
}) => {
  const items = [
    { id: "home" as const, label: labels.home, icon: <HomeIcon className="h-5 w-5" /> },
    { id: "search" as const, label: labels.explore, icon: <SearchIcon className="h-5 w-5" /> },
    { id: "library" as const, label: labels.library, icon: <LibraryIcon className="h-5 w-5" /> },
    { id: "queue" as const, label: labels.queue, icon: <QueueIcon className="h-5 w-5" /> },
    { id: "lyrics" as const, label: labels.lyrics, icon: <WaveformIcon className="h-5 w-5" /> },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[70px] items-center justify-around border-t border-white/10 bg-black/90 px-2 backdrop-blur-2xl lg:hidden">
      {items.map((item) => {
        const isSearch = item.id === "search";
        const isActive = !isSearch && activeView === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              if (isSearch) {
                onSearchClick();
                return;
              }
              onViewChange(item.id);
            }}
            className={`flex min-w-0 flex-1 flex-col items-center gap-1 text-[11px] font-bold transition-colors duration-200 ${
              isActive ? "text-white" : "text-white/52 hover:text-white/80"
            }`}
          >
            {item.icon}
            <span className="max-w-full truncate">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default MobileTabBar;
