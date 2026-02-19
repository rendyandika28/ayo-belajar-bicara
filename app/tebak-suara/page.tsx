"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { words, Word } from "@/data/words";
import { useAppStore } from "@/store/useAppStore";
import { speak, speakSyllable } from "@/lib/speech";
import { playCorrect, playWrong, playApplause } from "@/lib/sounds";
import Link from "next/link";
import FocusModeButton from "@/components/focus/FocusModeButton";
import ConfettiEffect from "@/components/ui/ConfettiEffect";

const SESSION_SIZE = 10;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

type FeedbackState = "none" | "correct" | "wrong";

interface Question {
  word: Word;
  options: Word[];
}

export default function TebakSuaraPage() {
  const { totalStars, addStar, incrementSession } = useAppStore();

  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const shuffled = shuffleArray(words);
    const selected = shuffled.slice(0, SESSION_SIZE);
    const generated = selected.map((word) => {
      const others = words.filter((w) => w.id !== word.id);
      const distractors = shuffleArray(others).slice(0, 3);
      const options = shuffleArray([word, ...distractors]);
      return { word, options };
    });
    setQuestions(generated);
  }, []);

  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>("none");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showSpeak, setShowSpeak] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const isLocked = feedback !== "none";
  const current = questions[index];

  // Auto-play audio when question changes
  useEffect(() => {
    if (!current || isCompleted) return;
    const timer = setTimeout(() => {
      speak(current.word.word);
    }, 500);
    return () => clearTimeout(timer);
  }, [index, current, isCompleted]);

  const handleListen = useCallback(() => {
    if (!current) return;
    speak(current.word.word);
  }, [current]);

  const handleListenSlow = useCallback(() => {
    if (!current) return;
    current.word.syllables.forEach((syl, i) => {
      setTimeout(() => speakSyllable(syl), i * 700);
    });
  }, [current]);

  const handleSelect = useCallback(
    (opt: Word) => {
      if (isLocked || !current) return;

      setSelectedId(opt.id);

      if (opt.id === current.word.id) {
        playCorrect();
        addStar(1);
        setScore((prev) => prev + 1);
        setFeedback("correct");
        setShowSpeak(true);
        setShowConfetti(true);
      } else {
        playWrong();
        setFeedback("wrong");

        setTimeout(() => {
          setSelectedId(null);
          setFeedback("none");
        }, 1300);
      }
    },
    [isLocked, current, addStar]
  );

  const handleNext = useCallback(() => {
    setShowConfetti(false);
    if (index + 1 >= SESSION_SIZE) {
      incrementSession();
      playApplause();
      setIsCompleted(true);
    } else {
      setIndex((prev) => prev + 1);
      setFeedback("none");
      setSelectedId(null);
      setShowSpeak(false);
    }
  }, [index, incrementSession]);

  const restartGame = useCallback(() => {
    setIndex(0);
    setFeedback("none");
    setSelectedId(null);
    setShowSpeak(false);
    setIsCompleted(false);
    setScore(0);
    setShowConfetti(false);
  }, []);

  if (!current && !isCompleted) {
    return (
      <div className="min-h-screen bg-teal-50 flex items-center justify-center">
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

  // Completion screen
  if (isCompleted) {
    const scorePercent = score / SESSION_SIZE;
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
      <div className="min-h-screen bg-teal-50 flex flex-col">
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

          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-teal-700 mb-4">
            {message} 🌟
          </h1>

          <p className="text-2xl mb-8">{"⭐".repeat(score)}</p>

          <div className="flex flex-col gap-4 w-full max-w-xs">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={restartGame}
              className="w-full py-4 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-heading text-xl rounded-2xl shadow-lg active:shadow-md"
            >
              🎮 Main Lagi
            </motion.button>

            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full py-4 px-6 bg-white text-teal-600 font-heading text-xl rounded-2xl shadow-lg active:shadow-md border-2 border-teal-200 text-center"
              >
                🏠 Pulang
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const progress = ((index + 1) / SESSION_SIZE) * 100;

  return (
    <div className="min-h-screen bg-teal-50 flex flex-col">
      <ConfettiEffect show={showConfetti} />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-teal-50/90 backdrop-blur-sm px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 flex items-center justify-center bg-white rounded-full shadow-md text-2xl"
            >
              🏠
            </motion.div>
          </Link>

          <h1 className="font-heading text-xl font-bold text-teal-700">
            Tebak Suara! 🔊
          </h1>

          <div className="flex items-center gap-2">
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
        <div className="w-full h-3 bg-teal-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-teal-400 to-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
        <p className="text-center text-sm text-teal-500 font-heading mt-1">
          {index + 1} / {SESSION_SIZE} · ⭐ {score}
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center px-4 py-4 gap-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md flex flex-col items-center gap-5"
          >
            {/* Question card */}
            <div className="w-full bg-white rounded-3xl shadow-md p-5 flex flex-col items-center gap-3">
              <p className="font-heading text-xl font-bold text-teal-700">
                Suara apa ini? 🎧
              </p>

              <div className="flex gap-3 flex-wrap justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleListen}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-400 to-cyan-500 text-white font-heading text-base rounded-2xl shadow-md active:shadow-sm"
                >
                  <span>🔊</span> Dengar
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleListenSlow}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-400 to-blue-500 text-white font-heading text-base rounded-2xl shadow-md active:shadow-sm"
                >
                  <span>🐌</span> Dengar Pelan
                </motion.button>
              </div>
            </div>

            {/* Options grid (2×2) — emoji only, no word label */}
            <div className="grid grid-cols-2 gap-4 w-full">
              {current.options.map((opt) => {
                const isSelected = selectedId === opt.id;
                const isCorrectAnswer = opt.id === current.word.id;

                const isSelectedCorrect = isSelected && feedback === "correct";
                const isSelectedWrong = isSelected && feedback === "wrong";
                const revealCorrect =
                  !isSelected && isCorrectAnswer && feedback === "wrong";
                const dimmed =
                  isLocked &&
                  !isSelected &&
                  !isCorrectAnswer;

                return (
                  <motion.button
                    key={opt.id}
                    whileTap={!isLocked ? { scale: 0.92 } : {}}
                    onClick={() => handleSelect(opt)}
                    disabled={isLocked}
                    className={[
                      "rounded-3xl flex flex-col items-center justify-center gap-1 shadow-md border-4 aspect-square transition-colors duration-200 cursor-pointer",
                      isSelectedCorrect
                        ? "border-green-400 bg-green-50"
                        : isSelectedWrong
                        ? "border-red-400 bg-red-50 animate-shake"
                        : revealCorrect
                        ? "border-green-300 bg-green-50"
                        : dimmed
                        ? "border-gray-100 bg-white opacity-50"
                        : "border-gray-100 bg-white",
                    ].join(" ")}
                  >
                    <span className="text-5xl sm:text-6xl">{opt.emoji}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Speak prompt — shown after correct answer */}
            <AnimatePresence>
              {showSpeak && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="w-full bg-green-50 border-2 border-green-300 rounded-3xl p-5 flex flex-col items-center gap-3"
                >
                  <p className="font-heading text-lg font-bold text-green-700">
                    🎉 Benar!
                  </p>

                  {/* Syllable breakdown */}
                  <div className="flex items-center gap-2 flex-wrap justify-center">
                    {current.word.syllables.map((syl, i) => (
                      <span
                        key={i}
                        className="font-heading text-2xl font-bold text-teal-700 bg-teal-100 px-3 py-1 rounded-xl"
                      >
                        {syl}
                      </span>
                    ))}
                  </div>

                  <p className="font-heading text-base text-green-600">
                    Coba ucapkan sendiri! 🗣️
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleListen}
                    className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-teal-300 text-teal-600 font-heading text-sm rounded-xl shadow-sm"
                  >
                    🔊 Dengar Lagi
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="w-full py-3 px-6 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-heading text-lg rounded-2xl shadow-lg active:shadow-md"
                  >
                    ➡️ Lanjut
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
