import { render, screen, fireEvent, act } from "@testing-library/react";
import { words } from "@/data/words";

const store = {
  addStar: vi.fn(),
  markWordLearned: vi.fn(),
  incrementSession: vi.fn(),
  recordGamePlay: vi.fn(),
};
vi.mock("@/store/useAppStore", () => ({
  useAppStore: (sel?: (s: typeof store) => unknown) => (sel ? sel(store) : store),
}));
vi.mock("@/components/ui/GameShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/GameTutorial", () => ({ default: () => null }));
vi.mock("@/components/ui/ConfettiEffect", () => ({ default: () => null }));
const speak = vi.fn();
vi.mock("@/lib/speech", () => ({
  speak: (w: string) => speak(w),
  speakSyllable: vi.fn(),
  createSpeechRecognition: () => null,
  isSpeechRecognitionSupported: () => false,
}));
vi.mock("@/lib/sounds", () => ({
  playCorrect: vi.fn(),
  playWrong: vi.fn(),
  playPop: vi.fn(),
  playApplause: vi.fn(),
}));

import AyoNgomongPage from "@/app/ayo-ngomong/page";
import TebakSuaraPage from "@/app/tebak-suara/page";

beforeEach(() => {
  vi.useFakeTimers();
  Object.values(store).forEach((f) => f.mockClear());
});
afterEach(() => vi.useRealTimers());

describe("ayo-ngomong advance", () => {
  it("Berhasil then Lewati advances one word, and the pending timer does not skip another", () => {
    render(<AyoNgomongPage />);
    fireEvent.click(screen.getByRole("button", { name: /berhasil/i }));
    fireEvent.click(screen.getByRole("button", { name: /lewati/i }));
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText("2 / 8")).toBeInTheDocument();
  });

  it("finishes once on the last word instead of overflowing", () => {
    render(<AyoNgomongPage />);
    for (let i = 0; i < 7; i++) fireEvent.click(screen.getByRole("button", { name: /lewati/i }));
    expect(screen.getByText("8 / 8")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /berhasil/i }));
    fireEvent.click(screen.getByRole("button", { name: /lewati/i }));
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText("Hebat Sekali!")).toBeInTheDocument();
    expect(store.incrementSession).toHaveBeenCalledTimes(1);
  });
});

describe("tebak-suara Lanjut", () => {
  function answerCorrectly() {
    speak.mockClear();
    fireEvent.click(screen.getAllByRole("button", { name: /^dengar$/i })[0]);
    const word = words.find((w) => w.word === speak.mock.calls[0][0])!;
    fireEvent.click(screen.getByRole("button", { name: word.word }));
  }

  it("a second tap on the exiting Lanjut does not skip a question", () => {
    render(<TebakSuaraPage />);
    answerCorrectly();
    const lanjut = screen.getByRole("button", { name: /lanjut/i });
    fireEvent.click(lanjut);
    fireEvent.click(lanjut); // stale button from the exiting card
    expect(screen.getByText(/^2 \/ 10/)).toBeInTheDocument();
  });

});
