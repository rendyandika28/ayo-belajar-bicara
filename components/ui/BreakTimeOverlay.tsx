"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
        className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="flex flex-col items-center bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full"
          initial={{ scale: 0, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0, y: 50 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <span className="text-6xl mb-2">{"\u23f0"}</span>
          <h2 className="text-2xl font-heading text-purple-700 mb-3">
            Waktunya Istirahat!
          </h2>

          {/* Session Summary */}
          {summary && !isResting && (
            <motion.div
              className="w-full bg-gradient-to-r from-yellow-50 to-purple-50 rounded-2xl p-4 mb-5 border-2 border-yellow-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h3 className="font-heading text-sm font-semibold text-gray-600 text-center mb-3">
                Hasil Belajar Hari Ini
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-lg font-heading font-bold text-yellow-500">
                    {summary.starsEarned > 0 ? `+${summary.starsEarned}` : "0"}
                  </div>
                  <div className="font-body text-xs text-gray-500">
                    {"\u2b50"} Bintang
                  </div>
                </div>
                <div>
                  <div className="text-lg font-heading font-bold text-blue-500">
                    {summary.wordsLearned > 0 ? `+${summary.wordsLearned}` : "0"}
                  </div>
                  <div className="font-body text-xs text-gray-500">
                    {"\ud83d\udcda"} Kata Baru
                  </div>
                </div>
                <div>
                  <div className="text-lg font-heading font-bold text-green-500">
                    {summary.sessionsCompleted}
                  </div>
                  <div className="font-body text-xs text-gray-500">
                    {"\u2705"} Sesi
                  </div>
                </div>
              </div>
              <p className="font-body text-xs text-gray-400 text-center mt-2">
                Kamu belajar selama {minutes} menit! Hebat! {"\ud83d\udc4f"}
              </p>
            </motion.div>
          )}

          {!isResting ? (
            <>
              <p className="text-center font-body text-gray-600 mb-6">
                Istirahat dulu ya biar segar lagi {"\ud83d\ude0a"}
              </p>
              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={handleBreak}
                  className="w-full bg-green-400 rounded-2xl min-h-[64px] px-6 py-3 font-heading text-xl shadow-lg active:scale-95 transition-transform"
                >
                  {"\ud83d\udca4"} Istirahat 5 Menit
                </button>
                <button
                  onClick={onContinue}
                  className="w-full bg-blue-400 rounded-2xl min-h-[64px] px-6 py-3 font-heading text-xl shadow-lg active:scale-95 transition-transform text-white"
                >
                  {"\ud83d\udcaa"} Lanjut Belajar
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-6xl font-heading text-green-600 my-4">
                {formatTime(secondsLeft)}
              </div>
              <p className="text-center font-body text-gray-600 mb-6">
                Istirahat sebentar ya... {"\ud83d\ude0a"}
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
