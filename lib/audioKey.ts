// Maps any spoken text to its recorded file name in public/audio/<key>.mp3.
// Shared by the app (lib/speech.ts) and the generator (scripts/generate-audio.mjs).

export function audioKey(text: string): string {
  const norm = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // drop diacritics (ā → a)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (norm.length <= 60) return norm || "x";
  // Long texts (prayers): readable prefix + short hash to stay unique.
  let h = 5381;
  for (const c of norm) h = ((h * 33) ^ c.charCodeAt(0)) >>> 0;
  return `${norm.slice(0, 48)}-${h.toString(36)}`;
}

/** Recording of syllable `syl` as pronounced inside `word`, e.g. "ja--jalan". */
export function syllableKey(syl: string, word: string): string {
  return `${audioKey(syl)}--${audioKey(word)}`;
}
