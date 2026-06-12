import { words, Word } from "@/data/words";

export type PhoneticTag = "r" | "s" | "l" | "ng" | "ny" | "kh" | "sy" | "konsonan-blend";

export interface PhoneticCategory {
  id: PhoneticTag;
  label: string;
  description: string;
  emoji: string;
}

export const PHONETIC_CATEGORIES: PhoneticCategory[] = [
  {
    id: "r",
    label: "Bunyi /R/",
    description: "Latih kata yang mengandung huruf R",
    emoji: "\ud83e\udd9c",
  },
  {
    id: "s",
    label: "Bunyi /S/",
    description: "Latih kata yang mengandung huruf S",
    emoji: "\ud83d\udca4",
  },
  {
    id: "l",
    label: "Bunyi /L/",
    description: "Latih kata yang mengandung huruf L",
    emoji: "\ud83c\udf0a",
  },
  {
    id: "ng",
    label: "Bunyi /NG/",
    description: "Latih kata yang mengandung huruf NG (seperti 'anjing', 'bunting')",
    emoji: "\ud83d\udc3e",
  },
  {
    id: "ny",
    label: "Bunyi /NY/",
    description: "Latih kata yang mengandung bunyi NY (seperti 'nyanyi', 'nyamuk')",
    emoji: "\ud83d\udcab",
  },
  {
    id: "kh",
    label: "Bunyi /KH/",
    description: "Latih kata yang mengandung bunyi KH (seperti 'khabar', 'akhir')",
    emoji: "\ud83d\udd0a",
  },
  {
    id: "sy",
    label: "Bunyi /SY/",
    description: "Latih kata yang mengandung bunyi SY (seperti 'syarat')",
    emoji: "\u270d\ufe0f",
  },
];

/**
 * Tag a word with phonetic categories based on its syllables/word text.
 */
export function getPhoneticTags(word: Word): PhoneticTag[] {
  const text = (word.word + " " + word.syllables.join(" ")).toLowerCase();
  const tags: PhoneticTag[] = [];

  if (text.includes("r") && /r/.test(word.word)) tags.push("r");
  if (text.includes("s") && /\bs/.test(word.word)) tags.push("s");
  if (text.includes("l") && /\bl/.test(word.word)) tags.push("l");
  if (text.includes("ng")) tags.push("ng");
  if (text.includes("ny")) tags.push("ny");
  if (text.includes("kh")) tags.push("kh");
  if (text.includes("sy")) tags.push("sy");

  return tags;
}

/**
 * Get all words matching a specific phonetic tag.
 */
export function getWordsByPhonetic(tag: PhoneticTag): Word[] {
  return words.filter((w) => getPhoneticTags(w).includes(tag));
}

/**
 * Get all custom words matching a tag (for category).
 */
export function getCustomWordsByPhonetic(
  customWords: Word[],
  tag: PhoneticTag
): Word[] {
  return customWords.filter((w) => getPhoneticTags(w).includes(tag));
}
