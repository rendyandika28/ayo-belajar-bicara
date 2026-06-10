"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  emoji: string;
  text: string;
}

interface GameTutorialProps {
  gameKey: string;
  steps: Step[];
}

export default function GameTutorial({ gameKey, steps }: GameTutorialProps) {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(`tutorial_${gameKey}`);
    if (!seen) {
      const timer = setTimeout(() => setShow(true), 400);
      return () => clearTimeout(timer);
    }
  }, [gameKey]);

  const handleDismiss = () => {
    localStorage.setItem(`tutorial_${gameKey}`, "1");
    setShow(false);
  };

  if (!show) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-6 pb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={handleDismiss}
          />

          {/* Card */}
          <motion.div
            className="relative bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border-2 border-purple-100"
            initial={{ opacity: 0, y: 60, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="flex flex-col items-center text-center">
              <span className="text-5xl mb-4">{current.emoji}</span>
              <p className="font-body text-base sm:text-lg text-foreground/90 leading-relaxed mb-6">
                {current.text}
              </p>
            </div>

            {/* Dots */}
            {steps.length > 1 && (
              <div className="flex justify-center gap-1.5 mb-5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === step ? "bg-purple-500 w-5" : "bg-purple-200"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-center gap-3">
              {!isLast && (
                <motion.button
                  className="bg-gray-100 text-foreground/60 font-heading text-sm px-5 py-2.5 rounded-full"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDismiss}
                >
                  Lewati
                </motion.button>
              )}
              <motion.button
                className="bg-purple-600 text-white font-heading text-base px-6 py-2.5 rounded-full shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (isLast) {
                    handleDismiss();
                  } else {
                    setStep((s) => s + 1);
                  }
                }}
              >
                {isLast ? "Mulai! \ud83d\ude80" : "Lanjut"}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
