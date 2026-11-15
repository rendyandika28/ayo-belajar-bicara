import { buildRound, isCorrect, planSession, SESSION_SIZE } from "@/lib/susunKalimat";
import { sentences } from "@/data/sentences";

describe("susun kalimat", () => {
  it("plans 8 unique sentences, 2 then 3 then 4 words, distractors from round 4", () => {
    const rounds = planSession(sentences);
    expect(rounds).toHaveLength(SESSION_SIZE);
    expect(new Set(rounds.map((r) => r.sentence.id)).size).toBe(SESSION_SIZE);
    rounds.forEach((r, i) => {
      expect(r.words.length).toBe(i < 3 ? 2 : i < 6 ? 3 : 4);
      expect(r.tiles.length - r.words.length).toBe(i < 3 ? 0 : 1);
    });
  });

  it("distractor is never a word of the sentence", () => {
    const s = sentences.find((x) => x.id === "kal-17")!;
    const r = buildRound(s, 1, sentences);
    const extra = r.tiles.map((t) => t.text).filter((t) => !r.words.includes(t));
    expect(extra).toHaveLength(1);
  });

  it("checks order", () => {
    expect(isCorrect(["makan", "nasi"], ["makan", "nasi"])).toBe(true);
    expect(isCorrect(["nasi", "makan"], ["makan", "nasi"])).toBe(false);
  });
});
