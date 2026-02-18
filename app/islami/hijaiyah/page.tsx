"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { speakIslamic } from "@/lib/speech";
import { playPop, playCorrect, playWrong } from "@/lib/sounds";
import { hijaiyahLetters } from "@/data/islamic";
import { useAppStore } from "@/store/useAppStore";
import StarCounter from "@/components/ui/StarCounter";

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

function Confetti() {
  const pieces = useMemo(() => {
    const colors = [
      "#10b981",
      "#f59e0b",
      "#3b82f6",
      "#ef4444",
      "#8b5cf6",
      "#ec4899",
    ];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      size: Math.random() * 8 + 4,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece absolute"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
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
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentLetter = hijaiyahLetters[currentIndex];

  // Mark letter as learned on first view
  useEffect(() => {
    if (currentLetter && !learnedRef.current.has(currentLetter.id)) {
      learnedRef.current.add(currentLetter.id);
      if (!hijaiyahLearned.includes(currentLetter.id)) {
        markHijaiyahLearned(currentLetter.id);
        addStar(1);
      }
    }
  }, [currentLetter, markHijaiyahLearned, addStar, hijaiyahLearned]);

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
      speakIslamic(currentLetter.name);
    }
  }, [currentLetter]);

  // Swipe support
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

  // Slide variants
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

  // Quiz functions
  const startQuiz = useCallback(() => {
    const questions = generateQuiz(10);
    setQuizQuestions(questions);
    setQuizIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setQuizScore(0);
    setQuizFinished(false);
    setIsQuizMode(true);
  }, []);

  const handleQuizAnswer = useCallback(
    (letterId: string) => {
      if (selectedAnswer !== null) return; // Already answered

      const currentQuestion = quizQuestions[quizIndex];
      const correct = letterId === currentQuestion.correctLetter.id;

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
      setTimeout(() => {
        if (quizIndex < quizQuestions.length - 1) {
          setQuizIndex((prev) => prev + 1);
          setSelectedAnswer(null);
          setIsCorrect(null);
        } else {
          setQuizFinished(true);
        }
      }, 1500);
    },
    [selectedAnswer, quizQuestions, quizIndex, addStar]
  );

  const exitQuiz = useCallback(() => {
    setIsQuizMode(false);
    setQuizFinished(false);
  }, []);

  // Quiz finished screen
  if (isQuizMode && quizFinished) {
    return (
      <motion.div
        className="islamic-pattern min-h-screen flex flex-col px-4 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-4">
          <motion.button
            onClick={exitQuiz}
            className="w-[52px] h-[52px] flex items-center justify-center bg-white/80 rounded-full shadow-md border-2 border-gray-200 text-2xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Kembali"
          >
            {"\u2b05\ufe0f"}
          </motion.button>
          <StarCounter />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-sm w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <span className="text-6xl block mb-4">
              {quizScore >= 8 ? "\ud83c\udfc6" : quizScore >= 5 ? "\ud83c\udf1f" : "\ud83d\udcaa"}
            </span>
            <h2 className="font-heading text-2xl font-bold text-emerald-800 mb-2">
              Quiz Selesai!
            </h2>
            <p className="font-body text-lg text-foreground/70 mb-1">
              Skor kamu:
            </p>
            <p className="font-heading text-5xl font-bold text-emerald-600 mb-4">
              {quizScore}/10
            </p>
            <p className="font-body text-sm text-foreground/60 mb-6">
              {quizScore >= 8
                ? "Masya Allah, hebat sekali!"
                : quizScore >= 5
                ? "Bagus! Terus belajar ya!"
                : "Ayo coba lagi, pasti bisa!"}
            </p>

            <div className="flex flex-col gap-3">
              <motion.button
                onClick={startQuiz}
                className="w-full bg-emerald-500 text-white font-heading text-lg py-3 rounded-2xl shadow-md min-h-[52px]"
                whileTap={{ scale: 0.95 }}
              >
                {"\ud83d\udd01"} Coba Lagi
              </motion.button>
              <motion.button
                onClick={exitQuiz}
                className="w-full bg-white text-emerald-700 font-heading text-lg py-3 rounded-2xl shadow-md border-2 border-emerald-200 min-h-[52px]"
                whileTap={{ scale: 0.95 }}
              >
                {"\ud83d\udcd6"} Belajar Lagi
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Quiz mode
  if (isQuizMode && quizQuestions.length > 0) {
    const currentQuestion = quizQuestions[quizIndex];

    return (
      <motion.div
        className="islamic-pattern min-h-screen flex flex-col px-4 py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {showConfetti && <Confetti />}

        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <motion.button
            onClick={exitQuiz}
            className="w-[52px] h-[52px] flex items-center justify-center bg-white/80 rounded-full shadow-md border-2 border-gray-200 text-2xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Keluar quiz"
          >
            {"\u2b05\ufe0f"}
          </motion.button>

          <h1 className="font-heading text-xl font-bold text-emerald-800">
            Quiz Hijaiyah
          </h1>

          <StarCounter />
        </div>

        {/* Progress */}
        <div className="mb-4 max-w-md mx-auto w-full">
          <div className="flex items-center justify-between mb-1">
            <span className="font-body text-sm text-emerald-700">
              Soal {quizIndex + 1}/10
            </span>
            <span className="font-body text-sm text-emerald-700">
              Skor: {quizScore}
            </span>
          </div>
          <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500 rounded-full"
              animate={{ width: `${((quizIndex + 1) / 10) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Quiz content */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full">
          {/* Question */}
          <motion.div
            className="bg-white rounded-3xl shadow-xl p-6 text-center mb-6 w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <p className="font-body text-sm text-foreground/60 mb-2">
              Mana huruf yang bernama:
            </p>
            <p className="font-heading text-3xl font-bold text-emerald-800 mb-2">
              {currentQuestion.correctLetter.name}
            </p>
            <motion.button
              onClick={() =>
                speakIslamic(currentQuestion.correctLetter.name)
              }
              className="bg-emerald-100 text-emerald-700 font-body text-sm px-4 py-2 rounded-full min-h-[40px]"
              whileTap={{ scale: 0.95 }}
            >
              {"\ud83d\udd0a"} Dengar
            </motion.button>
          </motion.div>

          {/* 2x2 answer grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={quizIndex}
              className="grid grid-cols-2 gap-4 w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option.id;
                const isCorrectOption =
                  option.id === currentQuestion.correctLetter.id;
                const showResult = selectedAnswer !== null;

                let borderColor = "border-emerald-200";
                let bgColor = "bg-white";

                if (showResult) {
                  if (isCorrectOption) {
                    borderColor = "border-green-500";
                    bgColor = "bg-green-50";
                  } else if (isSelected && !isCorrect) {
                    borderColor = "border-red-400";
                    bgColor = "bg-red-50";
                  }
                }

                return (
                  <motion.button
                    key={option.id}
                    onClick={() => handleQuizAnswer(option.id)}
                    className={`${bgColor} ${borderColor} border-3 rounded-2xl p-4 flex flex-col items-center justify-center shadow-lg min-h-[120px] ${
                      showResult && isSelected && !isCorrect
                        ? "animate-shake"
                        : ""
                    }`}
                    style={{ borderWidth: 3 }}
                    whileTap={selectedAnswer === null ? { scale: 0.95 } : {}}
                    animate={
                      showResult && isCorrectOption
                        ? { scale: [1, 1.1, 1] }
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                    disabled={selectedAnswer !== null}
                  >
                    <span
                      className="text-[64px] leading-none"
                      style={{ fontFamily: "var(--font-amiri)" }}
                      dir="rtl"
                    >
                      {option.letter}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    );
  }

  // Learning mode
  return (
    <motion.div
      className="islamic-pattern min-h-screen flex flex-col px-4 py-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/islami">
          <motion.button
            className="w-[52px] h-[52px] flex items-center justify-center bg-white/80 rounded-full shadow-md border-2 border-gray-200 text-2xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Kembali ke menu Islami"
          >
            {"\u2b05\ufe0f"}
          </motion.button>
        </Link>

        <h1 className="font-heading text-xl sm:text-2xl font-bold text-emerald-800">
          Huruf Hijaiyah
        </h1>

        <StarCounter />
      </div>

      {/* Card counter */}
      <p className="text-center font-body text-sm text-emerald-700/60 mb-2">
        {currentIndex + 1} / {hijaiyahLetters.length}
      </p>

      {/* Flashcard area */}
      <div
        className="flex-1 flex flex-col items-center justify-center"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Flashcard */}
        <div className="relative w-full max-w-sm" style={{ minHeight: 300 }}>
          <AnimatePresence mode="wait" custom={direction}>
            {currentLetter && (
              <motion.div
                key={currentLetter.id}
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
                className="absolute inset-0 bg-white rounded-3xl shadow-xl border-2 border-emerald-200 p-6 flex flex-col items-center justify-center cursor-pointer select-none"
              >
                {/* Arabic letter */}
                <motion.span
                  className="leading-none mb-2"
                  style={{
                    fontFamily: "var(--font-amiri)",
                    fontSize: "clamp(80px, 20vw, 120px)",
                  }}
                  dir="rtl"
                  whileTap={{ scale: 1.15 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {currentLetter.letter}
                </motion.span>

                {/* Letter name + emoji */}
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-heading text-2xl font-bold text-emerald-800">
                    {currentLetter.name}
                  </h2>
                  <span className="text-lg">{currentLetter.emoji}</span>
                </div>

                {/* Transliteration */}
                <p className="text-lg text-gray-600 font-body">
                  ({currentLetter.transliteration})
                </p>

                {/* Tap hint */}
                <p className="mt-4 text-xs text-foreground/40 font-body">
                  {"\ud83d\udd0a"} Ketuk untuk dengar
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-4 max-w-sm px-2">
          {hijaiyahLetters.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${
                i === currentIndex
                  ? "w-3 h-3 bg-emerald-500"
                  : "w-2 h-2 bg-emerald-300/50"
              }`}
            />
          ))}
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center justify-center gap-6 mt-6">
          <motion.button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className={`w-16 h-16 flex items-center justify-center rounded-full text-2xl font-bold shadow-lg border-2 transition-colors ${
              currentIndex === 0
                ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                : "bg-white border-emerald-200 text-emerald-700 active:bg-emerald-50"
            }`}
            whileTap={currentIndex > 0 ? { scale: 0.9 } : {}}
            aria-label="Sebelumnya"
          >
            {"\u25c0\ufe0f"}
          </motion.button>

          <motion.button
            onClick={handleCardTap}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-emerald-200 border-2 border-emerald-300 text-2xl shadow-lg active:bg-emerald-300 transition-colors"
            whileTap={{ scale: 0.9 }}
            aria-label="Ucapkan huruf"
          >
            {"\ud83d\udd0a"}
          </motion.button>

          <motion.button
            onClick={goNext}
            disabled={currentIndex >= hijaiyahLetters.length - 1}
            className={`w-16 h-16 flex items-center justify-center rounded-full text-2xl font-bold shadow-lg border-2 transition-colors ${
              currentIndex >= hijaiyahLetters.length - 1
                ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                : "bg-white border-emerald-200 text-emerald-700 active:bg-emerald-50"
            }`}
            whileTap={
              currentIndex < hijaiyahLetters.length - 1
                ? { scale: 0.9 }
                : {}
            }
            aria-label="Selanjutnya"
          >
            {"\u25b6\ufe0f"}
          </motion.button>
        </div>

        {/* Quiz button */}
        <motion.button
          onClick={startQuiz}
          className="mt-6 bg-amber-400 text-amber-900 font-heading text-lg px-6 py-3 rounded-2xl shadow-lg border-2 border-amber-500 min-h-[52px]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {"\ud83c\udfaf"} Quiz
        </motion.button>
      </div>
    </motion.div>
  );
}
