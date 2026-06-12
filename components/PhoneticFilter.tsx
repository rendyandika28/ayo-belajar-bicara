"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PHONETIC_CATEGORIES,
  getWordsByPhonetic,
  PhoneticTag,
} from "@/lib/phonetics";

interface PhoneticFilterProps {
  active: string;
  onChange: (cat: string) => void;
}

export default function PhoneticFilter({ onChange }: PhoneticFilterProps) {
  const [open, setOpen] = useState(false);
  const [activePhonetic, setActivePhonetic] = useState<PhoneticTag | null>(null);

  const handlePhonetic = (tag: PhoneticTag) => {
    if (activePhonetic === tag) {
      setActivePhonetic(null);
      onChange("semua");
    } else {
      setActivePhonetic(tag);
      onChange(`phonetic:${tag}`);
    }
  };

  // Count available words per phonetic tag
  const counts = PHONETIC_CATEGORIES.map((cat) => ({
    ...cat,
    count: getWordsByPhonetic(cat.id).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="mb-4 -mx-4 px-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 font-heading text-sm text-foreground/70 hover:text-foreground"
        aria-expanded={open}
      >
        <span>{open ? "\u25be" : "\u25b8"}</span>
        <span>Latih Bunyi Spesifik</span>
        {activePhonetic && (
          <span className="bg-orange-100 text-orange-700 text-[10px] px-2 py-0.5 rounded-full font-semibold">
            {activePhonetic.toUpperCase()}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 overflow-x-auto pt-3 pb-1">
              {counts.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handlePhonetic(cat.id)}
                  className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border-2 min-h-[60px] min-w-[80px] transition-colors ${
                    activePhonetic === cat.id
                      ? "bg-orange-100 border-orange-400"
                      : "bg-white border-gray-200"
                  }`}
                  aria-pressed={activePhonetic === cat.id}
                  aria-label={`Filter kata dengan bunyi ${cat.label} - ${cat.count} kata tersedia`}
                >
                  <span className="text-lg" aria-hidden="true">{cat.emoji}</span>
                  <span className="font-heading text-xs font-bold text-foreground">
                    {cat.label}
                  </span>
                  <span className="font-body text-[10px] text-foreground/50">
                    {cat.count} kata
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
