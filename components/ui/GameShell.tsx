"use client";

import Link from "next/link";
import StarCounter from "@/components/ui/StarCounter";
import FocusModeButton from "@/components/focus/FocusModeButton";
import { playPop } from "@/lib/sounds";

/**
 * One header for every game screen: home on the left, title in the middle,
 * stars on the right. Same place on every page (W3C COGA: predictable layout).
 */
export default function GameShell({
  title,
  children,
  focusMode = true,
  backHref = "/",
  backLabel = "Kembali ke beranda",
  onBack,
}: {
  title: string;
  children: React.ReactNode;
  focusMode?: boolean;
  backHref?: string;
  backLabel?: string;
  /** In-page back (e.g. quiz → menu). When set, the top-left button calls this instead of navigating. */
  onBack?: () => void;
}) {
  const btn = "inline-flex shrink-0 items-center justify-center w-14 h-14 rounded-full bg-surface border border-line text-ink transition-colors hover:bg-accent-soft active:bg-line";
  const homeIcon = (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
  const backIcon = (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-4 pb-12">
        {/* 3 equal side tracks keep the title exactly centred. Phones: title gets its own
            centred row so it never truncates; wider: one row. */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 mb-5">
          <div className="flex justify-start">
          {onBack ? (
            <button type="button" onClick={() => { playPop(); onBack(); }} aria-label={backLabel} className={btn}>
              {backIcon}
            </button>
          ) : (
            <Link href={backHref} onClick={playPop} aria-label={backLabel} className={btn}>
              {backHref === "/" ? homeIcon : backIcon}
            </Link>
          )}
          </div>
          <h1 className="order-last col-span-2 sm:order-none sm:col-span-1 min-w-0 font-heading text-2xl sm:text-3xl font-bold text-ink text-center" style={{ overflowWrap: "break-word" }}>{title}</h1>
          <div className="flex items-center gap-2 justify-end">
            {focusMode && <FocusModeButton />}
            <StarCounter />
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
