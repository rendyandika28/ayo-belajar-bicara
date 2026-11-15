import { levelForWords, levelProgress } from "@/lib/levels";
import { useAppStore } from "@/store/useAppStore";

describe("levels", () => {
  it("levelForWords uses 10/25/50 thresholds", () => {
    expect(levelForWords(0)).toBe(1);
    expect(levelForWords(9)).toBe(1);
    expect(levelForWords(10)).toBe(2);
    expect(levelForWords(25)).toBe(3);
    expect(levelForWords(50)).toBe(4);
  });

  it("levelProgress reports words needed for the next level", () => {
    const p = levelProgress(14);
    expect(p.current.level).toBe(2);
    expect(p.next?.level).toBe(3);
    expect(p.need).toBe(11);
    expect(levelProgress(60).next).toBeNull();
    expect(levelProgress(0, 3).current.level).toBe(3);
  });

  it("learning the 10th word raises currentLevel", () => {
    useAppStore.setState({ wordsLearned: Array.from({ length: 9 }, (_, i) => `w${i}`), currentLevel: 1 });
    useAppStore.getState().markWordLearned("w9");
    expect(useAppStore.getState().currentLevel).toBe(2);
  });
});

describe("mark actions report only new items (refresh double-star bug)", () => {
  it("returns false for an item already in persisted state", () => {
    useAppStore.setState({ wordsLearned: ["apel"], hijaiyahLearned: ["alif"], asmaulHusnaLearned: ["ar-rahman"] });
    const s = useAppStore.getState();
    expect(s.markWordLearned("apel")).toBe(false);
    expect(s.markWordLearned("bola")).toBe(true);
    expect(s.markHijaiyahLearned("alif")).toBe(false);
    expect(s.markAsmaulHusnaLearned("ar-rahman")).toBe(false);
  });
});
