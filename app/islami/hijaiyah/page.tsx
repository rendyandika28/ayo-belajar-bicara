"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { speakHijaiyah } from "@/lib/speech";
import { playPop, playCorrect, playWrong } from "@/lib/sounds";
import { hijaiyahLetters } from "@/data/islamic";
import { useAppStore } from "@/store/useAppStore";
import GameShell from "@/components/ui/GameShell";
import BigButton from "@/components/ui/BigButton";
import Icon from "@/components/ui/Icon";
import ConfettiEffect from "@/components/ui/ConfettiEffect";

type QuizQuestion = {
  correctLetter: (typeof hijaiyahLetters)[number];
  options: (typeof hijaiyahLetters)[number][];
};

function generateQuiz(count: number): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const correctIndex = Math.floor(Math.random() * hijaiyahLetters.length);
    const correct = hijaiyahLetters[correctIndex];

    // Pick 3 wrong options
    const wrongOptions: (typeof hijaiyahLetters)[number][] = [];
    const usedIndices = new Set<number>([correctIndex]);
    while (wrongOptions.length < 3) {
      const idx = Math.floor(Math.random() * hijaiyahLetters.length);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        wrongOptions.push(hijaiyahLetters[idx]);
      }
    }

    // Shuffle correct + wrong into 4 options
    const options = [...wrongOptions, correct].sort(() => Math.random() - 0.5);
    questions.push({ correctLetter: correct, options });
  }
  return questions;
}

export default function HijaiyahPage() {
  const { markHijaiyahLearned, addStar, hijaiyahLearned } = useAppStore();

  // Learning mode state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const learnedRef = useRef<Set<string>>(new Set());

  // Quiz mode state
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongPick, setWrongPick] = useState<string | null>(null); // first miss; one retry allowed
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentLetter = hijaiyahLetters[currentIndex];

  // Mark letter as learned on first view
  useEffect(() => {
    if (currentLetter && !learnedRef.current.has(currentLetter.id)) {
      learnedRef.current.add(currentLetter.id);
      if (markHijaiyahLearned(currentLetter.id)) addStar(1);
    }
  }, [currentLetter, markHijaiyahLearned, addStar]);

  const goNext = useCallback(() => {
    if (currentIndex < hijaiyahLetters.length - 1) {
      setDirection(1);
      setCurrentIndex((prev) => prev + 1);
      playPop();
    }
  }, [currentIndex]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((prev) => prev - 1);
      playPop();
    }
  }, [currentIndex]);

  const handleCardTap = useCallback(() => {
    if (currentLetter) {
      speakHijaiyah(currentLetter);
    }
  }, [currentLetter]);

  // Swipe support
  const touchStart = useRef({ x: 0, y: 0 });
  const quizTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (quizTimerRef.current) clearTimeout(quizTimerRef.current); }, []);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);
  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      // Clearly horizontal only, so a diagonal scroll never changes the letter.
      if (Math.abs(dx) <= 60 || Math.abs(dx) <= 1.5 * Math.abs(dy)) return;
      if (dx > 0) goPrev();
      else goNext();
    },
    [goNext, goPrev]
  );

  // Slide variants
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

  // Quiz functions
  const startQuiz = useCallback(() => {
    if (quizTimerRef.current) { clearTimeout(quizTimerRef.current); quizTimerRef.current = null; }
    const questions = generateQuiz(10);
    setQuizQuestions(questions);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setWrongPick(null);
    setIsCorrect(null);
    setQuizScore(0);
    setQuizFinished(false);
    setIsQuizMode(true);
  }, []);

  const handleQuizAnswer = useCallback(
    (letterId: string) => {
      if (selectedAnswer !== null || letterId === wrongPick) return; // Already answered

      const currentQuestion = quizQuestions[quizIndex];
      const correct = letterId === currentQuestion.correctLetter.id;

      if (!correct && wrongPick === null) {
        // First miss: gentle hint, child tries again.
        playWrong();
        setWrongPick(letterId);
        return;
      }

      setSelectedAnswer(letterId);
      setIsCorrect(correct);

      if (correct) {
        playCorrect();
        setQuizScore((prev) => prev + 1);
        setShowConfetti(true);
        addStar(1);
        setTimeout(() => setShowConfetti(false), 2500);
      } else {
        playWrong();
      }

      // Move to next question after delay
      quizTimerRef.current = setTimeout(() => {
        quizTimerRef.current = null;
        if (quizIndex < quizQuestions.length - 1) {
          setQuizIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setWrongPick(null);
          setIsCorrect(null);
        } else {
          setQuizFinished(true);
        }
      }, 1500);
    },
    [selectedAnswer, wrongPick, quizQuestions, quizIndex, addStar]
  );

  const exitQuiz = useCallback(() => {
    if (quizTimerRef.current) { clearTimeout(quizTimerRef.current); quizTimerRef.current = null; }
    setIsQuizMode(false);
    setQuizFinished(false);
  }, []);

  // Quiz finished screen
  if (isQuizMode && quizFinished) {
    return (
      <GameShell title="Quiz Hijaiyah" onBack={exitQuiz} backLabel="Kembali ke belajar huruf">
        <motion.div
          className="bg-surface rounded-3xl border border-line p-8 text-center max-w-sm mx-auto flex flex-col items-center gap-3"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <span className="w-20 h-20 rounded-full bg-good-strong text-on-accent flex items-center justify-center">
            <Icon name="star" size={40} />
          </span>
          <h2 className="font-heading text-2xl font-bold text-ink">Quiz Selesai!</h2>
          <p className="font-body text-lg text-ink-muted">Skor kamu:</p>
          <p className="font-heading text-5xl font-bold text-good-strong">{quizScore}/10</p>
          <p className="font-body text-lg text-ink">
            {quizScore >= 8
              ? "Masya Allah, hebat sekali!"
              : quizScore >= 5
              ? "Bagus! Terus belajar ya!"
              : "Ayo coba lagi, pasti bisa!"}
          </p>
          <div className="flex flex-col gap-3 w-full mt-2">
            <BigButton onClick={startQuiz} className="w-full">
              <Icon name="retry" /> Coba Lagi
            </BigButton>
            <BigButton tone="quiet" onClick={exitQuiz} className="w-full">
              <Icon name="book" /> Belajar Lagi
            </BigButton>
          </div>
        </motion.div>
      </GameShell>
    );
  }

  // Quiz mode
  if (isQuizMode && quizQuestions.length > 0) {
    const currentQuestion = quizQuestions[quizIndex];

    return (
      <GameShell title="Quiz Hijaiyah" onBack={exitQuiz} backLabel="Keluar dari kuis">
        <ConfettiEffect show={showConfetti} />

        {/* ponytail: sized to fit 360x640 without scrolling (584px visible - 132px header = 452px; content ~410px) */}
        <div className="max-w-md mx-auto w-full flex flex-col gap-3">
          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1 font-body text-base text-ink-muted">
              <span>Soal {quizIndex + 1}/10</span>
              <span>Skor: {quizScore}</span>
            </div>
            <div className="w-full h-2 bg-line rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-good-strong rounded-full origin-left"
                initial={false}
                animate={{ scaleX: (quizIndex + 1) / 10 }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="bg-surface rounded-3xl border border-line p-3 text-center flex flex-col items-center gap-1">
            <p className="font-body text-lg text-ink-muted">Mana huruf yang bernama:</p>
            <div className="flex items-center justify-center gap-3">
              <p className="font-heading text-3xl font-bold text-ink">{currentQuestion.correctLetter.name}</p>
              <button
                type="button"
                onClick={() => speakHijaiyah(currentQuestion.correctLetter)}
                className="inline-flex items-center gap-2 min-h-14 px-4 rounded-full bg-surface border-2 border-line font-heading text-lg text-ink transition-colors hover:bg-accent-soft active:bg-line"
              >
                <Icon name="speaker" /> Dengar
              </button>
            </div>
          </div>

          {/* 2x2 answer grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={quizIndex}
              className="grid grid-cols-2 gap-3 w-full"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrectOption =
                  option.id === currentQuestion.correctLetter.id;
                const showResult = selectedAnswer !== null;
                const missed = option.id === wrongPick || (showResult && isSelected && !isCorrect);

                const border = showResult && isCorrectOption
                  ? "border-good-strong"
                  : missed
                  ? "border-warn"
                  : "border-line";

                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleQuizAnswer(option.id)}
                    className={`relative bg-surface ${border} border-4 rounded-3xl p-2 flex flex-col items-center justify-center min-h-[112px] transition-colors`}
                    whileTap={selectedAnswer === null ? { scale: 0.96 } : {}}
                    disabled={selectedAnswer !== null || option.id === wrongPick}
                  >
                    <span className="font-arabic text-[52px] leading-tight text-ink" dir="rtl" lang="ar">
                      {option.letter}
                    </span>
                    {showResult && isCorrectOption && (
                      <span className="absolute top-2 right-2 w-9 h-9 rounded-full bg-good-strong text-on-accent flex items-center justify-center">
                        <Icon name="check" />
                      </span>
                    )}
                    {!showResult && option.id === wrongPick && <span className="font-heading text-lg text-ink">Coba lagi</span>}
                    {showResult && isCorrectOption && !isCorrect && <span className="font-heading text-lg text-ink">Jawabannya ini</span>}
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </GameShell>
    );
  }

  // Learning mode: choices on the left, the chosen letter on the right. Fits one screen.
  return (
    <GameShell title="Huruf Hijaiyah" backHref="/islami" backLabel="Kembali ke menu Islami">
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3 sm:gap-4 h-[calc(100dvh-13rem)] sm:h-[calc(100dvh-11rem)] min-h-[420px] max-h-[720px]">
        {/* Letter picker (scrolls inside its own panel) */}
        <nav aria-label="Pilih huruf" className="min-h-0 overflow-y-auto overscroll-contain rounded-3xl border border-line bg-surface p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2" dir="rtl">
            {hijaiyahLetters.map((l, i) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setDirection(i > currentIndex ? 1 : -1);
                  setCurrentIndex(i);
                  playPop();
                  speakHijaiyah(l);
                }}
                aria-label={l.name}
                aria-current={i === currentIndex ? "true" : undefined}
                className={`min-h-[56px] rounded-2xl border-2 flex items-center justify-center font-arabic text-3xl sm:text-4xl leading-none transition-colors ${
                  i === currentIndex
                    ? "bg-accent-soft border-accent-strong text-ink"
                    : hijaiyahLearned.includes(l.id)
                    ? "bg-paper border-good-strong text-ink"
                    : "bg-paper border-line text-ink hover:bg-accent-soft"
                }`}
                lang="ar"
              >
                {l.letter}
              </button>
            ))}
          </div>
        </nav>

        {/* Chosen letter */}
        <div className="min-h-0 flex flex-col gap-3">
          <div
            className="relative flex-1 min-h-0"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <AnimatePresence mode="wait" custom={direction}>
              {currentLetter && (
                <motion.button
                  type="button"
                  key={currentLetter.id}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: "tween", duration: 0.2 }}
                  onClick={handleCardTap}
                  aria-label={`Dengar huruf ${currentLetter.name}`}
                  className="absolute inset-0 bg-surface rounded-3xl border border-line p-3 flex flex-col items-center justify-center gap-1 select-none hover:bg-accent-soft transition-colors"
                >
                  <span className="font-body text-sm text-ink-muted">{currentIndex + 1} / {hijaiyahLetters.length}</span>
                  <span className="font-arabic leading-tight text-ink" style={{ fontSize: "clamp(64px, 16vh, 128px)" }} dir="rtl" lang="ar">
                    {currentLetter.letter}
                  </span>
                  <span className="font-heading text-2xl sm:text-3xl font-bold text-ink">{currentLetter.name}</span>
                  <span className="text-lg text-ink-muted font-body">({currentLetter.transliteration})</span>
                  <span className="mt-1 flex items-center gap-1 text-sm text-ink-muted font-body">
                    <Icon name="speaker" size={18} /> Ketuk untuk dengar
                  </span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="shrink-0 grid grid-cols-2 gap-2">
            <BigButton tone="quiet" onClick={goPrev} disabled={currentIndex === 0} aria-label="Sebelumnya" className="px-2">
              <Icon name="prev" size={28} />
            </BigButton>
            <BigButton tone="quiet" onClick={goNext} disabled={currentIndex >= hijaiyahLetters.length - 1} aria-label="Selanjutnya" className="px-2">
              <Icon name="next" size={28} />
            </BigButton>
          </div>
          <BigButton tone="good" onClick={startQuiz} className="shrink-0 w-full">
            <Icon name="target" /> Quiz
          </BigButton>
        </div>
      </div>
    </GameShell>
  );
}
