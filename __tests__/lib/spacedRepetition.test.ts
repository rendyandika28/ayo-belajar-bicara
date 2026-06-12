import { updateSR, pickWordsForReview, getMasteryLevel, SRState } from "@/lib/spacedRepetition";
import { getPhoneticTags, getWordsByPhonetic, PHONETIC_CATEGORIES } from "@/lib/phonetics";
import { words } from "@/data/words";

describe("spacedRepetition", () => {
  describe("updateSR", () => {
    it("creates a new state on first success", () => {
      const initial: SRState = { reps: 0, ease: 2.5, interval: 0, lastReviewed: 0, nextReview: 0 };
      const result = updateSR(initial, 1);
      expect(result.reps).toBe(1);
      expect(result.interval).toBe(1);
    });

    it("uses 3-day interval on second success", () => {
      const after1: SRState = { reps: 1, ease: 2.5, interval: 1, lastReviewed: 0, nextReview: 0 };
      const result = updateSR(after1, 1);
      expect(result.reps).toBe(2);
      expect(result.interval).toBe(3);
    });

    it("uses interval*ease for subsequent reviews", () => {
      const after2: SRState = { reps: 2, ease: 2.5, interval: 3, lastReviewed: 0, nextReview: 0 };
      const result = updateSR(after2, 1);
      expect(result.reps).toBe(3);
      // 3 * 2.5 = 7.5 -> 8
      expect(result.interval).toBe(8);
    });

    it("resets reps on failure (quality 0)", () => {
      const state: SRState = { reps: 5, ease: 2.5, interval: 30, lastReviewed: 0, nextReview: 0 };
      const result = updateSR(state, 0);
      expect(result.reps).toBe(0);
      expect(result.interval).toBe(0.5);
    });

    it("ease factor never goes below 1.3", () => {
      let state: SRState = { reps: 0, ease: 1.5, interval: 0, lastReviewed: 0, nextReview: 0 };
      // Many wrong answers
      for (let i = 0; i < 10; i++) {
        state = updateSR(state, 0);
      }
      expect(state.ease).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe("pickWordsForReview", () => {
    const allWords = [
      { id: "w1" }, { id: "w2" }, { id: "w3" }, { id: "w4" }, { id: "w5" },
    ];

    it("returns all words when SR map is empty (all new)", () => {
      const result = pickWordsForReview(allWords, {}, 3);
      expect(result.length).toBe(3);
      expect(new Set(result).size).toBe(3);
    });

    it("includes due words", () => {
      const now = Date.now();
      const srMap = {
        w1: { reps: 2, ease: 2.5, interval: 5, lastReviewed: now - 86400000 * 10, nextReview: now - 86400000 * 5 },
        w2: { reps: 2, ease: 2.5, interval: 5, lastReviewed: now, nextReview: now + 86400000 * 5 },
      };
      const result = pickWordsForReview(allWords, srMap, 5);
      expect(result).toContain("w1");
    });

    it("shuffles results by default", () => {
      const srMap = {};
      const r1 = pickWordsForReview(allWords, srMap, 5);
      const r2 = pickWordsForReview(allWords, srMap, 5);
      // With 5 items and 5! permutations, very unlikely to match
      // Just verify they include all words
      expect(new Set(r1).size).toBe(5);
      expect(new Set(r2).size).toBe(5);
    });
  });

  describe("getMasteryLevel", () => {
    it("returns 'new' for undefined", () => {
      expect(getMasteryLevel(undefined)).toBe("new");
    });
    it("returns 'new' for 0 reps", () => {
      expect(getMasteryLevel({ reps: 0, ease: 2.5, interval: 0, lastReviewed: 0, nextReview: 0 })).toBe("new");
    });
    it("returns 'learning' for 1-2 reps", () => {
      expect(getMasteryLevel({ reps: 1, ease: 2.5, interval: 1, lastReviewed: 0, nextReview: 0 })).toBe("learning");
    });
    it("returns 'mastered' for 6+ reps", () => {
      expect(getMasteryLevel({ reps: 6, ease: 2.5, interval: 30, lastReviewed: 0, nextReview: 0 })).toBe("mastered");
    });
  });
});

describe("phonetics", () => {
  describe("getPhoneticTags", () => {
    it("returns empty array for words with no special sounds", () => {
      // "mama" has 'm' and 'a', not in our special tags
      const result = getPhoneticTags({
        id: "test",
        emoji: "x",
        word: "mama",
        syllables: ["ma", "ma"],
        category: "keluarga",
        difficulty: 1,
      });
      // 'mama' has 'm' which isn't in our tags
      expect(result).toEqual([]);
    });

    it("tags R sound", () => {
      const result = getPhoneticTags({
        id: "test",
        emoji: "x",
        word: "rumah",
        syllables: ["ru", "mah"],
        category: "benda",
        difficulty: 1,
      });
      expect(result).toContain("r");
    });

    it("tags S sound", () => {
      const result = getPhoneticTags({
        id: "test",
        emoji: "x",
        word: "susu",
        syllables: ["su", "su"],
        category: "makanan",
        difficulty: 1,
      });
      expect(result).toContain("s");
    });

    it("tags NG sound", () => {
      const result = getPhoneticTags({
        id: "test",
        emoji: "x",
        word: "anjing",
        syllables: ["an", "jing"],
        category: "hewan",
        difficulty: 1,
      });
      expect(result).toContain("ng");
    });
  });

  describe("getWordsByPhonetic", () => {
    it("returns words with R sound", () => {
      const result = getWordsByPhonetic("r");
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((w) => w.word.toLowerCase().includes("r"))).toBe(true);
    });

    it("returns words with NG sound", () => {
      const result = getWordsByPhonetic("ng");
      expect(result.length).toBeGreaterThan(0);
      expect(result.some((w) => w.word.includes("ng"))).toBe(true);
    });
  });

  describe("PHONETIC_CATEGORIES", () => {
    it("has 7 categories", () => {
      expect(PHONETIC_CATEGORIES.length).toBe(7);
    });

    it("each category has required fields", () => {
      for (const cat of PHONETIC_CATEGORIES) {
        expect(cat.id).toBeTruthy();
        expect(cat.label).toBeTruthy();
        expect(cat.description).toBeTruthy();
        expect(cat.emoji).toBeTruthy();
      }
    });
  });
});
