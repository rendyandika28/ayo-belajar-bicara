"use client";

import { useAppStore } from "@/store/useAppStore";
import { playPop } from "@/lib/sounds";

export default function CalmModeToggle() {
  const calmMode = useAppStore((s) => s.calmMode);
  const toggleCalmMode = useAppStore((s) => s.toggleCalmMode);

  return (
    <button
      type="button"
      className={`flex items-center gap-2 rounded-full px-3 border font-heading text-sm min-h-[44px] min-w-[44px] transition-colors ${
        calmMode
          ? "bg-accent-soft border-accent text-accent-strong"
          : "bg-surface border-line text-ink hover:bg-accent-soft"
      }`}
      onClick={() => {
        toggleCalmMode();
        playPop();
      }}
      aria-label={calmMode ? "Nonaktifkan mode tenang" : "Aktifkan mode tenang"}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      <span className="hidden sm:inline">{calmMode ? "Tenang" : "Mode Tenang"}</span>
    </button>
  );
}
