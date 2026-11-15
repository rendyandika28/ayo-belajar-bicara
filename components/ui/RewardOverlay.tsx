"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConfettiEffect from "./ConfettiEffect";
import BigButton from "./BigButton";

interface RewardOverlayProps {
  show: boolean;
  emoji: string;
  message: string;
  onClose: () => void;
}

export default function RewardOverlay({
  show,
  emoji,
  message,
  onClose,
}: RewardOverlayProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => onClose(), 4000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[var(--scrim)] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ConfettiEffect show={show} />
          <motion.div
            className="flex flex-col items-center gap-5 bg-surface border border-line rounded-3xl p-8 max-w-sm w-full"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
          >
            {/* Reward picture (content, from the page) */}
            <span className="flex items-center justify-center w-28 h-28 rounded-full bg-accent-soft text-6xl" aria-hidden="true">
              {emoji}
            </span>
            <p className="text-3xl font-heading font-semibold text-center text-ink">
              {message}
            </p>
            <BigButton onClick={onClose} className="w-full">
              Lanjut
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14m-6-6 6 6-6 6" />
              </svg>
            </BigButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
