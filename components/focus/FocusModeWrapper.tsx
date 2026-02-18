"use client";

import { useEffect, useRef } from "react";
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

export default function FocusModeWrapper() {
  useFocusMode();

  const isFocusMode = useFocusStore((s) => s.isFocusMode);
  const secondsRemaining = useFocusStore((s) => s.secondsRemaining);
  const isTabAway = useFocusStore((s) => s.isTabAway);
  const exitStep = useFocusStore((s) => s.exitStep);
  const showBreak = useFocusStore((s) => s.showBreak);
  const focusDuration = useFocusStore((s) => s.focusDuration);
  const tapExit = useFocusStore((s) => s.tapExit);
  const resetExitStep = useFocusStore((s) => s.resetExitStep);
  const stopFocusMode = useFocusStore((s) => s.stopFocusMode);

  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-reset exit step after 3 seconds
  useEffect(() => {
    if (exitStep === 1) {
      resetTimerRef.current = setTimeout(() => {
        resetExitStep();
      }, 3000);
    }

    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
        resetTimerRef.current = null;
      }
    };
  }, [exitStep, resetExitStep]);

  const handleBreakContinue = () => {
    stopFocusMode();
  };

  const handleBreakRest = () => {
    // Track learning time when break starts
    const appStore = useAppStore.getState();
    appStore.addMinutes(focusDuration);
    appStore.incrementSession();
    appStore.setBreakTime(true);
  };

  if (!isFocusMode) return null;

  return (
    <>
      {/* Floating timer — bottom-right pill */}
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

      {/* Lock button — top-right corner */}
      {!showBreak && (
        <div className="fixed top-4 right-4 z-[85]">
          <AnimatePresence mode="wait">
            {exitStep === 0 ? (
              <motion.button
                key="locked"
                onClick={tapExit}
                className="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-md border-2 border-gray-300 text-lg"
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                aria-label="Keluar focus mode"
              >
                {"🔒"}
              </motion.button>
            ) : (
              <motion.button
                key="unlocking"
                onClick={tapExit}
                className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg border-2 border-red-300 px-4 py-2 min-h-[44px]"
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8, width: 40 }}
                animate={{ opacity: 1, scale: 1, width: "auto" }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="text-lg">{"🔓"}</span>
                <span className="font-body text-sm text-red-600 whitespace-nowrap">
                  Ketuk lagi untuk keluar
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Tab-away overlay */}
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
              <span className="text-8xl">{"👋"}</span>
              <h2 className="font-heading text-3xl font-bold text-white">
                Ayo kembali belajar!
              </h2>
              <p className="font-body text-lg text-white/80">
                Kamu masih dalam Focus Mode
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Break overlay */}
      <AnimatePresence>
        {showBreak && (
          <div className="z-[95] relative">
            <BreakTimeOverlay
              onContinue={handleBreakContinue}
              onBreak={handleBreakRest}
              minutes={focusDuration}
            />
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
