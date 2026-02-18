"use client";

let cachedVoice: SpeechSynthesisVoice | null = null;

function getIndonesianVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  // Prefer exact id-ID match, then any id- prefix
  cachedVoice =
    voices.find((v) => v.lang === "id-ID") ||
    voices.find((v) => v.lang.startsWith("id")) ||
    null;
  return cachedVoice;
}

// Reset cache when voices load (they load async on some browsers)
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
  };
}

export function speak(
  text: string,
  options?: { rate?: number; pitch?: number; lang?: string; onEnd?: () => void }
) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = options?.lang || "id-ID";
  utterance.rate = options?.rate || 0.8;
  utterance.pitch = options?.pitch || 1.1;

  const voice = getIndonesianVoice();
  if (voice) {
    utterance.voice = voice;
  }

  if (options?.onEnd) {
    utterance.onend = options.onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function speakIslamic(text: string, onEnd?: () => void) {
  speak(text, { rate: 0.6, pitch: 1.0, onEnd });
}

export function speakSyllable(syllable: string, onEnd?: () => void) {
  speak(syllable, { rate: 0.6, pitch: 1.1, onEnd });
}

type SpeechRecognitionEvent = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
        confidence: number;
      };
      isFinal: boolean;
    };
    length: number;
  };
};

type SpeechRecognitionErrorEvent = {
  error: string;
};

export interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export function createSpeechRecognition(): SpeechRecognitionInstance | null {
  if (typeof window === "undefined") return null;

  const SpeechRecognition =
    (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance }).webkitSpeechRecognition;

  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();
  recognition.lang = "id-ID";
  recognition.continuous = false;
  recognition.interimResults = true;

  return recognition;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}
