import { words } from "@/data/words";

describe("words data", () => {
  it("has at least 60 words", () => {
    expect(words.length).toBeGreaterThanOrEqual(60);
  });

  it("has no duplicate IDs", () => {
    const ids = words.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has all required fields with correct types", () => {
    for (const word of words) {
      expect(word.id).toBeTypeOf("string");
      expect(word.emoji).toBeTypeOf("string");
      expect(word.word).toBeTypeOf("string");
      expect(Array.isArray(word.syllables)).toBe(true);
      expect(word.category).toBeTypeOf("string");
      expect(word.difficulty).toBeTypeOf("number");
    }
  });

  it("has valid categories", () => {
    const validCategories = ["hewan", "buah", "benda", "keluarga", "aktivitas", "makanan", "islami", "warna", "angka", "tubuh", "alam", "peralatan"];
    for (const word of words) {
      expect(validCategories).toContain(word.category);
    }
  });

  it("has valid difficulty levels (1, 2, or 3)", () => {
    for (const word of words) {
      expect([1, 2, 3]).toContain(word.difficulty);
    }
  });

  it("syllables join to match word (ignoring spaces)", () => {
    for (const word of words) {
      const joined = word.syllables.join("");
      const target = word.word.replace(/\s/g, "");
      expect(joined).toBe(target);
    }
  });

  it("has non-empty emoji for all words", () => {
    for (const word of words) {
      expect(word.emoji.length).toBeGreaterThan(0);
    }
  });

  it("has non-empty word text for all entries", () => {
    for (const word of words) {
      expect(word.word.trim().length).toBeGreaterThan(0);
    }
  });

  it("has at least one syllable per word", () => {
    for (const word of words) {
      expect(word.syllables.length).toBeGreaterThanOrEqual(1);
    }
  });
});
