import { render, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import HomePage from "@/app/page";
import KartuKataPage from "@/app/kartu-kata/page";
import BunyiKataPage from "@/app/bunyi-kata/page";
import TebakGambarPage from "@/app/tebak-gambar/page";
import TebakSuaraPage from "@/app/tebak-suara/page";
import SukuKataPage from "@/app/suku-kata/page";
import AyoNgomongPage from "@/app/ayo-ngomong/page";
import PendampingPage from "@/app/pendamping/page";
import SusunKalimatPage from "@/app/susun-kalimat/page";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

const VIEWPORTS = [
  { name: "phone-320", width: 320, height: 568 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1280", width: 1280, height: 800 },
] as const;

const PAGES: Array<[string, React.ComponentType]> = [
  ["home", HomePage],
  ["kartu-kata", KartuKataPage],
  ["bunyi-kata", BunyiKataPage],
  ["tebak-gambar", TebakGambarPage],
  ["tebak-suara", TebakSuaraPage],
  ["suku-kata", SukuKataPage],
  ["ayo-ngomong", AyoNgomongPage],
  ["pendamping", PendampingPage],
  ["susun-kalimat", SusunKalimatPage],
];

describe.each(VIEWPORTS)("responsive audit @ $name", ({ width, height }) => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      value: width,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: height,
      configurable: true,
      writable: true,
    });
    Object.defineProperty(document.documentElement, "clientWidth", {
      value: width,
      configurable: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  test.each(PAGES)("%s does not overflow the viewport horizontally", (_name, Page) => {
    render(<Page />);
    const docWidth = document.documentElement.scrollWidth;
    expect(docWidth).toBeLessThanOrEqual(width + 1);
  });
});

describe("SafeInput primitive", () => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { value: 320, configurable: true });
  });

  afterEach(() => {
    cleanup();
  });

  test("has min-w-0 class to prevent flex overflow", async () => {
    const { SafeInput } = await import("@/components/ui/SafeInput");
    const { container } = render(<SafeInput aria-label="test" />);
    const input = container.querySelector("input");
    expect(input?.className).toContain("min-w-0");
  });

  test("defaults size attribute to 1 to prevent intrinsic min-width", async () => {
    const { SafeInput } = await import("@/components/ui/SafeInput");
    const { container } = render(<SafeInput aria-label="test" />);
    const input = container.querySelector("input");
    expect(input?.getAttribute("size")).toBe("1");
  });
});

describe("ResponsivePanel primitive", () => {
  test("constrains width to viewport minus gutter", async () => {
    const { ResponsivePanel } = await import("@/components/ui/ResponsivePanel");
    const { container } = render(<ResponsivePanel>x</ResponsivePanel>);
    const div = container.querySelector("div");
    expect(div?.className).toContain("max-w-[calc(100vw-1.5rem)]");
  });
});
