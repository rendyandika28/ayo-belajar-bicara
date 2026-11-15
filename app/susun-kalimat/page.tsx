"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { simpleSentences } from "@/data/words";
import { speak } from "@/lib/speech";
import GameShell from "@/components/ui/GameShell";
import BigButton from "@/components/ui/BigButton";
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
    // `sentences` too: after "Main Lagi" the new first sentence can equal the
    // last one played, and the board must still reset (locked was left true).
  }, [currentSentence, sentences]);

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
      <GameShell title="Susun Kalimat">
        <p className="font-heading text-xl text-ink-muted text-center py-16">Memuat…</p>
      </GameShell>
    );
  }

  if (finished) {
    const message = score >= 7 ? "Luar biasa!" : score >= 5 ? "Bagus sekali!" : "Ayo coba lagi!";

    return (
      <GameShell title="Susun Kalimat">
        <section className="bg-surface rounded-3xl border border-line p-6 sm:p-8 flex flex-col items-center text-center gap-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="text-warn" aria-hidden="true">
            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
          </svg>
          <h2 className="font-heading text-3xl font-bold text-ink">{message}</h2>
          <p className="font-body text-xl text-ink-muted">
            Kamu berhasil menyusun {score} dari {SESSION_SIZE} kalimat!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2">
            <BigButton onClick={handleRestart}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Main Lagi
            </BigButton>
          </div>
        </section>
      </GameShell>
    );
  }

  const correctWords = currentSentence.split(" ");
  const progress = ((currentIdx + 1) / SESSION_SIZE) * 100;

  return (
    <GameShell title="Susun Kalimat">
      <ConfettiEffect show={showConfetti} />
      <RewardOverlay show={showReward} message="Hebat!" emoji={"\ud83c\udfc6"} onClose={handleRewardDone} />

      {/* Progress */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 bg-line rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="bg-accent h-full rounded-full origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="font-body text-base text-ink-muted">
          {currentIdx + 1} / {SESSION_SIZE}
        </p>
      </div>

      <section className="bg-surface rounded-3xl border border-line p-5 sm:p-8 flex flex-col gap-6">
        {/* Target sentence slots */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          key={currentIdx}
        >
          <p className="font-body text-xl text-ink-muted mb-3">Susun kalimat ini:</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {correctWords.map((word, i) => (
              <div
                key={i}
                className={`min-w-[64px] h-12 px-2 rounded-xl border-2 flex items-center justify-center transition-colors ${
                  feedback === "correct"
                    ? "border-good-strong bg-paper"
                    : feedback === "wrong"
                    ? "border-warn bg-paper"
                    : selectedWords[i]
                    ? "border-accent bg-accent-soft"
                    : "border-dashed border-line bg-paper"
                }`}
              >
                {selectedWords[i] && (
                  <span className="font-heading text-xl text-ink">
                    {selectedWords[i]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Feedback message */}
          <div className="min-h-[36px] mt-3" aria-live="polite">
            <AnimatePresence>
              {feedback === "correct" && (
                <motion.p
                  className="font-heading text-xl text-good-strong inline-flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12 5 5 9-10" />
                  </svg>
                  Hebat! {currentSentence}
                </motion.p>
              )}
              {feedback === "wrong" && (
                <motion.p
                  className="font-heading text-xl text-ink"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Coba lagi…
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Word buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {shuffledWords.map((word, i) => {
            const isUsed = usedIndices.has(i);
            return (
              <button
                key={`${currentIdx}-${i}`}
                type="button"
                className={`font-heading text-2xl px-6 min-h-[72px] min-w-[96px] rounded-3xl border-2 transition-[opacity,background-color,border-color] duration-200 ${
                  isUsed
                    ? "opacity-0 pointer-events-none border-line bg-surface"
                    : feedback === "wrong"
                    ? "bg-surface text-ink border-warn"
                    : "bg-surface text-ink border-line hover:bg-accent-soft active:bg-line"
                }`}
                onClick={() => handleWordTap(word, i)}
                disabled={isUsed || locked}
              >
                {word}
              </button>
            );
          })}
        </div>
      </section>
    </GameShell>
  );
}
