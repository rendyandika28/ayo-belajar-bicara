import { buildRound, isCorrect, pickDistractors, planSession, syllablePool, SESSION_SIZE } from "@/lib/susunSuku";
import { words, type Word } from "@/data/words";

const w = (id: string, syllables: string[]): Word =>
  ({ id, emoji: "", word: syllables.join(""), syllables, category: "benda", difficulty: 1 });

describe("susun suku kata", () => {
  const pool = syllablePool(words);

  it("round has every syllable plus n distractors that are not in the word", () => {
    const minum = w("x", ["mi", "num"]);
    const r = buildRound(minum, 2, pool);
    expect(r.tiles).toHaveLength(4);
    expect(r.tiles.map((t) => t.text)).toEqual(expect.arrayContaining(["mi", "num"]));
    const extra = r.tiles.map((t) => t.text).filter((t) => !["mi", "num"].includes(t));
    expect(extra).toHaveLength(2);
    expect(new Set(r.tiles.map((t) => t.id)).size).toBe(4);
  });

  it("keeps repeated syllables as separate tiles (ma-ma)", () => {
    const r = buildRound(w("m", ["ma", "ma"]), 1, pool);
    expect(r.tiles.filter((t) => t.text === "ma")).toHaveLength(2);
    expect(pickDistractors(w("m", ["ma", "ma"]), 3, pool)).not.toContain("ma");
  });

  it("plans 8 unique words with rising difficulty", () => {
    const rounds = planSession(words);
    expect(rounds).toHaveLength(SESSION_SIZE);
    expect(new Set(rounds.map((r) => r.word.id)).size).toBe(SESSION_SIZE);
    rounds.forEach((r, i) => {
      const distractors = r.tiles.length - r.word.syllables.length;
      expect(distractors).toBe(i < 3 ? 1 : 2);
    });
    expect(rounds.slice(6).every((r) => r.word.syllables.length >= 3)).toBe(true);
  });

  it("checks order", () => {
    const minum = w("x", ["mi", "num"]);
    expect(isCorrect(["mi", "num"], minum)).toBe(true);
    expect(isCorrect(["num", "mi"], minum)).toBe(false);
    expect(isCorrect(["mi"], minum)).toBe(false);
  });
});
