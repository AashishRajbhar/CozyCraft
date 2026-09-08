import React, { useState } from 'react';
import {
  Search,
  Volume2,
  ArrowLeftRight,
  Wand2,
  QrCode,
  ScanBarcode,
  Download,
  Eye,
  Play,
  RotateCcw,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  FileText,
  CheckCircle2,
  Flame
} from 'lucide-react';
import { ToolCategory, ActiveView, DoneWorkItem, ToolItem } from '../types';
import { TOOLS } from '../data/mockData';
import { CozyDeskIllustration } from './CozyDeskIllustration';

interface StudioDashboardProps {
  onSelectTool: (view: ActiveView) => void;
  doneWork: DoneWorkItem[];
  onClearHistory: () => void;
  onOpenPreview: (item: DoneWorkItem) => void;
  onOpenSearchModal: () => void;
  ramUsageMb: number;
}

export const StudioDashboard: React.FC<StudioDashboardProps> = ({
  onSelectTool,
  doneWork,
  onClearHistory,
  onOpenPreview,
  onOpenSearchModal,
  ramUsageMb,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');

  // Category filters definition
  const categories: { id: ToolCategory; label: string }[] = [
    { id: 'all', label: 'All Tools' },
    { id: 'audio', label: 'Audio & Voice' },
    { id: 'images', label: 'Image Tools' },
    { id: 'converters', label: 'Converters' },
    { id: 'utilities', label: 'QR & Barcode Utilities' },
  ];

  // Filter tools
  const filteredTools = TOOLS.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tag.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Render tool icon dynamically
  const renderToolIcon = (iconName: string, color: 'lavender' | 'sage' | 'peach') => {
    const colorClasses = {
      lavender: 'bg-[#EDE9FE] text-[#534C72] border-[#DDD6FE]',
      sage: 'bg-[#EAF5ED] text-[#2F6D44] border-[#CFE8D7]',
      peach: 'bg-[#FFEEDA] text-[#A05E32] border-[#F8D7BE]',
    }[color];

    const iconMap: Record<string, React.ReactNode> = {
      Volume2: <Volume2 className="w-5 h-5" />,
      ArrowLeftRight: <ArrowLeftRight className="w-5 h-5" />,
      Wand2: <Wand2 className="w-5 h-5" />,
      QrCode: <QrCode className="w-5 h-5" />,
      ScanBarcode: <ScanBarcode className="w-5 h-5" />,
    };

    return (
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorClasses}`}>
        {iconMap[iconName] || <Sparkles className="w-5 h-5" />}
      </div>
    );
  };

  // Render Done Work icon
  const renderDoneIcon = (type: DoneWorkItem['iconType'], color: DoneWorkItem['accentColor']) => {
    const colorClasses = {
      lavender: 'bg-[#EDE9FE] text-[#534C72]',
      sage: 'bg-[#EAF5ED] text-[#2F6D44]',
      peach: 'bg-[#FFEEDA] text-[#A05E32]',
    }[color];

    if (type === 'qr') {
      return (
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClasses}`}>
          <QrCode className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'barcode') {
      return (
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClasses}`}>
          <ScanBarcode className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'pdf') {
      return (
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClasses}`}>
          <FileText className="w-4 h-4" />
        </div>
      );
    }
    if (type === 'audio') {
      return (
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClasses}`}>
          <Volume2 className="w-4 h-4" />
        </div>
      );
    }
    return (
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${colorClasses}`}>
        <Wand2 className="w-4 h-4" />
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-9">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-2">
        {/* Top Privacy Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium bg-[#EBF5ED] text-[#2F6D44] border border-[#CFE8D7] shadow-2xs select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2F6D44]" />
          <span>CLIENT-SIDE PROCESSING ONLY • Zero Server Uploads</span>
        </div>

        {/* Display Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-[44px] leading-tight font-bold tracking-tight text-[#191C21] font-['Plus_Jakarta_Sans']">
          Your calm, private digital workshop.
        </h1>

        {/* Subtitle */}
        <p className="text-[#6C6975] text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Instant client-side tools running in local WebAssembly memory. Zero data leaves your computer.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative flex items-center bg-white rounded-2xl border border-[#E4DBD0] shadow-[0_2px_12px_rgba(107,100,140,0.04)] hover:border-[#D1C6BA] focus-within:border-[#534C72] focus-within:ring-2 focus-within:ring-[#534C72]/10 transition-all">
          <Search className="w-5 h-5 text-[#79767F] ml-4 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools (e.g. text to voice, convert HEIC, merge PDF)..."
            className="w-full bg-transparent px-3 py-3.5 text-sm sm:text-base text-[#191C21] placeholder-[#9E9BA6] focus:outline-none"
          />
          <button
            onClick={onOpenSearchModal}
            className="hidden sm:inline-flex items-center gap-1 mr-3 px-2 py-1 rounded-md bg-[#F2ECE4] border border-[#E2D8CC] text-xs font-mono text-[#5A5762] hover:bg-[#EAE2D8] transition-colors"
            title="Press Cmd+K to search anytime"
          >
            ⌘ K
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center justify-center flex-wrap gap-2 pt-1">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#534C72] text-white shadow-xs'
                  : 'bg-[#F2ECE4]/80 text-[#48464E] hover:bg-[#E8DFD4] hover:text-[#191C21]'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* "My Done Work" Card */}
      <div className="bg-white rounded-2xl border border-[#E8DFD4] p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(107,100,140,0.05)] space-y-4">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EBF5ED] text-[#2F6D44] flex items-center justify-center shrink-0 border border-[#CFE8D7] mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-bold text-base sm:text-lg text-[#191C21]">
                  My Done Work
                </h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#EBF5ED] text-[#2F6D44] border border-[#CFE8D7]">
                  In Device Memory
                </span>
              </div>
              <p className="text-xs text-[#79767F] mt-0.5">
                • Saved in local RAM only. Erased on tab closure.
              </p>
            </div>
          </div>

          <button
            onClick={onClearHistory}
            className="inline-flex items-center gap-1.5 text-xs text-[#79767F] hover:text-[#BA1A1A] transition-colors self-start sm:self-auto py-1"
            title="Clear memory records"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear History
          </button>
        </div>

        {/* Done Items List */}
        {doneWork.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#79767F] font-mono border border-dashed border-[#E8DFD4] rounded-xl">
            No work files in browser buffer. Launch a tool below to process locally.
          </div>
        ) : (
          <div className="divide-y divide-[#F2ECE4]">
            {doneWork.map((item) => (
              <div
                key={item.id}
                className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF7F2]/60 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {renderDoneIcon(item.iconType, item.accentColor)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#191C21] truncate">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#EBF5ED] text-[#2F6D44] border border-[#CFE8D7]">
                        {item.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#79767F] font-mono mt-0.5">
                      {item.categoryText} • {item.sizeText} • {item.timeAgoText}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {item.iconType === 'pdf' && (
                    <button
                      onClick={() => onOpenPreview(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F2ECE4] text-[#272A30] border border-[#E2D8CC] hover:bg-[#EAE2D8] transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      Open
                    </button>
                  )}

                  {item.iconType === 'audio' && (
                    <button
                      onClick={() => onOpenPreview(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#F2ECE4] text-[#272A30] border border-[#E2D8CC] hover:bg-[#EAE2D8] transition-colors"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Play
                    </button>
                  )}

                  <button
                    onClick={() => {
                      // Trigger clean dummy file download for sample work item
                      const blob = new Blob([`CozyCraft client-side artifact: ${item.name}`], {
                        type: 'application/octet-stream',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = item.name;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-medium bg-[#534C72] hover:bg-[#433D5D] text-white shadow-2xs transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Card Footer */}
        <div className="pt-3 border-t border-[#E8DFD4] flex flex-col sm:flex-row items-center justify-between text-xs text-[#79767F] font-mono gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2F6D44]" />
            <span>These files live entirely in your browser session. Nothing is ever uploaded to a server.</span>
          </div>
          <div className="text-[#5A5762] shrink-0">
            RAM buffer: <span className="font-semibold text-[#191C21]">{ramUsageMb.toFixed(2)} MB</span>
          </div>
        </div>
      </div>

      {/* "Quick Launch Tools" Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#191C21]">
                Quick Launch Tools
              </h2>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#F2ECE4] text-[#5A5762] border border-[#E2D8CC]">
                {filteredTools.length} Modules Available
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6C6975] mt-0.5">
              Hardware-accelerated local routines ready without installation.
            </p>
          </div>
        </div>

        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.view)}
              className="group relative bg-white rounded-2xl border border-[#E8DFD4] p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(107,100,140,0.05)] hover:shadow-[0_10px_30px_-4px_rgba(39,42,48,0.08)] hover:border-[#D1C6BA] transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Top Row: Icon + WASM / GPU tag */}
                <div className="flex items-start justify-between">
                  {renderToolIcon(tool.iconName, tool.accentColor)}
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#F2ECE4] text-[#5A5762] border border-[#E2D8CC]">
                    {tool.tag}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="mt-4">
                  <h3 className="font-bold text-base sm:text-lg text-[#191C21] group-hover:text-[#534C72] transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6C6975] mt-1.5 leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: Status & Launch Tool Link */}
              <div className="mt-5 pt-3.5 border-t border-[#F2ECE4] flex items-center justify-between text-xs font-medium">
                <span className="inline-flex items-center gap-1.5 text-[#5A5762] font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3EA25E]" />
                  {tool.footerTag}
                </span>

                <span className="inline-flex items-center gap-1 text-[#534C72] group-hover:translate-x-0.5 transition-transform font-semibold">
                  Launch Tool
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mindful Productivity Banner */}
      <div className="bg-white rounded-2xl border border-[#E8DFD4] p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(107,100,140,0.05)] flex flex-col md:flex-row items-center gap-6">
        {/* Left: Cozy Illustration */}
        <div className="w-full md:w-[45%] shrink-0 h-44 sm:h-52 rounded-xl overflow-hidden border border-[#E8DFD4] shadow-xs">
          <CozyDeskIllustration className="w-full h-full" />
        </div>

        {/* Right: Content */}
        <div className="w-full md:w-[55%] space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFEEDA] text-[#A05E32] border border-[#F8D7BE]">
            <Sparkles className="w-3.5 h-3.5 text-[#A05E32]" />
            Mindful Productivity
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-[#191C21]">
            A quiet workspace for deep concentration.
          </h3>

          <p className="text-xs sm:text-sm text-[#6C6975] leading-relaxed">
            CozyCraft does not track usage metrics or profile digital artifacts. Everything runs in your browser tab&apos;s isolated sandbox. Close the tab, and your memory footprint returns to zero.
          </p>
        </div>
      </div>

    </div>
  );
};
