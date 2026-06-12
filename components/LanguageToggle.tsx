"use client";

import { motion } from "framer-motion";
import { useI18nStore } from "@/store/useI18nStore";

export default function LanguageToggle() {
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);

  return (
    <button
      onClick={() => setLocale(locale === "id" ? "en" : "id")}
      className="flex items-center gap-1 bg-white/80 rounded-full px-3 py-2 shadow-md border-2 border-gray-200 text-sm font-heading min-h-[44px]"
      aria-label={`Switch to ${locale === "id" ? "English" : "Bahasa Indonesia"}`}
    >
      <motion.span
        key={locale}
        className="text-sm font-bold"
        initial={{ y: -8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {locale === "id" ? "\ud83c\uddee\ud83c\uddea ID" : "\ud83c\uddec\ud83c\udde7 EN"}
      </motion.span>
    </button>
  );
}
