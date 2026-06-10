"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { words, Word } from "@/data/words";
import { useAppStore } from "@/store/useAppStore";
import { speak } from "@/lib/speech";
import { playCorrect, playWrong, playApplause } from "@/lib/sounds";
import Link from "next/link";
import FocusModeButton from "@/components/focus/FocusModeButton";
import ConfettiEffect from "@/components/ui/ConfettiEffect";
import GameTutorial from "@/components/GameTutorial";

const TOTAL_QUESTIONS = 10;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function pickQuestionOptions(allWords: Word[], target: Word): Word[] {
  // Get distractors from the same category first
  const sameCategory = allWords.filter(
    (w) => w.category === target.category && w.id !== target.id
  );
  const shuffledSame = shuffleArray(sameCategory);

  let distractors: Word[] = [];

  if (shuffledSame.length >= 3) {
    distractors = shuffledSame.slice(0, 3);
  } else {
    // Not enough in same category, fill from others
    distractors = [...shuffledSame];
    const others = allWords.filter(
      (w) => w.id !== target.id && w.category !== target.category
    );
    const shuffledOthers = shuffleArray(others);
    const remaining = 3 - distractors.length;
    distractors = [...distractors, ...shuffledOthers.slice(0, remaining)];
  }

  // Combine target with distractors and shuffle
  return shuffleArray([target, ...distractors]);
}

function generateQuestions(allWords: Word[]): { target: Word; options: Word[] }[] {
  const shuffled = shuffleArray(allWords);
  const selected = shuffled.slice(0, TOTAL_QUESTIONS);

  // If we don't have enough words, allow repeats
  while (selected.length < TOTAL_QUESTIONS) {
    const extra = shuffleArray(allWords);
    selected.push(...extra.slice(0, TOTAL_QUESTIONS - selected.length));
  }

  return selected.map((target) => ({
    target,
    options: pickQuestionOptions(allWords, target),
  }));
}

type GamePhase = "playing" | "finished";

export default function TebakGambarPage() {
  const { totalStars, customWords, addStar, incrementSession, recordGamePlay } = useAppStore();

  useEffect(() => { recordGamePlay("tebak-gambar"); }, [recordGamePlay]);

  const allWords = useMemo(() => [...words, ...customWords], [customWords]);

  const [gamePhase, setGamePhase] = useState<GamePhase>("playing");
  const [questions, setQuestions] = useState<{ target: Word; options: Word[] }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Initialize questions
  useEffect(() => {
    setQuestions(generateQuestions(allWords));
  }, [allWords]);

  const currentQuestion = questions[currentIndex];

  // Speak the target word when question changes
  const speakTarget = useCallback(() => {
    if (currentQuestion) {
      speak(currentQuestion.target.word, { lang: "id-ID" });
    }
  }, [currentQuestion]);

  useEffect(() => {
    if (currentQuestion && gamePhase === "playing" && isCorrect === null) {
      const timer = setTimeout(() => {
        speakTarget();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentQuestion, gamePhase, isCorrect, speakTarget]);

  const handleSelect = useCallback(
    (word: Word) => {
      if (isLocked || !currentQuestion) return;

      setSelectedId(word.id);
      setIsLocked(true);

      if (word.id === currentQuestion.target.id) {
        // Correct answer
        setIsCorrect(true);
        setShowConfetti(true);
        setFeedbackText(null);
        playCorrect();
        addStar(1);
        setScore((prev) => prev + 1);

        // Auto-advance after 1.5s
        setTimeout(() => {
          setShowConfetti(false);
          if (currentIndex + 1 >= TOTAL_QUESTIONS) {
            incrementSession();
            playApplause();
            setGamePhase("finished");
          } else {
            setCurrentIndex((prev) => prev + 1);
            setSelectedId(null);
            setIsCorrect(null);
            setIsLocked(false);
          }
        }, 1500);
      } else {
        // Wrong answer
        setIsCorrect(false);
        setFeedbackText("Coba lagi ya!");
        playWrong();

        // Unlock after shake animation
        setTimeout(() => {
          setSelectedId(null);
          setIsCorrect(null);
          setFeedbackText(null);
          setIsLocked(false);
        }, 1200);
      }
    },
    [isLocked, currentQuestion, currentIndex, addStar, incrementSession]
  );

  const restartGame = useCallback(() => {
    setQuestions(generateQuestions(allWords));
    setCurrentIndex(0);
    setScore(0);
    setSelectedId(null);
    setIsCorrect(null);
    setShowConfetti(false);
    setFeedbackText(null);
    setIsLocked(false);
    setGamePhase("playing");
  }, [allWords]);

  // Don't render until questions are generated
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="text-5xl"
        >
          🌟
        </motion.div>
      </div>
    );
  }

  // Reward screen
  if (gamePhase === "finished") {
    const scorePercent = score / TOTAL_QUESTIONS;
    let celebrationEmoji = "🎉";
    let message = `Hebat! Kamu dapat ${score} bintang!`;

    if (scorePercent === 1) {
      celebrationEmoji = "🏆";
      message = `Sempurna! Kamu dapat ${score} bintang!`;
    } else if (scorePercent >= 0.7) {
      celebrationEmoji = "🌟";
      message = `Hebat! Kamu dapat ${score} bintang!`;
    } else if (scorePercent >= 0.4) {
      celebrationEmoji = "👏";
      message = `Bagus! Kamu dapat ${score} bintang!`;
    } else {
      celebrationEmoji = "💪";
      message = `Ayo semangat! Kamu dapat ${score} bintang!`;
    }

    return (
      <div className="min-h-screen bg-pink-50 flex flex-col">
        <ConfettiEffect show={true} />

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex-1 flex flex-col items-center justify-center px-6 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="text-8xl mb-6"
          >
            {celebrationEmoji}
          </motion.div>

          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-purple-700 mb-4">
            {message} 🌟
          </h1>

          <p className="text-2xl mb-8">{"⭐".repeat(score)}</p>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartGame}
              className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-heading text-xl rounded-2xl shadow-lg active:shadow-md"
            >
              🎮 Main Lagi
            </motion.button>

            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 px-6 bg-white text-purple-600 font-heading text-xl rounded-2xl shadow-lg active:shadow-md border-2 border-purple-200 text-center"
              >
                🏠 Pulang
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // Playing screen
  const progress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100;

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col">
      <GameTutorial
        gameKey="tebak-gambar"
        steps={[
          { emoji: "\ud83d\udc42", text: "Dengarkan suara kata yang diputar, lalu perhatikan baik-baik." },
          { emoji: "\ud83c\udfaf", text: "Pilih gambar yang sesuai dengan kata yang kamu dengar!" },
        ]}
      />
      <ConfettiEffect show={showConfetti} />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-pink-50/90 backdrop-blur-sm px-4 pt-4 pb-2">
        <div className="relative flex items-center justify-between mb-3">
          {/* Back button */}
          <Link href="/" className="z-10">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md text-2xl"
            >
              🏠
            </motion.div>
          </Link>

          {/* Score */}
          <div className="absolute left-1/2 -translate-x-1/2 font-heading text-xl font-bold text-purple-700 whitespace-nowrap pointer-events-none">
            ⭐ {score}/{TOTAL_QUESTIONS}
          </div>

          {/* Focus + Total stars */}
          <div className="flex items-center gap-2 z-10">
            <FocusModeButton />
            <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1.5 rounded-full">
              <span className="text-lg">⭐</span>
              <span className="font-heading font-bold text-yellow-700">
                {totalStars}
              </span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-pink-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-pink-400 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <p className="text-center text-sm text-pink-400 font-heading mt-1">
          {currentIndex + 1} / {TOTAL_QUESTIONS}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md flex flex-col items-center gap-6"
          >
            {/* Question prompt */}
            <div className="text-center">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-purple-700 mb-2">
                Mana gambar yang benar?
              </h2>
              <p className="font-heading text-lg text-pink-500">
                Dengarkan dan pilih!
              </p>
            </div>

            {/* Listen button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={speakTarget}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-heading text-xl rounded-2xl shadow-lg active:shadow-md"
            >
              <span className="text-2xl">
                🔊
              </span>
              Dengar Lagi
            </motion.button>

            {/* Feedback text */}
            <AnimatePresence>
              {feedbackText && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="font-heading text-lg text-orange-500 font-bold"
                >
                  {feedbackText} 😊
                </motion.p>
              )}
            </AnimatePresence>

            {/* Options grid (2x2) */}
            <div className="grid grid-cols-2 gap-4 w-full">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedId === option.id;
                const isTarget = option.id === currentQuestion.target.id;
                const showCorrectBlink =
                  isCorrect === false && isTarget;
                const showWrongShake =
                  isCorrect === false && isSelected;
                const showCorrectBounce =
                  isCorrect === true && isSelected;

                let borderClass = "border-3 border-purple-200";
                if (isCorrect === true && isSelected) {
                  borderClass = "border-4 border-green-400";
                } else if (isCorrect === false && isSelected) {
                  borderClass = "border-4 border-red-400";
                }

                return (
                  <motion.button
                    key={option.id}
                    whileHover={!isLocked ? { scale: 1.05 } : {}}
                    whileTap={!isLocked ? { scale: 0.95 } : {}}
                    animate={
                      showCorrectBounce
                        ? {
                            scale: [1, 1.15, 1],
                            transition: {
                              duration: 0.5,
                              repeat: 1,
                              ease: "easeInOut",
                            },
                          }
                        : {}
                    }
                    onClick={() => handleSelect(option)}
                    disabled={isLocked}
                    className={`
                      relative flex flex-col items-center justify-center
                      bg-white rounded-3xl shadow-lg
                      min-h-[100px] sm:min-h-[130px]
                      p-4
                      transition-colors duration-200
                      ${borderClass}
                      ${showWrongShake ? "animate-shake" : ""}
                      ${showCorrectBlink ? "animate-blink" : ""}
                      ${!isLocked ? "active:bg-pink-50 cursor-pointer" : "cursor-default"}
                    `}
                  >
                    <span className="text-5xl sm:text-6xl leading-none mb-2">
                      {option.emoji}
                    </span>
                    <span className="font-heading text-base sm:text-lg font-bold text-purple-600">
                      {option.word}
                    </span>

                    {/* Correct check mark */}
                    {isCorrect === true && isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-lg shadow-md"
                      >
                        ✓
                      </motion.div>
                    )}

                    {/* Wrong X mark */}
                    {isCorrect === false && isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-400 rounded-full flex items-center justify-center text-white text-lg shadow-md"
                      >
                        ✗
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
