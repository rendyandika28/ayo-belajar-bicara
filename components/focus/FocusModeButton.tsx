"use client";

import { motion } from "framer-motion";
import { useFocusStore } from "@/store/useFocusStore";
import { useAppStore } from "@/store/useAppStore";
import { enterFullscreen } from "@/hooks/useFocusMode";

export default function FocusModeButton() {
  const isFocusMode = useFocusStore((s) => s.isFocusMode);
  const startFocusMode = useFocusStore((s) => s.startFocusMode);
  const sessionDuration = useAppStore((s) => s.sessionDuration);

  if (isFocusMode) return null;

  const handleClick = () => {
    startFocusMode(sessionDuration);
    enterFullscreen();
  };

  return (
    <motion.button
      onClick={handleClick}
      className="flex items-center gap-1.5 bg-purple-500 text-white rounded-full px-3 py-1.5 font-heading text-sm shadow-md min-h-[36px]"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Aktifkan focus mode"
    >
      <span>{"🎯"}</span>
      <span>Focus ({sessionDuration}m)</span>
    </motion.button>
  );
}
