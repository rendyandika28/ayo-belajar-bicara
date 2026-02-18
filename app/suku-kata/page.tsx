"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { words, Word } from "@/data/words";
import { speak, speakSyllable } from "@/lib/speech";
import { playPop, playCorrect, playApplause } from "@/lib/sounds";
import FocusModeButton from "@/components/focus/FocusModeButton";

// ─── Constants ───────────────────────────────────────────────────────────────

const SINGLE_SYLLABLES = [
  "ma", "pa", "ba", "da", "na", "ka", "sa", "ta", "la",
  "mi", "mu", "bu", "du", "su", "ku",
];

const MERGE_SESSION_SIZE = 8;

type Mode = null | "single" | "merge" | "full";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── Shared Components ──────────────────────────────────────────────────────

function TopBar({
  onBack,
  totalStars,
}: {
  onBack: () => void;
  totalStars: number;
}) {
  return (
    <div className="flex items-center justify-between w-full px-4 py-3">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-lg font-heading text-gray-600 active:scale-95 transition-transform min-w-[64px] min-h-[48px]"
      >
        <span className="text-2xl">&#8592;</span> Kembali
      </button>
      <div className="flex items-center gap-2">
        <FocusModeButton />
        <div className="flex items-center gap-1 text-lg font-heading text-yellow-600 min-h-[48px]">
          <span className="text-xl">&#11088;</span> {totalStars}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className="w-full px-4 mb-2">
      <div className="flex justify-between text-sm font-body text-gray-500 mb-1">
        <span>Progres</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function SessionComplete({ onBack }: { onBack: () => void }) {
  useEffect(() => {
    playApplause();
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center justify-center flex-1 gap-6 p-8"
    >
      <motion.div
        className="text-8xl"
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        &#127881;
      </motion.div>
      <h2 className="text-3xl font-heading text-center text-purple-700">
        Hebat! Sesi Selesai!
      </h2>
      <p className="text-lg font-body text-gray-600 text-center">
        Kamu sudah belajar dengan baik!
      </p>
      <button
        onClick={onBack}
        className="mt-4 px-8 py-4 bg-purple-500 text-white text-xl font-heading rounded-2xl active:scale-95 transition-transform min-h-[64px]"
      >
        Kembali ke Menu
      </button>
    </motion.div>
  );
}

// ─── Mode Selection ─────────────────────────────────────────────────────────

function ModeSelection({ onSelect }: { onSelect: (mode: Mode) => void }) {
  const modeCards: {
    mode: Mode;
    emoji: string;
    label: string;
    desc: string;
    bg: string;
  }[] = [
    {
      mode: "single",
      emoji: "\uD83D\uDD24",
      label: "Suku Kata Tunggal",
      desc: "Belajar satu suku kata",
      bg: "bg-blue-200",
    },
    {
      mode: "merge",
      emoji: "\uD83D\uDD17",
      label: "Gabung Suku Kata",
      desc: "Gabungkan suku kata jadi kata",
      bg: "bg-green-200",
    },
    {
      mode: "full",
      emoji: "\uD83D\uDCDD",
      label: "Kata Utuh",
      desc: "Belajar kata lengkap",
      bg: "bg-purple-200",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center gap-5 px-4 py-6 flex-1"
    >
      <h1 className="text-3xl font-heading text-gray-800 text-center">
        Pilih Mode Belajar
      </h1>
      <div className="flex flex-col gap-4 w-full max-w-md">
        {modeCards.map((card) => (
          <motion.button
            key={card.mode}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelect(card.mode)}
            className={`${card.bg} rounded-3xl p-6 flex items-center gap-4 shadow-md active:shadow-sm transition-shadow min-h-[96px] w-full text-left`}
          >
            <span className="text-5xl">{card.emoji}</span>
            <div>
              <h2 className="text-xl font-heading text-gray-800">
                {card.label}
              </h2>
              <p className="text-sm font-body text-gray-600">{card.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Mode 1: Suku Kata Tunggal ─────────────────────────────────────────────

function ModeSingle({ onBack }: { onBack: () => void }) {
  const addStar = useAppStore((s) => s.addStar);
  const totalStars = useAppStore((s) => s.totalStars);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [completed, setCompleted] = useState(false);

  const syllables = useMemo(() => SINGLE_SYLLABLES, []);
  const total = syllables.length;
  const current = syllables[index];

  // Auto-play syllable when shown
  useEffect(() => {
    if (!completed && current) {
      const timeout = setTimeout(() => {
        speakSyllable(current);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [index, completed, current]);

  const handleListen = useCallback(() => {
    if (current) speakSyllable(current);
  }, [current]);

  const handleNext = useCallback(() => {
    playPop();
    addStar(1);
    if (index + 1 >= total) {
      setCompleted(true);
    } else {
      setDirection(1);
      setIndex((prev) => prev + 1);
    }
  }, [index, total, addStar]);

  if (completed) {
    return (
      <div className="flex flex-col min-h-screen bg-blue-50">
        <TopBar onBack={onBack} totalStars={totalStars} />
        <SessionComplete onBack={onBack} />
      </div>
    );
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <TopBar onBack={onBack} totalStars={totalStars} />
      <ProgressBar current={index + 1} total={total} />

      <div className="flex flex-col items-center justify-center flex-1 gap-8 px-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <div className="bg-white rounded-3xl shadow-lg px-8 py-6 sm:px-12 sm:py-10">
              <span className="text-5xl sm:text-7xl font-heading text-blue-700 uppercase tracking-wide select-none">
                {current}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={handleListen}
            className="w-full py-4 bg-blue-400 text-white text-xl font-heading rounded-2xl active:scale-95 transition-transform min-h-[64px] shadow-md"
          >
            &#128266; Dengar
          </button>
          <button
            onClick={handleNext}
            className="w-full py-4 bg-orange-400 text-white text-xl font-heading rounded-2xl active:scale-95 transition-transform min-h-[64px] shadow-md"
          >
            &#9654; Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Mode 2: Gabung Suku Kata ──────────────────────────────────────────────

function ModeMerge({ onBack }: { onBack: () => void }) {
  const addStar = useAppStore((s) => s.addStar);
  const totalStars = useAppStore((s) => s.totalStars);

  // Filter difficulty 1 words with exactly 2 syllables, shuffle, take session size
  const sessionWords = useMemo(() => {
    const eligible = words.filter(
      (w) => w.difficulty === 1 && w.syllables.length === 2
    );
    return shuffleArray(eligible).slice(0, MERGE_SESSION_SIZE);
  }, []);

  const [index, setIndex] = useState(0);
  const [merged, setMerged] = useState(false);
  const [completed, setCompleted] = useState(false);
  const total = sessionWords.length;
  const currentWord: Word | undefined = sessionWords[index];

  const handleTapSyllable = useCallback(
    (syllable: string) => {
      if (!merged) speakSyllable(syllable);
    },
    [merged]
  );

  const handleMerge = useCallback(() => {
    if (!currentWord) return;
    setMerged(true);
    playCorrect();
    // Slight delay before speaking the full word
    setTimeout(() => {
      speak(currentWord.word);
    }, 600);
  }, [currentWord]);

  const handleNext = useCallback(() => {
    playPop();
    addStar(1);
    if (index + 1 >= total) {
      setCompleted(true);
    } else {
      setMerged(false);
      setIndex((prev) => prev + 1);
    }
  }, [index, total, addStar]);

  if (completed) {
    return (
      <div className="flex flex-col min-h-screen bg-blue-50">
        <TopBar onBack={onBack} totalStars={totalStars} />
        <SessionComplete onBack={onBack} />
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex flex-col min-h-screen bg-blue-50">
        <TopBar onBack={onBack} totalStars={totalStars} />
        <div className="flex items-center justify-center flex-1">
          <p className="font-body text-gray-500 text-lg">
            Tidak ada kata tersedia.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <TopBar onBack={onBack} totalStars={totalStars} />
      <ProgressBar current={index + 1} total={total} />

      <div className="flex flex-col items-center justify-center flex-1 gap-8 px-4">
        {/* Emoji (shown after merge) */}
        <AnimatePresence>
          {merged && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="text-7xl"
            >
              {currentWord.emoji}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Syllable boxes */}
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            {!merged ? (
              // Separated syllable cards
              currentWord.syllables.map((syl, i) => (
                <motion.button
                  key={`sep-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.3 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handleTapSyllable(syl)}
                  className="bg-yellow-200 rounded-2xl px-8 py-6 shadow-md active:shadow-sm transition-shadow min-w-[72px] sm:min-w-[90px] min-h-[80px] flex items-center justify-center"
                >
                  <span className="text-3xl sm:text-4xl font-heading text-gray-800 uppercase select-none">
                    {syl}
                  </span>
                </motion.button>
              ))
            ) : (
              // Merged word card
              <motion.div
                key="merged"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-yellow-200 rounded-2xl px-6 py-4 sm:px-10 sm:py-6 shadow-lg"
              >
                <span className="text-3xl sm:text-5xl font-heading text-gray-800 uppercase select-none">
                  {currentWord.word}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {!merged ? (
            <button
              onClick={handleMerge}
              className="w-full py-4 bg-green-400 text-white text-xl font-heading rounded-2xl active:scale-95 transition-transform min-h-[64px] shadow-md"
            >
              &#128279; Gabung!
            </button>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleNext}
              className="w-full py-4 bg-orange-400 text-white text-xl font-heading rounded-2xl active:scale-95 transition-transform min-h-[64px] shadow-md"
            >
              &#9654; Selanjutnya
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mode 3: Kata Utuh ─────────────────────────────────────────────────────

function ModeFull({ onBack }: { onBack: () => void }) {
  const addStar = useAppStore((s) => s.addStar);
  const totalStars = useAppStore((s) => s.totalStars);

  const allWords = useMemo(() => shuffleArray(words), []);
  const total = allWords.length;

  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [completed, setCompleted] = useState(false);

  const currentWord: Word | undefined = allWords[index];

  // Auto-play full word when shown
  useEffect(() => {
    if (!completed && currentWord) {
      const timeout = setTimeout(() => {
        speak(currentWord.word);
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [index, completed, currentWord]);

  const handleListen = useCallback(() => {
    if (currentWord) speak(currentWord.word);
  }, [currentWord]);

  const handleNext = useCallback(() => {
    playPop();
    addStar(1);
    if (index + 1 >= total) {
      setCompleted(true);
    } else {
      setDirection(1);
      setIndex((prev) => prev + 1);
    }
  }, [index, total, addStar]);

  if (completed) {
    return (
      <div className="flex flex-col min-h-screen bg-blue-50">
        <TopBar onBack={onBack} totalStars={totalStars} />
        <SessionComplete onBack={onBack} />
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex flex-col min-h-screen bg-blue-50">
        <TopBar onBack={onBack} totalStars={totalStars} />
        <div className="flex items-center justify-center flex-1">
          <p className="font-body text-gray-500 text-lg">
            Tidak ada kata tersedia.
          </p>
        </div>
      </div>
    );
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="flex flex-col min-h-screen bg-blue-50">
      <TopBar onBack={onBack} totalStars={totalStars} />
      <ProgressBar current={index + 1} total={total} />

      <div className="flex flex-col items-center justify-center flex-1 gap-6 px-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="flex flex-col items-center gap-4"
          >
            {/* Emoji */}
            <span className="text-6xl sm:text-8xl select-none">{currentWord.emoji}</span>

            {/* Full word */}
            <div className="bg-white rounded-3xl shadow-lg px-6 py-4 sm:px-10 sm:py-6">
              <span className="text-3xl sm:text-5xl font-heading text-purple-700 uppercase tracking-wide select-none">
                {currentWord.word}
              </span>
            </div>

            {/* Syllable breakdown */}
            <div className="flex items-center gap-2 mt-2">
              {currentWord.syllables.map((syl, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => speakSyllable(syl)}
                  className="bg-yellow-100 border-2 border-yellow-300 rounded-xl px-5 py-3 min-w-[60px] min-h-[52px] flex items-center justify-center active:bg-yellow-200 transition-colors"
                >
                  <span className="text-2xl font-heading text-gray-700 uppercase select-none">
                    {syl}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <button
            onClick={handleListen}
            className="w-full py-4 bg-blue-400 text-white text-xl font-heading rounded-2xl active:scale-95 transition-transform min-h-[64px] shadow-md"
          >
            &#128266; Dengar
          </button>
          <button
            onClick={handleNext}
            className="w-full py-4 bg-orange-400 text-white text-xl font-heading rounded-2xl active:scale-95 transition-transform min-h-[64px] shadow-md"
          >
            &#9654; Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function SukuKataPage() {
  const router = useRouter();
  const totalStars = useAppStore((s) => s.totalStars);
  const [mode, setMode] = useState<Mode>(null);

  const handleBackFromMode = useCallback(() => {
    setMode(null);
  }, []);

  const handleBackFromMenu = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-blue-50">
      <AnimatePresence mode="wait">
        {mode === null && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen"
          >
            <TopBar onBack={handleBackFromMenu} totalStars={totalStars} />
            <ModeSelection onSelect={setMode} />
          </motion.div>
        )}

        {mode === "single" && (
          <motion.div
            key="single"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            <ModeSingle onBack={handleBackFromMode} />
          </motion.div>
        )}

        {mode === "merge" && (
          <motion.div
            key="merge"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            <ModeMerge onBack={handleBackFromMode} />
          </motion.div>
        )}

        {mode === "full" && (
          <motion.div
            key="full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            <ModeFull onBack={handleBackFromMode} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
