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
  // Hint "tekan dan tahan gembok": shown when focus mode starts and after a too-short tap.
  const [showHint, setShowHint] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashHint = useCallback(() => {
    setShowHint(true);
    if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    hintTimerRef.current = setTimeout(() => setShowHint(false), 5000);
  }, []);
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
    if (pressTimerRef.current) flashHint(); // released before the hold finished
    clearPressTimer();
  }, [clearPressTimer, flashHint]);

  useEffect(() => {
    if (isFocusMode) flashHint();
    return () => { if (hintTimerRef.current) clearTimeout(hintTimerRef.current); };
  }, [isFocusMode, flashHint]);

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
      {/* One small pill in the corner: timer + long-press lock. Was a lock button fixed at
          screen centre, which covered the game. */}
      {!showBreak && (
        <div className="fixed bottom-4 right-4 z-[85] flex flex-col items-end gap-2">
          {pressProgress > 0 && pressProgress < 1 && (
            <p className="font-body text-sm text-ink bg-surface border border-line rounded-xl px-3 py-1 font-semibold">
              Tahan {Math.ceil(LONG_PRESS_MS / 1000 - pressProgress * (LONG_PRESS_MS / 1000))} detik lagi…
            </p>
          )}
          {showHint && pressProgress === 0 && (
            <p role="status" className="font-body text-sm text-ink bg-surface border border-line rounded-xl px-3 py-2 max-w-[220px] text-right leading-snug">
              Untuk keluar, <strong>tekan dan tahan</strong> ikon gembok 3 detik
            </p>
          )}
          <div
            className={`flex items-center gap-1 bg-surface rounded-full pl-4 pr-1 min-h-[52px] border-2 select-none ${
              secondsRemaining < 60 ? "border-warn" : "border-line"
            }`}
          >
            <span className="font-heading text-lg text-ink font-bold tabular-nums">
              {formatTime(secondsRemaining)}
            </span>
            <button
              type="button"
              onMouseDown={handlePressStart}
              onMouseUp={handlePressEnd}
              onMouseLeave={handlePressEnd}
              onTouchStart={handlePressStart}
              onTouchEnd={handlePressEnd}
              onTouchCancel={handlePressEnd}
              onContextMenu={(e) => e.preventDefault()}
              className="relative w-11 h-11 flex items-center justify-center text-ink rounded-full cursor-pointer select-none hover:bg-accent-soft"
              aria-label="Tekan lama untuk keluar dari mode belajar"
              title="Tekan lama untuk keluar"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d={pressProgress > 0 ? "M8 11V7a4 4 0 0 1 7.5-2" : "M8 11V7a4 4 0 0 1 8 0v4"} />
              </svg>
              {pressProgress > 0 && (
                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 44 44" aria-hidden="true">
                  <circle cx="22" cy="22" r="20" fill="none" stroke="var(--accent-strong)" strokeWidth="3"
                    strokeDasharray={125.7} strokeDashoffset={125.7 * (1 - pressProgress)} strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
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
