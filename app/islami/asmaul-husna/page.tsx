"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { asmaulHusna } from "@/data/islamic";
import { useAppStore } from "@/store/useAppStore";
import { speak } from "@/lib/speech";
import { playPop, playCelebration } from "@/lib/sounds";
import GameShell from "@/components/ui/GameShell";
import BigButton from "@/components/ui/BigButton";
import Icon from "@/components/ui/Icon";
import ConfettiEffect from "@/components/ui/ConfettiEffect";

export default function AsmaulHusnaPage() {
  const { asmaulHusnaLearned, markAsmaulHusnaLearned, addStar } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const [hasShownReward, setHasShownReward] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const learnedInSession = useRef<Set<string>>(new Set());

  const currentItem = asmaulHusna[currentIndex];
  const total = asmaulHusna.length;

  // Mark as learned and speak when card appears
  useEffect(() => {
    if (!currentItem) return;

    // Speak the latin name
    speak(currentItem.latin, { rate: 0.6 });

    // Mark as learned and give star (only once per session)
    if (!learnedInSession.current.has(currentItem.id)) {
      learnedInSession.current.add(currentItem.id);
      if (!asmaulHusnaLearned.includes(currentItem.id)) {
        markAsmaulHusnaLearned(currentItem.id);
        addStar(1);
      }
    }
  }, [currentItem, asmaulHusnaLearned, markAsmaulHusnaLearned, addStar]);

  // Check if all viewed - show reward
  useEffect(() => {
    if (learnedInSession.current.size === total && !hasShownReward) {
      setHasShownReward(true);
      setShowReward(true);
      setShowConfetti(true);
      playCelebration();
      setTimeout(() => setShowConfetti(false), 3500);
    }
  }, [currentIndex, total, hasShownReward]);

  const goNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      playPop();
    }
  }, [currentIndex, total]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      playPop();
    }
  }, [currentIndex]);

  const handleListen = useCallback(() => {
    if (!currentItem) return;
    speak(currentItem.latin, { rate: 0.6 });
  }, [currentItem]);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <GameShell title="Asmaul Husna" backHref="/islami" backLabel="Kembali ke menu Islami">
      <ConfettiEffect show={showConfetti} />

      {/* Progress indicator */}
      <div className="text-center mb-4">
        <p className="font-body text-base text-ink-muted">{currentIndex + 1}/{total}</p>
        <div className="w-full max-w-xs mx-auto h-2 bg-line rounded-full overflow-hidden mt-1">
          <motion.div
            className="h-full bg-good-strong rounded-full origin-left"
            initial={false}
            animate={{ scaleX: (currentIndex + 1) / total }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-sm" style={{ minHeight: 340 }}>
          <AnimatePresence mode="wait" custom={direction}>
            {currentItem && (
              <motion.div
                key={currentItem.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "tween", duration: 0.25 }}
                className="absolute inset-0 bg-surface rounded-3xl border border-line p-6 sm:p-8 flex flex-col items-center justify-center"
              >
                <div className="w-11 h-11 rounded-full bg-good-strong text-on-accent flex items-center justify-center font-heading text-lg font-bold mb-4">
                  {currentItem.number}
                </div>
                <p className="font-arabic text-5xl text-ink mb-4 leading-relaxed" dir="rtl" lang="ar">
                  {currentItem.arabic}
                </p>
                <h2 className="font-heading text-3xl font-bold text-ink mb-2">{currentItem.latin}</h2>
                <p className="text-xl text-ink-muted font-body text-center">{currentItem.meaning}</p>
                <BigButton onClick={handleListen} className="mt-5">
                  <Icon name="speaker" /> Dengar
                </BigButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm mt-5">
          <BigButton tone="quiet" onClick={goPrev} disabled={currentIndex === 0} aria-label="Sebelumnya">
            <Icon name="prev" size={32} />
          </BigButton>
          <BigButton tone="quiet" onClick={goNext} disabled={currentIndex >= total - 1} aria-label="Selanjutnya">
            <Icon name="next" size={32} />
          </BigButton>
        </div>
      </div>

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
              <p className="font-body text-lg text-ink-muted">Kamu sudah belajar semua 10 Asmaul Husna!</p>
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
