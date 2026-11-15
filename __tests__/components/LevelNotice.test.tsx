import { render, screen, act } from "@testing-library/react";
import LevelNotice from "@/components/LevelNotice";
import { useAppStore } from "@/store/useAppStore";

let path = "/kartu-kata";
vi.mock("next/navigation", () => ({ usePathname: () => path }));

beforeEach(() => {
  sessionStorage.clear();
  useAppStore.setState({ wordsLearned: [], currentLevel: 1, seenLevel: 0 });
  path = "/kartu-kata";
});

describe("LevelNotice", () => {
  it("greets a new player with their level on a game screen", () => {
    render(<LevelNotice />);
    expect(screen.getByText(/Kamu di Level 1/)).toBeInTheDocument();
    expect(screen.getByText(/10 kata lagi menuju Level 2/)).toBeInTheDocument();
  });

  it("announces a level up once", () => {
    render(<LevelNotice />);
    act(() => {
      useAppStore.setState({ wordsLearned: Array.from({ length: 10 }, (_, i) => `w${i}`), currentLevel: 2 });
    });
    expect(screen.getByText(/Naik ke Level 2/)).toBeInTheDocument();
    expect(useAppStore.getState().seenLevel).toBe(2);
  });

  it("stays quiet outside games", () => {
    path = "/pendamping";
    render(<LevelNotice />);
    expect(screen.queryByText(/Level 1/)).toBeNull();
  });
});
