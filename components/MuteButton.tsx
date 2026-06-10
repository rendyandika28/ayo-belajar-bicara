"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

export default function MuteButton() {
  const isMuted = useAppStore((s) => s.isMuted);
  const toggleMute = useAppStore((s) => s.toggleMute);

  return (
    <motion.button
      className="flex items-center gap-1 bg-white/80 rounded-full px-3 py-2 shadow-md border-2 border-gray-200 text-sm font-heading min-h-[44px]"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleMute}
      aria-label={isMuted ? "Aktifkan suara" : "Matikan suara"}
    >
      <span className="text-lg">{isMuted ? "\ud83d\udd07" : "\ud83d\udd0a"}</span>
      <span className="hidden sm:inline text-xs">{isMuted ? "Suara mati" : "Suara"}</span>
    </motion.button>
  );
}
