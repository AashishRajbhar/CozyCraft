import React from 'react';
import { X, ShieldCheck, Cpu, Database, HardDrive, Lock, CheckCircle2 } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#272A30]/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-[#E8DFD4] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8DFD4] bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EBF5ED] text-[#2F6D44] flex items-center justify-center border border-[#CFE8D7]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#191C21]">
                Local Architecture & Zero-Server Security
              </h2>
              <p className="text-xs text-[#6C6975]">
                How CozyCraft operates 100% inside your browser sandbox
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-[#79767F] hover:text-[#191C21] rounded-lg hover:bg-[#EAE2D8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-sm text-[#48464E] leading-relaxed">
          
          <div className="p-4 rounded-xl bg-[#EBF5ED]/80 border border-[#CFE8D7] flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#2F6D44] shrink-0 mt-0.5" />
            <div className="text-xs text-[#2F6D44] leading-relaxed">
              <strong className="font-semibold block text-sm mb-1">True Zero-Knowledge Execution</strong>
              No backend API exists for your documents or voice scripts. Network inspectors will confirm 0 bytes uploaded to external domains. Even if your internet connection disconnects, all tools continue working smoothly.
            </div>
          </div>

          {/* 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            
            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFD4] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#534C72] flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-[#191C21]">WebAssembly</div>
              <p className="text-xs text-[#6C6975]">
                C/C++ binaries compiled to WASM (Piper, FFmpeg, Whisper) execute at near-native CPU speeds inside browser threads.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFD4] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#EAF5ED] text-[#2F6D44] flex items-center justify-center">
                <HardDrive className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-[#191C21]">Volatile RAM</div>
              <p className="text-xs text-[#6C6975]">
                Audio blobs and raster buffers are held exclusively in browser heap memory. Closing or refreshing the tab securely purges them.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#E8DFD4] space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFEEDA] text-[#A05E32] flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div className="font-bold text-sm text-[#191C21]">Browser Sandbox</div>
              <p className="text-xs text-[#6C6975]">
                Operates strictly under same-origin security policies, preventing unauthorized file system access or external script injection.
              </p>
            </div>

          </div>

          <div className="space-y-2 pt-2 text-xs">
            <h4 className="font-semibold text-[#191C21] text-sm">
              Offline Verification Steps
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-[#6C6975] pl-1 font-mono">
              <li>Open Chrome / Firefox / Safari DevTools (F12)</li>
              <li>Switch to the Network tab and filter by &quot;Fetch / XHR&quot;</li>
              <li>Synthesize speech, remove a background, or convert a file</li>
              <li>Verify that zero outbound POST / PUT payload requests occur</li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DFD4] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#534C72] hover:bg-[#433D5D] text-white text-xs font-medium transition-colors"
          >
            Understood
          </button>
        </div>

      </div>
    </div>
  );
};
