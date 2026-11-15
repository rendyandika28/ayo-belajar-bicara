"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { words, Word } from "@/data/words";
import { useAppStore } from "@/store/useAppStore";
import { speak } from "@/lib/speech";
import { playCorrect, playWrong, playApplause } from "@/lib/sounds";
import Link from "next/link";
import GameShell from "@/components/ui/GameShell";
import BigButton from "@/components/ui/BigButton";
import ConfettiEffect from "@/components/ui/ConfettiEffect";
import GameTutorial from "@/components/GameTutorial";
import WordPicture from "@/components/WordPicture";

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

function generateQuestions(): Question[] {
  return shuffleArray(words).slice(0, SESSION_SIZE).map((word) => {
    const distractors = shuffleArray(words.filter((w) => w.id !== word.id)).slice(0, 3);
    return { word, options: shuffleArray([word, ...distractors]) };
  });
}

export default function TebakSuaraPage() {
  const { addStar, incrementSession, recordGamePlay } = useAppStore();

  useEffect(() => { recordGamePlay("tebak-suara"); }, [recordGamePlay]);

  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    setQuestions(generateQuestions());
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
    // Same natural recording, played slower (was syllable clips joined by gaps: sounded halting).
    speak(current.word.word, { speed: 0.5 });
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

  // Index of the question whose "Lanjut" may still advance. The exiting card
  // keeps its old onClick during AnimatePresence, so a second tap must be ignored.
  const activeIndexRef = useRef(0);

  const handleNext = useCallback((from: number) => {
    if (from !== activeIndexRef.current) return;
    activeIndexRef.current = from + 1 >= SESSION_SIZE ? -1 : from + 1;
    setShowConfetti(false);
    if (from + 1 >= SESSION_SIZE) {
      incrementSession();
      playApplause();
      setIsCompleted(true);
    } else {
      setIndex(from + 1);
      setFeedback("none");
      setSelectedId(null);
      setShowSpeak(false);
    }
  }, [incrementSession]);

  const restartGame = useCallback(() => {
    activeIndexRef.current = 0;
    setQuestions(generateQuestions());
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
      <div className="min-h-screen bg-paper flex items-center justify-center" role="status">
        <div className="w-12 h-12 border-4 border-line border-t-accent-strong rounded-full motion-safe:animate-spin" aria-hidden="true" />
        <span className="sr-only">Memuat…</span>
      </div>
    );
  }

  // Completion screen
  if (isCompleted) {
    const scorePercent = score / SESSION_SIZE;
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
      <GameShell title="Tebak Suara!">
        <ConfettiEffect show={true} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-surface rounded-3xl border border-line p-6 sm:p-8 flex flex-col items-center text-center gap-5 max-w-md mx-auto"
        >
          <span className="w-20 h-20 rounded-full bg-good-strong text-on-accent flex items-center justify-center">
            <StarIcon size={40} />
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink">{message}</h2>
          <div className="flex flex-col gap-3 w-full">
            <BigButton onClick={restartGame} className="w-full">
              <RetryIcon /> Main Lagi
            </BigButton>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-3 min-h-[72px] px-6 rounded-3xl font-heading text-lg sm:text-xl font-semibold bg-surface text-ink border-2 border-line transition-colors hover:bg-accent-soft active:bg-line"
            >
              <HomeIcon /> Pulang
            </Link>
          </div>
        </motion.div>
      </GameShell>
    );
  }

  const progress = ((index + 1) / SESSION_SIZE) * 100;

  return (
    <GameShell title="Tebak Suara!">
      <GameTutorial
        gameKey="tebak-suara"
        steps={[
          { image: "/images/ui/listen.webp", text: "Dengarkan suara kata yang diputar. Ada tombol 'Dengar' untuk mengulang." },
          { image: "/images/ui/choose.webp", text: "Tebak dengan memilih jawaban yang benar dari gambar yang tersedia!" },
        ]}
      />
      <ConfettiEffect show={showConfetti} />

      {/* Fits one screen (dvh minus GameShell header/padding): no scrolling while playing. */}
      <div className="max-w-md mx-auto flex flex-col h-[calc(100dvh-13rem)] sm:h-[calc(100dvh-11rem)] min-h-[460px] max-h-[760px]">
      {/* Progress */}
      <div className="shrink-0 w-full h-3 bg-line rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent-strong rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      <p className="shrink-0 flex justify-between text-base text-ink-muted font-heading mt-1 mb-3">
        <span>{index + 1} / {SESSION_SIZE}</span>
        <span>{score} bintang</span>
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24, pointerEvents: "none" }}
          transition={{ duration: 0.25 }}
          className="flex-1 min-h-0 w-full flex flex-col items-center gap-3"
        >
          {/* Top card: the question, swapped for "say it" once answered right (same slot, no growth) */}
          {!showSpeak ? (
            <div className="shrink-0 w-full h-[168px] bg-surface rounded-3xl border-2 border-line p-3 flex flex-col items-center justify-center gap-3">
              <p className="font-heading text-2xl font-bold text-ink">Suara apa ini?</p>
              <div className="grid grid-cols-2 gap-3 w-full">
                <BigButton onClick={handleListen}>
                  <SpeakerIcon /> Dengar
                </BigButton>
                <BigButton tone="quiet" onClick={handleListenSlow}>
                  <SlowIcon /> Pelan
                </BigButton>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 w-full h-[168px] bg-surface border-2 border-good-strong rounded-3xl p-3 flex flex-col items-center justify-center gap-3"
            >
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="flex items-center gap-1 font-heading text-lg font-bold text-good-strong">
                  <CheckIcon /> Benar! Ucapkan:
                </span>
                {current.word.syllables.map((syl, i) => (
                  <span key={i} className="font-heading text-2xl font-bold text-ink bg-accent-soft px-3 py-0.5 rounded-xl">
                    {syl}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3 w-full">
                <BigButton tone="quiet" onClick={handleListen}>
                  <SpeakerIcon /> Dengar
                </BigButton>
                <BigButton tone="good" onClick={() => handleNext(index)}>
                  Lanjut <ArrowIcon />
                </BigButton>
              </div>
            </motion.div>
          )}

          {/* Options grid (2×2) — picture only, no word label */}
          <div className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 gap-3 w-full">
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
                  whileTap={!isLocked ? { scale: 0.96 } : {}}
                  onClick={() => handleSelect(opt)}
                  disabled={isLocked}
                  aria-label={opt.word}
                  className={[
                    "relative min-h-0 rounded-3xl flex flex-col items-center justify-center gap-1 border-4 p-2 transition-colors duration-200",
                    isSelectedCorrect
                      ? "border-good-strong bg-paper"
                      : isSelectedWrong
                      ? "border-warn bg-paper"
                      : revealCorrect
                      ? "border-good bg-paper"
                      : dimmed
                      ? "border-line bg-paper opacity-40"
                      : "border-line bg-paper hover:border-accent",
                  ].join(" ")}
                >
                  <WordPicture word={opt} className="h-[78%] max-h-40 w-auto aspect-square" emojiClassName="text-5xl sm:text-6xl" />
                  {isSelectedCorrect && (
                    <span className="absolute top-2 right-2 w-9 h-9 rounded-full bg-good-strong text-on-accent flex items-center justify-center">
                      <CheckIcon />
                    </span>
                  )}
                  {isSelectedWrong && (
                    <span className="font-heading text-lg text-ink">Coba lagi</span>
                  )}
                </motion.button>
              );
            })}
          </div>

        </motion.div>
      </AnimatePresence>
      </div>
    </GameShell>
  );
}

function Svg({ size = 24, children }: { size?: number; children: React.ReactNode }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
const SpeakerIcon = () => <Svg><path d="M11 5 6 9H2v6h4l5 4V5z" /><path d="M15.5 8.5a5 5 0 0 1 0 7" /><path d="M19 5a10 10 0 0 1 0 14" /></Svg>;
const SlowIcon = () => <Svg><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
const CheckIcon = () => <Svg><path d="M5 12.5 10 17l9-10" /></Svg>;
const ArrowIcon = () => <Svg><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></Svg>;
const RetryIcon = () => <Svg><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Svg>;
const HomeIcon = () => <Svg><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></Svg>;
const StarIcon = ({ size }: { size?: number }) => <Svg size={size}><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" /></Svg>;
