describe("asset()", () => {
  afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); });

  it("keeps local paths when no asset base is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_ASSET_BASE", "");
    const { asset } = await import("@/lib/asset");
    expect(asset("/audio/kucing.mp3")).toBe("/audio/kucing.mp3");
  });

  it("prefixes the R2 base and leaves absolute/data URLs alone", async () => {
    vi.stubEnv("NEXT_PUBLIC_ASSET_BASE", "https://pub-x.r2.dev/");
    const { asset } = await import("@/lib/asset");
    expect(asset("/images/words/hew-1.webp")).toBe("https://pub-x.r2.dev/images/words/hew-1.webp");
    expect(asset("data:image/png;base64,AA")).toBe("data:image/png;base64,AA");
  });
});
