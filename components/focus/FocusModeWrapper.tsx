"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFocusStore } from "@/store/useFocusStore";
import { useFocusMode } from "@/hooks/useFocusMode";
import { useAppStore } from "@/store/useAppStore";
import BreakTimeOverlay from "@/components/ui/BreakTimeOverlay";

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const LONG_PRESS_MS = 3000;

export default function FocusModeWrapper() {
  useFocusMode();

  const isFocusMode = useFocusStore((s) => s.isFocusMode);
  const secondsRemaining = useFocusStore((s) => s.secondsRemaining);
  const isTabAway = useFocusStore((s) => s.isTabAway);
  const showBreak = useFocusStore((s) => s.showBreak);
  const focusDuration = useFocusStore((s) => s.focusDuration);
  const stopFocusMode = useFocusStore((s) => s.stopFocusMode);

  const [pressProgress, setPressProgress] = useState(0);
  const [sessionSummary, setSessionSummary] = useState<{
    starsEarned: number;
    wordsLearned: number;
    sessionsCompleted: number;
  } | null>(null);

  const pressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const breakHandledRef = useRef(false);
  const sessionSnapshotRef = useRef<{
    stars: number;
    words: number;
    sessions: number;
  } | null>(null);

  // Capture snapshot when focus mode starts
  useEffect(() => {
    if (isFocusMode && !sessionSnapshotRef.current) {
      const state = useAppStore.getState();
      sessionSnapshotRef.current = {
        stars: state.todayStars,
        words: state.wordsLearned.length,
        sessions: state.sessionsCompleted,
      };
    }
    if (!isFocusMode) {
      sessionSnapshotRef.current = null;
      setSessionSummary(null);
    }
  }, [isFocusMode]);

  const clearPressTimer = useCallback(() => {
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setPressProgress(0);
  }, []);

  const handlePressStart = useCallback(() => {
    if (pressTimerRef.current) return;
    const start = Date.now();
    pressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / LONG_PRESS_MS, 1);
      setPressProgress(progress);
      if (progress >= 1) {
        clearPressTimer();
        stopFocusMode();
      }
    }, 50);
  }, [clearPressTimer, stopFocusMode]);

  const handlePressEnd = useCallback(() => {
    clearPressTimer();
  }, [clearPressTimer]);

  useEffect(() => {
    return () => clearPressTimer();
  }, [clearPressTimer]);

  // Track learning time once when break overlay appears
  useEffect(() => {
    if (showBreak && !breakHandledRef.current) {
      breakHandledRef.current = true;
      const appStore = useAppStore.getState();
      appStore.addMinutes(focusDuration);
      appStore.incrementSession();
      appStore.setBreakTime(true);

      // Compute session summary
      const snapshot = sessionSnapshotRef.current;
      if (snapshot) {
        const current = useAppStore.getState();
        setSessionSummary({
          starsEarned: current.todayStars - snapshot.stars,
          wordsLearned: current.wordsLearned.length - snapshot.words,
          sessionsCompleted: current.sessionsCompleted - snapshot.sessions,
        });
      }
    }
    if (!showBreak) {
      breakHandledRef.current = false;
    }
  }, [showBreak, focusDuration]);

  const handleBreakContinue = useCallback(() => {
    stopFocusMode();
  }, [stopFocusMode]);

  if (!isFocusMode) return null;

  return (
    <>
      {!showBreak && (
        <motion.div
          className={`fixed bottom-6 right-4 z-[85] bg-surface rounded-full px-4 min-h-[44px] flex items-center border-2 font-heading text-lg select-none tabular-nums ${
            secondsRemaining < 60 ? "border-warn" : "border-line"
          }`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <span className="text-ink font-bold">
            {formatTime(secondsRemaining)}
          </span>
        </motion.div>
      )}

      {!showBreak && (
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[85] flex flex-col items-center gap-3">
          <motion.button
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onTouchCancel={handlePressEnd}
            className="w-16 h-16 flex items-center justify-center bg-surface text-ink rounded-full border-2 border-line cursor-pointer select-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            aria-label="Tekan lama untuk keluar"
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d={pressProgress > 0 ? "M8 11V7a4 4 0 0 1 7.5-2" : "M8 11V7a4 4 0 0 1 8 0v4"} />
            </svg>
          </motion.button>

          {pressProgress > 0 && (
            <div className="w-20 h-1.5 bg-line rounded-full overflow-hidden">
              <div
                className="h-full bg-accent-strong rounded-full"
                style={{ width: `${pressProgress * 100}%` }}
              />
            </div>
          )}

          {pressProgress === 0 && (
            <motion.p
              className="font-body text-sm text-ink-muted bg-surface rounded-xl px-3 py-1 text-center max-w-[180px] leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Tekan lama tombol kunci untuk keluar
            </motion.p>
          )}
          {pressProgress > 0 && pressProgress < 1 && (
            <p className="font-body text-sm text-ink bg-surface rounded-xl px-3 py-1 font-semibold">
              Tahan {Math.ceil(LONG_PRESS_MS / 1000 - pressProgress * (LONG_PRESS_MS / 1000))} detik lagi…
            </p>
          )}
        </div>
      )}

      <AnimatePresence>
        {isTabAway && !showBreak && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-paper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-4 text-center px-6">
              <h2 className="font-heading text-3xl font-bold text-ink">
                Ayo kembali belajar!
              </h2>
              <p className="font-body text-lg text-ink-muted">
                Si kecil masih dalam Mode Belajar
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBreak && (
          <div className="z-[95] relative">
            <BreakTimeOverlay
              onContinue={handleBreakContinue}
              onBreak={() => {}}
              minutes={focusDuration}
              summary={sessionSummary}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
