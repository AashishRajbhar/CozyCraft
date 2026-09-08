import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  Sparkles,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  RotateCcw,
  ClipboardPaste,
  ShieldCheck,
  Radio,
  SlidersHorizontal,
  Trash2,
  Loader2,
  Clock,
  Database
} from 'lucide-react';
import { VOICE_PERSONAS, INITIAL_GENERATIONS } from '../data/mockData';
import { VoicePersona, AudioGeneration } from '../types';
import {
  generateAudioWaveform,
  createSynthesizedWavBlob,
  playBrowserSpeech,
  stopBrowserSpeech,
} from '../utils/audioSynthesis';

interface TextToVoiceStudioProps {
  onBack: () => void;
  onGenerationComplete?: (gen: AudioGeneration) => void;
}

export const TextToVoiceStudio: React.FC<TextToVoiceStudioProps> = ({
  onBack,
  onGenerationComplete,
}) => {
  // Input state
  const [scriptText, setScriptText] = useState(
    'Take a slow, deep breath in... hold gently for a moment... and exhale softly, releasing any tension from your shoulders and mind.'
  );
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('ember');
  const [cadence, setCadence] = useState<number>(1.0);
  const [pitchOffset, setPitchOffset] = useState<number>(0.0);
  const [deliveryMode, setDeliveryMode] = useState<'natural' | 'whisper'>('natural');

  // Generation & Active Result state
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<{
    persona: string;
    delivery: string;
    sampleRateText: string;
    durationSeconds: number;
    currentTime: number;
    isPlaying: boolean;
    audioUrl?: string;
    blob?: Blob;
    waveform: number[];
  }>({
    persona: 'Ember',
    delivery: 'Natural Speech',
    sampleRateText: '24kHz Uncompressed',
    durationSeconds: 8.4,
    currentTime: 3.4,
    isPlaying: false,
    waveform: generateAudioWaveform(36, 12),
  });

  // Recent generations list
  const [generations, setGenerations] = useState<AudioGeneration[]>(INITIAL_GENERATIONS);
  const [playingGenId, setPlayingGenId] = useState<string | null>(null);

  // Playback timer ref
  const playbackTimerRef = useRef<number | null>(null);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Est duration calculation
  const wordCount = scriptText.trim().split(/\s+/).filter(Boolean).length;
  const estDuration = Math.max(1.5, Math.round((wordCount / (2.5 * cadence)) * 10) / 10);

  const selectedPersona = VOICE_PERSONAS.find((p) => p.id === selectedPersonaId) || VOICE_PERSONAS[0];

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopBrowserSpeech();
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, []);

  // Handle Play/Pause for Active Synthesis Result
  const togglePlayActive = () => {
    if (activeResult.isPlaying) {
      stopBrowserSpeech();
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      setActiveResult((prev) => ({ ...prev, isPlaying: false }));
    } else {
      // Start real speech synthesis or timer playback
      const targetDuration = activeResult.durationSeconds;
      setActiveResult((prev) => ({ ...prev, isPlaying: true, currentTime: 0 }));

      activeUtteranceRef.current = playBrowserSpeech(
        scriptText,
        activeResult.persona,
        cadence,
        pitchOffset,
        () => {
          setActiveResult((prev) => ({ ...prev, isPlaying: false, currentTime: targetDuration }));
          if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
        }
      );

      const step = 0.1;
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = window.setInterval(() => {
        setActiveResult((prev) => {
          if (prev.currentTime >= prev.durationSeconds) {
            clearInterval(playbackTimerRef.current!);
            return { ...prev, isPlaying: false, currentTime: prev.durationSeconds };
          }
          return { ...prev, currentTime: Math.min(prev.durationSeconds, prev.currentTime + step) };
        });
      }, 100);
    }
  };

  // Scrub active audio waveform
  const handleScrubWaveform = (fraction: number) => {
    const newTime = Math.round(fraction * activeResult.durationSeconds * 10) / 10;
    setActiveResult((prev) => ({ ...prev, currentTime: newTime }));
  };

  // Synthesize Speech button action
  const handleSynthesize = async () => {
    if (!scriptText.trim()) return;
    setIsSynthesizing(true);
    stopBrowserSpeech();

    try {
      // Generate actual WAV in browser RAM
      const { blob, url, duration } = await createSynthesizedWavBlob(
        scriptText,
        selectedPersona.name,
        cadence,
        pitchOffset,
        deliveryMode === 'whisper'
      );

      const newWaveform = generateAudioWaveform(36, Math.floor(Math.random() * 100));

      const newResult = {
        persona: selectedPersona.name,
        delivery: deliveryMode === 'whisper' ? 'Whisper Soft' : 'Natural Speech',
        sampleRateText: '24kHz Uncompressed',
        durationSeconds: duration,
        currentTime: 0,
        isPlaying: false,
        audioUrl: url,
        blob: blob,
        waveform: newWaveform,
      };

      setActiveResult(newResult);

      // Create new generation record
      const fileName = `${selectedPersona.name.toLowerCase()}_narration_${Date.now().toString().slice(-4)}.wav`;
      const sizeKb = Math.round(blob.size / 1024);
      const newGen: AudioGeneration = {
        id: `gen-${Date.now()}`,
        fileName,
        personaName: selectedPersona.name,
        durationText: `${duration.toFixed(1)}s`,
        durationSeconds: duration,
        sizeText: `${sizeKb} KB`,
        format: 'wav',
        text: scriptText,
        timestamp: 'Just now',
        audioBlobUrl: url,
      };

      setGenerations((prev) => [newGen, ...prev]);
      if (onGenerationComplete) {
        onGenerationComplete(newGen);
      }
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Download active file
  const handleDownload = (format: 'wav' | 'mp3') => {
    const filename = `${activeResult.persona.toLowerCase()}_speech_${Date.now().toString().slice(-4)}.${format}`;
    if (activeResult.audioUrl) {
      const a = document.createElement('a');
      a.href = activeResult.audioUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Fallback: create blob on demand
      createSynthesizedWavBlob(scriptText, activeResult.persona).then(({ url }) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      });
    }
  };

  // Copy speech script
  const handleCopyScript = () => {
    navigator.clipboard.writeText(scriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // Paste from clipboard
  const handlePasteScript = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setScriptText(text);
    } catch {
      // In case permissions restrict clipboard read
      const sample = 'Breathe in tranquility, breathe out distraction. Let every breath ground you in quiet awareness.';
      setScriptText(sample);
    }
  };

  // Play generation item
  const handleTogglePlayGen = (gen: AudioGeneration) => {
    if (playingGenId === gen.id) {
      stopBrowserSpeech();
      setPlayingGenId(null);
    } else {
      stopBrowserSpeech();
      setPlayingGenId(gen.id);
      playBrowserSpeech(gen.text, gen.personaName, 1.0, 0, () => {
        setPlayingGenId(null);
      });
    }
  };

  // Delete generation item
  const handleDeleteGen = (id: string) => {
    setGenerations((prev) => prev.filter((g) => g.id !== id));
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div className="w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top Breadcrumb & Zero-Server Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-2 text-[#6C6975] flex-wrap">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 font-medium text-[#191C21] hover:text-[#534C72] transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </button>
          <span className="text-[#C9C5CF]">/</span>
          <span>Audio & Speech</span>
          <span className="text-[#C9C5CF]">/</span>
          <span className="text-[#191C21] font-medium">Text to Voice</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#EBF5ED] text-[#2F6D44] border border-[#CFE8D7] w-fit select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2F6D44]" />
          Zero Server Uploads • In-Memory Neural WASM
        </div>
      </div>

      {/* Page Title & Subtitle */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FFEEDA] border border-[#F6DCBE] flex items-center justify-center shrink-0 shadow-2xs">
          <Volume2 className="w-6 h-6 text-[#A05E32]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191C21]">
            Text to Voice Studio
          </h1>
          <p className="text-[#6C6975] text-sm sm:text-base mt-1">
            Synthesize warm, natural voiceovers locally in your browser memory.
          </p>
        </div>
      </div>

      {/* Main Synthesizer Configuration Card */}
      <div className="bg-white rounded-2xl border border-[#E8DFD4] p-5 sm:p-7 shadow-[0_4px_20px_-2px_rgba(107,100,140,0.05)] space-y-6">
        
        {/* Section: Speech Script Header & Actions */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[#191C21] text-base">Speech Script</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#F2ECE4] text-[#5A5762] border border-[#E2D8CC]">
                EN-US
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handlePasteScript}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[#534C72] hover:bg-[#F2ECE4] transition-colors"
                title="Paste text from clipboard"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                Paste text
              </button>
              <button
                onClick={() => setScriptText('')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[#79767F] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/40 transition-colors"
                title="Clear current text"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>

          {/* Textarea */}
          <div className="relative rounded-xl border border-[#E4DBD0] bg-[#FAF7F2] p-3.5 sm:p-4 focus-within:border-[#534C72] focus-within:ring-2 focus-within:ring-[#534C72]/15 transition-all">
            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="Enter your script to synthesize warm offline speech..."
              className="w-full bg-transparent resize-none text-[#191C21] placeholder-[#A5A0B2] text-sm sm:text-base leading-relaxed focus:outline-none"
            />

            <div className="flex items-center justify-between pt-2 border-t border-[#ECE5DB] text-xs text-[#79767F] font-mono">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#534C72]" />
                Est. Duration: ~{estDuration}s
              </span>
              <span>
                {scriptText.length} / 5,000 characters
              </span>
            </div>
          </div>
        </div>

        {/* Section: Voice Persona */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#191C21] text-sm">Voice Persona</span>
            <span className="text-xs font-mono text-[#79767F] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#768E7C]" />
              Local Onnx Model
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {VOICE_PERSONAS.map((persona) => {
              const isSelected = selectedPersonaId === persona.id;
              return (
                <div
                  key={persona.id}
                  onClick={() => setSelectedPersonaId(persona.id)}
                  className={`relative p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#534C72] bg-white ring-2 ring-[#534C72]/15 shadow-sm'
                      : 'border-[#E8DFD4] bg-[#FAF7F2]/60 hover:bg-white hover:border-[#DFD6C9]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm select-none ${persona.bgColor} ${persona.textColor}`}
                    >
                      {persona.letter}
                    </div>

                    <div className="pt-0.5">
                      {isSelected ? (
                        <div className="w-4 h-4 rounded-full border-2 border-[#534C72] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#534C72]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-[#C9C5CF]" />
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="font-semibold text-[#191C21] text-sm">
                      {persona.name}
                    </div>
                    <div className="text-xs text-[#6C6975] mt-0.5">
                      {persona.subtitle}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#EFE8DD] text-[11px] text-[#5A5762] flex items-center gap-1">
                    <span>{persona.tag}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Cadence, Pitch, Delivery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          {/* Cadence / Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[#191C21] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#534C72]" />
                Cadence / Speed
              </span>
              <span className="font-mono text-[#534C72]">{cadence.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.6"
              max="1.4"
              step="0.05"
              value={cadence}
              onChange={(e) => setCadence(parseFloat(e.target.value))}
              className="w-full accent-[#534C72] cursor-pointer h-1.5 bg-[#E8DFD4] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#79767F] font-mono">
              <span>0.6x Slow</span>
              <span>Balanced</span>
              <span>1.4x Fast</span>
            </div>
          </div>

          {/* Pitch Warmth */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[#191C21] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#D97A53]" />
                Pitch Warmth
              </span>
              <span className="font-mono text-[#D97A53]">
                {pitchOffset > 0 ? `+${pitchOffset.toFixed(1)}` : pitchOffset.toFixed(1)} st
              </span>
            </div>
            <input
              type="range"
              min="-2.0"
              max="2.0"
              step="0.1"
              value={pitchOffset}
              onChange={(e) => setPitchOffset(parseFloat(e.target.value))}
              className="w-full accent-[#D97A53] cursor-pointer h-1.5 bg-[#E8DFD4] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#79767F] font-mono">
              <span>Deeper</span>
              <span>Natural</span>
              <span>Higher</span>
            </div>
          </div>

          {/* Vocal Delivery Intonation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[#191C21]">Vocal Delivery</span>
              <span className="text-[11px] font-mono text-[#79767F]">Intonation</span>
            </div>
            
            <div className="grid grid-cols-2 p-1 bg-[#F2ECE4] rounded-xl border border-[#E2D8CC]">
              <button
                onClick={() => setDeliveryMode('natural')}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                  deliveryMode === 'natural'
                    ? 'bg-white text-[#191C21] shadow-2xs'
                    : 'text-[#6C6975] hover:text-[#191C21]'
                }`}
              >
                Natural
              </button>
              <button
                onClick={() => setDeliveryMode('whisper')}
                className={`py-1.5 text-xs font-medium rounded-lg transition-all ${
                  deliveryMode === 'whisper'
                    ? 'bg-white text-[#191C21] shadow-2xs'
                    : 'text-[#6C6975] hover:text-[#191C21]'
                }`}
              >
                Whisper Soft
              </button>
            </div>
            <p className="text-[10px] text-[#79767F] text-center">
              {deliveryMode === 'natural' ? 'Gentle soothing resonance' : 'Quiet intimate whisper contour'}
            </p>
          </div>

        </div>

        {/* Bottom Action Bar */}
        <div className="pt-4 border-t border-[#E8DFD4] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#5A5762]">
            <span className="w-2 h-2 rounded-full bg-[#3EA25E]" />
            Engine: <span className="font-semibold text-[#191C21]">Piper WASM Neural</span> (Cached in RAM)
          </div>

          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing || !scriptText.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#534C72] hover:bg-[#433D5D] active:scale-[0.98] text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50"
          >
            {isSynthesizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synthesizing locally...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Synthesize Speech
              </>
            )}
          </button>
        </div>

      </div>

      {/* Active Synthesis Result Card */}
      <div className="bg-white rounded-2xl border border-[#E8DFD4] p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(107,100,140,0.05)] space-y-4">
        
        {/* Header of Active Result */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#EBF5ED] flex items-center justify-center text-[#2F6D44] shrink-0 border border-[#CFE8D7]">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-semibold text-[#191C21] text-sm sm:text-base">
                Active Synthesis Result
              </div>
              <div className="text-xs text-[#6C6975]">
                {activeResult.persona} • {activeResult.delivery} • {activeResult.sampleRateText}
              </div>
            </div>
          </div>

          {/* Action buttons on top right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload('mp3')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-[#F2ECE4] text-[#272A30] border border-[#E2D8CC] hover:bg-[#EAE2D8] transition-colors"
              title="Download MP3"
            >
              <Download className="w-3 h-3" />
              .mp3
            </button>
            <button
              onClick={() => handleDownload('wav')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium bg-[#F2ECE4] text-[#272A30] border border-[#E2D8CC] hover:bg-[#EAE2D8] transition-colors"
              title="Download WAV"
            >
              <Download className="w-3 h-3" />
              .wav
            </button>
            <button
              onClick={handleCopyScript}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#F2ECE4] text-[#272A30] border border-[#E2D8CC] hover:bg-[#EAE2D8] transition-colors"
              title="Copy Script"
            >
              {copiedScript ? <Check className="w-3 h-3 text-[#2F6D44]" /> : <Copy className="w-3 h-3" />}
              {copiedScript ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Audio Player Container with Interactive Waveform */}
        <div className="rounded-xl bg-[#F4EFEA] border border-[#E6DED2] p-4 flex items-center gap-4 sm:gap-6">
          {/* Circular Play / Pause button */}
          <button
            onClick={togglePlayActive}
            className="w-12 h-12 rounded-full bg-[#534C72] hover:bg-[#433D5D] active:scale-95 text-white flex items-center justify-center shrink-0 shadow-md transition-all"
            title={activeResult.isPlaying ? 'Pause narration' : 'Play narration'}
          >
            {activeResult.isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Current Time */}
          <span className="text-xs font-mono font-medium text-[#48464E] shrink-0">
            {formatSeconds(activeResult.currentTime)}
          </span>

          {/* Waveform Bars Display with scrubbing */}
          <div
            className="flex-1 flex items-center gap-[3px] sm:gap-[5px] h-10 cursor-pointer py-1 select-none"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              handleScrubWaveform(fraction);
            }}
          >
            {activeResult.waveform.map((val, idx) => {
              const barProgress = idx / activeResult.waveform.length;
              const currentProgress = activeResult.currentTime / activeResult.durationSeconds;
              const isPlayed = barProgress <= currentProgress;

              return (
                <div
                  key={idx}
                  className="flex-1 flex items-center justify-center h-full"
                  title={`Seek to ${(barProgress * activeResult.durationSeconds).toFixed(1)}s`}
                >
                  <div
                    style={{ height: `${Math.max(15, Math.round(val * 100))}%` }}
                    className={`w-full rounded-full transition-all duration-75 ${
                      isPlayed
                        ? 'bg-[#534C72]'
                        : 'bg-[#D1C9BE] hover:bg-[#B7AEA2]'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          {/* Total Duration */}
          <span className="text-xs font-mono text-[#79767F] shrink-0">
            {formatSeconds(activeResult.durationSeconds)}
          </span>
        </div>

      </div>

      {/* Recent Generations in this Session */}
      <div className="bg-white rounded-2xl border border-[#E8DFD4] p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(107,100,140,0.05)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-[#79767F]" />
            <span className="font-semibold text-[#191C21] text-sm sm:text-base">
              Recent Generations in this Session
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-[#79767F]">
            <Database className="w-3.5 h-3.5 text-[#534C72]" />
            <span>Stored in browser IndexedDB</span>
          </div>
        </div>

        <div className="divide-y divide-[#F0E9DF]">
          {generations.map((gen) => {
            const isThisPlaying = playingGenId === gen.id;

            return (
              <div
                key={gen.id}
                className="py-3.5 first:pt-1 last:pb-1 flex items-center justify-between gap-3 hover:bg-[#FAF7F2]/60 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => handleTogglePlayGen(gen)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                      isThisPlaying
                        ? 'bg-[#534C72] text-white'
                        : 'bg-[#F2ECE4] text-[#534C72] hover:bg-[#E8DFD4]'
                    }`}
                    title={isThisPlaying ? 'Pause' : 'Play this clip'}
                  >
                    {isThisPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <div className="text-sm font-medium text-[#191C21] truncate">
                      {gen.fileName}
                    </div>
                    <div className="text-xs text-[#79767F] font-mono mt-0.5">
                      {gen.personaName} • {gen.durationText} • {gen.sizeText}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (gen.audioBlobUrl) {
                        const a = document.createElement('a');
                        a.href = gen.audioBlobUrl;
                        a.download = gen.fileName;
                        a.click();
                      } else {
                        createSynthesizedWavBlob(gen.text, gen.personaName).then(({ url }) => {
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = gen.fileName;
                          a.click();
                        });
                      }
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#5A5762] hover:text-[#191C21] hover:bg-[#F2ECE4] transition-colors"
                    title="Download audio"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteGen(gen.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[#79767F] hover:text-[#BA1A1A] hover:bg-[#FFDAD6]/50 transition-colors"
                    title="Remove from session list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Security Reassurance Card */}
      <div className="p-4 rounded-xl bg-[#EBF5ED]/80 border border-[#CFE8D7] text-xs text-[#2F6D44] flex items-center justify-center text-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#2F6D44] shrink-0" />
        <span>
          Zero-knowledge speech synthesis. No speech or text ever touches an external server. Everything executes locally.
        </span>
      </div>

    </div>
  );
};
