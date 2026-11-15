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
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2 bg-accent-strong text-on-accent rounded-full px-3 font-heading text-sm min-h-[44px] hover:bg-ink transition-colors"
      aria-label="Aktifkan mode belajar"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      <span>Mode Belajar {sessionDuration}m</span>
    </button>
  );
}
