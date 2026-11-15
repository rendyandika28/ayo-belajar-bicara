"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { words, Word } from "@/data/words";
import { speak, speakSyllable } from "@/lib/speech";
import { playPop, playCorrect, playApplause } from "@/lib/sounds";
import GameShell from "@/components/ui/GameShell";
import BigButton from "@/components/ui/BigButton";
import GameTutorial from "@/components/GameTutorial";

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

const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function SpeakerIcon() {
  return (
    <svg aria-hidden="true" {...iconProps}>
      <path d="M11 5 6 9H3v6h3l5 4V5z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function NextIcon() {
  return (
    <svg aria-hidden="true" {...iconProps}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg aria-hidden="true" {...iconProps}>
      <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
      <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
    </svg>
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
    <div className="w-full mb-4">
      <div className="flex justify-between text-base font-body text-ink-muted mb-1">
        <span>Progres</span>
        <span>
          {current}/{total}
        </span>
      </div>
      <div className="w-full h-2.5 bg-line rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent-strong rounded-full origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-surface rounded-3xl border border-line flex flex-col items-center text-center gap-4 p-8"
    >
      <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-good-strong text-on-accent">
        <svg aria-hidden="true" {...iconProps} width={44} height={44} strokeWidth={3}>
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <h2 className="text-[32px] leading-tight font-heading font-bold text-ink">
        Hebat! Sesi Selesai!
      </h2>
      <p className="text-xl font-body text-ink-muted">
        Kamu sudah belajar dengan baik!
      </p>
      <BigButton onClick={onBack} className="mt-2">
        Kembali ke Menu
      </BigButton>
    </motion.div>
  );
}

// ─── Mode Selection ─────────────────────────────────────────────────────────

function ModeSelection({ onSelect }: { onSelect: (mode: Mode) => void }) {
  const modeCards: {
    mode: Mode;
    label: string;
    desc: string;
    icon: React.ReactNode;
  }[] = [
    {
      mode: "single",
      label: "Suku Kata Tunggal",
      desc: "Belajar satu suku kata",
      icon: <span className="font-heading text-2xl font-bold">ba</span>,
    },
    {
      mode: "merge",
      label: "Gabung Suku Kata",
      desc: "Gabungkan suku kata jadi kata",
      icon: <LinkIcon />,
    },
    {
      mode: "full",
      label: "Kata Utuh",
      desc: "Belajar kata lengkap",
      icon: <span className="font-heading text-xl font-bold">bola</span>,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-5"
    >
      <h2 className="text-2xl font-heading font-bold text-ink text-center">
        Pilih Mode Belajar
      </h2>
      <div className="flex flex-col gap-3 w-full max-w-md">
        {modeCards.map((card) => (
          <button
            key={card.mode}
            onClick={() => onSelect(card.mode)}
            className="bg-surface border border-line rounded-3xl p-5 flex items-center gap-4 min-h-[96px] w-full text-left hover:bg-accent-soft active:bg-line transition-colors"
          >
            <span className="flex-shrink-0 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-soft text-accent-strong" aria-hidden="true">
              {card.icon}
            </span>
            <div>
              <h3 className="text-xl font-heading font-semibold text-ink">
                {card.label}
              </h3>
              <p className="text-base font-body text-ink-muted">{card.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Mode 1: Suku Kata Tunggal ─────────────────────────────────────────────

function ModeSingle({ onBack }: { onBack: () => void }) {
  const addStar = useAppStore((s) => s.addStar);
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
      <div className="flex flex-col">
        <SessionComplete onBack={onBack} />
      </div>
    );
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="flex flex-col">
      <ProgressBar current={index + 1} total={total} />

      <div className="flex flex-col items-center gap-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex items-center justify-center"
          >
            <div className="bg-surface rounded-3xl border border-line px-12 py-8 sm:px-16 sm:py-10">
              <span className="text-6xl sm:text-7xl font-heading font-bold text-ink select-none">
                {current}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          <BigButton tone="quiet" onClick={handleListen} className="flex-col sm:flex-row !gap-1 sm:!gap-3 !px-3 sm:!px-6">
            <SpeakerIcon /> Dengar
          </BigButton>
          <BigButton onClick={handleNext} className="flex-col sm:flex-row !gap-1 sm:!gap-3 !px-3 sm:!px-6">
            Selanjutnya <NextIcon />
          </BigButton>
        </div>
      </div>
    </div>
  );
}

// ─── Mode 2: Gabung Suku Kata ──────────────────────────────────────────────

function ModeMerge({ onBack }: { onBack: () => void }) {
  const addStar = useAppStore((s) => s.addStar);

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
      <div className="flex flex-col">
        <SessionComplete onBack={onBack} />
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-center py-12">
          <p className="font-body text-ink-muted text-lg">
            Tidak ada kata tersedia.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <ProgressBar current={index + 1} total={total} />

      <div className="flex flex-col items-center gap-6">
        {/* Emoji (shown after merge) */}
        <AnimatePresence>
          {merged && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.25 }}
              className="text-7xl leading-none"
              aria-hidden="true"
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.2 }}
                  onClick={() => handleTapSyllable(syl)}
                  className="bg-surface border-2 border-line rounded-3xl px-8 py-6 min-w-[96px] min-h-[96px] flex items-center justify-center hover:bg-accent-soft active:bg-line transition-colors"
                >
                  <span className="text-[40px] leading-none font-heading font-bold text-ink select-none">
                    {syl}
                  </span>
                </motion.button>
              ))
            ) : (
              // Merged word card
              <motion.div
                key="merged"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.25 }}
                className="bg-good-strong text-on-accent rounded-3xl px-8 py-5 sm:px-12 sm:py-6 inline-flex items-center gap-3"
              >
                <svg aria-hidden="true" {...iconProps} width={32} height={32} strokeWidth={3}>
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                <span className="text-[40px] sm:text-5xl leading-none font-heading font-bold select-none">
                  {currentWord.word}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {!merged ? (
            <BigButton onClick={handleMerge} className="w-full">
              <LinkIcon /> Gabung!
            </BigButton>
          ) : (
            <BigButton onClick={handleNext} className="w-full">
              Selanjutnya <NextIcon />
            </BigButton>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mode 3: Kata Utuh ─────────────────────────────────────────────────────

function ModeFull({ onBack }: { onBack: () => void }) {
  const addStar = useAppStore((s) => s.addStar);

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
      <div className="flex flex-col">
        <SessionComplete onBack={onBack} />
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="flex flex-col">
        <div className="flex items-center justify-center py-12">
          <p className="font-body text-ink-muted text-lg">
            Tidak ada kata tersedia.
          </p>
        </div>
      </div>
    );
  }

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="flex flex-col">
      <ProgressBar current={index + 1} total={total} />

      <div className="flex flex-col items-center gap-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex flex-col items-center gap-4"
          >
            {/* Icon */}
            <span className="text-7xl sm:text-8xl leading-none select-none" aria-hidden="true">{currentWord.emoji}</span>

            {/* Full word */}
            <div className="bg-surface rounded-3xl border border-line px-8 py-4 sm:px-12 sm:py-6">
              <span className="text-[40px] sm:text-5xl leading-tight font-heading font-bold text-ink select-none">
                {currentWord.word}
              </span>
            </div>

            {/* Syllable breakdown */}
            <div className="flex items-center gap-2 mt-2">
              {currentWord.syllables.map((syl, i) => (
                <motion.button
                  key={i}
                  onClick={() => speakSyllable(syl)}
                  className="bg-accent-soft rounded-2xl px-5 py-3 min-w-[60px] min-h-[52px] flex items-center justify-center hover:bg-line active:bg-line transition-colors"
                >
                  <span className="text-2xl font-heading text-ink select-none">
                    {syl}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
          <BigButton tone="quiet" onClick={handleListen} className="flex-col sm:flex-row !gap-1 sm:!gap-3 !px-3 sm:!px-6">
            <SpeakerIcon /> Dengar
          </BigButton>
          <BigButton onClick={handleNext} className="flex-col sm:flex-row !gap-1 sm:!gap-3 !px-3 sm:!px-6">
            Selanjutnya <NextIcon />
          </BigButton>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function SukuKataPage() {
  const recordGamePlay = useAppStore((s) => s.recordGamePlay);
  const [mode, setMode] = useState<Mode>(null);

  useEffect(() => { recordGamePlay("suku-kata"); }, [recordGamePlay]);

  const handleBackFromMode = useCallback(() => {
    setMode(null);
  }, []);

  return (
    <GameShell
      title="Suku Kata"
      {...(mode !== null && { onBack: handleBackFromMode, backLabel: "Kembali ke menu" })}
    >
      <GameTutorial
        gameKey="suku-kata"
        steps={[
          { emoji: "\ud83d\udd24", text: "Pilih salah satu mode belajar: suku kata tunggal, gabung suku kata, atau kata utuh." },
          { emoji: "\ud83e\udde0", text: "Di mode 'Gabung Suku Kata', gabungkan dua suku kata menjadi kata yang benar!" },
        ]}
      />
      <AnimatePresence mode="wait">
        {mode === null && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ModeSelection onSelect={setMode} />
          </motion.div>
        )}

        {mode === "single" && (
          <motion.div key="single" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModeSingle onBack={handleBackFromMode} />
          </motion.div>
        )}

        {mode === "merge" && (
          <motion.div key="merge" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModeMerge onBack={handleBackFromMode} />
          </motion.div>
        )}

        {mode === "full" && (
          <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ModeFull onBack={handleBackFromMode} />
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
