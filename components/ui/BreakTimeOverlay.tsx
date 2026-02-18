"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BreakTimeOverlayProps {
  onContinue: () => void;
  onBreak: () => void;
  minutes: number;
}

export default function BreakTimeOverlay({
  onContinue,
  onBreak,
  minutes,
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
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex flex-col items-center gap-6 bg-white rounded-3xl p-10 shadow-2xl max-w-sm mx-4"
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <span className="text-7xl">&#9200;</span>
          <h2 className="text-2xl font-heading text-purple-700">
            Waktunya Istirahat!
          </h2>

          {!isResting ? (
            <>
              <p className="text-center font-body text-gray-600 text-lg">
                Kamu sudah belajar {minutes} menit, hebat! Istirahat dulu ya{" "}
                &#128522;
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleBreak}
                  className="w-full bg-green-400 rounded-2xl min-h-[64px] px-6 py-3 font-heading text-xl shadow-lg active:scale-95 transition-transform"
                >
                  &#128564; Istirahat 5 Menit
                </button>
                <button
                  onClick={onContinue}
                  className="w-full bg-blue-400 rounded-2xl min-h-[64px] px-6 py-3 font-heading text-xl shadow-lg active:scale-95 transition-transform text-white"
                >
                  &#128170; Lanjut Belajar
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl font-heading text-green-600">
                {formatTime(secondsLeft)}
              </div>
              <p className="text-center font-body text-gray-600">
                Istirahat sebentar ya... &#128522;
              </p>
              <button
                onClick={onContinue}
                className="w-full bg-blue-400 rounded-2xl min-h-[64px] px-6 py-3 font-heading text-xl shadow-lg active:scale-95 transition-transform text-white"
              >
                Kembali Belajar
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
