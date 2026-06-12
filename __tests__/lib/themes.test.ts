import { THEMES, getTheme } from "@/lib/themes";

describe("themes", () => {
  it("has at least 5 themes", () => {
    expect(THEMES.length).toBeGreaterThanOrEqual(5);
  });

  it("each theme has required fields", () => {
    for (const theme of THEMES) {
      expect(theme.id).toBeTruthy();
      expect(theme.name).toBeTruthy();
      expect(theme.description).toBeTruthy();
      expect(theme.emoji).toBeTruthy();
      expect(theme.bodyBackgroundClass).toBeTruthy();
    }
  });

  it("getTheme returns the right theme by id", () => {
    const t = getTheme("ramadan");
    expect(t.id).toBe("ramadan");
    expect(t.name).toBe("Ramadan");
  });

  it("getTheme falls back to default for unknown id", () => {
    const t = getTheme("nonexistent");
    expect(t.id).toBe("default");
  });
});
