import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StudioDashboard } from './components/StudioDashboard';
import { TextToVoiceStudio } from './components/TextToVoiceStudio';
import { FileConverterView } from './components/FileConverterView';
import { BackgroundRemoverView } from './components/BackgroundRemoverView';
import { QrCodeView } from './components/QrCodeView';
import { BarcodeReaderView } from './components/BarcodeReaderView';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { SettingsModal } from './components/SettingsModal';
import { FilePreviewModal } from './components/FilePreviewModal';

import { ActiveView, NavTab, DoneWorkItem, AudioGeneration } from './types';
import { INITIAL_DONE_WORK, TOOLS } from './data/mockData';
import { Star, Clock, ArrowRight, ShieldCheck, Trash2, Heart } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [currentTab, setCurrentTab] = useState<NavTab>('studio');

  // Done Work State
  const [doneWork, setDoneWork] = useState<DoneWorkItem[]>(INITIAL_DONE_WORK);
  const [ramUsageMb, setRamUsageMb] = useState<number>(5.05);
  const [ramLimitMb, setRamLimitMb] = useState<number>(512);

  // Favorites state
  const [favoriteToolIds, setFavoriteToolIds] = useState<string[]>([
    'text-to-voice',
    'bg-remover',
    'file-converter',
    'qr-code',
  ]);

  // System & Isolation State
  const [offlineMode, setOfflineMode] = useState<boolean>(true);

  // Modals
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [previewItem, setPreviewItem] = useState<DoneWorkItem | null>(null);

  // Keyboard shortcut listener for Command Palette (⌘K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // When a tool completes work, record it in local RAM list
  const handleWorkCompleted = (item: DoneWorkItem) => {
    setDoneWork((prev) => [item, ...prev]);
    setRamUsageMb((prev) => Math.min(ramLimitMb, Math.round((prev + 1.25) * 100) / 100));
  };

  // Audio generation handler
  const handleAudioGenerated = (gen: AudioGeneration) => {
    const item: DoneWorkItem = {
      id: gen.id,
      name: gen.fileName,
      status: 'Ready',
      categoryText: 'Neural Voice',
      sizeText: gen.sizeText,
      timeAgoText: 'Just now',
      iconType: 'audio',
      accentColor: 'lavender',
      hasPreview: true,
      previewData: {
        title: `${gen.personaName} Voiceover`,
        type: 'WASM Audio',
        details: gen.text,
      },
      downloadUrl: gen.audioBlobUrl,
    };
    handleWorkCompleted(item);
  };

  const handleClearHistory = () => {
    setDoneWork([]);
    setRamUsageMb(0.85);
  };

  const handlePurgeRam = () => {
    setDoneWork([]);
    setRamUsageMb(0.42);
  };

  const toggleFavorite = (toolId: string) => {
    setFavoriteToolIds((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  };

  const handleSelectTab = (tab: NavTab) => {
    setCurrentTab(tab);
    setActiveView('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#191C21] font-['Plus_Jakarta_Sans'] selection:bg-[#E6DEFF] selection:text-[#363152]">
      
      {/* Top Sticky Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        offlineMode={offlineMode}
        onToggleOffline={() => setOfflineMode((prev) => !prev)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Render Specific Tool Views */}
        {activeView === 'text-to-voice' && (
          <TextToVoiceStudio
            onBack={() => setActiveView('dashboard')}
            onGenerationComplete={handleAudioGenerated}
          />
        )}

        {activeView === 'file-converter' && (
          <FileConverterView
            onBack={() => setActiveView('dashboard')}
            onWorkCompleted={handleWorkCompleted}
          />
        )}

        {activeView === 'bg-remover' && (
          <BackgroundRemoverView
            onBack={() => setActiveView('dashboard')}
            onWorkCompleted={handleWorkCompleted}
          />
        )}

        {activeView === 'qr-code' && (
          <QrCodeView
            onBack={() => setActiveView('dashboard')}
            onWorkCompleted={handleWorkCompleted}
          />
        )}

        {activeView === 'barcode-reader' && (
          <BarcodeReaderView
            onBack={() => setActiveView('dashboard')}
            onWorkCompleted={handleWorkCompleted}
          />
        )}

        {/* Render Primary Studio Tabs when activeView is 'dashboard' */}
        {activeView === 'dashboard' && (
          <>
            {currentTab === 'studio' && (
              <StudioDashboard
                onSelectTool={(view) => setActiveView(view)}
                doneWork={doneWork}
                onClearHistory={handleClearHistory}
                onOpenPreview={(item) => setPreviewItem(item)}
                onOpenSearchModal={() => setIsCommandPaletteOpen(true)}
                ramUsageMb={ramUsageMb}
              />
            )}

            {currentTab === 'favorites' && (
              <div className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191C21]">
                      Starred Routines & Favorites
                    </h1>
                    <p className="text-xs sm:text-sm text-[#6C6975] mt-1">
                      Quick access to your most frequently used client-side modules.
                    </p>
                  </div>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-[#EBF5ED] text-[#2F6D44] border border-[#CFE8D7]">
                    {favoriteToolIds.length} Starred
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                  {TOOLS.filter((t) => favoriteToolIds.includes(t.id)).map((tool) => (
                    <div
                      key={tool.id}
                      onClick={() => setActiveView(tool.view)}
                      className="group relative bg-white rounded-2xl border border-[#E8DFD4] p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(107,100,140,0.05)] hover:shadow-md hover:border-[#D1C6BA] transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#F2ECE4] text-[#5A5762]">
                            {tool.tag}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(tool.id);
                            }}
                            className="p-1 text-[#A05E32] hover:scale-110 transition-transform"
                            title="Remove from favorites"
                          >
                            <Heart className="w-4 h-4 fill-current" />
                          </button>
                        </div>

                        <div className="mt-4">
                          <h3 className="font-bold text-base sm:text-lg text-[#191C21] group-hover:text-[#534C72] transition-colors">
                            {tool.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#6C6975] mt-1.5 leading-relaxed">
                            {tool.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 pt-3.5 border-t border-[#F2ECE4] flex items-center justify-between text-xs font-medium">
                        <span className="inline-flex items-center gap-1.5 text-[#5A5762] font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3EA25E]" />
                          {tool.footerTag}
                        </span>

                        <span className="inline-flex items-center gap-1 text-[#534C72] font-semibold">
                          Launch Tool
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentTab === 'recents' && (
              <div className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191C21]">
                      Recent Activity & Buffer Log
                    </h1>
                    <p className="text-xs sm:text-sm text-[#6C6975] mt-1">
                      Ephemeral session activity history stored in volatile memory.
                    </p>
                  </div>

                  <button
                    onClick={handleClearHistory}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[#BA1A1A] bg-[#FFDAD6]/40 hover:bg-[#FFDAD6]/70 border border-[#FFB4AB] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Buffer
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-[#E8DFD4] p-5 sm:p-6 shadow-sm space-y-3">
                  {doneWork.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#79767F] font-mono">
                      No files or activity currently in browser memory.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F2ECE4]">
                      {doneWork.map((item) => (
                        <div
                          key={item.id}
                          className="py-3 flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="font-semibold text-sm text-[#191C21]">
                              {item.name}
                            </div>
                            <div className="text-xs text-[#79767F] font-mono">
                              {item.categoryText} • {item.sizeText} • {item.timeAgoText}
                            </div>
                          </div>

                          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#EBF5ED] text-[#2F6D44] border border-[#CFE8D7]">
                            In RAM Buffer
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenArchitecture={() => setIsHelpOpen(true)}
        onOpenShortcuts={() => setIsCommandPaletteOpen(true)}
        onOpenPrivacy={() => setIsHelpOpen(true)}
      />

      {/* Modals */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTool={(view) => setActiveView(view)}
      />

      <ArchitectureModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        ramLimitMb={ramLimitMb}
        onUpdateRamLimit={(limit) => setRamLimitMb(limit)}
        offlineMode={offlineMode}
        onToggleOffline={() => setOfflineMode((prev) => !prev)}
        onPurgeRam={handlePurgeRam}
      />

      <FilePreviewModal
        item={previewItem}
        onClose={() => setPreviewItem(null)}
      />

    </div>
  );
}
