import { useI18nStore, t } from "@/store/useI18nStore";

describe("useI18nStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useI18nStore.setState({ locale: "id" });
  });

  it("defaults to Indonesian", () => {
    expect(useI18nStore.getState().locale).toBe("id");
  });

  it("toggles locale", () => {
    useI18nStore.getState().setLocale("en");
    expect(useI18nStore.getState().locale).toBe("en");
    useI18nStore.getState().setLocale("id");
    expect(useI18nStore.getState().locale).toBe("id");
  });
});

describe("t() translation function", () => {
  beforeEach(() => {
    useI18nStore.setState({ locale: "id" });
  });

  it("returns Indonesian translation by default", () => {
    expect(t("common.next", "id")).toBe("Lanjut");
    expect(t("home.welcome", "id")).toBe("Ayo Belajar Bicara!");
  });

  it("returns English translation when locale is en", () => {
    expect(t("common.next", "en")).toBe("Next");
    expect(t("home.welcome", "en")).toBe("Let's Learn to Talk!");
  });

  it("falls back to Indonesian for unknown locale", () => {
    // @ts-expect-error - testing fallback
    expect(t("common.next", "fr")).toBe("Lanjut");
  });

  it("returns key as-is if translation is missing", () => {
    expect(t("unknown.key", "id")).toBe("unknown.key");
  });
});
