import { render, screen, fireEvent } from "@testing-library/react";
import ProfileSwitcher from "@/components/ProfileSwitcher";
import { useAppStore } from "@/store/useAppStore";

describe("ProfileSwitcher", () => {
  beforeEach(() => {
    useAppStore.setState({
      profiles: [{ id: "default", name: "Si Kecil", emoji: "\ud83d\udc76" }],
      activeProfileId: "default",
      profilesData: {
        default: {
          totalStars: 0,
          wordsLearned: [],
          gameStats: {},
        } as any,
      },
    } as any);
  });

  it("renders the active profile name", () => {
    render(<ProfileSwitcher />);
    expect(screen.getByText("Si Kecil")).toBeInTheDocument();
  });

  it("renders the active profile emoji", () => {
    render(<ProfileSwitcher />);
    expect(screen.getByText("\ud83d\udc76")).toBeInTheDocument();
  });

  it("has accessible label for the switcher", () => {
    render(<ProfileSwitcher />);
    expect(screen.getByLabelText("Ganti profil")).toBeInTheDocument();
  });

  it("opens the dropdown on click", () => {
    render(<ProfileSwitcher />);
    fireEvent.click(screen.getByLabelText("Ganti profil"));
    expect(screen.getByText(/Tambah Anak/i)).toBeInTheDocument();
  });

  it("shows add form when Tambah Anak is clicked", () => {
    render(<ProfileSwitcher />);
    fireEvent.click(screen.getByLabelText("Ganti profil"));
    fireEvent.click(screen.getByText(/Tambah Anak/i));
    expect(screen.getByPlaceholderText(/nama anak/i)).toBeInTheDocument();
  });

  it("creates a new profile", () => {
    render(<ProfileSwitcher />);
    const before = useAppStore.getState().profiles.length;
    fireEvent.click(screen.getByLabelText("Ganti profil"));
    fireEvent.click(screen.getByText(/Tambah Anak/i));
    const input = screen.getByPlaceholderText(/nama anak/i);
    fireEvent.change(input, { target: { value: "Adik Baru" } });
    fireEvent.click(screen.getByRole("button", { name: /^tambah$/i }));
    const after = useAppStore.getState().profiles.length;
    expect(after).toBe(before + 1);
    expect(useAppStore.getState().profiles[after - 1].name).toBe("Adik Baru");
  });
});
