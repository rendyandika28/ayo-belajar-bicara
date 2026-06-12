"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

export default function IceCreamsIndicator() {
  const rawIceCreams = useAppStore((s) => s.iceCreams);
  const iceCreams = Number.isFinite(rawIceCreams) ? (rawIceCreams as number) : 0;

  if (iceCreams <= 0) return null;

  return (
    <motion.div
      className="inline-flex items-center gap-1.5 bg-pink-100 rounded-full px-3 py-1.5 shadow-md border-2 border-pink-200"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      title="Setiap 5 hari berturut-turut, Anda dapat 1 es krim untuk menyelamatkan streak"
      aria-label={`Es krim penyelamat streak: ${iceCreams} tersisa`}
    >
      <span className="text-lg" aria-hidden="true">{"\ud83c\udf66"}</span>
      <span className="font-heading text-sm font-bold text-pink-700">
        {iceCreams}
      </span>
      <span className="font-body text-[10px] text-pink-600/70 hidden sm:inline">
        / 3
      </span>
    </motion.div>
  );
}
