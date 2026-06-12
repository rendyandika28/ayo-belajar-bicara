"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { THEMES } from "@/lib/themes";
import { useAppStore } from "@/store/useAppStore";

export default function ThemePicker() {
  const currentTheme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const [open, setOpen] = useState(false);

  const activeTheme = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-2 shadow-md border-2 border-gray-200 text-sm font-heading min-h-[44px]"
        aria-label="Pilih tema tampilan"
      >
        <span className="text-lg" aria-hidden="true">{activeTheme.emoji}</span>
        <span className="hidden sm:inline text-xs">Tema</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="theme-picker-title"
            >
              <h2
                id="theme-picker-title"
                className="font-heading text-xl font-bold text-foreground text-center mb-2"
              >
                Pilih Tema
              </h2>
              <p className="font-body text-xs text-foreground/60 text-center mb-4">
                Pilih tampilan yang paling cocok untuk si kecil
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      setTheme(theme.id);
                      setOpen(false);
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 min-h-[80px] transition-colors ${
                      currentTheme === theme.id
                        ? "border-purple-400 ring-2 ring-purple-200"
                        : "border-gray-200"
                    } ${theme.backgroundClass}`}
                    aria-pressed={currentTheme === theme.id}
                    aria-label={`Pilih tema ${theme.name}`}
                  >
                    <span className="text-3xl" aria-hidden="true">{theme.emoji}</span>
                    <span className="font-heading text-sm font-bold text-foreground">
                      {theme.name}
                    </span>
                    <span className="font-body text-[10px] text-foreground/60 text-center leading-tight">
                      {theme.description}
                    </span>
                  </button>
                ))}
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-full text-foreground/50 font-body text-sm py-2"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
