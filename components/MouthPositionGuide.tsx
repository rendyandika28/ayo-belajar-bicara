"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MouthShape from "@/components/MouthShape";
import { speak, speakSyllable } from "@/lib/speech";
import { playPop } from "@/lib/sounds";

const PHONEME_INFO: Record<string, { label: string; description: string; tip: string; example: string }> = {
  r: {
    label: "Bunyi /R/",
    description: "Bibir bulat, ujung lidah naik ke langit-langit",
    tip: "Coba ucapkan 'aaa' lalu tekuk lidah ke belakang atas",
    example: "rumah",
  },
  s: {
    label: "Bunyi /S/",
    description: "Gigi atas dan bawah rapat, lidah di belakang gigi",
    tip: "Senyum tipis dan hembuskan udara lewat gigi",
    example: "susu",
  },
  l: {
    label: "Bunyi /L/",
    description: "Ujung lidah sentuh langit-langit di belakang gigi",
    tip: "Letakkan ujung lidah di belakang gigi atas",
    example: "lima",
  },
  ng: {
    label: "Bunyi /NG/",
    description: "Lidah di belakang mulut, bunyi keluar lewat hidung",
    tip: "Bunyikan 'n' tapi tahan di belakang mulut",
    example: "anjing",
  },
};

export default function MouthPositionGuide({ phoneme = "r" as keyof typeof PHONEME_INFO }) {
  const [open, setOpen] = useState(false);
  const [currentPhoneme, setCurrentPhoneme] = useState<keyof typeof PHONEME_INFO>(phoneme);
  const info = PHONEME_INFO[currentPhoneme];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 font-heading text-xs px-3 py-1.5 rounded-full border-2 border-purple-200 min-h-[32px]"
        aria-label="Lihat posisi mulut untuk bunyi ini"
      >
        <span aria-hidden="true">{"\ud83d\udc41\ufe0f"}</span>
        <span>Posisi Mulut</span>
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
              aria-labelledby="mouth-guide-title"
            >
              <div className="text-center mb-4">
                <h3 id="mouth-guide-title" className="font-heading text-xl font-bold text-foreground">
                  Posisi Mulut
                </h3>
                <p className="font-body text-xs text-foreground/60 mt-1">
                  Pilih bunyi untuk melihat posisi mulut
                </p>
              </div>

              <div className="flex gap-2 justify-center mb-4 flex-wrap">
                {Object.keys(PHONEME_INFO).map((key) => (
                  <button
                    key={key}
                    onClick={() => setCurrentPhoneme(key as keyof typeof PHONEME_INFO)}
                    className={`px-3 py-1.5 rounded-full font-heading text-sm min-h-[36px] border-2 ${
                      currentPhoneme === key
                        ? "bg-purple-500 text-white border-purple-500"
                        : "bg-white border-gray-200 text-foreground/70"
                    }`}
                    aria-pressed={currentPhoneme === key}
                  >
                    /{key.toUpperCase()}/
                  </button>
                ))}
              </div>

              <div className="flex justify-center mb-3">
                <MouthShape phoneme={currentPhoneme} size={140} />
              </div>

              <div className="bg-purple-50 rounded-2xl p-4 mb-4">
                <p className="font-heading text-sm font-bold text-foreground mb-1">
                  {info.label}
                </p>
                <p className="font-body text-xs text-foreground/70 mb-2">
                  {info.description}
                </p>
                <p className="font-body text-xs text-purple-700 italic">
                  {"\ud83d\udca1"} {info.tip}
                </p>
              </div>

              <div className="flex gap-2 justify-center mb-3">
                <button
                  onClick={() => {
                    playPop();
                    speak(info.example, { rate: 0.5 });
                  }}
                  className="bg-purple-500 text-white font-heading text-sm px-4 py-2 rounded-full min-h-[44px] flex items-center gap-1"
                >
                  <span aria-hidden="true">{"\ud83d\udd0a"}</span>
                  Dengar Contoh
                </button>
                <button
                  onClick={() => {
                    playPop();
                    const firstSyllable = info.example.slice(0, 2);
                    speakSyllable(firstSyllable);
                  }}
                  className="bg-white border-2 border-purple-300 text-purple-700 font-heading text-sm px-4 py-2 rounded-full min-h-[44px] flex items-center gap-1"
                >
                  <span aria-hidden="true">{"\ud83d\udcdd"}</span>
                  Suku Kata
                </button>
              </div>

              <p className="text-center font-body text-sm text-foreground/70 mb-3">
                Contoh: <strong>{info.example}</strong>
              </p>

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
