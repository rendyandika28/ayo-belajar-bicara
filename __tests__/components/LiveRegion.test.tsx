import { render, screen } from "@testing-library/react";
import { LiveRegion } from "@/components/LiveRegion";

describe("LiveRegion", () => {
  it("renders the message in a status region", () => {
    render(<LiveRegion message="Bintang baru" />);
    const region = screen.getByRole("status");
    expect(region).toHaveTextContent("Bintang baru");
  });

  it("uses aria-live=polite by default", () => {
    render(<LiveRegion message="Hello" />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "polite");
  });

  it("uses aria-live=assertive when politeness is set", () => {
    render(<LiveRegion message="Warning" politeness="assertive" />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-live", "assertive");
  });

  it("has aria-atomic=true to read full content", () => {
    render(<LiveRegion message="Test" />);
    const region = screen.getByRole("status");
    expect(region).toHaveAttribute("aria-atomic", "true");
  });

  it("is visually hidden via sr-only", () => {
    const { container } = render(<LiveRegion message="Hidden" />);
    const region = container.querySelector("[role='status']");
    expect(region).toHaveClass("sr-only");
  });
});
