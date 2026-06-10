"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { simpleSentences } from "@/data/words";
import { speak } from "@/lib/speech";
import StarCounter from "@/components/ui/StarCounter";
import ConfettiEffect from "@/components/ui/ConfettiEffect";
import RewardOverlay from "@/components/ui/RewardOverlay";
import { playPop } from "@/lib/sounds";

const SESSION_SIZE = 8;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SusunKalimatPage() {
  const addStar = useAppStore((s) => s.addStar);
  const incrementSession = useAppStore((s) => s.incrementSession);

  const [sentences, setSentences] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const picked = shuffleArray(simpleSentences).slice(0, SESSION_SIZE);
    setSentences(picked);
  }, []);

  const currentSentence = sentences[currentIdx];

  useEffect(() => {
    if (!currentSentence) return;
    const words = currentSentence.split(" ");
    setShuffledWords(shuffleArray(words));
    setSelectedWords([]);
    setUsedIndices(new Set());
    setFeedback(null);
    setLocked(false);
  }, [currentSentence]);

  const handleWordTap = useCallback(
    (word: string, wordIndex: number) => {
      if (locked || usedIndices.has(wordIndex)) return;
      playPop();
      const newSelected = [...selectedWords, word];
      const newUsed = new Set(usedIndices);
      newUsed.add(wordIndex);
      setSelectedWords(newSelected);
      setUsedIndices(newUsed);

      if (newSelected.length === shuffledWords.length) {
        setLocked(true);
        const correct = currentSentence.split(" ");
        const isCorrect = newSelected.every((w, i) => w === correct[i]);

        if (isCorrect) {
          setFeedback("correct");
          setShowConfetti(true);
          setScore((s) => s + 1);
          addStar(2);
          setTimeout(() => setShowConfetti(false), 2000);
          setTimeout(() => {
            speak(currentSentence, { rate: 0.7 });
            setFeedback(null);
            if (currentIdx < sentences.length - 1) {
              setCurrentIdx((i) => i + 1);
            } else {
              setShowReward(true);
            }
          }, 1200);
        } else {
          setFeedback("wrong");
          addStar(1);
          setTimeout(() => {
            const reshuffled = shuffleArray(currentSentence.split(" "));
            setShuffledWords(reshuffled);
            setSelectedWords([]);
            setUsedIndices(new Set());
            setFeedback(null);
            setLocked(false);
          }, 1200);
        }
      }
    },
    [
      locked, usedIndices, selectedWords, shuffledWords,
      currentSentence, currentIdx, sentences.length, addStar,
    ]
  );

  const handleRewardDone = useCallback(() => {
    setShowReward(false);
    setFinished(true);
    incrementSession();
  }, [incrementSession]);

  const handleRestart = useCallback(() => {
    setSentences(shuffleArray(simpleSentences).slice(0, SESSION_SIZE));
    setCurrentIdx(0);
    setScore(0);
    setFinished(false);
    setShowReward(false);
  }, []);

  if (sentences.length === 0) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <p className="font-heading text-lg text-foreground/60">Memuat...</p>
      </div>
    );
  }

  if (finished) {
    const celebrationEmoji = score >= 7 ? "\ud83c\udfc6" : score >= 5 ? "\u2b50" : "\ud83d\udc4f";
    const message = score >= 7 ? "Luar biasa!" : score >= 5 ? "Bagus sekali!" : "Ayo coba lagi!";

    return (
      <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center px-6 text-center">
        <span className="text-7xl mb-6">{celebrationEmoji}</span>
        <h2 className="font-heading text-3xl font-bold text-foreground mb-2">{message}</h2>
        <p className="font-body text-lg text-foreground/70 mb-2">
          Kamu berhasil menyusun {score} dari {SESSION_SIZE} kalimat!
        </p>
        <div className="flex gap-1 mb-8">
          {Array.from({ length: score }).map((_, i) => (
            <span key={i} className="text-2xl">{"\u2b50"}</span>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          <motion.button
            className="bg-orange-500 text-white font-heading text-lg px-8 py-3 rounded-full shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRestart}
          >
            {"\ud83d\udd04"} Main Lagi
          </motion.button>
          <Link href="/">
            <motion.button
              className="bg-white text-foreground/70 font-heading text-base px-8 py-2.5 rounded-full shadow-md border-2 border-gray-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {"\ud83c\udfe0"} Pulang
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const correctWords = currentSentence.split(" ");
  const progress = ((currentIdx + 1) / SESSION_SIZE) * 100;

  return (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      <ConfettiEffect show={showConfetti} />
      <RewardOverlay show={showReward} message="Hebat!" emoji={"\ud83c\udfc6"} onClose={handleRewardDone} />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-orange-50/90 backdrop-blur-sm px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <Link href="/">
            <motion.button
              className="w-12 h-12 min-w-[48px] min-h-[48px] bg-white rounded-full flex items-center justify-center shadow-md text-2xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Kembali"
            
            onClick={playPop}>
              {"\ud83c\udfe0"}
            </motion.button>
          </Link>
          <div className="flex items-center gap-2">
            <StarCounter />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/80 rounded-full h-2.5 overflow-hidden shadow-inner">
          <motion.div
            className="bg-orange-400 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>
        <p className="font-body text-xs text-foreground/50 text-right mt-1">
          {currentIdx + 1} / {SESSION_SIZE}
        </p>
      </div>

      {/* Game area */}
      <div className="flex-1 flex flex-col px-4 py-6">
        {/* Target sentence hint */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          key={currentIdx}
        >
          <p className="font-body text-sm text-foreground/50 mb-1">Susun kalimat ini:</p>
          <div className="flex justify-center gap-1.5 flex-wrap">
            {correctWords.map((word, i) => (
              <div
                key={i}
                className={`w-14 h-8 rounded-lg border-2 border-dashed flex items-center justify-center transition-colors ${
                  selectedWords[i]
                    ? "border-green-400 bg-green-50"
                    : feedback === "wrong"
                    ? "border-red-300 bg-red-50"
                    : "border-gray-300 bg-white/50"
                }`}
              >
                {selectedWords[i] && (
                  <span className="font-heading text-sm text-green-700">
                    {selectedWords[i]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Feedback message */}
          <AnimatePresence>
            {feedback === "correct" && (
              <motion.p
                className="font-heading text-lg text-green-600 mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {"\u2705"} Hebat! {currentSentence}
              </motion.p>
            )}
            {feedback === "wrong" && (
              <motion.p
                className="font-heading text-lg text-red-500 mt-2"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                {"\ud83d\udd04"} Coba lagi...
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Word buttons */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-wrap justify-center gap-3 max-w-sm">
            <AnimatePresence mode="popLayout">
              {shuffledWords.map((word, i) => {
                const isUsed = usedIndices.has(i);
                return (
                  <motion.button
                    key={`${currentIdx}-${i}`}
                    layout
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: isUsed ? 0 : 1,
                      scale: isUsed ? 0.5 : 1,
                    }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`font-heading text-xl px-6 py-4 rounded-2xl shadow-md min-h-[56px] min-w-[80px] ${
                      isUsed
                        ? "pointer-events-none"
                        : feedback === "wrong"
                        ? "bg-red-200 text-red-700"
                        : "bg-white text-foreground border-2 border-orange-200 hover:border-orange-400"
                    }`}
                    onClick={() => handleWordTap(word, i)}
                    disabled={isUsed || locked}
                    whileHover={!isUsed ? { scale: 1.08 } : undefined}
                    whileTap={!isUsed ? { scale: 0.92 } : undefined}
                  >
                    {word}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
