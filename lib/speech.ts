"use client";

import { useAppStore } from "@/store/useAppStore";
import { asset } from "@/lib/asset";
import { audioKey, syllableKey } from "@/lib/audioKey";
import audioManifest from "@/lib/audioManifest.json";

let cachedVoice: SpeechSynthesisVoice | null = null;
let voicesReady = false;

function findIndonesianVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  // Match id-ID, id_ID, id, or any id-* variant
  return (
    voices.find((v) => v.lang === "id-ID") ||
    voices.find((v) => v.lang === "id_ID") ||
    voices.find((v) => v.lang.toLowerCase().startsWith("id")) ||
    null
  );
}

function getIndonesianVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  cachedVoice = findIndonesianVoice();
  return cachedVoice;
}

// Voices load async on Android Chrome — preload them
if (typeof window !== "undefined" && window.speechSynthesis) {
  // Try immediately (works on iOS/desktop)
  if (window.speechSynthesis.getVoices().length > 0) {
    voicesReady = true;
    cachedVoice = findIndonesianVoice();
  }

  // Listen for async load (Android Chrome)
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    voicesReady = true;
    cachedVoice = findIndonesianVoice();
  };
}

function doSpeak(
  text: string,
  options?: { rate?: number; pitch?: number; lang?: string; onEnd?: () => void }
) {
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }

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

export function initSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  try {
    const utterance = new SpeechSynthesisUtterance("");
    utterance.volume = 0;
    window.speechSynthesis.speak(utterance);
  } catch {}
}

// Recorded natural voice (npm run gen:audio) for texts in the manifest; browser TTS otherwise.
const recorded = new Set<string>(audioManifest as string[]);
let currentAudio: HTMLAudioElement | null = null;

function stopRecorded() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

function playRecorded(text: string, onEnd?: () => void, keys: string[] = [audioKey(text)]): boolean {
  const key = keys.find((k) => recorded.has(k));
  if (!key || typeof Audio === "undefined") return false;
  stopRecorded();
  window.speechSynthesis?.cancel();
  const audio = new Audio(asset(`/audio/${key}.mp3`));
  currentAudio = audio;
  if (onEnd) audio.onended = onEnd;
  audio.play().catch(() => {
    // Autoplay blocked or file missing: fall back to the browser voice.
    if (currentAudio === audio) currentAudio = null;
    if (window.speechSynthesis) doSpeak(text, { onEnd });
  });
  return true;
}

export function speak(
  text: string,
  options?: { rate?: number; pitch?: number; lang?: string; onEnd?: () => void }
) {
  if (typeof window === "undefined") return;
  try {
    if (useAppStore.getState().isMuted) return;
  } catch {
    return;
  }

  if (playRecorded(text, options?.onEnd)) return;
  if (!window.speechSynthesis) return;
  stopRecorded();

  if (voicesReady) {
    doSpeak(text, options);
    return;
  }

  // Android: voices not loaded yet — wait for them (max 3s)
  // Trigger voice loading by calling getVoices()
  window.speechSynthesis.getVoices();

  let attempts = 0;
  const interval = setInterval(() => {
    attempts++;
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0 || attempts >= 15) {
      clearInterval(interval);
      voicesReady = true;
      cachedVoice = findIndonesianVoice();
      doSpeak(text, options);
    }
  }, 200);
}

export function speakIslamic(text: string, onEnd?: () => void) {
  speak(text, { rate: 0.6, pitch: 1.0, onEnd });
}

/**
 * Speak a syllable. Pass the word it belongs to so the recording made inside that
 * word is used (e.g. "be" in "bebek" vs "belajar"); falls back to the plain syllable.
 */
export function speakSyllable(syllable: string, onEnd?: () => void, word?: string) {
  if (word && typeof window !== "undefined") {
    try { if (useAppStore.getState().isMuted) return; } catch { return; }
    if (playRecorded(syllable, onEnd, [syllableKey(syllable, word), audioKey(syllable)])) return;
  }
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
      length: number;
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
  maxAlternatives: number;
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
  // The right word is often a lower-ranked guess for child speech; check several.
  recognition.maxAlternatives = 5;

  return recognition;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return !!(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );
}
