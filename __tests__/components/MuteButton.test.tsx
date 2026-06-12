import { render, screen, fireEvent } from "@testing-library/react";
import MuteButton from "@/components/MuteButton";
import { useAppStore } from "@/store/useAppStore";

describe("MuteButton", () => {
  beforeEach(() => {
    useAppStore.setState({
      isMuted: false,
      profiles: [{ id: "default", name: "Si Kecil", emoji: "\ud83d\udc76" }],
      activeProfileId: "default",
      profilesData: { default: { gameStats: {} } as any },
    } as any);
  });

  it("renders with accessible label when sound is on", () => {
    render(<MuteButton />);
    expect(screen.getByLabelText("Matikan suara")).toBeInTheDocument();
  });

  it("renders with accessible label when sound is muted", () => {
    useAppStore.setState({ isMuted: true } as any);
    render(<MuteButton />);
    expect(screen.getByLabelText("Aktifkan suara")).toBeInTheDocument();
  });

  it("toggles isMuted on click", () => {
    render(<MuteButton />);
    expect(useAppStore.getState().isMuted).toBe(false);
    fireEvent.click(screen.getByLabelText("Matikan suara"));
    expect(useAppStore.getState().isMuted).toBe(true);
  });
});
