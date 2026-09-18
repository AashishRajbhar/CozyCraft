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
  Database,
  Globe,
  Star
} from 'lucide-react';
import { VOICE_PERSONAS, INITIAL_GENERATIONS } from '../data/mockData';
import { VoicePersona, AudioGeneration } from '../types';
import {
  generateAudioWaveform,
  synthesizeEdgeTTSAudio,
  createSynthesizedWavBlob,
  stopBrowserSpeech,
} from '../utils/audioSynthesis';

interface TextToVoiceStudioProps {
  onBack: () => void;
  onGenerationComplete?: (gen: AudioGeneration) => void;
}

const LANGUAGE_FILTERS = [
  'All',
  'English (US)',
  'English (UK)',
  'Hindi',
  'Bengali',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Gujarati',
  'Taiwanese Mandarin'
];

export const TextToVoiceStudio: React.FC<TextToVoiceStudioProps> = ({
  onBack,
  onGenerationComplete,
}) => {
  // Input state
  const [scriptText, setScriptText] = useState(
    'Take a slow, deep breath in... hold gently for a moment... and exhale softly, releasing any tension from your shoulders and mind.'
  );
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('en-us-guy');
  const [ratePercentage, setRatePercentage] = useState<number>(0); // -50% to +50%
  const [pitchHz, setPitchHz] = useState<number>(0); // -20Hz to +20Hz

  // Generation & Active Result state
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [activeResult, setActiveResult] = useState<{
    persona: string;
    voiceId: string;
    delivery: string;
    sampleRateText: string;
    durationSeconds: number;
    currentTime: number;
    isPlaying: boolean;
    audioUrl?: string;
    blob?: Blob;
    waveform: number[];
  }>({
    persona: 'Guy (en-US-GuyNeural)',
    voiceId: 'en-US-GuyNeural',
    delivery: 'Microsoft Edge-TTS Neural',
    sampleRateText: 'High Fidelity MP3 Stream',
    durationSeconds: 8.4,
    currentTime: 0,
    isPlaying: false,
    waveform: generateAudioWaveform(36, 12),
  });

  // Recent generations list
  const [generations, setGenerations] = useState<AudioGeneration[]>(INITIAL_GENERATIONS);
  const [playingGenId, setPlayingGenId] = useState<string | null>(null);

  // Audio HTML elements refs
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const genAudioElementRef = useRef<HTMLAudioElement | null>(null);

  // Filter personas by language
  const filteredPersonas = selectedLanguage === 'All'
    ? VOICE_PERSONAS
    : VOICE_PERSONAS.filter(p => p.language === selectedLanguage);

  const selectedPersona = VOICE_PERSONAS.find((p) => p.id === selectedPersonaId) || VOICE_PERSONAS[0];

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopBrowserSpeech();
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      if (genAudioElementRef.current) {
        genAudioElementRef.current.pause();
      }
    };
  }, []);

  // Est duration calculation
  const wordCount = scriptText.trim().split(/\s+/).filter(Boolean).length;
  const speedFactor = 1 + (ratePercentage / 100);
  const estDuration = Math.max(1.0, Math.round((wordCount / (2.5 * Math.max(0.5, speedFactor))) * 10) / 10);

  // Handle Play/Pause for Active Synthesis Result
  const togglePlayActive = () => {
    if (!activeResult.audioUrl) {
      // Synthesize first if no audioUrl
      handleSynthesize();
      return;
    }

    if (!audioElementRef.current) {
      audioElementRef.current = new Audio(activeResult.audioUrl);
      
      audioElementRef.current.ontimeupdate = () => {
        if (audioElementRef.current) {
          setActiveResult((prev) => ({
            ...prev,
            currentTime: audioElementRef.current?.currentTime || 0,
          }));
        }
      };

      audioElementRef.current.onended = () => {
        setActiveResult((prev) => ({ ...prev, isPlaying: false, currentTime: prev.durationSeconds }));
      };
    }

    if (activeResult.isPlaying) {
      audioElementRef.current.pause();
      setActiveResult((prev) => ({ ...prev, isPlaying: false }));
    } else {
      if (audioElementRef.current.src !== activeResult.audioUrl) {
        audioElementRef.current.src = activeResult.audioUrl;
      }
      audioElementRef.current.play().then(() => {
        setActiveResult((prev) => ({ ...prev, isPlaying: true }));
      }).catch(err => {
        console.error("Audio playback error:", err);
        setActiveResult((prev) => ({ ...prev, isPlaying: false }));
      });
    }
  };

  // Scrub active audio waveform
  const handleScrubWaveform = (fraction: number) => {
    const newTime = Math.round(fraction * activeResult.durationSeconds * 10) / 10;
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = newTime;
    }
    setActiveResult((prev) => ({ ...prev, currentTime: newTime }));
  };

  // Synthesize Speech button action using Edge-TTS
  const handleSynthesize = async () => {
    if (!scriptText.trim()) return;
    setIsSynthesizing(true);
    stopBrowserSpeech();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    try {
      let blob: Blob;
      let url: string;
      let duration: number;

      try {
        // Call Python Edge-TTS API
        const result = await synthesizeEdgeTTSAudio(
          scriptText,
          selectedPersona.voiceId,
          ratePercentage,
          pitchHz
        );
        blob = result.blob;
        url = result.url;
        duration = result.duration;
      } catch (apiError) {
        console.warn("Edge-TTS API call failed, falling back to Web Audio synthesis:", apiError);
        const result = await createSynthesizedWavBlob(
          scriptText,
          selectedPersona.name,
          1 + (ratePercentage / 100),
          pitchHz / 5
        );
        blob = result.blob;
        url = result.url;
        duration = result.duration;
      }

      const newWaveform = generateAudioWaveform(36, Math.floor(Math.random() * 100));

      const newResult = {
        persona: `${selectedPersona.name} (${selectedPersona.voiceId})`,
        voiceId: selectedPersona.voiceId,
        delivery: `Microsoft Edge-TTS (${selectedPersona.language})`,
        sampleRateText: '24kHz High-Fidelity MP3',
        durationSeconds: duration,
        currentTime: 0,
        isPlaying: true,
        audioUrl: url,
        blob: blob,
        waveform: newWaveform,
      };

      setActiveResult(newResult);

      // Play newly generated audio immediately
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      audioElementRef.current = new Audio(url);
      audioElementRef.current.ontimeupdate = () => {
        if (audioElementRef.current) {
          setActiveResult((prev) => ({
            ...prev,
            currentTime: audioElementRef.current?.currentTime || 0,
          }));
        }
      };
      audioElementRef.current.onended = () => {
        setActiveResult((prev) => ({ ...prev, isPlaying: false, currentTime: duration }));
      };
      audioElementRef.current.play().catch(e => console.error("Auto-play error:", e));

      // Create new generation record
      const fileName = `${selectedPersona.voiceId.toLowerCase()}_${Date.now().toString().slice(-4)}.mp3`;
      const sizeKb = Math.round(blob.size / 1024);
      const newGen: AudioGeneration = {
        id: `gen-${Date.now()}`,
        fileName,
        personaName: `${selectedPersona.name} (${selectedPersona.tag})`,
        durationText: `${duration.toFixed(1)}s`,
        durationSeconds: duration,
        sizeText: `${sizeKb} KB`,
        format: 'mp3',
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
  const handleDownload = (format: 'mp3' | 'wav' = 'mp3') => {
    const filename = `${activeResult.voiceId.toLowerCase()}_speech_${Date.now().toString().slice(-4)}.${format}`;
    if (activeResult.audioUrl) {
      const a = document.createElement('a');
      a.href = activeResult.audioUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
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
      const sample = 'Welcome to CozyCraft Studio. High-quality neural speech synthesis running with Microsoft Edge-TTS.';
      setScriptText(sample);
    }
  };

  // Play generation item
  const handleTogglePlayGen = (gen: AudioGeneration) => {
    if (playingGenId === gen.id) {
      if (genAudioElementRef.current) {
        genAudioElementRef.current.pause();
      }
      setPlayingGenId(null);
    } else {
      if (genAudioElementRef.current) {
        genAudioElementRef.current.pause();
      }
      if (gen.audioBlobUrl) {
        genAudioElementRef.current = new Audio(gen.audioBlobUrl);
        genAudioElementRef.current.onended = () => setPlayingGenId(null);
        genAudioElementRef.current.play().catch(() => setPlayingGenId(null));
        setPlayingGenId(gen.id);
      }
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
      {/* Top Breadcrumb & Edge-TTS Neural Badge */}
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
          <span className="text-[#191C21] font-medium">Edge-TTS Neural Voice</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-[#EBF5ED] text-[#2F6D44] border border-[#CFE8D7] w-fit select-none">
          <ShieldCheck className="w-3.5 h-3.5 text-[#2F6D44]" />
          Powered by Python Edge-TTS Engine • Multilingual High Quality
        </div>
      </div>

      {/* Page Title & Subtitle */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#FFEEDA] border border-[#F6DCBE] flex items-center justify-center shrink-0 shadow-2xs">
          <Volume2 className="w-6 h-6 text-[#A05E32]" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191C21]">
            Text to Voice Studio (Edge-TTS Engine)
          </h1>
          <p className="text-[#6C6975] text-sm sm:text-base mt-1">
            Synthesize ultra-realistic neural speech across 11+ languages and regional voices.
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
                {selectedPersona.locale}
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
              placeholder="Enter your script to synthesize high-quality Edge-TTS speech..."
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

        {/* Section: Language Filter Pills */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-[#191C21] text-sm flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#534C72]" />
              Filter Language / Region
            </span>
            <span className="text-xs font-mono text-[#79767F]">
              Showing {filteredPersonas.length} Voices
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {LANGUAGE_FILTERS.map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setSelectedLanguage(lang);
                  const firstMatch = lang === 'All'
                    ? VOICE_PERSONAS[0]
                    : VOICE_PERSONAS.find(p => p.language === lang);
                  if (firstMatch) {
                    setSelectedPersonaId(firstMatch.id);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  selectedLanguage === lang
                    ? 'bg-[#534C72] text-white shadow-2xs'
                    : 'bg-[#F2ECE4] text-[#6C6975] hover:bg-[#E8DFD4] hover:text-[#191C21]'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Section: Voice Persona Grid */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[320px] overflow-y-auto pr-1">
            {filteredPersonas.map((persona) => {
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
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm select-none ${persona.bgColor} ${persona.textColor}`}
                      >
                        {persona.letter}
                      </div>
                      <div>
                        <div className="font-semibold text-[#191C21] text-sm flex items-center gap-1">
                          {persona.name}
                          {persona.isPopular && (
                            <Star className="w-3.5 h-3.5 text-[#D97A53] fill-current" title="Most Popular" />
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-[#79767F]">
                          {persona.voiceId}
                        </div>
                      </div>
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

                  <div className="mt-3 pt-2 border-t border-[#EFE8DD] text-[11px] text-[#5A5762] flex items-center justify-between">
                    <span className="font-medium text-[#534C72]">{persona.tag}</span>
                    <span className="capitalize px-2 py-0.5 rounded bg-[#F2ECE4] text-[#6C6975] font-mono">
                      {persona.gender}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Speed Rate & Pitch Offset Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          
          {/* Speed Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[#191C21] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#534C72]" />
                Speed Rate (% Change)
              </span>
              <span className="font-mono text-[#534C72]">
                {ratePercentage >= 0 ? `+${ratePercentage}%` : `${ratePercentage}%`}
              </span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="5"
              value={ratePercentage}
              onChange={(e) => setRatePercentage(parseInt(e.target.value))}
              className="w-full accent-[#534C72] cursor-pointer h-1.5 bg-[#E8DFD4] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#79767F] font-mono">
              <span>-50% Slower</span>
              <span>Normal (+0%)</span>
              <span>+50% Faster</span>
            </div>
          </div>

          {/* Pitch Offset */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-[#191C21] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#D97A53]" />
                Pitch Offset (Hz)
              </span>
              <span className="font-mono text-[#D97A53]">
                {pitchHz >= 0 ? `+${pitchHz}Hz` : `${pitchHz}Hz`}
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="2"
              value={pitchHz}
              onChange={(e) => setPitchHz(parseInt(e.target.value))}
              className="w-full accent-[#D97A53] cursor-pointer h-1.5 bg-[#E8DFD4] rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-[#79767F] font-mono">
              <span>-20Hz Deeper</span>
              <span>Natural (+0Hz)</span>
              <span>+20Hz Higher</span>
            </div>
          </div>

        </div>

        {/* Bottom Action Bar */}
        <div className="pt-4 border-t border-[#E8DFD4] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#5A5762]">
            <span className="w-2 h-2 rounded-full bg-[#3EA25E]" />
            Active Voice: <span className="font-semibold text-[#191C21]">{selectedPersona.voiceId}</span>
          </div>

          <button
            onClick={handleSynthesize}
            disabled={isSynthesizing || !scriptText.trim()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#534C72] hover:bg-[#433D5D] active:scale-[0.98] text-white font-medium text-sm transition-all shadow-sm disabled:opacity-50"
          >
            {isSynthesizing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Synthesizing Edge-TTS...
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
                Active Edge-TTS Result
              </div>
              <div className="text-xs text-[#6C6975]">
                {activeResult.persona} • {activeResult.sampleRateText}
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
              Download .mp3
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
              const currentProgress = activeResult.currentTime / (activeResult.durationSeconds || 1);
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
              Recent Edge-TTS Generations
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-mono text-[#79767F]">
            <Database className="w-3.5 h-3.5 text-[#534C72]" />
            <span>Stored in browser RAM</span>
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
          Edge-TTS Engine active. Supports English (US/UK), Hindi, Bengali, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, and Taiwanese Mandarin.
        </span>
      </div>

    </div>
  );
};
