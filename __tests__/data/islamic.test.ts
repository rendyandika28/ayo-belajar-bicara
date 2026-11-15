import { hijaiyahLetters, dailyDoas, asmaulHusna } from "@/data/islamic";

describe("hijaiyahLetters", () => {
  it("has exactly 29 letters", () => {
    expect(hijaiyahLetters).toHaveLength(29);
  });

  it("has no duplicate IDs", () => {
    const ids = hijaiyahLetters.map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has sequential IDs from hij-1 to hij-29", () => {
    hijaiyahLetters.forEach((h, i) => {
      expect(h.id).toBe(`hij-${i + 1}`);
    });
  });

  it("has all required fields", () => {
    for (const h of hijaiyahLetters) {
      expect(h.id).toBeTypeOf("string");
      expect(h.letter).toBeTypeOf("string");
      expect(h.name).toBeTypeOf("string");
      expect(h.transliteration).toBeTypeOf("string");
      expect(Array.isArray(h.syllables)).toBe(true);
      expect(h.emoji).toBeTypeOf("string");
      expect(h.letter.length).toBeGreaterThan(0);
      expect(h.name.length).toBeGreaterThan(0);
    }
  });

  it("has non-empty emoji for all letters", () => {
    for (const h of hijaiyahLetters) {
      expect(h.emoji.length).toBeGreaterThan(0);
    }
  });
});

describe("dailyDoas", () => {
  it("has 20 doas", () => {
    expect(dailyDoas).toHaveLength(20);
  });

  it("has no duplicate IDs", () => {
    const ids = dailyDoas.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has all required fields", () => {
    for (const d of dailyDoas) {
      expect(d.id).toBeTypeOf("string");
      expect(d.title).toBeTypeOf("string");
      expect(d.arabic).toBeTypeOf("string");
      expect(d.latin).toBeTypeOf("string");
      expect(d.meaning).toBeTypeOf("string");
      expect(d.emoji).toBeTypeOf("string");
      expect(Array.isArray(d.syllablesLatin)).toBe(true);
      expect(d.situation).toBeTypeOf("string");
    }
  });

  it("has non-empty syllablesLatin arrays", () => {
    for (const d of dailyDoas) {
      expect(d.syllablesLatin.length).toBeGreaterThan(0);
    }
  });

  it("has non-empty situation descriptions", () => {
    for (const d of dailyDoas) {
      expect(d.situation.trim().length).toBeGreaterThan(0);
    }
  });

  it("has non-empty arabic text", () => {
    for (const d of dailyDoas) {
      expect(d.arabic.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("asmaulHusna", () => {
  it("has all 99 names", () => {
    expect(asmaulHusna).toHaveLength(99);
  });

  it("has no duplicate IDs", () => {
    const ids = asmaulHusna.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has sequential numbers from 1 to 99", () => {
    asmaulHusna.forEach((a, i) => {
      expect(a.number).toBe(i + 1);
    });
  });

  it("has all required fields", () => {
    for (const a of asmaulHusna) {
      expect(a.id).toBeTypeOf("string");
      expect(a.number).toBeTypeOf("number");
      expect(a.arabic).toBeTypeOf("string");
      expect(a.latin).toBeTypeOf("string");
      expect(a.meaning).toBeTypeOf("string");
      expect(Array.isArray(a.syllables)).toBe(true);
    }
  });

  it("has non-empty syllables arrays", () => {
    for (const a of asmaulHusna) {
      expect(a.syllables.length).toBeGreaterThan(0);
    }
  });
});
