describe("sounds", () => {
  let createOscillatorSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();

    createOscillatorSpy = vi.fn(() => ({
      type: "sine" as OscillatorType,
      frequency: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    }));

    const createGainFn = vi.fn(() => ({
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    }));

    // @ts-expect-error: mock AudioContext
    globalThis.AudioContext = class {
      currentTime = 0;
      destination = {};
      createOscillator = createOscillatorSpy;
      createGain = createGainFn;
      close = vi.fn();
    };
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("playDing runs without error", async () => {
    const { playDing } = await import("@/lib/sounds");
    expect(() => playDing()).not.toThrow();
  });

  it("playPop runs without error", async () => {
    const { playPop } = await import("@/lib/sounds");
    expect(() => playPop()).not.toThrow();
  });

  it("playCorrect runs without error", async () => {
    const { playCorrect } = await import("@/lib/sounds");
    expect(() => playCorrect()).not.toThrow();
  });

  it("playWrong runs without error", async () => {
    const { playWrong } = await import("@/lib/sounds");
    expect(() => playWrong()).not.toThrow();
  });

  it("playApplause runs without error", async () => {
    const { playApplause } = await import("@/lib/sounds");
    expect(() => playApplause()).not.toThrow();
  });

  it("playCelebration runs without error", async () => {
    const { playCelebration } = await import("@/lib/sounds");
    expect(() => playCelebration()).not.toThrow();
  });

  it("playDing calls createOscillator", async () => {
    const { playDing } = await import("@/lib/sounds");
    playDing();
    expect(createOscillatorSpy).toHaveBeenCalled();
  });

  it("playCorrect calls createOscillator multiple times with setTimeout", async () => {
    const { playCorrect } = await import("@/lib/sounds");
    playCorrect();
    expect(createOscillatorSpy).toHaveBeenCalled();
    vi.advanceTimersByTime(500);
    expect(createOscillatorSpy.mock.calls.length).toBeGreaterThanOrEqual(3);
  });

  it("handles AudioContext failure gracefully", async () => {
    // @ts-expect-error: intentionally breaking AudioContext
    globalThis.AudioContext = class {
      currentTime = 0;
      destination = {};
      createOscillator() { throw new Error("Audio not available"); }
      createGain() { throw new Error("Audio not available"); }
    };

    vi.resetModules();
    const { playDing } = await import("@/lib/sounds");
    expect(() => playDing()).not.toThrow();
  });

  it("playApplause schedules multiple timeouts", async () => {
    const { playApplause } = await import("@/lib/sounds");
    playApplause();
    vi.advanceTimersByTime(1000);
    expect(createOscillatorSpy.mock.calls.length).toBeGreaterThanOrEqual(10);
  });
});
