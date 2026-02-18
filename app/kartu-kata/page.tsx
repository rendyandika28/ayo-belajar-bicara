"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { speak, speakSyllable } from "@/lib/speech";
import { playPop } from "@/lib/sounds";
import { words, categories } from "@/data/words";
import { useAppStore } from "@/store/useAppStore";
import StarCounter from "@/components/ui/StarCounter";
import FocusModeButton from "@/components/focus/FocusModeButton";

export default function KartuKataPage() {
  const {
    markWordLearned,
    addStar,
    customWords,
    wordsLearned,
  } = useAppStore();

  const [selectedCategory, setSelectedCategory] = useState("semua");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 = left, 1 = right
  const learnedRef = useRef<Set<string>>(new Set());

  // Combine built-in words with custom words and filter by category
  const allWords = useMemo(() => {
    const combined = [...words, ...customWords];
    if (selectedCategory === "semua") return combined;
    return combined.filter((w) => w.category === selectedCategory);
  }, [selectedCategory, customWords]);

  // Reset index when category changes
  useEffect(() => {
    setCurrentIndex(0);
    setDirection(0);
  }, [selectedCategory]);

  const currentWord = allWords[currentIndex];

  // Mark word as learned and give star on first view
  useEffect(() => {
    if (currentWord && !learnedRef.current.has(currentWord.id)) {
      learnedRef.current.add(currentWord.id);
      markWordLearned(currentWord.id);
      if (!wordsLearned.includes(currentWord.id)) {
        addStar(1);
      }
    }
  }, [currentWord, markWordLearned, addStar, wordsLearned]);

  const goNext = useCallback(() => {
    if (currentIndex < allWords.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      playPop();
    }
  }, [currentIndex, allWords.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      playPop();
    }
  }, [currentIndex]);

  const handleCardTap = useCallback(() => {
    if (currentWord) {
      speak(currentWord.word);
    }
  }, [currentWord]);

  const handleSyllableTap = useCallback((syllable: string) => {
    speakSyllable(syllable);
    playPop();
  }, []);

  // Swipe support for mobile
  const touchStartX = useRef(0);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      if (diff > 60) goPrev();
      else if (diff < -60) goNext();
    },
    [goNext, goPrev]
  );

  // Slide animation variants
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
      className="min-h-screen flex flex-col px-4 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/">
          <motion.button
            className="w-[52px] h-[52px] flex items-center justify-center bg-white/80 rounded-full shadow-md border-2 border-gray-200 text-2xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Kembali ke beranda"
          >
            {"\ud83c\udfe0"}
          </motion.button>
        </Link>

        <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
          Kartu Kata
        </h1>

        <div className="flex items-center gap-2">
          <FocusModeButton />
          <StarCounter />
        </div>
      </div>

      {/* Category filter */}
      <div className="mb-4 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full font-heading text-sm min-h-[44px] border-2 transition-colors ${
                selectedCategory === cat.id
                  ? "bg-foreground text-white border-foreground shadow-lg"
                  : "bg-white border-gray-200 text-foreground/80 shadow-sm"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Flashcard area */}
      <div
        className="flex-1 flex flex-col items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {allWords.length === 0 ? (
          <div className="text-center font-body text-foreground/60">
            <p className="text-4xl mb-3">{"\ud83d\ude22"}</p>
            <p>Belum ada kata di kategori ini.</p>
          </div>
        ) : (
          <>
            {/* Card counter */}
            <p className="font-body text-sm text-foreground/50 mb-3">
              {currentIndex + 1} / {allWords.length}
            </p>

            {/* Flashcard */}
            <div className="relative w-full max-w-sm" style={{ minHeight: 280 }}>
              <AnimatePresence mode="wait" custom={direction}>
                {currentWord && (
                  <motion.div
                    key={currentWord.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      type: "tween",
                      duration: 0.25,
                    }}
                    onClick={handleCardTap}
                    className="absolute inset-0 bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-6 flex flex-col items-center justify-center cursor-pointer select-none"
                  >
                    {/* Emoji */}
                    <motion.span
                      className="text-6xl sm:text-8xl leading-none mb-4"
                      whileTap={{ scale: 1.2 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {currentWord.emoji}
                    </motion.span>

                    {/* Word */}
                    <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground mb-3">
                      {currentWord.word}
                    </h2>

                    {/* Syllable breakdown */}
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {currentWord.syllables.map((syl, i) => (
                        <span key={i} className="flex items-center gap-2">
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSyllableTap(syl);
                            }}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-800 font-heading text-xl px-4 py-2 rounded-2xl min-w-[56px] min-h-[48px] border-2 border-blue-200 active:bg-blue-300 transition-colors"
                            whileTap={{ scale: 0.9 }}
                          >
                            {syl}
                          </motion.button>
                          {i < currentWord.syllables.length - 1 && (
                            <span className="text-foreground/30 font-body text-lg">
                              -
                            </span>
                          )}
                        </span>
                      ))}
                    </div>

                    {/* Tap hint */}
                    <p className="mt-4 text-xs text-foreground/40 font-body">
                      {"\ud83d\udd0a"} Ketuk untuk dengar
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <motion.button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className={`w-16 h-16 flex items-center justify-center rounded-full text-2xl font-bold shadow-lg border-2 transition-colors ${
                  currentIndex === 0
                    ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                    : "bg-white border-gray-200 text-foreground active:bg-gray-100"
                }`}
                whileTap={currentIndex > 0 ? { scale: 0.9 } : {}}
                aria-label="Sebelumnya"
              >
                {"\u25c0\ufe0f"}
              </motion.button>

              <motion.button
                onClick={handleCardTap}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-green-200 border-2 border-green-300 text-2xl shadow-lg active:bg-green-300 transition-colors"
                whileTap={{ scale: 0.9 }}
                aria-label="Ucapkan kata"
              >
                {"\ud83d\udd0a"}
              </motion.button>

              <motion.button
                onClick={goNext}
                disabled={currentIndex >= allWords.length - 1}
                className={`w-16 h-16 flex items-center justify-center rounded-full text-2xl font-bold shadow-lg border-2 transition-colors ${
                  currentIndex >= allWords.length - 1
                    ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                    : "bg-white border-gray-200 text-foreground active:bg-gray-100"
                }`}
                whileTap={
                  currentIndex < allWords.length - 1 ? { scale: 0.9 } : {}
                }
                aria-label="Selanjutnya"
              >
                {"\u25b6\ufe0f"}
              </motion.button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
