"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { playPop } from "@/lib/sounds";

export default function CalmModeToggle() {
  const calmMode = useAppStore((s) => s.calmMode);
  const toggleCalmMode = useAppStore((s) => s.toggleCalmMode);

  return (
    <motion.button
      className={`flex items-center gap-1 bg-white/80 rounded-full px-3 py-2 shadow-md border-2 text-sm font-heading min-h-[44px] ${
        calmMode ? "border-green-300 bg-green-50" : "border-gray-200"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        toggleCalmMode();
        playPop();
      }}
      aria-label={calmMode ? "Nonaktifkan mode tenang" : "Aktifkan mode tenang"}
    >
      <span className="text-lg">{calmMode ? "\ud83e\udd2b" : "\ud83c\udf1f"}</span>
      <span className="hidden sm:inline text-xs">{calmMode ? "Tenang" : "Mode Tenang"}</span>
    </motion.button>
  );
}
