"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BigButton from "@/components/ui/BigButton";

interface Step {
  emoji?: string;
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
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center px-4 pb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[var(--scrim)]"
            onClick={handleDismiss}
          />

          {/* Card */}
          <motion.div
            className="relative bg-surface rounded-3xl p-6 max-w-sm w-full border border-line"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-col items-center text-center">
              {/* Step picture for pre-readers (content from the page) */}
              {current.emoji && (
                <span className="flex items-center justify-center w-24 h-24 rounded-full bg-accent-soft text-5xl mb-4" aria-hidden="true">
                  {current.emoji}
                </span>
              )}
              <p className="font-body text-xl text-ink leading-relaxed mb-6">
                {current.text}
              </p>
            </div>

            {/* Dots */}
            {steps.length > 1 && (
              <div className="flex justify-center gap-2 mb-5" aria-hidden="true">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2.5 rounded-full transition-colors ${
                      i === step ? "bg-accent-strong w-6" : "bg-line w-2.5"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-center gap-3">
              {!isLast && (
                <BigButton tone="quiet" className="flex-1" onClick={handleDismiss}>
                  Lewati
                </BigButton>
              )}
              <BigButton
                className="flex-1"
                onClick={() => {
                  if (isLast) {
                    handleDismiss();
                  } else {
                    setStep((s) => s + 1);
                  }
                }}
              >
                {isLast ? "Mulai!" : "Lanjut"}
              </BigButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
