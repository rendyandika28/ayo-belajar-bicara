"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { asmaulHusna } from "@/data/islamic";
import { useAppStore } from "@/store/useAppStore";
import { speak } from "@/lib/speech";
import { playPop, playCelebration } from "@/lib/sounds";
import StarCounter from "@/components/ui/StarCounter";
import FocusModeButton from "@/components/focus/FocusModeButton";
import ConfettiEffect from "@/components/ui/ConfettiEffect";

export default function AsmaulHusnaPage() {
  const { asmaulHusnaLearned, markAsmaulHusnaLearned, addStar } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showReward, setShowReward] = useState(false);
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
    if (learnedInSession.current.size === total && !showReward) {
      setShowReward(true);
      setShowConfetti(true);
      playCelebration();
      setTimeout(() => setShowConfetti(false), 3500);
    }
  }, [currentIndex, total, showReward]);

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
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  return (
    <motion.div
      className="islamic-pattern min-h-screen flex flex-col px-4 py-4 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <ConfettiEffect show={showConfetti} />

      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href="/islami">
            <motion.button
              className="w-[52px] h-[52px] flex items-center justify-center bg-white/80 rounded-full shadow-md border-2 border-gray-200 text-2xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Kembali ke halaman Islami"
            >
              {"◀️"}
            </motion.button>
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-emerald-800">
            Asmaul Husna {"✨"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <FocusModeButton />
          <StarCounter />
        </div>
      </div>

      {/* Progress indicator */}
      <div className="text-center mb-2">
        <p className="font-body text-sm text-emerald-600/80">
          {currentIndex + 1}/{total}
        </p>
        <div className="w-full max-w-xs mx-auto h-2 bg-emerald-200 rounded-full overflow-hidden mt-1">
          <motion.div
            className="h-full bg-emerald-500 rounded-full"
            animate={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Card area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-full max-w-sm" style={{ minHeight: 300 }}>
          <AnimatePresence mode="wait" custom={direction}>
            {currentItem && (
              <motion.div
                key={currentItem.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  type: "tween",
                  duration: 0.25,
                }}
                className="absolute inset-0 bg-white rounded-3xl shadow-xl border-2 border-emerald-200 p-6 sm:p-8 flex flex-col items-center justify-center"
              >
                {/* Number badge */}
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-heading text-lg font-bold mb-4 shadow-md">
                  {currentItem.number}
                </div>

                {/* Arabic text */}
                <p
                  className="text-4xl sm:text-5xl text-emerald-900 mb-4 leading-relaxed"
                  style={{ fontFamily: "var(--font-amiri)" }}
                  dir="rtl" lang="ar"
                >
                  {currentItem.arabic}
                </p>

                {/* Latin name */}
                <h2 className="font-heading text-2xl font-bold text-emerald-800 mb-2">
                  {currentItem.latin}
                </h2>

                {/* Meaning */}
                <p className="text-lg text-gray-600 font-body text-center">
                  {currentItem.meaning}
                </p>

                {/* Listen button */}
                <motion.button
                  onClick={handleListen}
                  className="mt-5 bg-emerald-600 text-white font-heading text-lg px-8 py-3 rounded-2xl shadow-lg min-h-[52px] active:bg-emerald-700 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {"🔊"} Dengar
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center justify-center gap-8 mt-6">
          <motion.button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className={`w-16 h-16 flex items-center justify-center rounded-full text-2xl font-bold shadow-lg border-2 transition-colors ${
              currentIndex === 0
                ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                : "bg-white border-emerald-300 text-emerald-700 active:bg-emerald-50"
            }`}
            whileTap={currentIndex > 0 ? { scale: 0.9 } : {}}
            aria-label="Sebelumnya"
          >
            {"◀️"}
          </motion.button>

          <motion.button
            onClick={goNext}
            disabled={currentIndex >= total - 1}
            className={`w-16 h-16 flex items-center justify-center rounded-full text-2xl font-bold shadow-lg border-2 transition-colors ${
              currentIndex >= total - 1
                ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                : "bg-white border-emerald-300 text-emerald-700 active:bg-emerald-50"
            }`}
            whileTap={currentIndex < total - 1 ? { scale: 0.9 } : {}}
            aria-label="Selanjutnya"
          >
            {"▶️"}
          </motion.button>
        </div>
      </div>

      {/* Reward overlay */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-amber-300 text-center max-w-sm w-full"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <p className="text-6xl mb-4">{"🌟"}</p>
              <h2 className="font-heading text-2xl font-bold text-emerald-800 mb-2">
                Subhanallah! Kamu Hebat! {"🌟"}
              </h2>
              <p className="font-body text-emerald-600 mb-6">
                Kamu sudah belajar semua 10 Asmaul Husna!
              </p>
              <motion.button
                onClick={() => setShowReward(false)}
                className="bg-emerald-600 text-white font-heading text-lg px-8 py-3 rounded-2xl shadow-lg min-h-[52px] active:bg-emerald-700 transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                Lanjutkan
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
