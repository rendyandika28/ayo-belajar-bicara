describe("speech", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();

    // Reset speechSynthesis mock
    Object.defineProperty(globalThis, "speechSynthesis", {
      value: {
        getVoices: vi.fn(() => []),
        speak: vi.fn(),
        cancel: vi.fn(),
        onvoiceschanged: null,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("voice selection", () => {
    it("prefers id-ID voice", async () => {
      const voices = [
        { lang: "en-US", name: "English" },
        { lang: "id-ID", name: "Indonesian" },
        { lang: "id_ID", name: "Indonesian Alt" },
      ] as SpeechSynthesisVoice[];

      (globalThis.speechSynthesis.getVoices as ReturnType<typeof vi.fn>).mockReturnValue(voices);

      const { speak } = await import("@/lib/speech");
      speak("halo");

      const utterance = (globalThis.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
      expect(utterance.voice?.lang).toBe("id-ID");
    });

    it("falls back to id_ID voice", async () => {
      const voices = [
        { lang: "en-US", name: "English" },
        { lang: "id_ID", name: "Indonesian Alt" },
      ] as SpeechSynthesisVoice[];

      (globalThis.speechSynthesis.getVoices as ReturnType<typeof vi.fn>).mockReturnValue(voices);

      const { speak } = await import("@/lib/speech");
      speak("halo");

      const utterance = (globalThis.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
      expect(utterance.voice?.lang).toBe("id_ID");
    });

    it("falls back to id-prefixed voice", async () => {
      const voices = [
        { lang: "en-US", name: "English" },
        { lang: "id-XY", name: "Indonesian Variant" },
      ] as SpeechSynthesisVoice[];

      (globalThis.speechSynthesis.getVoices as ReturnType<typeof vi.fn>).mockReturnValue(voices);

      const { speak } = await import("@/lib/speech");
      speak("halo");

      const utterance = (globalThis.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
      expect(utterance.voice?.lang).toBe("id-XY");
    });

    it("returns null when no Indonesian voice available", async () => {
      const voices = [
        { lang: "en-US", name: "English" },
      ] as SpeechSynthesisVoice[];

      (globalThis.speechSynthesis.getVoices as ReturnType<typeof vi.fn>).mockReturnValue(voices);

      const { speak } = await import("@/lib/speech");
      speak("halo");

      const utterance = (globalThis.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
      expect(utterance.voice).toBeNull();
    });
  });

  describe("speak", () => {
    it("cancels previous speech before speaking", async () => {
      // Provide a voice so voicesReady=true during module init
      const voices = [{ lang: "en-US", name: "English" }] as SpeechSynthesisVoice[];
      (globalThis.speechSynthesis.getVoices as ReturnType<typeof vi.fn>).mockReturnValue(voices);

      const { speak } = await import("@/lib/speech");
      speak("halo");

      expect(globalThis.speechSynthesis.cancel).toHaveBeenCalled();
    });

    it("creates utterance with correct default values", async () => {
      const voices = [{ lang: "en-US", name: "English" }] as SpeechSynthesisVoice[];
      (globalThis.speechSynthesis.getVoices as ReturnType<typeof vi.fn>).mockReturnValue(voices);

      const { speak } = await import("@/lib/speech");
      speak("halo");

      const utterance = (globalThis.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
      expect(utterance).toBeDefined();
      expect(utterance.lang).toBe("id-ID");
      expect(utterance.rate).toBe(0.8);
      expect(utterance.pitch).toBe(1.1);
    });

    it("calls speechSynthesis.speak", async () => {
      const voices = [{ lang: "en-US", name: "English" }] as SpeechSynthesisVoice[];
      (globalThis.speechSynthesis.getVoices as ReturnType<typeof vi.fn>).mockReturnValue(voices);

      const { speak } = await import("@/lib/speech");
      speak("halo");

      expect(globalThis.speechSynthesis.speak).toHaveBeenCalled();
    });

    it("does nothing when speechSynthesis is unavailable", async () => {
      Object.defineProperty(globalThis, "speechSynthesis", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { speak } = await import("@/lib/speech");
      expect(() => speak("halo")).not.toThrow();
    });

    it("polls for voices when not ready and eventually speaks", async () => {
      // Start with no voices
      const getVoicesMock = vi.fn(() => []);
      Object.defineProperty(globalThis, "speechSynthesis", {
        value: {
          getVoices: getVoicesMock,
          speak: vi.fn(),
          cancel: vi.fn(),
          onvoiceschanged: null,
        },
        writable: true,
        configurable: true,
      });

      const { speak } = await import("@/lib/speech");
      speak("halo");

      // Not spoken yet (voices not ready, polling started)
      expect(globalThis.speechSynthesis.speak).not.toHaveBeenCalled();

      // After 15 attempts (15 * 200ms = 3000ms), it speaks even without voices
      vi.advanceTimersByTime(3100);
      expect(globalThis.speechSynthesis.speak).toHaveBeenCalled();
    });
  });

  describe("speakIslamic", () => {
    it("speaks with rate 0.6 and pitch 1.0", async () => {
      const voices = [{ lang: "en-US", name: "English" }] as SpeechSynthesisVoice[];
      (globalThis.speechSynthesis.getVoices as ReturnType<typeof vi.fn>).mockReturnValue(voices);

      const { speakIslamic } = await import("@/lib/speech");
      speakIslamic("bismillah");

      const utterance = (globalThis.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
      expect(utterance.rate).toBe(0.6);
      expect(utterance.pitch).toBe(1.0);
    });
  });

  describe("speakSyllable", () => {
    it("speaks with rate 0.6 and pitch 1.1", async () => {
      const voices = [{ lang: "en-US", name: "English" }] as SpeechSynthesisVoice[];
      (globalThis.speechSynthesis.getVoices as ReturnType<typeof vi.fn>).mockReturnValue(voices);

      const { speakSyllable } = await import("@/lib/speech");
      speakSyllable("zzq"); // no recording, so the browser voice is used

      const utterance = (globalThis.speechSynthesis.speak as ReturnType<typeof vi.fn>).mock.calls[0]?.[0];
      expect(utterance.rate).toBe(0.6);
      expect(utterance.pitch).toBe(1.1);
    });
  });

  describe("createSpeechRecognition", () => {
    it("returns null when SpeechRecognition is not available", async () => {
      const { createSpeechRecognition } = await import("@/lib/speech");
      const result = createSpeechRecognition();
      expect(result).toBeNull();
    });

    it("returns configured recognition instance when available", async () => {
      (globalThis as unknown as Record<string, unknown>).SpeechRecognition = class {
        lang = "";
        continuous = true;
        interimResults = false;
        onresult = null;
        onerror = null;
        onend = null;
        start = vi.fn();
        stop = vi.fn();
        abort = vi.fn();
      };

      const { createSpeechRecognition } = await import("@/lib/speech");
      const result = createSpeechRecognition();

      expect(result).not.toBeNull();
      expect(result!.lang).toBe("id-ID");
      expect(result!.continuous).toBe(false);
      expect(result!.interimResults).toBe(true);

      delete (globalThis as unknown as Record<string, unknown>).SpeechRecognition;
    });
  });

  describe("isSpeechRecognitionSupported", () => {
    it("returns false when neither API is available", async () => {
      const { isSpeechRecognitionSupported } = await import("@/lib/speech");
      expect(isSpeechRecognitionSupported()).toBe(false);
    });

    it("returns true when SpeechRecognition is available", async () => {
      (globalThis as unknown as Record<string, unknown>).SpeechRecognition = class {};

      const { isSpeechRecognitionSupported } = await import("@/lib/speech");
      expect(isSpeechRecognitionSupported()).toBe(true);

      delete (globalThis as unknown as Record<string, unknown>).SpeechRecognition;
    });

    it("returns true when webkitSpeechRecognition is available", async () => {
      (globalThis as unknown as Record<string, unknown>).webkitSpeechRecognition = class {};

      const { isSpeechRecognitionSupported } = await import("@/lib/speech");
      expect(isSpeechRecognitionSupported()).toBe(true);

      delete (globalThis as unknown as Record<string, unknown>).webkitSpeechRecognition;
    });
  });
});

describe("recorded voice", () => {
  it("plays the recorded mp3 for texts in the manifest instead of browser TTS", async () => {
    vi.resetModules();
    vi.doMock("@/lib/audioManifest.json", () => ({ default: ["kucing"] }));
    const play = vi.fn(() => Promise.resolve());
    const created: string[] = [];
    vi.stubGlobal("Audio", vi.fn(function (this: { play: typeof play; pause: () => void }, src: string) {
      created.push(src);
      this.play = play;
      this.pause = () => {};
    }));
    Object.defineProperty(globalThis, "speechSynthesis", {
      value: { speak: vi.fn(), cancel: vi.fn(), getVoices: vi.fn(() => []), speaking: false, pending: false },
      writable: true,
      configurable: true,
    });

    const { speak } = await import("@/lib/speech");
    speak("Kucing");

    expect(created).toEqual(["/audio/kucing.mp3"]);
    expect(play).toHaveBeenCalled();
    expect(globalThis.speechSynthesis.speak).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
    vi.doUnmock("@/lib/audioManifest.json");
  });
});

describe("speakSyllable with word context", () => {
  async function setup(manifest: string[]) {
    vi.resetModules();
    vi.doMock("@/lib/audioManifest.json", () => ({ default: manifest }));
    const created: string[] = [];
    vi.stubGlobal("Audio", vi.fn(function (this: { play: () => Promise<void>; pause: () => void }, src: string) {
      created.push(src);
      this.play = () => Promise.resolve();
      this.pause = () => {};
    }));
    Object.defineProperty(globalThis, "speechSynthesis", {
      value: { speak: vi.fn(), cancel: vi.fn(), getVoices: vi.fn(() => []), speaking: false, pending: false },
      writable: true,
      configurable: true,
    });
    const mod = await import("@/lib/speech");
    return { ...mod, created };
  }
  afterEach(() => { vi.unstubAllGlobals(); vi.doUnmock("@/lib/audioManifest.json"); });

  it("prefers the recording made inside the word", async () => {
    const { speakSyllable, created } = await setup(["ja", "ja--jalan"]);
    speakSyllable("ja", undefined, "jalan");
    expect(created).toEqual(["/audio/ja--jalan.mp3"]);
  });

  it("falls back to the plain syllable recording", async () => {
    const { speakSyllable, created } = await setup(["ja"]);
    speakSyllable("ja", undefined, "jalan");
    expect(created).toEqual(["/audio/ja.mp3"]);
  });
});

describe("recorded audio superseded", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.doUnmock("@/lib/audioManifest.json"); });

  it("does not fall back to browser voice when a newer clip replaced it", async () => {
    vi.resetModules();
    vi.doMock("@/lib/audioManifest.json", () => ({ default: ["kucing"] }));
    const rejects: Array<(e: Error) => void> = [];
    vi.stubGlobal("Audio", vi.fn(function (this: { play: () => Promise<void>; pause: () => void }) {
      this.play = () => new Promise<void>((_, reject) => { rejects.push(reject); });
      this.pause = () => {};
    }));
    const synthSpeak = vi.fn();
    vi.stubGlobal("speechSynthesis", { speak: synthSpeak, cancel: vi.fn(), getVoices: () => [] });
    const { useAppStore } = await import("@/store/useAppStore");
    useAppStore.setState({ isMuted: false } as never);
    const { speak } = await import("@/lib/speech");
    speak("kucing");
    speak("kucing"); // e.g. StrictMode effect running twice
    rejects[0](new Error("AbortError"));
    await new Promise((r) => setTimeout(r, 0));
    expect(synthSpeak).not.toHaveBeenCalled();
  });
});

describe("partFills", () => {
  it("fills parts in order, partially inside the current one", async () => {
    const { partFills } = await import("@/lib/speech");
    expect(partFills(["ab", "cd"], 0)).toEqual([0, 0]);
    expect(partFills(["ab", "cd"], 0.25)).toEqual([0.5, 0]);
    expect(partFills(["ab", "cd"], 0.75)).toEqual([1, 0.5]);
    expect(partFills(["ab", "cd"], 1)).toEqual([1, 1]);
  });
});

describe("playWithProgress", () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.doUnmock("@/lib/audioManifest.json"); });

  it("calls onEnd when the clip is replaced or stopped, so highlights clear", async () => {
    vi.resetModules();
    vi.doMock("@/lib/audioManifest.json", () => ({ default: ["doa", "kucing"] }));
    vi.stubGlobal("Audio", vi.fn(function (this: { play: () => Promise<void>; pause: () => void }) {
      this.play = () => new Promise<void>(() => {});
      this.pause = () => {};
    }));
    vi.stubGlobal("speechSynthesis", { speak: vi.fn(), cancel: vi.fn(), getVoices: () => [] });
    const { useAppStore } = await import("@/store/useAppStore");
    useAppStore.setState({ isMuted: false } as never);
    const { playWithProgress, speak, stopAudio } = await import("@/lib/speech");

    const onEnd = vi.fn();
    playWithProgress("doa", () => {}, onEnd);
    speak("kucing"); // another sound replaces it
    expect(onEnd).toHaveBeenCalledTimes(1);

    const onEnd2 = vi.fn();
    playWithProgress("doa", () => {}, onEnd2);
    stopAudio();
    stopAudio();
    expect(onEnd2).toHaveBeenCalledTimes(1);
  });
});
