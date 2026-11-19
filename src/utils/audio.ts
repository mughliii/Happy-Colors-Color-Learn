import { LanguageMode } from '../types';

let sharedAudioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      sharedAudioCtx = new AudioCtx();
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

function playTone(
  freq: number,
  duration = 0.12,
  type: OscillatorType = 'sine',
  volume = 0.16,
  enabled = true
) {
  if (!enabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Ignore audio context errors on restricted browsers
  }
}

export function playPop(enabled: boolean) {
  if (!enabled) return;
  playTone(540, 0.08, 'triangle', 0.2, true);
  window.setTimeout(() => playTone(820, 0.09, 'sine', 0.14, true), 38);
}

export function playClick(enabled: boolean) {
  playTone(440, 0.06, 'sine', 0.13, enabled);
}

export function playSuccess(enabled: boolean) {
  if (!enabled) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
    window.setTimeout(() => playTone(freq, 0.18, 'triangle', 0.18, true), idx * 85);
  });
}

export function playOops(enabled: boolean) {
  if (!enabled) return;
  playTone(270, 0.16, 'sawtooth', 0.1, true);
  window.setTimeout(() => playTone(210, 0.2, 'sawtooth', 0.1, true), 110);
}

export function playSparkle(enabled: boolean) {
  if (!enabled) return;
  [659, 880, 1175, 1318].forEach((freq, idx) => {
    window.setTimeout(() => playTone(freq, 0.11, 'sine', 0.13, true), idx * 55);
  });
}

export function triggerHaptic(ms = 18) {
  if (window.AndroidBridge?.vibrate) {
    window.AndroidBridge.vibrate(ms);
  } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      // Haptics unavailable
    }
  }
}

export function speakText(
  enText: string,
  urText: string,
  langMode: LanguageMode,
  voiceEnabled: boolean
) {
  if (!voiceEnabled) return;

  const speakSingle = (text: string, langCode: 'en' | 'ur', onEnd?: () => void) => {
    if (!text.trim()) return;

    if (window.AndroidBridge?.speak) {
      window.AndroidBridge.speak(text, langCode);
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode === 'ur' ? 'ur-PK' : 'en-US';
      utterance.rate = 0.88;
      utterance.pitch = 1.12;

      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find((v) =>
        langCode === 'ur'
          ? v.lang.toLowerCase().startsWith('ur')
          : v.lang.toLowerCase().startsWith('en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      if (onEnd) {
        utterance.onend = onEnd;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  if (langMode === 'ur' && urText) {
    speakSingle(urText, 'ur');
  } else if (langMode === 'both' && urText) {
    if (window.AndroidBridge?.speak) {
      window.AndroidBridge.speak(enText, 'en');
    } else {
      speakSingle(enText, 'en', () => {
        // Speak Urdu right after English if an Urdu voice exists on the device
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const hasUrduVoice = window.speechSynthesis
            .getVoices()
            .some((v) => v.lang.toLowerCase().startsWith('ur'));
          if (hasUrduVoice) {
            speakSingle(urText, 'ur');
          }
        }
      });
    }
  } else {
    speakSingle(enText, 'en');
  }
}
