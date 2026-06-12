"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { getDailyWord } from "@/lib/dailyWord";
import { speak } from "@/lib/speech";
import { playPop } from "@/lib/sounds";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export default function WordOfTheDay() {
  const dailyWord =
    useAppStore((s) => s.dailyWord) ?? { date: "", wordId: "", completed: false };
  const wordsLearned = useAppStore((s) => s.wordsLearned);
  const completeDailyWord = useAppStore((s) => s.completeDailyWord);
  const recordGamePlay = useAppStore((s) => s.recordGamePlay);
  const initDailyWord = useAppStore((s) => s.initDailyWord);

  const today = getToday();
  const showNew = dailyWord.date !== today;
  const word = showNew
    ? getDailyWord(today, wordsLearned)
    : getDailyWord(dailyWord.date, wordsLearned);
  const isCompleted = !showNew && dailyWord.completed && dailyWord.wordId === word.id;

  useEffect(() => {
    if (showNew && word.id) {
      initDailyWord(word.id, today);
    }
  }, [showNew, word.id, today, initDailyWord]);

  const handleSpeak = () => {
    playPop();
    speak(word.word, { rate: 0.7 });
  };

  const handleComplete = () => {
    completeDailyWord();
    recordGamePlay("kata-hari-ini");
  };

  return (
    <motion.div
      className="max-w-lg mx-auto mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <div className="flex items-center gap-2 mb-3 px-1">
        <span className="text-lg" aria-hidden="true">{"\ud83c\udf1f"}</span>
        <h2 className="font-heading text-base font-semibold text-foreground/70">
          Kata Hari Ini
        </h2>
        {isCompleted && (
          <span className="font-body text-[10px] bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-semibold">
            Selesai
          </span>
        )}
      </div>
      <motion.div
        className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4 shadow-md border-2 border-yellow-200 flex items-center gap-4"
        whileHover={{ scale: 1.01 }}
      >
        <div className="text-6xl flex-shrink-0" aria-hidden="true">{word.emoji}</div>
        <div className="flex-1 min-w-0">
          <p className="font-heading text-2xl font-bold text-foreground leading-tight">
            {word.word}
          </p>
          <p className="font-body text-xs text-foreground/60 mt-1">
            {word.syllables.join(" - ")}
          </p>
          <div className="flex gap-2 mt-2 flex-wrap">
            <button
              onClick={handleSpeak}
              className="bg-white/80 hover:bg-white text-foreground font-heading text-xs px-3 py-1.5 rounded-full shadow-sm border border-white min-h-[32px]"
              aria-label="Dengarkan kata hari ini"
            >
              {"\ud83d\udd0a"} Dengar
            </button>
            {!isCompleted ? (
              <button
                onClick={handleComplete}
                className="bg-yellow-400 hover:bg-yellow-500 text-foreground font-heading text-xs px-3 py-1.5 rounded-full shadow-sm min-h-[32px]"
                aria-label="Tandai sudah dipelajari, dapat 2 bintang"
              >
                {"\u2b50"} +2 Bintang
              </button>
            ) : (
              <Link
                href="/kartu-kata"
                className="bg-white/80 hover:bg-white text-foreground font-heading text-xs px-3 py-1.5 rounded-full shadow-sm border border-white min-h-[32px] inline-flex items-center"
              >
                {"\ud83d\udcda"} Latih lagi
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
