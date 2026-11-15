"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { levelProgress } from "@/lib/levels";

const NOT_GAMES = ["/", "/pendamping", "/offline"];
const SESSION_KEY = "levelIntroShown";

type Notice = { kind: "intro" | "up"; title: string; detail: string };

/**
 * Non-blocking level toast on game screens: an intro once per session, and a
 * "level up" once per level. A toast, not a modal, so it never stacks on GameTutorial.
 */
export default function LevelNotice() {
  const pathname = usePathname();
  const words = useAppStore((s) => s.wordsLearned.length);
  const currentLevel = useAppStore((s) => s.currentLevel);
  const seenLevel = useAppStore((s) => s.seenLevel);
  const setSeenLevel = useAppStore((s) => s.setSeenLevel);
  const [notice, setNotice] = useState<Notice | null>(null);

  const { current, next, need } = levelProgress(words, currentLevel);
  const isGame = !NOT_GAMES.includes(pathname);

  useEffect(() => {
    if (!isGame) return;
    const detail = next ? `${need} kata lagi menuju Level ${next.level}.` : "Level tertinggi. Terus berlatih!";
    if (seenLevel > 0 && current.level > seenLevel) {
      setSeenLevel(current.level);
      setNotice({ kind: "up", title: `Hore! Naik ke Level ${current.level}: ${current.name}`, detail });
      return;
    }
    let shown = false;
    try { shown = sessionStorage.getItem(SESSION_KEY) === "1"; } catch {}
    if (seenLevel === 0 || !shown) {
      if (seenLevel === 0) setSeenLevel(current.level);
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
      setNotice({ kind: "intro", title: `Ayo mulai! Kamu di Level ${current.level}: ${current.name}`, detail });
    }
  }, [isGame, current.level, current.name, next, need, seenLevel, setSeenLevel]);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), notice.kind === "up" ? 6000 : 5000);
    return () => clearTimeout(t);
  }, [notice]);

  // Leaving games hides it.
  const visible = notice && isGame;

  return (
    <div className="fixed top-3 inset-x-0 z-[95] flex justify-center px-4 pointer-events-none" role="status" aria-live="polite">
      <AnimatePresence>
        {visible && (
          <motion.div
            key={notice.title}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto w-full max-w-sm flex items-start gap-3 rounded-2xl border px-4 py-3 ${notice.kind === "up" ? "bg-good-strong border-good-strong text-on-accent" : "bg-surface border-line text-ink"}`}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 mt-0.5 ${notice.kind === "up" ? "" : "text-accent-strong"}`}>
              <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.8Z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="font-heading text-lg font-semibold leading-snug">{notice.title}</p>
              <p className={`font-body text-sm mt-0.5 ${notice.kind === "up" ? "" : "text-ink-muted"}`}>{notice.detail}</p>
            </div>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Tutup"
              className="shrink-0 -mr-2 -mt-1 w-11 h-11 inline-flex items-center justify-center rounded-full transition-opacity hover:opacity-70"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
