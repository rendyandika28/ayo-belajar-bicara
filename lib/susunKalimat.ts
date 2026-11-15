import type { Sentence } from "@/data/sentences";

// "Susun Kalimat": tap shuffled word tiles in order to build the sentence.
// Same shape as lib/susunSuku.ts: distractor tiles from round 4 so it is not a guess.

export type Tile = { id: string; text: string };
export type Round = { sentence: Sentence; words: string[]; tiles: Tile[] };

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

const wordsOf = (s: Sentence) => s.text.split(" ");

export function buildRound(sentence: Sentence, distractors: number, all: Sentence[], rand: Rand = Math.random): Round {
  const words = wordsOf(sentence);
  const own = new Set(words);
  const pool = shuffle([...new Set(all.flatMap(wordsOf))].filter((w) => !own.has(w)), rand);
  const texts = [...words, ...pool.slice(0, distractors)];
  // ids keep repeated words as separate tiles
  return { sentence, words, tiles: shuffle(texts.map((text, i) => ({ id: `${sentence.id}-${i}`, text })), rand) };
}

/** 8 unique sentences, harder as it goes: 1–3 two words, 4–6 three words +1 distractor, 7–8 four words +1. */
export function planSession(all: Sentence[], rand: Rand = Math.random): Round[] {
  const by = (n: number) => shuffle(all.filter((s) => wordsOf(s).length === n), rand);
  const [two, three, four] = [by(2), by(3), by(4)];
  const used = new Set<string>();
  const take = (list: Sentence[]) => {
    const s = list.find((x) => !used.has(x.id)) ?? all.find((x) => !used.has(x.id));
    if (s) used.add(s.id);
    return s;
  };
  const rounds: Round[] = [];
  for (let i = 0; i < SESSION_SIZE; i++) {
    const [list, d] = i < 3 ? [two, 0] : i < 6 ? [three, 1] : [four, 1];
    const s = take(list);
    if (s) rounds.push(buildRound(s, d, all, rand));
  }
  return rounds;
}

export function isCorrect(answer: string[], words: string[]): boolean {
  return answer.length === words.length && answer.every((w, i) => w === words[i]);
}
