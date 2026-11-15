"use client";

import Link from "next/link";
import GameShell from "@/components/ui/GameShell";
import AssetImage from "@/components/ui/AssetImage";
import { useAppStore } from "@/store/useAppStore";
import { playPop } from "@/lib/sounds";
import { hijaiyahLetters, dailyDoas, asmaulHusna } from "@/data/islamic";

export default function IslamiPage() {
  const { hijaiyahLearned, doasAttempted, asmaulHusnaLearned } = useAppStore();

  const cards = [
    { label: "Huruf Hijaiyah", href: "/islami/hijaiyah", image: "/images/ui/islami-hijaiyah.webp", done: hijaiyahLearned.length, total: hijaiyahLetters.length, unit: "huruf" },
    { label: "Doa Harian", href: "/islami/doa", image: "/images/ui/islami-doa.webp", done: doasAttempted.length, total: dailyDoas.length, unit: "doa" },
    { label: "Asmaul Husna", href: "/islami/asmaul-husna", image: "/images/ui/islami-asma.webp", done: asmaulHusnaLearned.length, total: asmaulHusna.length, unit: "nama" },
  ];

  return (
    <GameShell title="Belajar Islami">
      {/* Same card shape as Suku Kata's mode picker: picture on top, label + progress below. */}
      <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3 sm:gap-4 w-full">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            onClick={playPop}
            className="bg-surface border border-line rounded-3xl p-3 flex min-[420px]:flex-col items-center min-[420px]:items-stretch gap-3 w-full min-w-0 hover:bg-accent-soft active:bg-line transition-colors"
          >
            <AssetImage src={card.image} eager className="w-20 h-20 shrink-0 min-[420px]:w-full min-[420px]:h-auto min-[420px]:aspect-square rounded-2xl" />
            <span className="flex-1 min-w-0 min-[420px]:px-1 min-[420px]:pb-1">
              <span className="block font-heading text-lg sm:text-xl font-bold text-ink leading-tight">{card.label}</span>
              <span className="block mt-2 w-full h-2 bg-line rounded-full overflow-hidden">
                <span
                  className="block h-full bg-good-strong rounded-full origin-left"
                  style={{ transform: `scaleX(${Math.min(card.done / card.total, 1)})` }}
                />
              </span>
              <span className="block font-body text-sm text-ink-muted mt-1">{card.done}/{card.total} {card.unit}</span>
            </span>
          </Link>
        ))}
      </div>
    </GameShell>
  );
}
