import React, { useState } from 'react';
import { X, Sliders, HardDrive, Volume2, Shield, Bell, Trash2, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ramLimitMb: number;
  onUpdateRamLimit: (limit: number) => void;
  offlineMode: boolean;
  onToggleOffline: () => void;
  onPurgeRam: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  ramLimitMb,
  onUpdateRamLimit,
  offlineMode,
  onToggleOffline,
  onPurgeRam,
}) => {
  const [audioQuality, setAudioQuality] = useState<'24khz' | '44khz' | '48khz'>('24khz');
  const [purgedMessage, setPurgedMessage] = useState(false);

  if (!isOpen) return null;

  const handlePurge = () => {
    onPurgeRam();
    setPurgedMessage(true);
    setTimeout(() => setPurgedMessage(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#272A30]/40 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-[#E8DFD4] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E8DFD4] bg-[#FAF7F2]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#534C72] flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-[#191C21]">
                Studio Settings & Allocations
              </h2>
              <p className="text-xs text-[#6C6975]">
                Configure local WebAssembly heap and client-side preferences
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

        {/* Settings Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          
          {/* Setting 1: RAM Buffer Cap */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#191C21] flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-[#534C72]" />
                WASM Heap Memory Limit
              </span>
              <span className="font-mono text-[#534C72] font-medium">{ramLimitMb} MB</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[256, 512, 1024].map((cap) => (
                <button
                  key={cap}
                  onClick={() => onUpdateRamLimit(cap)}
                  className={`py-2 text-xs font-mono rounded-xl border transition-all ${
                    ramLimitMb === cap
                      ? 'border-[#534C72] bg-[#FAF7F2] text-[#534C72] font-semibold ring-1 ring-[#534C72]'
                      : 'border-[#E8DFD4] text-[#6C6975] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {cap} MB
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#79767F]">
              Maximum buffer assigned to in-memory audio clips and decoded image frames.
            </p>
          </div>

          {/* Setting 2: Offline Isolation Switch */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E8DFD4]">
            <div className="space-y-0.5">
              <div className="font-semibold text-xs text-[#191C21] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#2F6D44]" />
                Enforce Offline Network Isolation
              </div>
              <div className="text-[11px] text-[#6C6975]">
                Blocks accidental background telemetry and external fonts
              </div>
            </div>

            <button
              onClick={onToggleOffline}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                offlineMode ? 'bg-[#2F6D44]' : 'bg-[#C9C5CF]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  offlineMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Setting 3: Audio Sample Rate */}
          <div className="space-y-2">
            <span className="font-semibold text-xs text-[#191C21] flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-[#A05E32]" />
              Default Neural Synthesis Frequency
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '24khz', label: '24 kHz (Warm / Fast)' },
                { id: '44khz', label: '44.1 kHz (CD)' },
                { id: '48khz', label: '48 kHz (Studio)' },
              ].map((rate) => (
                <button
                  key={rate.id}
                  onClick={() => setAudioQuality(rate.id as typeof audioQuality)}
                  className={`py-2 px-2 text-[11px] font-medium rounded-xl border text-center transition-all ${
                    audioQuality === rate.id
                      ? 'border-[#534C72] bg-[#FAF7F2] text-[#534C72] font-semibold ring-1 ring-[#534C72]'
                      : 'border-[#E8DFD4] text-[#6C6975] hover:bg-[#FAF7F2]'
                  }`}
                >
                  {rate.label}
                </button>
              ))}
            </div>
          </div>

          {/* Setting 4: Purge RAM now */}
          <div className="pt-2 border-t border-[#E8DFD4] flex items-center justify-between">
            <div className="text-xs text-[#79767F]">
              Clear all audio blobs and temporary frames from RAM
            </div>

            <button
              onClick={handlePurge}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-[#BA1A1A] bg-[#FFDAD6]/40 hover:bg-[#FFDAD6]/70 border border-[#FFB4AB] transition-colors"
            >
              {purgedMessage ? <Check className="w-3 h-3 text-[#2F6D44]" /> : <Trash2 className="w-3 h-3" />}
              {purgedMessage ? 'Buffer Cleared' : 'Purge RAM'}
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#E8DFD4] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#534C72] hover:bg-[#433D5D] text-white text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
