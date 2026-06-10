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
          className={`fixed bottom-6 right-4 z-[85] bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border-2 border-purple-300 font-heading text-lg select-none ${
            secondsRemaining < 60 ? "animate-pulse" : ""
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <span className="text-purple-700 font-bold">
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
            className="w-16 h-16 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-lg border-2 border-gray-300 text-2xl cursor-pointer select-none"
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            aria-label="Tekan lama untuk keluar"
          >
            {pressProgress > 0 ? "\u23f3" : "\ud83d\udd12"}
          </motion.button>

          {pressProgress > 0 && (
            <div className="w-20 h-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${pressProgress * 100}%` }}
              />
            </div>
          )}

          {pressProgress === 0 && (
            <motion.p
              className="font-body text-xs text-white/70 text-center max-w-[160px] leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              Tekan lama tombol kunci untuk keluar
            </motion.p>
          )}
          {pressProgress > 0 && pressProgress < 1 && (
            <p className="font-body text-xs text-white font-semibold">
              Tahan {Math.ceil(LONG_PRESS_MS / 1000 - pressProgress * (LONG_PRESS_MS / 1000))} detik lagi...
            </p>
          )}
        </div>
      )}

      <AnimatePresence>
        {isTabAway && !showBreak && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-purple-900/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4 text-center px-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="text-8xl">{"\ud83d\udc4b"}</span>
              <h2 className="font-heading text-3xl font-bold text-white">
                Ayo kembali belajar!
              </h2>
              <p className="font-body text-lg text-white/80">
                Si kecil masih dalam Mode Belajar
              </p>
            </motion.div>
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
