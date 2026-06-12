import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OnboardingOverlay from "@/components/OnboardingOverlay";

describe("OnboardingOverlay", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not render when onboarding already completed", () => {
    localStorage.setItem("onboardingDone", "true");
    const { container } = render(<OnboardingOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it("shows first step on first visit", () => {
    render(<OnboardingOverlay />);
    expect(screen.getByText(/Ayo Belajar Bicara!/i)).toBeInTheDocument();
  });

  it("has a Lewati (skip) button", () => {
    render(<OnboardingOverlay />);
    expect(screen.getByRole("button", { name: /lewati/i })).toBeInTheDocument();
  });

  it("skips and persists when Lewati is clicked", () => {
    render(<OnboardingOverlay />);
    fireEvent.click(screen.getByRole("button", { name: /lewati/i }));
    expect(localStorage.getItem("onboardingDone")).toBe("true");
  });

  it("progresses to next step on Lanjut click", async () => {
    render(<OnboardingOverlay />);
    const lanjut = screen.getByRole("button", { name: /lanjut/i });
    fireEvent.click(lanjut);
    await waitFor(() => {
      expect(screen.getByText(/Mulai dari Tebak Gambar/i)).toBeInTheDocument();
    });
  });

  it("completes onboarding on final step and hides", async () => {
    render(<OnboardingOverlay />);
    fireEvent.click(screen.getByRole("button", { name: /lanjut/i }));
    await waitFor(() => screen.getByText(/Mulai dari Tebak Gambar/i));
    fireEvent.click(screen.getByRole("button", { name: /lanjut/i }));
    await waitFor(() => screen.getByText(/Pantau Perkembangan/i));
    fireEvent.click(screen.getByRole("button", { name: /mulai belajar/i }));
    expect(localStorage.getItem("onboardingDone")).toBe("true");
  });
});
