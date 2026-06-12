/**
 * Pronunciation Coach
 *
 * Without a real AI, we use a heuristic approach:
 * 1. Compare spoken transcript to target word
 * 2. Identify which syllables are most/least accurate
 * 3. Provide specific feedback per syllable
 *
 * In production, this would be replaced with an AI API call.
 */

import { Word } from "@/data/words";
import { isMatch } from "./fuzzyMatch";

export interface SyllableFeedback {
  syllable: string;
  status: "good" | "close" | "missing" | "wrong";
  hint: string;
}

export interface PronunciationAnalysis {
  overall: "match" | "close" | "no";
  accuracy: number; // 0-100
  syllableFeedback: SyllableFeedback[];
  suggestion: string;
  tip: string;
}

function compareSyllable(spoken: string, target: string): "good" | "close" | "missing" | "wrong" {
  const s = spoken.toLowerCase().trim();
  const t = target.toLowerCase().trim();
  if (!s) return "missing";
  if (s === t) return "good";
  if (s.length >= 2 && (t.startsWith(s) || s.startsWith(t))) return "close";
  // Character overlap
  let matches = 0;
  for (const ch of t) {
    if (s.includes(ch)) matches++;
  }
  const overlap = matches / t.length;
  if (overlap >= 0.7) return "close";
  return "wrong";
}

function getTipForSyllable(syllable: string, status: SyllableFeedback["status"]): string {
  if (status === "good") return "Bagus!";
  if (status === "close") return "Hampir! Coba pelankan.";
  if (status === "missing") return `Coba ucapkan "${syllable}" lebih keras.`;
  return `Fokus pada bunyi "${syllable}".`;
}

export function analyzePronunciation(
  spoken: string,
  word: Word
): PronunciationAnalysis {
  const overall = isMatch(spoken, word.word);

  // Compare each syllable against the spoken transcript
  const spokenLower = spoken.toLowerCase().trim();
  const syllableFeedback: SyllableFeedback[] = word.syllables.map((syl) => {
    const status = compareSyllable(syl, spokenLower);
    return {
      syllable: syl,
      status,
      hint: getTipForSyllable(syl, status),
    };
  });

  // Calculate accuracy
  const goodCount = syllableFeedback.filter((f) => f.status === "good").length;
  const closeCount = syllableFeedback.filter((f) => f.status === "close").length;
  const accuracy = Math.round(
    ((goodCount + closeCount * 0.5) / syllableFeedback.length) * 100
  );

  // Generate suggestion
  let suggestion = "";
  if (overall === "match") {
    suggestion = `Sempurna! "${word.word}" terdengar jelas.`;
  } else if (overall === "close") {
    const missedSyllables = syllableFeedback
      .filter((f) => f.status === "missing" || f.status === "wrong")
      .map((f) => f.syllable);
    if (missedSyllables.length > 0) {
      suggestion = `Hampir! Fokus ucapkan "${missedSyllables.join('", "')}" lebih jelas.`;
    } else {
      suggestion = `Hampir benar! Coba ucapkan pelan-pelan.`;
    }
  } else {
    suggestion = `Coba lagi. Dengarkan dulu, lalu ulangi.`;
  }

  // Tip: based on what's most common difficulty
  const missing = syllableFeedback.filter((f) => f.status === "missing");
  const wrong = syllableFeedback.filter((f) => f.status === "wrong");
  let tip = "";
  if (missing.length === word.syllables.length) {
    tip = `Bunyikan "${word.word}" setelah dengarkan.`;
  } else if (wrong.length > 0) {
    const wrongSyl = wrong[0].syllable;
    tip = `Suku kata "${wrongSyl}" perlu lebih banyak latihan.`;
  } else if (overall === "close") {
    tip = "Ulangi 2-3 kali untuk hasil terbaik.";
  } else {
    tip = "Lanjut ke kata berikutnya!";
  }

  return {
    overall,
    accuracy,
    syllableFeedback,
    suggestion,
    tip,
  };
}

/**
 * Smart prompt enhancement — gives context-aware encouragement
 * based on the user's history and current attempt quality.
 */
export function getEncouragement(
  analysis: PronunciationAnalysis,
  attemptCount: number
): string {
  if (analysis.overall === "match") {
    return attemptCount === 1
      ? "Sempurna di percobaan pertama!"
      : "Akhirnya! Kamu berhasil!";
  }
  if (analysis.overall === "close") {
    if (analysis.accuracy >= 80) return "Tinggal sedikit lagi!";
    if (analysis.accuracy >= 50) return "Bagus, coba lagi ya!";
    return "Ayo semangat, pasti bisa!";
  }
  return "Tidak apa-apa, coba lagi. Bunda/Papa di sini mendukungmu!";
}
