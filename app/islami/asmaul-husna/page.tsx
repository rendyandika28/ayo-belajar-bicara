"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { asmaulHusna } from "@/data/islamic";
import { useAppStore } from "@/store/useAppStore";
import { speakAsma } from "@/lib/speech";
import { playPop, playCelebration } from "@/lib/sounds";
import GameShell from "@/components/ui/GameShell";
import BigButton from "@/components/ui/BigButton";
import Icon from "@/components/ui/Icon";
import ConfettiEffect from "@/components/ui/ConfettiEffect";

export default function AsmaulHusnaPage() {
  const { markAsmaulHusnaLearned, addStar } = useAppStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [hasShownReward, setHasShownReward] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const learnedInSession = useRef<Set<string>>(new Set());
  const total = asmaulHusna.length;

  // Tap a card: hear the name; first tap this session marks it learned (+1 star if new).
  const handleTap = useCallback((item: (typeof asmaulHusna)[number]) => {
    playPop();
    setActiveId(item.id);
    speakAsma(item);
    if (learnedInSession.current.has(item.id)) return;
    learnedInSession.current.add(item.id);
    const isNew = markAsmaulHusnaLearned(item.id);
    if (isNew) addStar(1);
    // Reward the moment the last name is learned, across all visits (store keeps progress).
    if (isNew && useAppStore.getState().asmaulHusnaLearned.length >= total && !hasShownReward) {
      setHasShownReward(true);
      setShowReward(true);
      setShowConfetti(true);
      playCelebration();
      setTimeout(() => setShowConfetti(false), 3500);
    }
  }, [markAsmaulHusnaLearned, addStar, total, hasShownReward]);

  return (
    <GameShell title="Asmaul Husna" backHref="/islami" backLabel="Kembali ke menu Islami">
      <ConfettiEffect show={showConfetti} />

      <p className="text-center font-body text-base text-ink-muted mb-3">Ketuk nama untuk mendengar</p>
      <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {asmaulHusna.map((item) => {
          const active = item.id === activeId;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => handleTap(item)}
                aria-pressed={active}
                aria-label={`${item.number}. ${item.latin}, ${item.meaning}`}
                className={`relative w-full h-full rounded-3xl border-2 p-3 pt-4 flex flex-col items-center gap-1 text-center transition-colors ${
                  active ? "bg-accent-soft border-accent-strong" : "bg-surface border-line hover:bg-accent-soft active:bg-line"
                }`}
              >
                <span className="absolute top-2 left-2 w-7 h-7 rounded-full bg-good-strong text-on-accent flex items-center justify-center font-heading text-xs font-bold">
                  {item.number}
                </span>
                <span className="font-arabic text-3xl sm:text-4xl text-ink leading-relaxed" dir="rtl" lang="ar">{item.arabic}</span>
                <span className="font-heading text-base sm:text-lg font-bold text-ink leading-tight" style={{ overflowWrap: "break-word", minWidth: 0 }}>{item.latin}</span>
                <span className="font-body text-sm text-ink-muted leading-snug">{item.meaning}</span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Reward overlay */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            className="fixed inset-0 z-40 bg-paper flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bg-surface rounded-3xl p-8 border border-line text-center max-w-sm w-full flex flex-col items-center gap-3">
              <span className="w-20 h-20 rounded-full bg-good-strong text-on-accent flex items-center justify-center">
                <Icon name="star" size={40} />
              </span>
              <h2 className="font-heading text-2xl font-bold text-ink">Subhanallah! Kamu Hebat!</h2>
              <p className="font-body text-lg text-ink-muted">Kamu sudah belajar semua {total} Asmaul Husna!</p>
              <div className="flex flex-col gap-3 w-full mt-2">
                <BigButton onClick={() => setShowReward(false)} className="w-full">
                  Lanjutkan Belajar
                </BigButton>
                <Link
                  href="/islami"
                  className="inline-flex items-center justify-center gap-3 min-h-[72px] px-6 rounded-3xl font-heading text-lg sm:text-xl font-semibold bg-surface text-ink border-2 border-line transition-colors hover:bg-accent-soft active:bg-line"
                >
                  <Icon name="home" /> Menu Islami
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
