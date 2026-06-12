import { render, screen } from "@testing-library/react";
import SkipLink from "@/components/SkipLink";

describe("SkipLink", () => {
  it("renders a link with accessible text", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: /lewati ke konten utama/i });
    expect(link).toBeInTheDocument();
  });

  it("links to #main-content", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: /lewati ke konten utama/i });
    expect(link).toHaveAttribute("href", "#main-content");
  });
});
