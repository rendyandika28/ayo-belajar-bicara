"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { words, Word } from "@/data/words";
import { getPhoneticTags } from "@/lib/phonetics";
import { getMasteryLevel, SRState } from "@/lib/spacedRepetition";

type WordCategory = Word["category"];

const CATEGORIES: WordCategory[] = [
  "hewan", "buah", "benda", "keluarga", "aktivitas", "makanan",
  "warna", "angka", "tubuh", "alam", "peralatan",
];

const SOUND_TAGS = ["r", "s", "l", "ng", "ny", "kh", "sy"] as const;

type ViewMode = "parent" | "therapist";

export default function TherapistDashboard() {
  const [mode, setMode] = useState<ViewMode>("parent");
  const wordsLearned = useAppStore((s) => s.wordsLearned);
  const srState = useAppStore((s) => s.srState);
  const gameStats = useAppStore((s) => s.gameStats);
  const sessionsCompleted = useAppStore((s) => s.sessionsCompleted);
  const totalStars = useAppStore((s) => s.totalStars);

  if (mode === "parent") {
    return (
      <div className="flex items-center gap-2 mb-3">
        <span className="font-body text-xs text-foreground/60">Tampilan:</span>
        <button
          onClick={() => setMode("parent")}
          className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-heading text-xs min-h-[32px]"
          aria-pressed={true}
        >
          Orang Tua
        </button>
        <button
          onClick={() => setMode("therapist")}
          className="px-3 py-1 rounded-full bg-gray-100 text-foreground/60 font-heading text-xs min-h-[32px] hover:bg-blue-100 hover:text-blue-700"
          aria-pressed={false}
        >
          Terapis
        </button>
      </div>
    );
  }

  // Therapist view
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-body text-xs text-foreground/60">Tampilan:</span>
        <button
          onClick={() => setMode("parent")}
          className="px-3 py-1 rounded-full bg-gray-100 text-foreground/60 font-heading text-xs min-h-[32px] hover:bg-purple-100 hover:text-purple-700"
          aria-pressed={false}
        >
          Orang Tua
        </button>
        <button
          onClick={() => setMode("therapist")}
          className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-heading text-xs min-h-[32px]"
          aria-pressed={true}
        >
          Terapis
        </button>
      </div>

      <TherapistContent
        wordsLearned={wordsLearned}
        srState={srState}
        gameStats={gameStats}
        sessionsCompleted={sessionsCompleted}
        totalStars={totalStars}
      />
    </motion.div>
  );
}

function TherapistContent({
  wordsLearned,
  srState,
  gameStats,
  sessionsCompleted,
  totalStars,
}: {
  wordsLearned: string[];
  srState: Record<string, SRState>;
  gameStats: Record<string, number>;
  sessionsCompleted: number;
  totalStars: number;
}) {
  // Mastery by category
  const categoryStats = useMemo(() => {
    const result: Record<string, { total: number; mastered: number; learning: number; familiar: number; new: number }> = {};
    for (const cat of CATEGORIES) {
      const catWords = words.filter((w) => w.category === cat);
      let mastered = 0, learning = 0, familiar = 0, newCount = 0;
      for (const w of catWords) {
        const level = getMasteryLevel(srState[w.id]);
        if (level === "mastered") mastered++;
        else if (level === "learning") learning++;
        else if (level === "familiar") familiar++;
        else newCount++;
      }
      result[cat] = { total: catWords.length, mastered, learning, familiar, new: newCount };
    }
    return result;
  }, [srState]);

  // Sound mastery
  const soundStats = useMemo(() => {
    const result: Record<string, { total: number; mastered: number }> = {};
    for (const tag of SOUND_TAGS) {
      const tagWords = words.filter((w) => getPhoneticTags(w).includes(tag));
      const mastered = tagWords.filter((w) => {
        const level = getMasteryLevel(srState[w.id]);
        return level === "mastered";
      }).length;
      result[tag] = { total: tagWords.length, mastered };
    }
    return result;
  }, [srState]);

  // All words status
  const allWordStatus = useMemo(() => {
    return words.map((w) => ({
      word: w,
      level: getMasteryLevel(srState[w.id]),
      isLearned: wordsLearned.includes(w.id),
    }));
  }, [wordsLearned, srState]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200">
      <h2 className="font-heading text-base font-bold text-blue-900 mb-4 flex items-center gap-2">
        <span aria-hidden="true">{"\ud83c\udfe5"}</span>
        Mode Terapis (Clinical View)
      </h2>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="font-heading text-2xl font-bold text-blue-700">{totalStars}</p>
          <p className="font-body text-[10px] text-foreground/60">Total Bintang</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="font-heading text-2xl font-bold text-blue-700">{wordsLearned.length}</p>
          <p className="font-body text-[10px] text-foreground/60">Kata Dikuasai</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="font-heading text-2xl font-bold text-blue-700">{sessionsCompleted}</p>
          <p className="font-body text-[10px] text-foreground/60">Sesi</p>
        </div>
        <div className="bg-white rounded-xl p-3 text-center">
          <p className="font-heading text-2xl font-bold text-blue-700">
            {Object.keys(gameStats).length}
          </p>
          <p className="font-body text-[10px] text-foreground/60">Game Dimainkan</p>
        </div>
      </div>

      {/* Category breakdown */}
      <h3 className="font-heading text-sm font-semibold text-blue-900 mb-2">
        Per Kategori
      </h3>
      <div className="space-y-1.5 mb-4">
        {Object.entries(categoryStats).map(([cat, stats]) => {
          const masteredPct = stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0;
          return (
            <div key={cat} className="bg-white rounded-lg p-2">
              <div className="flex items-center justify-between mb-1">
                <span className="font-body text-xs capitalize">{cat}</span>
                <span className="font-body text-[10px] text-foreground/60">
                  {stats.mastered}/{stats.total} ({Math.round(masteredPct)}%)
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-400 to-green-400"
                  style={{ width: `${masteredPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sound mastery */}
      <h3 className="font-heading text-sm font-semibold text-blue-900 mb-2">
        Bunyi Sulit — Mastery
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
        {Object.entries(soundStats).map(([tag, stats]) => {
          const masteredPct = stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0;
          const color =
            masteredPct >= 70
              ? "bg-green-100 text-green-700"
              : masteredPct >= 40
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700";
          return (
            <div
              key={tag}
              className={`${color} rounded-lg p-2 text-center`}
              title={`${stats.mastered} dari ${stats.total} kata mastered`}
            >
              <p className="font-heading text-base font-bold">/{tag.toUpperCase()}/</p>
              <p className="font-body text-[10px]">{Math.round(masteredPct)}%</p>
            </div>
          );
        })}
      </div>

      {/* Word grid (compact) */}
      <h3 className="font-heading text-sm font-semibold text-blue-900 mb-2">
        Detail Kata ({allWordStatus.length} total)
      </h3>
      <div className="bg-white rounded-lg p-2 max-h-60 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {allWordStatus.map(({ word, level }) => {
            const levelColor =
              level === "mastered"
                ? "bg-green-100 text-green-700"
                : level === "familiar"
                ? "bg-blue-100 text-blue-700"
                : level === "learning"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-500";
            return (
              <div
                key={word.id}
                className={`${levelColor} rounded px-2 py-1 flex items-center gap-1`}
                title={`${word.word} - ${level}`}
              >
                <span className="text-sm flex-shrink-0" aria-hidden="true">{word.emoji}</span>
                <span className="font-body text-[10px] truncate flex-1">{word.word}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p className="font-body text-[10px] text-blue-700/70 mt-3 italic text-center">
        Tampilan klinis untuk Terapis Wicara. Data berdasarkan algoritma Spaced Repetition.
      </p>
    </div>
  );
}
