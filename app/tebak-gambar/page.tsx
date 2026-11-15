"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { words, Word } from "@/data/words";
import { TOTAL_QUESTIONS, generateQuestions, readRecent, rememberTargets } from "@/lib/tebakGambar";
import { useAppStore } from "@/store/useAppStore";
import { speak } from "@/lib/speech";
import { playCorrect, playWrong, playApplause } from "@/lib/sounds";
import GameShell from "@/components/ui/GameShell";
import BigButton from "@/components/ui/BigButton";
import ConfettiEffect from "@/components/ui/ConfettiEffect";
import GameTutorial from "@/components/GameTutorial";
import WordPicture from "@/components/WordPicture";

type GamePhase = "playing" | "finished";

export default function TebakGambarPage() {
  const { customWords, addStar, incrementSession, recordGamePlay } = useAppStore();

  useEffect(() => { recordGamePlay("tebak-gambar"); }, [recordGamePlay]);

  // Only words with a picture: built-in words all have AI art (public/images/words), custom ones need a photo.
  const allWords = useMemo(() => [...words, ...customWords.filter((w) => w.image)], [customWords]);

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
    {
      const qs = generateQuestions(allWords, readRecent());
      rememberTargets(qs.map((q) => q.target.id));
      setQuestions(qs);
    }
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
    {
      const qs = generateQuestions(allWords, readRecent());
      rememberTargets(qs.map((q) => q.target.id));
      setQuestions(qs);
    }
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
      <GameShell title="Tebak Gambar">
        <p className="font-heading text-xl text-ink-muted text-center py-16">Memuat…</p>
      </GameShell>
    );
  }

  // Reward screen
  if (gamePhase === "finished") {
    const scorePercent = score / TOTAL_QUESTIONS;
    let message = `Hebat! Kamu dapat ${score} bintang!`;

    if (scorePercent === 1) {
      message = `Sempurna! Kamu dapat ${score} bintang!`;
    } else if (scorePercent >= 0.7) {
      message = `Hebat! Kamu dapat ${score} bintang!`;
    } else if (scorePercent >= 0.4) {
      message = `Bagus! Kamu dapat ${score} bintang!`;
    } else {
      message = `Ayo semangat! Kamu dapat ${score} bintang!`;
    }

    return (
      <GameShell title="Tebak Gambar">
        <ConfettiEffect show={true} />

        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-surface rounded-3xl border border-line p-6 sm:p-8 max-w-md mx-auto flex flex-col items-center text-center gap-4"
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="text-warn" aria-hidden="true">
            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
          </svg>
          <h2 className="font-heading text-3xl font-bold text-ink">{message}</h2>
          <BigButton onClick={restartGame} className="w-full sm:w-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Main Lagi
          </BigButton>
        </motion.section>
      </GameShell>
    );
  }

  // Playing screen
  const progress = ((currentIndex + 1) / TOTAL_QUESTIONS) * 100;

  return (
    <GameShell title="Tebak Gambar">
      <GameTutorial
        gameKey="tebak-gambar"
        steps={[
          { image: "/images/ui/listen.webp", text: "Dengarkan suara kata yang diputar, lalu perhatikan baik-baik." },
          { image: "/images/ui/choose.webp", text: "Pilih gambar yang sesuai dengan kata yang kamu dengar!" },
        ]}
      />
      <ConfettiEffect show={showConfetti} />

      <div className="max-w-md mx-auto">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2.5 bg-line rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <p className="font-body text-base text-ink-muted">
            {currentIndex + 1} / {TOTAL_QUESTIONS}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-surface rounded-3xl border border-line p-5 sm:p-6 flex flex-col items-center gap-5"
          >
            {/* Question prompt */}
            <div className="text-center">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">
                Mana gambar yang benar?
              </h2>
              <p className="font-body text-xl text-ink-muted">Dengarkan dan pilih!</p>
            </div>

            {/* Listen button */}
            <BigButton onClick={speakTarget}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 5 6 9H3v6h3l5 4z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
              Dengar Lagi
            </BigButton>

            {/* Feedback text */}
            <p className="min-h-[28px] font-heading text-xl text-ink" aria-live="polite">
              {feedbackText}
            </p>

            {/* Options grid (2x2) */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedId === option.id;
                const isTarget = option.id === currentQuestion.target.id;
                const showCorrectBlink =
                  isCorrect === false && isTarget;
                const showWrongShake =
                  isCorrect === false && isSelected;
                const showCorrectBounce =
                  isCorrect === true && isSelected;

                let borderClass = "border-line";
                if (showCorrectBounce) {
                  borderClass = "border-good-strong";
                } else if (showWrongShake) {
                  borderClass = "border-warn";
                } else if (showCorrectBlink) {
                  borderClass = "border-accent";
                }

                return (
                  <button
                    type="button"
                    key={option.id}
                    onClick={() => handleSelect(option)}
                    disabled={isLocked}
                    className={`relative flex flex-col items-center justify-center gap-2 bg-paper rounded-3xl border-4 min-h-[120px] sm:min-h-[140px] p-3 transition-colors duration-200 ${borderClass} ${
                      !isLocked ? "hover:bg-accent-soft active:bg-line" : ""
                    }`}
                  >
                    <WordPicture word={option} className="w-20 h-20 sm:w-24 sm:h-24" emojiClassName="text-5xl sm:text-6xl" />
                    <span className="font-heading text-xl font-bold text-ink">
                      {option.word}
                    </span>

                    {/* Correct check mark */}
                    {showCorrectBounce && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-2 right-2 w-9 h-9 bg-good-strong rounded-full flex items-center justify-center text-on-accent"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m5 12 5 5 9-10" />
                        </svg>
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </GameShell>
  );
}
