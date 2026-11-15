"use client";

import { useEffect } from "react";
import AssetImage from "@/components/ui/AssetImage";
import Link from "next/link";
import StarCounter from "@/components/ui/StarCounter";
import MuteButton from "@/components/MuteButton";
import { useAppStore } from "@/store/useAppStore";
import { playPop } from "@/lib/sounds";

import { beginnerGames, advancedGames, type Game } from "@/lib/games";
import { levelProgress } from "@/lib/levels";

function GameCard({ game: item, eager }: { game: Game; eager?: boolean }) {
  return (
    <Link
      href={item.href}
      onClick={playPop}
      className={`home-card group flex flex-col bg-surface rounded-3xl border border-line p-3 min-w-0 transition-transform hover:-translate-y-0.5 active:scale-[0.97]`}
    >
      {/* Slot: public/images/games/<slug>.webp, 1024x1024, AI illustration */}
      <AssetImage src={`/images/games/${item.slug}.webp`} eager={eager} className="aspect-square w-full rounded-2xl" />
      <span className="font-heading text-lg sm:text-xl font-semibold text-ink mt-3 px-1">{item.label}</span>
      <span className="font-body text-sm text-ink-muted leading-snug px-1 pb-1">{item.desc}</span>
    </Link>
  );
}

function Section({ title, tag, games, cols, eager }: { title: string; tag: string; games: Game[]; cols: string; eager?: boolean }) {
  return (
    <section className="mb-10">
      <div className="flex items-baseline gap-3 mb-4 px-1">
        <h2 className="font-heading text-xl font-semibold text-ink">{title}</h2>
        <span className="font-body text-sm text-ink-muted">{tag}</span>
      </div>
      <div className={`grid grid-cols-2 ${cols} gap-4`}>
        {games.map((g) => <GameCard key={g.href} game={g} eager={eager} />)}
      </div>
    </section>
  );
}

export default function HomePage() {
  const updateStreak = useAppStore((s) => s.updateStreak);
  const startSession = useAppStore((s) => s.startSession);
  const dailyStreak = useAppStore((s) => s.dailyStreak);
  const currentLevel = useAppStore((s) => s.currentLevel);
  const wordCount = useAppStore((s) => s.wordsLearned.length);

  useEffect(() => {
    updateStreak();
    startSession();
  }, [updateStreak, startSession]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-16">
        {/* Top bar */}
        <header className="flex flex-wrap items-center justify-between gap-2 mb-8">
          <Link
            href="/pendamping"
            onClick={playPop}
            className={`inline-flex items-center gap-2 bg-surface rounded-full px-4 min-h-[44px] border border-line font-heading text-sm text-ink transition-colors hover:bg-accent-soft active:bg-line`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="8" cy="7" r="3" />
              <circle cx="17" cy="9" r="2.5" />
              <path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6" />
              <path d="M13.5 20c.3-2.6 1.8-4.5 3.5-4.5s3.5 2 3.5 4.5" />
            </svg>
            <span className="hidden sm:inline">Pendamping</span>
            <span className="sr-only sm:hidden">Pendamping</span>
          </Link>

          <div className="flex flex-wrap justify-end items-center gap-1.5">
            <MuteButton />
            {dailyStreak > 0 && (
              <div className="flex items-center gap-1 bg-surface rounded-full px-3 min-h-[44px] border border-line">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-warn">
                  <path d="M12 21c-4 0-6.5-2.6-6.5-6 0-3.5 3-5.5 3.5-9 2 1.2 3 3 3 5 1-1 1.5-2.2 1.5-3.5 2.6 1.8 5 4.6 5 7.5 0 3.4-2.5 6-6.5 6Z" />
                </svg>
                <span className="font-heading text-lg font-bold text-ink tabular-nums">{dailyStreak}</span>
                <span className="sr-only">hari berturut-turut</span>
              </div>
            )}
            <StarCounter />
          </div>
        </header>

        {/* Title */}
        <div className="mb-10 px-1">
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-ink leading-tight" style={{ overflowWrap: "break-word", minWidth: 0 }}>
            Ayo Belajar Bicara!
          </h1>
          <p className="font-body text-base text-ink-muted mt-2">Level {levelProgress(wordCount, currentLevel).current.level}</p>
        </div>

        <Section title="Mulai Belajar" tag="Pemula" games={beginnerGames} cols="sm:grid-cols-3" eager />
        <Section title="Tantangan" tag="Lanjutan" games={advancedGames} cols="sm:grid-cols-4" />
      </div>
    </div>
  );
}
