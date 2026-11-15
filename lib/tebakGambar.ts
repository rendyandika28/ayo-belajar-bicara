import type { Word } from "@/data/words";

export const TOTAL_QUESTIONS = 10;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickQuestionOptions(allWords: Word[], target: Word): Word[] {
  // Get distractors from the same category first
  const sameCategory = allWords.filter(
    (w) => w.category === target.category && w.id !== target.id
  );
  const shuffledSame = shuffleArray(sameCategory);

  let distractors: Word[] = [];

  if (shuffledSame.length >= 3) {
    distractors = shuffledSame.slice(0, 3);
  } else {
    // Not enough in same category, fill from others
    distractors = [...shuffledSame];
    const others = allWords.filter(
      (w) => w.id !== target.id && w.category !== target.category
    );
    const shuffledOthers = shuffleArray(others);
    const remaining = 3 - distractors.length;
    distractors = [...distractors, ...shuffledOthers.slice(0, remaining)];
  }

  // Combine target with distractors and shuffle
  return shuffleArray([target, ...distractors]);
}

// Targets from recent sessions are skipped until most of the pool has been seen,
// so each session feels new. ponytail: per-device memory in localStorage.
const RECENT_KEY = "tebakGambarRecent";
const RECENT_MAX = 60;

export function readRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}

export function rememberTargets(ids: string[]) {
  try {
    const next = [...ids, ...readRecent().filter((id) => !ids.includes(id))].slice(0, RECENT_MAX);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

export function generateQuestions(allWords: Word[], recent: string[] = []): { target: Word; options: Word[] }[] {
  const fresh = shuffleArray(allWords.filter((w) => !recent.includes(w.id)));
  const seen = shuffleArray(allWords.filter((w) => recent.includes(w.id)));
  const selected = [...fresh, ...seen].slice(0, TOTAL_QUESTIONS);

  // If we don't have enough words, allow repeats
  while (selected.length < TOTAL_QUESTIONS && allWords.length > 0) {
    const extra = shuffleArray(allWords);
    selected.push(...extra.slice(0, TOTAL_QUESTIONS - selected.length));
  }

  return selected.map((target) => ({
    target,
    options: pickQuestionOptions(allWords, target),
  }));
}
