import React, { useState, useEffect } from 'react';
import { Search, X, Volume2, ArrowLeftRight, Wand2, QrCode, ScanBarcode, ArrowRight } from 'lucide-react';
import { ActiveView } from '../types';
import { TOOLS } from '../data/mockData';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (view: ActiveView) => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for ⌘K and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent or toggle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = TOOLS.filter(
    (t) =>
      t.title.toLowerCase().includes(query.toLowerCase()) ||
      t.description.toLowerCase().includes(query.toLowerCase()) ||
      t.tag.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#272A30]/30 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-[#E8DFD4] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Search header */}
        <div className="flex items-center px-4 border-b border-[#E8DFD4] bg-[#FAF7F2]">
          <Search className="w-4 h-4 text-[#79767F] shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all offline tools, routines, or actions..."
            className="w-full bg-transparent px-3 py-3.5 text-sm text-[#191C21] focus:outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-[#79767F] hover:text-[#191C21] rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="p-2 max-h-80 overflow-y-auto divide-y divide-[#F2ECE4]">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-[#79767F] font-mono">
              No matching local tools found for &quot;{query}&quot;.
            </div>
          ) : (
            filtered.map((tool) => (
              <div
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.view);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-[#FAF7F2] cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EBF5ED] text-[#2F6D44] flex items-center justify-center text-xs">
                    {tool.tag.slice(0, 3)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#191C21] group-hover:text-[#534C72]">
                      {tool.title}
                    </div>
                    <div className="text-xs text-[#6C6975] truncate max-w-xs">
                      {tool.description}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#F2ECE4] text-[#5A5762]">
                    {tool.tag}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#534C72] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer shortcuts tip */}
        <div className="px-4 py-2 bg-[#FAF7F2] border-t border-[#E8DFD4] flex items-center justify-between text-[11px] text-[#79767F] font-mono">
          <span>Navigate with mouse or keyboard</span>
          <span>ESC to close</span>
        </div>

      </div>
    </div>
  );
};
