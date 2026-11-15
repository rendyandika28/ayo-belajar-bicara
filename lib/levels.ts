// Level rule: one measure parents can follow, words learned (Kartu Kata, Ayo Ngomong).
// ponytail: thresholds 10/25/50 are a sensible guess, not research; tune here.

export type Level = { level: number; name: string; minWords: number; games: string[] };

export const LEVELS: Level[] = [
  { level: 1, name: "Mengenal Suara", minWords: 0, games: ["tebak-suara", "kartu-kata"] },
  { level: 2, name: "Meniru Suku Kata", minWords: 10, games: ["suku-kata", "kartu-kata"] },
  { level: 3, name: "Gabung Suku Kata", minWords: 25, games: ["kartu-kata", "ayo-ngomong"] },
  { level: 4, name: "Kata Utuh + Kalimat", minWords: 50, games: ["ayo-ngomong", "susun-kalimat"] },
];

export function levelForWords(words: number): number {
  return [...LEVELS].reverse().find((l) => words >= l.minWords)!.level;
}

/** Current level (never below the stored one) and what is needed for the next. */
export function levelProgress(words: number, stored = 1) {
  const level = Math.max(stored, levelForWords(words));
  const current = LEVELS[level - 1];
  const next = LEVELS[level] ?? null;
  const need = next ? Math.max(0, next.minWords - words) : 0;
  const pct = next ? Math.min(1, (words - current.minWords) / (next.minWords - current.minWords)) : 1;
  return { current, next, need, pct: Math.max(0, pct) };
}
