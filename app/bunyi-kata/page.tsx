"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import Link from "next/link";
import { words, Word } from "@/data/words";
import { useAppStore } from "@/store/useAppStore";
import { speak } from "@/lib/speech";
import { playCorrect, playWrong, playApplause, playPop } from "@/lib/sounds";
import GameShell from "@/components/ui/GameShell";
import BigButton from "@/components/ui/BigButton";
import GameTutorial from "@/components/GameTutorial";

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
  useEffect(() => {
    document.title = "Bunyi Kata - Ayo Belajar Bicara";
  }, []);
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

  const startSession = () => {
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
    setCurrentIdx(0);
    setSelectedIdx(null);
    setScore(0);
    setFinished(false);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(startSession, []);

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
    playPop();
    startSession();
  };

  if (questions.length === 0) {
    return (
      <GameShell title="Bunyi Kata">
        <p className="font-heading text-lg text-ink-muted text-center py-12">Memuat…</p>
      </GameShell>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <GameShell title="Bunyi Kata">
        <div className="bg-surface rounded-3xl border border-line p-8 flex flex-col items-center text-center">
          <h2 className="font-heading text-[40px] leading-tight font-bold text-ink mb-2">
            Skor {score}/{questions.length}
          </h2>
          <p className="font-body text-xl text-ink-muted mb-8">
            Akurasi {pct}%!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <BigButton onClick={handleRestart}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Main Lagi
            </BigButton>
            <Link
              href="/"
              onClick={playPop}
              className="inline-flex items-center justify-center gap-3 min-h-[72px] px-6 rounded-3xl font-heading text-lg sm:text-xl font-semibold bg-surface text-ink border-2 border-line hover:bg-accent-soft active:bg-line transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5" />
              </svg>
              Pulang
            </Link>
          </div>
        </div>
      </GameShell>
    );
  }

  if (!currentQuestion) return null;
  const progress = ((currentIdx + 1) / questions.length) * 100;

  return (
    <GameShell title="Bunyi Kata">
      <div id="main-content">
      <h2 className="sr-only">Bunyi Kata - Latihan phonological awareness</h2>
      <ConfettiEffect show={showConfetti} />

      <GameTutorial
        gameKey="bunyi-kata"
        steps={[
          { emoji: "\ud83d\udd0a", text: "Dengarkan bunyi suku kata pertama dari kata di atas." },
          { emoji: "\ud83c\udfaf", text: "Pilih kata yang dimulai dengan bunyi yang sama!" },
        ]}
      />

      {/* Progress */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 bg-line rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="bg-accent-strong h-full rounded-full origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: progress / 100 }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <span className="font-heading text-base font-bold text-ink-muted">
          {currentIdx + 1} / {questions.length}
        </span>
      </div>

      <div className="flex flex-col items-center">
        {/* Target word */}
        <motion.div
          key={currentIdx}
          className="w-full bg-surface rounded-3xl border border-line p-6 text-center mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <p className="font-body text-lg text-ink-muted mb-3">
            Cari kata yang dimulai dengan bunyi yang sama:
          </p>
          <button
            onClick={() => {
              playPop();
              speak(currentQuestion.target.word.word, { rate: 0.6 });
            }}
            className="inline-flex flex-col items-center gap-2 rounded-3xl px-6 py-3 hover:bg-accent-soft transition-colors"
            aria-label={`Dengarkan kata ${currentQuestion.target.word.word}`}
          >
            <span className="text-7xl leading-none" aria-hidden="true">{currentQuestion.target.word.emoji}</span>
            <span className="font-heading text-[40px] leading-tight font-bold text-ink">
              {currentQuestion.target.word.word}
            </span>
            <span className="font-body text-lg text-ink-muted">
              Suku kata pertama: <strong className="text-accent-strong">{currentQuestion.target.firstSyllable}</strong>
            </span>
            <span className="inline-flex items-center gap-2 font-heading text-lg text-accent-strong">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4V5z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              </svg>
              Ketuk untuk dengar
            </span>
          </button>
        </motion.div>

        {/* Options */}
        <div className="grid grid-cols-3 gap-3 w-full">
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
                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-3xl border-2 min-h-[132px] transition-colors ${
                  showCorrect
                    ? "bg-good-strong border-good-strong text-on-accent"
                    : showWrong
                    ? "bg-surface border-warn text-ink"
                    : "bg-surface border-line text-ink hover:bg-accent-soft"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: idx * 0.05 }}
                aria-label={`Pilih ${opt.word.word}`}
              >
                <span className="text-5xl leading-none" aria-hidden="true">{opt.word.emoji}</span>
                <span className="font-heading text-lg sm:text-xl text-center leading-tight">
                  {opt.word.word}
                </span>
                {showCorrect && (
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                )}
                {showCorrect && selectedIdx !== currentQuestion.correctIndex && (
                  <span className="font-heading text-base">Jawabannya ini</span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Score */}
        {score > 0 && (
          <p className="mt-5 font-heading text-lg text-ink-muted">Benar: {score}</p>
        )}
      </div>
      </div>
    </GameShell>
  );
}
