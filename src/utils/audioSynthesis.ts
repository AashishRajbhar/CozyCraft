// Client-side Web Audio API and Speech Synthesis helper
// 100% In-browser, zero server uploads

export function generateAudioWaveform(count: number = 36, seed: number = 42): number[] {
  // Generates a realistic vocal waveform pattern with natural rises and falls
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = i / (count - 1);
    // Gaussian-like envelope with speech formant variations
    const envelope = Math.sin(x * Math.PI);
    const jitter = Math.sin((i + seed) * 1.7) * 0.25 + Math.cos((i * 2.3) + seed) * 0.15;
    const height = Math.max(0.18, Math.min(1.0, (envelope * 0.75 + 0.25 + jitter * 0.4)));
    bars.push(Math.round(height * 100) / 100);
  }
  return bars;
}

export function createSynthesizedWavBlob(
  text: string,
  persona: string,
  cadence: number = 1.0,
  pitchOffset: number = 0.0,
  whisper: boolean = false
): Promise<{ blob: Blob; url: string; duration: number }> {
  return new Promise((resolve) => {
    // Calculate approximate duration based on word count and cadence
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const baseDuration = Math.max(2.5, Math.min(60, (words / (2.5 * cadence))));
    const duration = Math.round(baseDuration * 10) / 10;
    
    // Create an offline audio context to synthesize a calm ambient vocal tone
    const sampleRate = 24000;
    const numSamples = Math.floor(sampleRate * duration);
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    // Create audio buffer (1 channel, 24kHz matching the UI label: 24kHz Uncompressed)
    const audioBuffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = audioBuffer.getChannelData(0);

    // Fundamental frequencies for the personas
    let baseFreq = 160; // default
    if (persona === 'Ember') baseFreq = 145 + pitchOffset * 10; // Warm & calming deeper tone
    else if (persona === 'Hazel') baseFreq = 175 + pitchOffset * 10; // Soft storyteller
    else if (persona === 'River') baseFreq = 130 + pitchOffset * 10; // Gentle guide
    else if (persona === 'Nova') baseFreq = 210 + pitchOffset * 10; // Bright & crisp

    // Synthesize organic, soothing vocal formants
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Fade in and out smoothly
      const fadeIn = Math.min(1, t / 0.15);
      const fadeOut = Math.min(1, (duration - t) / 0.25);
      const envelope = fadeIn * fadeOut;

      // Natural speech-like cadence modulation
      const speechMod = 0.5 + 0.5 * Math.sin(2 * Math.PI * 3.5 * t);
      
      // Formant harmonic tones
      const f0 = baseFreq * (1 + 0.03 * Math.sin(2 * Math.PI * 4.2 * t));
      const harmonic1 = Math.sin(2 * Math.PI * f0 * t) * 0.4;
      const harmonic2 = Math.sin(2 * Math.PI * f0 * 2 * t) * 0.25;
      const harmonic3 = Math.sin(2 * Math.PI * f0 * 3 * t) * 0.12;
      
      // Whisper adds gentle pink noise
      const noise = whisper ? (Math.random() * 2 - 1) * 0.35 : 0;
      
      const sample = (harmonic1 + harmonic2 + harmonic3 + noise) * envelope * speechMod * 0.5;
      channelData[i] = Math.max(-1, Math.min(1, sample));
    }

    // Convert audio buffer to WAV format
    const wavBlob = audioBufferToWav(audioBuffer);
    const url = URL.createObjectURL(wavBlob);
    
    resolve({
      blob: wavBlob,
      url,
      duration
    });
  });
}

// Convert AudioBuffer to standard PCM 16-bit WAV Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const samples = buffer.getChannelData(0);
  const dataLength = samples.length * (bitDepth / 8);
  const bufferLength = 44 + dataLength;
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const view = new DataView(arrayBuffer);

  // Write RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');

  // Write fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * (bitDepth / 8), true);
  view.setUint16(32, numChannels * (bitDepth / 8), true);
  view.setUint16(34, bitDepth, true);

  // Write data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // Write 16-bit PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

// Play speech via Web Speech Synthesis with natural voice matching
export function playBrowserSpeech(
  text: string,
  persona: string,
  rate: number = 1.0,
  pitchOffset: number = 0.0,
  onEnd?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    if (onEnd) onEnd();
    return null;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Apply persona characteristics
  if (persona === 'Ember') {
    utterance.pitch = Math.max(0.7, 0.9 + pitchOffset * 0.1);
    utterance.rate = Math.max(0.6, rate * 0.9);
  } else if (persona === 'Hazel') {
    utterance.pitch = Math.max(0.7, 1.05 + pitchOffset * 0.1);
    utterance.rate = Math.max(0.6, rate * 0.95);
  } else if (persona === 'River') {
    utterance.pitch = Math.max(0.6, 0.85 + pitchOffset * 0.1);
    utterance.rate = Math.max(0.6, rate * 1.0);
  } else if (persona === 'Nova') {
    utterance.pitch = Math.max(0.8, 1.15 + pitchOffset * 0.1);
    utterance.rate = Math.max(0.7, rate * 1.1);
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    // Pick suitable english voice if available
    const naturalVoice = voices.find(v => 
      v.lang.startsWith('en') && (
        v.name.includes('Natural') || 
        v.name.includes('Google') || 
        v.name.includes('Samantha') || 
        v.name.includes('Daniel') ||
        v.name.includes('Karen')
      )
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
    
    if (naturalVoice) {
      utterance.voice = naturalVoice;
    }
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopBrowserSpeech() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
