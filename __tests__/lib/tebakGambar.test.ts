import { generateQuestions, TOTAL_QUESTIONS } from "@/lib/tebakGambar";
import { words } from "@/data/words";

describe("tebak gambar questions", () => {
  it("makes 10 unique targets, each with 4 options including the target", () => {
    const qs = generateQuestions(words);
    expect(qs).toHaveLength(TOTAL_QUESTIONS);
    expect(new Set(qs.map((q) => q.target.id)).size).toBe(TOTAL_QUESTIONS);
    for (const q of qs) {
      expect(q.options).toHaveLength(4);
      expect(q.options.map((o) => o.id)).toContain(q.target.id);
    }
  });

  it("skips recently used targets while fresh words remain", () => {
    const recent = words.slice(0, 60).map((w) => w.id);
    const qs = generateQuestions(words, recent);
    expect(qs.every((q) => !recent.includes(q.target.id))).toBe(true);
  });
});
