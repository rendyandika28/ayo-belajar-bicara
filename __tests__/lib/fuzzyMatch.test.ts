import { isMatch } from "@/lib/fuzzyMatch";

describe("isMatch", () => {
  // Empty / whitespace input
  it("returns 'no' for empty string input", () => {
    expect(isMatch("", "kucing")).toBe("no");
  });

  it("returns 'no' for whitespace-only input", () => {
    expect(isMatch("   ", "kucing")).toBe("no");
  });

  // Exact match
  it("returns 'match' for exact match", () => {
    expect(isMatch("kucing", "kucing")).toBe("match");
  });

  it("returns 'match' for case-insensitive exact match", () => {
    expect(isMatch("Kucing", "kucing")).toBe("match");
    expect(isMatch("KUCING", "kucing")).toBe("match");
  });

  it("returns 'match' for trimmed exact match", () => {
    expect(isMatch("  kucing  ", "kucing")).toBe("match");
  });

  // Contains check
  it("returns 'match' when spoken contains target", () => {
    expect(isMatch("itu kucing lucu", "kucing")).toBe("match");
  });

  it("returns 'match' when target contains spoken", () => {
    expect(isMatch("ku", "kucing")).toBe("match");
  });

  // Word-by-word matching
  it("returns 'match' when a word in multi-word spoken matches target", () => {
    expect(isMatch("itu sapi besar", "sapi")).toBe("match");
  });

  it("returns 'match' when a word in spoken contains target", () => {
    expect(isMatch("mengucingkan besar", "kucing")).toBe("match");
  });

  // Character overlap ratio
  it("returns 'match' when character overlap >= 0.7", () => {
    // "kucin" vs "kucing" → 5/6 = 0.83
    expect(isMatch("kucin", "kucing")).toBe("match");
  });

  it("returns 'close' when character overlap >= 0.5 but < 0.7", () => {
    // "kunx" vs "kucing" → k,u,n match (3/6 = 0.5) → close
    // "kunx" is not contained in "kucing" and vice versa
    expect(isMatch("kunx", "kucing")).toBe("close");
  });

  it("returns 'no' when character overlap < 0.5", () => {
    expect(isMatch("xyz", "kucing")).toBe("no");
  });

  // Real-world speech therapy scenarios
  it("handles child mispronunciation: 'kuting' for 'kucing'", () => {
    // k, u, t(no), i, n, g → 5/6 = 0.83
    expect(isMatch("kuting", "kucing")).toBe("match");
  });

  it("handles partial pronunciation: 'api' for 'sapi'", () => {
    expect(isMatch("api", "sapi")).toBe("match");
  });
});
