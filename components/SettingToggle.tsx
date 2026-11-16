"use client";

import { useAppStore } from "@/store/useAppStore";
import { playPop } from "@/lib/sounds";

/** Parent setting: stops animations and softens sound effects (W3C COGA, WCAG 2.3.3). */
export default function CalmModeToggle() {
  const calmMode = useAppStore((s) => s.calmMode);
  const toggleCalmMode = useAppStore((s) => s.toggleCalmMode);
  return <SettingToggle id="calm-label" title="Matikan Animasi" hint="Bunyi juga lebih pelan" on={calmMode} onToggle={toggleCalmMode} />;
}

/** Parent setting: hides word text in Kartu Kata and Tebak Gambar so the child guesses from picture/sound. */
export function HideTextToggle() {
  const hideText = useAppStore((s) => s.hideText);
  const toggleHideText = useAppStore((s) => s.toggleHideText);
  return <SettingToggle id="hide-text-label" title="Sembunyikan Tulisan" hint="Tebak dari gambar & suara" on={hideText} onToggle={toggleHideText} />;
}

function SettingToggle({ id, title, hint, on, onToggle }: { id: string; title: string; hint: string; on: boolean; onToggle: () => void }) {

  return (
    <div className="flex items-center gap-3 rounded-full bg-surface border border-line pl-2 pr-4 min-h-[44px]">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-labelledby={id}
        onClick={() => {
          onToggle();
          playPop();
        }}
        className={`relative inline-flex shrink-0 h-7 w-12 items-center rounded-full transition-colors ${
          on ? "bg-accent-strong" : "bg-line"
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 rounded-full bg-surface shadow transition-transform ${
            on ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
      <span className="text-left leading-tight">
        <span id={id} className="block font-heading text-sm font-semibold text-ink">{title}</span>
        <span className="block font-body text-xs text-ink-muted">{hint}</span>
      </span>
    </div>
  );
}
