"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConfettiEffect from "./ConfettiEffect";

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
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ConfettiEffect show={show} />
          <motion.div
            className="flex flex-col items-center gap-4 bg-white rounded-3xl p-10 shadow-2xl"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <span className="text-8xl">{emoji}</span>
            <p className="text-2xl font-heading text-center text-purple-700">
              {message}
            </p>
            <button
              onClick={onClose}
              className="mt-2 bg-yellow-400 rounded-2xl px-8 py-3 font-heading text-lg shadow-lg active:scale-95 transition-transform"
            >
              Lanjut!
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
