import { render, screen, fireEvent } from "@testing-library/react";
import CalmModeToggle from "@/components/CalmModeToggle";
import { useAppStore } from "@/store/useAppStore";

describe("CalmModeToggle", () => {
  beforeEach(() => {
    useAppStore.setState({
      calmMode: false,
      profiles: [{ id: "default", name: "Si Kecil", emoji: "\ud83d\udc76" }],
      activeProfileId: "default",
      profilesData: { default: { gameStats: {} } as any },
    } as any);
    document.body.classList.remove("calm-mode-active");
  });

  it("renders with accessible label when calm mode is off", () => {
    render(<CalmModeToggle />);
    expect(screen.getByLabelText("Aktifkan mode tenang")).toBeInTheDocument();
  });

  it("renders with accessible label when calm mode is on", () => {
    useAppStore.setState({ calmMode: true } as any);
    render(<CalmModeToggle />);
    expect(screen.getByLabelText("Nonaktifkan mode tenang")).toBeInTheDocument();
  });

  it("toggles calmMode on click", () => {
    render(<CalmModeToggle />);
    expect(useAppStore.getState().calmMode).toBe(false);
    fireEvent.click(screen.getByLabelText("Aktifkan mode tenang"));
    expect(useAppStore.getState().calmMode).toBe(true);
  });
});
