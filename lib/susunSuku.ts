import type { Word } from "@/data/words";

// "Susun Suku Kata": tap shuffled syllable tiles in order to build the word.
// Distractor tiles stop 2-syllable words from being a 50/50 guess.

export type Tile = { id: string; text: string };
export type Round = { word: Word; tiles: Tile[] };

export const SESSION_SIZE = 8;

type Rand = () => number;

function shuffle<T>(arr: T[], rand: Rand): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function syllablePool(words: Word[]): string[] {
  return [...new Set(words.flatMap((w) => w.syllables))];
}

const lastVowel = (s: string) => s.match(/[aiueo](?=[^aiueo]*$)/)?.[0] ?? "";

/** n syllables not in the word, preferring look-/sound-alikes (same first letter or same vowel). */
export function pickDistractors(word: Word, n: number, pool: string[], rand: Rand = Math.random): string[] {
  const own = new Set(word.syllables);
  const candidates = shuffle(pool.filter((s) => !own.has(s)), rand);
  const similar = (s: string) =>
    word.syllables.some((w) => w[0] === s[0] || lastVowel(w) === lastVowel(s));
  return [...candidates.filter(similar), ...candidates.filter((s) => !similar(s))].slice(0, n);
}

export function buildRound(word: Word, distractors: number, pool: string[], rand: Rand = Math.random): Round {
  const texts = [...word.syllables, ...pickDistractors(word, distractors, pool, rand)];
  // ids keep repeated syllables (ma-ma) as separate tiles
  return { word, tiles: shuffle(texts.map((text, i) => ({ id: `${word.id}-${i}`, text })), rand) };
}

/** 8 unique words, difficulty rising: 1–3 two syllables +1 distractor, 4–6 +2, 7–8 three+ syllables +2. */
export function planSession(words: Word[], rand: Rand = Math.random): Round[] {
  const pool = syllablePool(words);
  const two = shuffle(words.filter((w) => w.syllables.length === 2), rand);
  const long = shuffle(words.filter((w) => w.syllables.length >= 3), rand);
  const picked: { word: Word; distractors: number }[] = [];
  const take = (list: Word[], fallback: Word[], d: number) => {
    const w = list.find((x) => !picked.some((p) => p.word.id === x.id))
      ?? fallback.find((x) => !picked.some((p) => p.word.id === x.id));
    if (w) picked.push({ word: w, distractors: d });
  };
  for (let i = 0; i < SESSION_SIZE; i++) {
    if (i < 3) take(two, long, 1);
    else if (i < 6) take(two, long, 2);
    else take(long, two, 2);
  }
  return picked.map((p) => buildRound(p.word, p.distractors, pool, rand));
}

export function isCorrect(answer: string[], word: Word): boolean {
  return answer.length === word.syllables.length && answer.every((s, i) => s === word.syllables[i]);
}
