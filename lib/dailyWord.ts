import { words, Word } from "@/data/words";

export function getDailyWord(date: string, excludeLearned: string[] = []): Word {
  const candidates = excludeLearned.length
    ? words.filter((w) => !excludeLearned.includes(w.id))
    : words;
  const list = candidates.length > 0 ? candidates : words;

  const today = new Date(date);
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );

  return list[dayOfYear % list.length];
}
