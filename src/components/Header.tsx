import React from 'react';
import { CozyCraftLogo } from './CozyCraftLogo';
import { WifiOff, HelpCircle, Sliders, Wifi } from 'lucide-react';
import { NavTab } from '../types';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  offlineMode: boolean;
  onToggleOffline: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenSettings,
  onOpenHelp,
  offlineMode,
  onToggleOffline,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E8DFD4] transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Left: Brand Logo + Status Pill */}
        <div className="flex items-center gap-3.5">
          <button
            onClick={() => onSelectTab('studio')}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6B648C] rounded-lg p-1"
            title="CozyCraft Studio Home"
          >
            <CozyCraftLogo size="md" />
          </button>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#EBF5ED] text-[#2F6D44] border border-[#CFE8D7] shadow-2xs select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3EA25E] animate-pulse" />
            100% In-Browser
          </span>
        </div>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-8">
          <button
            onClick={() => onSelectTab('studio')}
            className={`relative py-5 text-sm font-medium transition-colors hover:text-[#191C21] ${
              currentTab === 'studio'
                ? 'text-[#191C21] font-semibold'
                : 'text-[#6C6975]'
            }`}
          >
            Studio
            {currentTab === 'studio' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#191C21] rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('favorites')}
            className={`relative py-5 text-sm font-medium transition-colors hover:text-[#191C21] ${
              currentTab === 'favorites'
                ? 'text-[#191C21] font-semibold'
                : 'text-[#6C6975]'
            }`}
          >
            Favorites
            {currentTab === 'favorites' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#191C21] rounded-full" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('recents')}
            className={`relative py-5 text-sm font-medium transition-colors hover:text-[#191C21] ${
              currentTab === 'recents'
                ? 'text-[#191C21] font-semibold'
                : 'text-[#6C6975]'
            }`}
          >
            Recents
            {currentTab === 'recents' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#191C21] rounded-full" />
            )}
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Offline Mode Indicator Button */}
          <button
            onClick={onToggleOffline}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              offlineMode
                ? 'bg-[#EBF5ED] text-[#2F6D44] border-[#CFE8D7]'
                : 'bg-[#F2ECE4] text-[#48464E] border-[#E2D8CC] hover:bg-[#EAE2D8]'
            }`}
            title={offlineMode ? 'Local Offline Mode active' : 'Click to toggle Offline Isolation'}
          >
            {offlineMode ? (
              <WifiOff className="w-3.5 h-3.5 text-[#2F6D44]" />
            ) : (
              <Wifi className="w-3.5 h-3.5 text-[#79767F]" />
            )}
            <span className="hidden md:inline">Offline Mode</span>
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5A5762] hover:text-[#191C21] hover:bg-[#F0E9DF] transition-colors border border-transparent hover:border-[#E8DFD4]"
            title="Local Architecture & Security Information"
            aria-label="Help and Architecture"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5A5762] hover:text-[#191C21] hover:bg-[#F0E9DF] transition-colors border border-transparent hover:border-[#E8DFD4]"
            title="Studio Settings & Buffer Allocation"
            aria-label="Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
