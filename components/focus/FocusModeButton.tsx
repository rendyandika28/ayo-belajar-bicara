"use client";

import { useFocusStore } from "@/store/useFocusStore";
import { useAppStore } from "@/store/useAppStore";
import { enterFullscreen } from "@/hooks/useFocusMode";

export default function FocusModeButton() {
  const isFocusMode = useFocusStore((s) => s.isFocusMode);
  const startFocusMode = useFocusStore((s) => s.startFocusMode);
  const sessionDuration = useAppStore((s) => s.sessionDuration);

  if (isFocusMode) return null;

  const handleClick = () => {
    startFocusMode(sessionDuration);
    enterFullscreen();
  };

  return (
    // Icon only; the label floats out to the left on hover/focus without moving the layout.
    <button
      type="button"
      onClick={handleClick}
      className="group relative inline-flex shrink-0 items-center justify-center w-11 h-11 bg-accent-strong text-on-accent rounded-full hover:bg-ink transition-colors"
      aria-label={`Aktifkan mode belajar ${sessionDuration} menit`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-full top-1/2 mr-2 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-full bg-ink px-3 py-2 font-heading text-sm text-on-accent opacity-0 transition-[opacity,transform] duration-150 motion-reduce:transition-none group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100 z-10"
      >
        Mode Belajar {sessionDuration} menit
      </span>
    </button>
  );
}
