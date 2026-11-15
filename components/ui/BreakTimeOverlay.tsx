"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BigButton from "./BigButton";

interface BreakTimeOverlayProps {
  onContinue: () => void;
  onBreak: () => void;
  minutes: number;
  summary?: {
    starsEarned: number;
    wordsLearned: number;
    sessionsCompleted: number;
  } | null;
}

export default function BreakTimeOverlay({
  onContinue,
  onBreak,
  minutes,
  summary,
}: BreakTimeOverlayProps) {
  const [isResting, setIsResting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(5 * 60);

  const handleBreak = useCallback(() => {
    setIsResting(true);
    setSecondsLeft(5 * 60);
    onBreak();
  }, [onBreak]);

  useEffect(() => {
    if (!isResting) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isResting]);

  useEffect(() => {
    if (isResting && secondsLeft === 0) {
      onContinue();
    }
  }, [isResting, secondsLeft, onContinue]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--scrim)] px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex flex-col items-center bg-surface border border-line rounded-3xl p-8 max-w-sm w-full"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25 }}
        >
          <span className="flex items-center justify-center w-20 h-20 rounded-full bg-accent-soft text-accent-strong mb-3">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2.5 2M9 2h6" />
            </svg>
          </span>
          <h2 className="text-2xl font-heading font-semibold text-ink mb-4">
            Waktunya Istirahat!
          </h2>

          {/* Session Summary */}
          {summary && !isResting && (
            <div className="w-full bg-paper rounded-2xl p-4 mb-5">
              <h3 className="font-heading text-base font-semibold text-ink-muted text-center mb-3">
                Hasil Belajar Hari Ini
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-2xl font-heading font-bold text-ink">
                    {summary.starsEarned > 0 ? `+${summary.starsEarned}` : "0"}
                  </div>
                  <div className="font-body text-sm text-ink-muted">Bintang</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold text-ink">
                    {summary.wordsLearned > 0 ? `+${summary.wordsLearned}` : "0"}
                  </div>
                  <div className="font-body text-sm text-ink-muted">Kata Baru</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold text-ink">
                    {summary.sessionsCompleted}
                  </div>
                  <div className="font-body text-sm text-ink-muted">Sesi</div>
                </div>
              </div>
              <p className="font-body text-sm text-ink-muted text-center mt-3">
                Kamu belajar selama {minutes} menit! Hebat!
              </p>
            </div>
          )}

          {!isResting ? (
            <>
              <p className="text-center font-body text-lg text-ink mb-6">
                Istirahat dulu ya biar segar lagi
              </p>
              <div className="flex flex-col gap-3 w-full">
                <BigButton tone="good" onClick={handleBreak} className="w-full">
                  Istirahat 5 Menit
                </BigButton>
                <BigButton tone="quiet" onClick={onContinue} className="w-full">
                  Lanjut Belajar
                </BigButton>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl font-heading font-semibold text-good-strong my-4 tabular-nums">
                {formatTime(secondsLeft)}
              </div>
              <p className="text-center font-body text-lg text-ink mb-6">
                Istirahat sebentar ya…
              </p>
              <BigButton onClick={onContinue} className="w-full">
                Kembali Belajar
              </BigButton>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
