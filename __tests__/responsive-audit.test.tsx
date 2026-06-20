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
