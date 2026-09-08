import React, { useState } from 'react';
import { X, Download, FileText, Volume2, Play, Pause, Check, ShieldCheck } from 'lucide-react';
import { DoneWorkItem } from '../types';
import { playBrowserSpeech, stopBrowserSpeech } from '../utils/audioSynthesis';

interface FilePreviewModalProps {
  item: DoneWorkItem | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ item, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!item) return null;

  const togglePlay = () => {
    if (isPlaying) {
      stopBrowserSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const text = item.previewData?.details || 'Welcome to CozyCraft client-side narration.';
      playBrowserSpeech(text, 'Ember', 1.0, 0, () => {
        setIsPlaying(false);
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([`CozyCraft artifact: ${item.name}`], { type: 'application/octet-stream' });
    const url = item.downloadUrl || URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.name;
    a.click();
    if (!item.downloadUrl) URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#272A30]/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E8DFD4] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#E8DFD4] bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            {item.iconType === 'pdf' ? (
              <FileText className="w-5 h-5 text-[#A05E32]" />
            ) : item.iconType === 'audio' ? (
              <Volume2 className="w-5 h-5 text-[#534C72]" />
            ) : (
              <FileText className="w-5 h-5 text-[#2F6D44]" />
            )}
            <div>
              <h3 className="font-bold text-sm text-[#191C21] truncate max-w-xs">{item.name}</h3>
              <p className="text-[11px] text-[#79767F] font-mono">
                {item.categoryText} • {item.sizeText} • {item.status}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopBrowserSpeech();
              onClose();
            }}
            className="p-1 text-[#79767F] hover:text-[#191C21] rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-center">
          {item.iconType === 'pdf' && (
            <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#E8DFD4] space-y-3">
              <div className="w-16 h-20 bg-white mx-auto rounded-lg shadow-sm border border-[#E4DBD0] flex flex-col p-2 space-y-1.5 justify-center">
                <div className="h-2 bg-[#E8DFD4] rounded w-3/4" />
                <div className="h-1.5 bg-[#F2ECE4] rounded w-full" />
                <div className="h-1.5 bg-[#F2ECE4] rounded w-5/6" />
                <div className="h-1.5 bg-[#F2ECE4] rounded w-4/6" />
              </div>
              <div>
                <div className="font-semibold text-sm text-[#191C21]">
                  {item.previewData?.title || 'Document Ready'}
                </div>
                <div className="text-xs text-[#6C6975] mt-1">
                  {item.previewData?.details || '100% Client-side rendered document buffer.'}
                </div>
              </div>
            </div>
          )}

          {item.iconType === 'audio' && (
            <div className="p-6 rounded-xl bg-[#FAF7F2] border border-[#E8DFD4] space-y-4">
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-[#534C72] hover:bg-[#433D5D] text-white mx-auto flex items-center justify-center shadow-md transition-all active:scale-95"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
              </button>
              <div>
                <div className="font-semibold text-sm text-[#191C21]">
                  {item.previewData?.title || 'Audio Playback'}
                </div>
                <div className="text-xs text-[#6C6975] mt-1">
                  {isPlaying ? 'Playing local audio buffer...' : 'Click to listen to sample'}
                </div>
              </div>
            </div>
          )}

          {item.iconType === 'image' && (
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFD4] space-y-2">
              <div className="h-44 rounded-lg bg-white flex items-center justify-center overflow-hidden border border-[#E8DFD4]">
                {item.downloadUrl ? (
                  <img src={item.downloadUrl} alt="Preview" className="max-h-full object-contain" />
                ) : (
                  <span className="text-xs text-[#79767F] font-mono">Rendered in Canvas RAM</span>
                )}
              </div>
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 text-xs text-[#2F6D44] font-mono">
            <ShieldCheck className="w-4 h-4" />
            Zero network transit. File exists in your browser tab only.
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DFD4] flex items-center justify-between">
          <button
            onClick={() => {
              stopBrowserSpeech();
              onClose();
            }}
            className="px-4 py-2 text-xs text-[#6C6975] hover:text-[#191C21]"
          >
            Close
          </button>

          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-[#534C72] hover:bg-[#433D5D] text-white text-xs font-medium shadow-sm transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Download to Device
          </button>
        </div>

      </div>
    </div>
  );
};
