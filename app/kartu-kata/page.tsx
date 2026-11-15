"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { asset } from "@/lib/asset";
import { motion, AnimatePresence } from "framer-motion";
import { speak, speakSyllable } from "@/lib/speech";
import { words, categories } from "@/data/words";
import { useAppStore } from "@/store/useAppStore";
import GameShell from "@/components/ui/GameShell";
import BigButton from "@/components/ui/BigButton";
import GameTutorial from "@/components/GameTutorial";
import WordPicture from "@/components/WordPicture";
import { playPop } from "@/lib/sounds";

export default function KartuKataPage() {
  const {
    markWordLearned,
    addStar,
    customWords,
    recordGamePlay,
  } = useAppStore();

  useEffect(() => { recordGamePlay("kartu-kata"); }, [recordGamePlay]);

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
      // Store decides "new" from live state; the render snapshot is empty right after a refresh.
      if (markWordLearned(currentWord.id)) addStar(1);
    }
  }, [currentWord, markWordLearned, addStar]);

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
      x: dir > 0 ? 60 : -60,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
    }),
  };

  return (
    <GameShell title="Kartu Kata">
      <GameTutorial
        gameKey="kartu-kata"
        steps={[
          { image: "/images/words/bnd-3.webp", text: "Geser atau tekan tombol panah untuk melihat kata berikutnya." },
          { image: "/images/ui/listen.webp", text: "Ketuk kartu untuk mendengar cara membaca kata yang benar." },
        ]}
      />

      {/* Category filter */}
      <div className="mb-4 -mx-4 px-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={selectedCategory === cat.id}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 rounded-full font-heading text-base min-h-[44px] border transition-colors ${
                selectedCategory === cat.id
                  ? "bg-accent-soft text-ink border-accent-strong"
                  : "bg-surface border-line text-ink-muted hover:bg-accent-soft"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset(cat.image)} alt="" aria-hidden="true" className="w-7 h-7 rounded-full object-cover bg-paper -ml-1.5" />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Flashcard area */}
      <div
        className="flex flex-col items-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {allWords.length === 0 ? (
          <p className="text-center font-body text-lg text-ink-muted py-12">
            Belum ada kata di kategori ini.
          </p>
        ) : (
          <>
            <p className="font-body text-base text-ink-muted mb-3">
              {currentIndex + 1} / {allWords.length}
            </p>

            <div className="relative w-full max-w-sm" style={{ minHeight: 400 }}>
              <AnimatePresence mode="wait" custom={direction}>
                {currentWord && (
                  <motion.div
                    key={currentWord.id}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "tween", duration: 0.25 }}
                    onClick={handleCardTap}
                    className="absolute inset-0 bg-surface rounded-3xl border border-line p-6 flex flex-col items-center justify-center cursor-pointer select-none"
                  >
                    <div className="mb-4">
                      <WordPicture word={currentWord} className="w-44 h-44 sm:w-48 sm:h-48" />
                    </div>

                    <h2 className="font-heading text-[40px] sm:text-5xl leading-tight font-bold text-ink mb-3">
                      {currentWord.word}
                    </h2>

                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      {currentWord.syllables.map((syl, i) => (
                        <span key={i} className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSyllableTap(syl);
                            }}
                            className="bg-accent-soft text-ink font-heading text-xl px-4 rounded-2xl min-w-[56px] min-h-[48px] hover:bg-line active:bg-line transition-colors"
                          >
                            {syl}
                          </button>
                          {i < currentWord.syllables.length - 1 && (
                            <span className="text-ink-muted font-body text-lg" aria-hidden="true">
                              -
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-center gap-3 mt-6">
              <BigButton
                tone="quiet"
                onClick={goPrev}
                disabled={currentIndex === 0}
                aria-label="Sebelumnya"
              >
                <ArrowIcon dir="left" />
              </BigButton>

              <BigButton onClick={handleCardTap}>
                <SpeakerIcon />
                <span>Dengar</span>
              </BigButton>

              <BigButton
                tone="quiet"
                onClick={goNext}
                disabled={currentIndex >= allWords.length - 1}
                aria-label="Selanjutnya"
              >
                <ArrowIcon dir="right" />
              </BigButton>
            </div>
          </>
        )}
      </div>
    </GameShell>
  );
}

function SpeakerIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function ArrowIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {dir === "left" ? <path d="M15 5l-7 7 7 7" /> : <path d="M9 5l7 7-7 7" />}
    </svg>
  );
}
