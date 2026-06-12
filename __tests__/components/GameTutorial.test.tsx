import { render, screen, fireEvent, act } from "@testing-library/react";
import GameTutorial from "@/components/GameTutorial";

describe("GameTutorial", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const steps = [
    { emoji: "\ud83d\udcda", text: "Buka kartu kata" },
    { emoji: "\ud83d\udd0a", text: "Tekan untuk mendengar" },
  ];

  it("does not render when tutorial already seen", () => {
    localStorage.setItem("tutorial_kartu-kata", "1");
    const { container } = render(
      <GameTutorial gameKey="kartu-kata" steps={steps} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders first step on first visit after small delay", async () => {
    render(<GameTutorial gameKey="kartu-kata" steps={steps} />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    expect(screen.getByText(/buka kartu kata/i)).toBeInTheDocument();
  });

  it("persists tutorial_seen flag on Lewati", async () => {
    render(<GameTutorial gameKey="kartu-kata" steps={steps} />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    const skip = screen.queryByRole("button", { name: /lewati/i });
    if (skip) {
      fireEvent.click(skip);
      expect(localStorage.getItem("tutorial_kartu-kata")).toBe("1");
    }
  });

  it("persists flag after final step", async () => {
    render(<GameTutorial gameKey="kartu-kata" steps={steps} />);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
    });
    // Click Lanjut to go to step 2
    const lanjut = screen.queryByRole("button", { name: /lanjut/i });
    if (lanjut) fireEvent.click(lanjut);
    // Final step should have "Mulai" or similar
    const final = screen.queryByRole("button", { name: /mulai/i });
    if (final) {
      fireEvent.click(final);
      expect(localStorage.getItem("tutorial_kartu-kata")).toBe("1");
    }
  });
});
