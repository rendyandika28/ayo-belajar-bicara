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
// Ends the progress tracking of the playing clip (see playRecorded's onProgress).
let currentStop: (() => void) | null = null;

function stopRecorded() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  const stop = currentStop;
  currentStop = null;
  stop?.();
}

/** Stop any recording (and its progress tracking), e.g. when leaving a screen. */
export function stopAudio() {
  stopRecorded();
}

function playRecorded(
  text: string,
  onEnd?: () => void,
  keys: string[] = [audioKey(text)],
  onProgress?: (fraction: number) => void,
  rate?: number,
  speed?: number
): boolean {
  const key = keys.find((k) => recorded.has(k));
  if (!key || typeof Audio === "undefined") return false;
  stopRecorded();
  window.speechSynthesis?.cancel();
  const audio = new Audio(asset(`/audio/${key}.mp3`));
  // Slower playback of the same natural recording; browsers keep the pitch by default.
  if (speed) { audio.playbackRate = speed; audio.preservesPitch = true; }
  currentAudio = audio;
  let done = false;
  // Runs once however the clip ends: finished, replaced, stopped or failed mid-way.
  const finish = () => {
    if (done) return;
    done = true;
    if (currentStop === finish) currentStop = null;
    onEnd?.();
  };
  if (onProgress) {
    // Only progress callers get onEnd on stop: they must clear their highlight.
    currentStop = finish;
    // rAF, not timeupdate (fires only ~4x/s): smooth enough to follow syllables.
    const tick = () => {
      if (done || currentAudio !== audio) return;
      if (audio.ended) return finish();
      if (audio.duration > 0) onProgress(audio.currentTime / audio.duration);
      requestAnimationFrame(tick);
    };
    audio.onplay = () => requestAnimationFrame(tick);
    // Network error after playback started (before that, play() rejects: see catch).
    audio.onerror = () => {
      if (audio.currentTime > 0 && currentAudio === audio) {
        currentAudio = null;
        finish();
      }
    };
  }
  audio.onended = finish;
  audio.play().catch(() => {
    // Superseded by newer audio (pause() rejects play() with AbortError): stay silent,
    // otherwise the browser voice plays on top of the new recording.
    if (currentAudio !== audio) return;
    // Autoplay blocked or file missing: fall back to the browser voice.
    currentAudio = null;
    if (currentStop === finish) currentStop = null;
    done = true;
    if (window.speechSynthesis) doSpeak(text, { onEnd, rate });
    else onEnd?.();
  });
  return true;
}

export function speak(
  text: string,
  /** tts: skip recordings, always use the browser voice. speed: playback rate of the recording (0.7 = slower). */
  options?: { rate?: number; pitch?: number; lang?: string; onEnd?: () => void; tts?: boolean; speed?: number }
) {
  if (typeof window === "undefined") return;
  try {
    if (useAppStore.getState().isMuted) return;
  } catch {
    return;
  }

  // Slow playback asked for: the browser voice (no recording) must be slow too.
  if (options?.speed && options.rate === undefined) options = { ...options, rate: 0.6 };
  if (!options?.tts && playRecorded(text, options?.onEnd, undefined, undefined, options?.rate, options?.speed)) return;
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

/** Play the recording made from Arabic script under `key`; browser voice reads `fallback` if missing. */
function speakArabicRecording(key: string, fallback: string) {
  if (typeof window === "undefined") return;
  try { if (useAppStore.getState().isMuted) return; } catch { return; }
  if (playRecorded(fallback, undefined, [key], undefined, 0.6)) return;
  // Straight to the browser voice: the recording under audioKey(fallback) may be an
  // Indonesian syllable ("ha", "ba"), which is exactly the collision keys avoid.
  speak(fallback, { rate: 0.6, tts: true });
}

/** Hijaiyah letter name, recorded from its Arabic spelling (scripts/generate-audio.mjs, kind "hijaiyah"). */
export function speakHijaiyah(letter: { id: string; name: string }) {
  speakArabicRecording(`hijaiyah-${letter.id}`, letter.name);
}

/** Asmaul Husna name, recorded from its Arabic spelling (kind "asma"). */
export function speakAsma(item: { id: string; latin: string }) {
  speakArabicRecording(item.id, item.latin);
}

/**
 * Play a recording and report playback progress (0..1) while it plays.
 * Returns false when there is no recording (caller may fall back to speak()).
 */
export function playWithProgress(text: string, onProgress: (fraction: number) => void, onEnd?: () => void): boolean {
  if (typeof window === "undefined") return false;
  try { if (useAppStore.getState().isMuted) return false; } catch { return false; }
  return playRecorded(text, onEnd, [audioKey(text)], onProgress, 0.6);
}

/** How much of each part is spoken (0..1) at `fraction` of the audio, parts weighted by length. */
export function partFills(parts: string[], fraction: number): number[] {
  const total = parts.reduce((n, p) => n + p.length, 0) || 1;
  const at = fraction * total;
  let start = 0;
  return parts.map((p) => {
    const fill = p.length ? Math.min(Math.max((at - start) / p.length, 0), 1) : 1;
    start += p.length;
    return fill;
  });
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
