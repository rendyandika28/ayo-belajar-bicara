// Mock localStorage
import "@testing-library/jest-dom/vitest";

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
  };
})();

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

// Mock AudioContext
class MockGainNode {
  gain = {
    setValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
  };
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockOscillatorNode {
  type: OscillatorType = "sine";
  frequency = {
    setValueAtTime: vi.fn(),
  };
  connect = vi.fn();
  disconnect = vi.fn();
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioContext {
  currentTime = 0;
  destination = {};
  createOscillator = vi.fn(() => new MockOscillatorNode());
  createGain = vi.fn(() => new MockGainNode());
  close = vi.fn();
}

Object.defineProperty(globalThis, "AudioContext", {
  value: MockAudioContext,
  writable: true,
  configurable: true,
});

// Mock SpeechSynthesis
const mockSpeechSynthesis = {
  getVoices: vi.fn(() => []),
  speak: vi.fn(),
  cancel: vi.fn(),
  onvoiceschanged: null as (() => void) | null,
};

Object.defineProperty(globalThis, "speechSynthesis", {
  value: mockSpeechSynthesis,
  writable: true,
  configurable: true,
});

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  text: string;
  lang = "";
  rate = 1;
  pitch = 1;
  voice: SpeechSynthesisVoice | null = null;
  onend: (() => void) | null = null;

  constructor(text?: string) {
    this.text = text || "";
  }
}

Object.defineProperty(globalThis, "SpeechSynthesisUtterance", {
  value: MockSpeechSynthesisUtterance,
  writable: true,
  configurable: true,
});
