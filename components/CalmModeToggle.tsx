"use client";

import { useAppStore } from "@/store/useAppStore";
import { playPop } from "@/lib/sounds";

/** Parent setting: stops animations and softens sound effects (W3C COGA, WCAG 2.3.3). */
export default function CalmModeToggle() {
  const calmMode = useAppStore((s) => s.calmMode);
  const toggleCalmMode = useAppStore((s) => s.toggleCalmMode);

  return (
    <div className="flex items-center gap-3 rounded-full bg-surface border border-line pl-4 pr-2 min-h-[44px]">
      <span className="text-right leading-tight">
        <span id="calm-label" className="block font-heading text-sm font-semibold text-ink">Matikan Animasi</span>
        <span className="block font-body text-xs text-ink-muted">Bunyi juga lebih pelan</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={calmMode}
        aria-labelledby="calm-label"
        onClick={() => {
          toggleCalmMode();
          playPop();
        }}
        className={`relative inline-flex shrink-0 h-7 w-12 items-center rounded-full transition-colors ${
          calmMode ? "bg-accent-strong" : "bg-line"
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 rounded-full bg-surface shadow transition-transform ${
            calmMode ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
