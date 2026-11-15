"use client";

import { useAppStore } from "@/store/useAppStore";

export default function MuteButton() {
  const isMuted = useAppStore((s) => s.isMuted);
  const toggleMute = useAppStore((s) => s.toggleMute);

  return (
    <button
      type="button"
      className="flex items-center gap-2 bg-surface rounded-full px-3 border border-line text-ink font-heading text-sm min-h-[44px] min-w-[44px] hover:bg-accent-soft transition-colors"
      onClick={toggleMute}
      aria-label={isMuted ? "Aktifkan suara" : "Matikan suara"}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M11 5 6 9H3v6h3l5 4V5z" />
        {isMuted ? <path d="m16 9 5 6m0-6-5 6" /> : <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" />}
      </svg>
      <span className="hidden sm:inline">{isMuted ? "Suara mati" : "Suara"}</span>
    </button>
  );
}
