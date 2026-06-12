"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { words, Word } from "@/data/words";
import { useAppStore } from "@/store/useAppStore";
import { speak } from "@/lib/speech";
import { playCorrect, playWrong, playApplause, playPop } from "@/lib/sounds";
import StarCounter from "@/components/ui/StarCounter";
import GameTutorial from "@/components/GameTutorial";
import { usePageTitle } from "@/hooks/usePageTitle";

const ConfettiEffect = dynamic(() => import("@/components/ui/ConfettiEffect"), { ssr: false });
const SESSION_SIZE = 6;

interface Question {
  target: { word: Word; firstSyllable: string };
  options: { word: Word; firstSyllable: string }[];
  correctIndex: number;
}

function getFirstSyllable(w: Word): string {
  return w.syllables[0]?.toLowerCase() || w.word.slice(0, 2);
}

function generateQuestion(pool: Word[]): Question | null {
  // Find words that share a first syllable with another word
  const candidates = pool.filter(
    (w) =>
      w.syllables.length > 1 &&
      w.difficulty <= 2 &&
      pool.some(
        (other) => other.id !== w.id && getFirstSyllable(other) === getFirstSyllable(w)
      )
  );
  if (candidates.length < 2) return null;

  const target = candidates[Math.floor(Math.random() * candidates.length)];
  const targetSyllable = getFirstSyllable(target);
  // Find a match
  const match = pool.find(
    (w) => w.id !== target.id && getFirstSyllable(w) === targetSyllable
  );
  if (!match) return null;
  // Find distractors (different first syllable)
  const distractors = pool
    .filter(
      (w) =>
        w.id !== target.id &&
        w.id !== match.id &&
        getFirstSyllable(w) !== targetSyllable
    )
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  if (distractors.length < 2) return null;

  const options = [match, ...distractors].sort(() => Math.random() - 0.5);
  return {
    target: { word: target, firstSyllable: targetSyllable },
    options: options.map((o) => ({ word: o, firstSyllable: getFirstSyllable(o) })),
    correctIndex: options.findIndex((o) => o.id === match.id),
  };
}

export default function BunyiKataPage() {
  usePageTitle("Bunyi Kata");
  const addStar = useAppStore((s) => s.addStar);
  const incrementSession = useAppStore((s) => s.incrementSession);
  const recordGamePlay = useAppStore((s) => s.recordGamePlay);

  useEffect(() => {
    recordGamePlay("bunyi-kata");
  }, [recordGamePlay]);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const qs: Question[] = [];
    for (let i = 0; i < SESSION_SIZE; i++) {
      let q = generateQuestion(words);
      let attempts = 0;
      while ((!q || qs.some((existing) => existing.target.word.id === q!.target.word.id)) && attempts < 10) {
        q = generateQuestion(words);
        attempts++;
      }
      if (q) qs.push(q);
    }
    setQuestions(qs);
  }, []);

  const currentQuestion = questions[currentIdx];

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null || !currentQuestion) return;
    setSelectedIdx(idx);
    if (idx === currentQuestion.correctIndex) {
      playCorrect();
      setScore((s) => s + 1);
      addStar(2);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } else {
      playWrong();
    }
    setTimeout(() => {
      if (currentIdx < questions.length - 1) {
        setCurrentIdx((i) => i + 1);
        setSelectedIdx(null);
      } else {
        playApplause();
        setFinished(true);
        incrementSession();
      }
    }, 1800);
  };

  const handleRestart = () => {
    window.location.reload();
  };

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center">
        <p className="font-heading text-lg text-foreground/60">Memuat...</p>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center px-6 text-center">
        <span className="text-7xl mb-6" aria-hidden="true">{"\ud83c\udfaf"}</span>
        <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
          Skor {score}/{questions.length}
        </h1>
        <p className="font-body text-lg text-foreground/70 mb-8">
          Akurasi {pct}%!
        </p>
        <div className="flex flex-col gap-3">
          <motion.button
            onClick={handleRestart}
            className="bg-teal-500 text-white font-heading text-lg px-8 py-3 rounded-full shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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

  if (!currentQuestion) return null;
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <main id="main-content" className="min-h-screen bg-teal-50 flex flex-col">
      <h1 className="sr-only">Bunyi Kata - Latihan phonological awareness</h1>
      <ConfettiEffect show={showConfetti} />

      <GameTutorial
        gameKey="bunyi-kata"
        steps={[
          { emoji: "\ud83d\udd0a", text: "Dengarkan bunyi suku kata pertama dari kata di atas." },
          { emoji: "\ud83c\udfaf", text: "Pilih kata yang dimulai dengan bunyi yang sama!" },
        ]}
      />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-teal-50/90 backdrop-blur-sm px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <Link href="/">
            <motion.button
              className="w-12 h-12 min-w-[48px] min-h-[48px] bg-white rounded-full flex items-center justify-center shadow-md text-2xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Kembali ke beranda"
            >
              {"\ud83c\udfe0"}
            </motion.button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="bg-white rounded-full px-3 py-1 shadow-sm text-sm font-heading font-bold text-teal-700">
              {currentIdx + 1} / {questions.length}
            </span>
            <StarCounter />
          </div>
        </div>
        <div className="w-full bg-white/80 rounded-full h-2.5 overflow-hidden shadow-inner">
          <motion.div
            className="bg-teal-400 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {/* Target word */}
        <motion.div
          key={currentIdx}
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="font-body text-sm text-foreground/60 mb-3">
            Cari kata yang dimulai dengan bunyi yang sama:
          </p>
          <div className="flex flex-col items-center gap-3">
            <motion.button
              onClick={() => {
                playPop();
                speak(currentQuestion.target.word.word, { rate: 0.6 });
              }}
              className="flex flex-col items-center gap-2"
              aria-label={`Dengarkan kata ${currentQuestion.target.word.word}`}
            >
              <span className="text-7xl" aria-hidden="true">{currentQuestion.target.word.emoji}</span>
              <span className="font-heading text-3xl font-bold text-foreground">
                {currentQuestion.target.word.word}
              </span>
              <span className="font-body text-xs text-foreground/50">
                Suku kata pertama: <strong>{currentQuestion.target.firstSyllable}</strong>
              </span>
              <span className="text-sm text-foreground/40 mt-1">{"\ud83d\udd0a"} ketuk untuk dengar</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-3 gap-3 max-w-2xl w-full">
          {currentQuestion.options.map((opt, idx) => {
            const isSelected = selectedIdx === idx;
            const isCorrect = idx === currentQuestion.correctIndex;
            const showCorrect = selectedIdx !== null && isCorrect;
            const showWrong = isSelected && !isCorrect;

            return (
              <motion.button
                key={`${currentIdx}-${idx}`}
                onClick={() => handleSelect(idx)}
                disabled={selectedIdx !== null}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl shadow-md border-2 min-h-[120px] ${
                  showCorrect
                    ? "bg-green-100 border-green-400"
                    : showWrong
                    ? "bg-red-100 border-red-400"
                    : "bg-white border-gray-200 hover:border-teal-300"
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.08 }}
                whileHover={selectedIdx === null ? { scale: 1.05 } : undefined}
                whileTap={selectedIdx === null ? { scale: 0.95 } : undefined}
                aria-label={`Pilih ${opt.word.word}`}
              >
                <span className="text-5xl" aria-hidden="true">{opt.word.emoji}</span>
                <span className="font-heading text-base sm:text-lg text-foreground text-center leading-tight">
                  {opt.word.word}
                </span>
                {showCorrect && (
                  <span className="text-green-600 text-xl" aria-hidden="true">{"\u2705"}</span>
                )}
                {showWrong && (
                  <span className="text-red-500 text-xl" aria-hidden="true">{"\u274c"}</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Score */}
        <div className="mt-6 flex items-center gap-1">
          {Array.from({ length: score }).map((_, i) => (
            <span key={i} className="text-xl" aria-hidden="true">{"\u2b50"}</span>
          ))}
        </div>
      </div>
    </main>
  );
}
