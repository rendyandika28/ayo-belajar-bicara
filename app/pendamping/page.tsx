"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Word } from "@/data/words";

const categories = [
  "hewan",
  "buah",
  "benda",
  "keluarga",
  "aktivitas",
  "makanan",
  "islami",
] as const;

const levelDescriptions = [
  { level: 1, label: "Mengenal Suara", icon: "\uD83D\uDC42" },
  { level: 2, label: "Meniru Suku Kata", icon: "\uD83D\uDDE3\uFE0F" },
  { level: 3, label: "Gabung Suku Kata", icon: "\uD83D\uDD17" },
  { level: 4, label: "Kata Utuh + Kalimat", icon: "\uD83D\uDCAC" },
];

function getDayLabels(): string[] {
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const today = new Date().getDay();
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const dayIndex = (today - i + 7) % 7;
    labels.push(days[dayIndex]);
  }
  return labels;
}

function getLast7DaysDates(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function PendampingPage() {
  const todayStars = useAppStore((s) => s.todayStars);
  const wordsLearned = useAppStore((s) => s.wordsLearned);
  const sessionsCompleted = useAppStore((s) => s.sessionsCompleted);
  const todayMinutes = useAppStore((s) => s.todayMinutes);
  const dailyStreak = useAppStore((s) => s.dailyStreak);
  const lastActiveDate = useAppStore((s) => s.lastActiveDate);
  const currentLevel = useAppStore((s) => s.currentLevel);
  const hijaiyahLearned = useAppStore((s) => s.hijaiyahLearned);
  const doasAttempted = useAppStore((s) => s.doasAttempted);
  const asmaulHusnaLearned = useAppStore((s) => s.asmaulHusnaLearned);
  const weeklyMinutes = useAppStore((s) => s.weeklyMinutes);
  const customWords = useAppStore((s) => s.customWords);
  const sessionDuration = useAppStore((s) => s.sessionDuration);
  const addCustomWord = useAppStore((s) => s.addCustomWord);
  const removeCustomWord = useAppStore((s) => s.removeCustomWord);
  const setSessionDuration = useAppStore((s) => s.setSessionDuration);
  const resetProgress = useAppStore((s) => s.resetProgress);

  // Custom word form state
  const [emoji, setEmoji] = useState("");
  const [kata, setKata] = useState("");
  const [sukuKata, setSukuKata] = useState("");
  const [kategori, setKategori] = useState<Word["category"]>("benda");
  const [kesulitan, setKesulitan] = useState<1 | 2 | 3>(1);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Weekly chart data
  const dayLabels = getDayLabels();
  const maxMinutes = Math.max(...weeklyMinutes, 1);

  // Streak calendar: last 7 days
  const last7Days = getLast7DaysDates();
  const streakDays = last7Days.map((date) => {
    if (!lastActiveDate) return false;
    const lastActive = new Date(lastActiveDate);
    const checkDate = new Date(date);
    const diffDays = Math.floor(
      (lastActive.getTime() - checkDate.getTime()) / 86400000
    );
    return diffDays >= 0 && diffDays < dailyStreak;
  });

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emoji.trim() || !kata.trim() || !sukuKata.trim()) return;

    const newWord: Word = {
      id: "custom-" + Date.now(),
      emoji: emoji.trim(),
      word: kata.trim().toLowerCase(),
      syllables: sukuKata
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      category: kategori,
      difficulty: kesulitan,
    };

    addCustomWord(newWord);
    setEmoji("");
    setKata("");
    setSukuKata("");
    setKategori("benda");
    setKesulitan(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 pb-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <motion.button
              className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md border border-gray-200 text-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {"\uD83C\uDFE0"}
            </motion.button>
          </Link>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-800">
            Dashboard Pendamping {"\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67"}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 1: Progres Hari Ini */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-2"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.05 }}
          >
            <h2 className="font-heading text-lg font-semibold text-gray-700 mb-4">
              Progres Hari Ini
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
              <div className="bg-yellow-50 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl mb-1">{"\u2B50"}</div>
                <div className="font-heading text-xl sm:text-2xl font-bold text-yellow-600">
                  {todayStars}
                </div>
                <div className="font-body text-[10px] sm:text-xs text-gray-500">
                  Bintang Hari Ini
                </div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl mb-1">{"\uD83D\uDCDA"}</div>
                <div className="font-heading text-xl sm:text-2xl font-bold text-blue-600">
                  {wordsLearned.length}
                </div>
                <div className="font-body text-[10px] sm:text-xs text-gray-500">
                  Kata Dipelajari
                </div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl mb-1">{"\u2705"}</div>
                <div className="font-heading text-xl sm:text-2xl font-bold text-green-600">
                  {sessionsCompleted}
                </div>
                <div className="font-body text-[10px] sm:text-xs text-gray-500">
                  Sesi Selesai
                </div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl mb-1">{"\u23F1\uFE0F"}</div>
                <div className="font-heading text-xl sm:text-2xl font-bold text-purple-600">
                  {todayMinutes}
                </div>
                <div className="font-body text-[10px] sm:text-xs text-gray-500">
                  Waktu Belajar (menit)
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <div className="text-lg mb-0.5">{"\u0627"}</div>
                <div className="font-heading text-lg font-bold text-emerald-600">
                  {hijaiyahLearned.length}/29
                </div>
                <div className="font-body text-xs text-gray-500">Hijaiyah</div>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center">
                <div className="text-lg mb-0.5">{"\uD83E\uDD32"}</div>
                <div className="font-heading text-lg font-bold text-amber-600">
                  {doasAttempted.length}/10
                </div>
                <div className="font-body text-xs text-gray-500">Doa</div>
              </div>
              <div className="bg-teal-50 rounded-xl p-3 text-center">
                <div className="text-lg mb-0.5">{"\u2728"}</div>
                <div className="font-heading text-lg font-bold text-teal-600">
                  {asmaulHusnaLearned.length}/10
                </div>
                <div className="font-body text-xs text-gray-500">
                  Asmaul Husna
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 2: Daily Streak */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-heading text-lg font-semibold text-gray-700 mb-4">
              Daily Streak
            </h2>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-4xl">{"\uD83D\uDD25"}</span>
              <div>
                <span className="font-heading text-3xl font-bold text-orange-500">
                  {dailyStreak}
                </span>
                <span className="font-body text-sm text-gray-500 ml-2">
                  hari berturut-turut
                </span>
              </div>
            </div>
            <div className="flex justify-between gap-2">
              {last7Days.map((date, i) => {
                const dayName = dayLabels[i];
                const isActive = streakDays[i];
                return (
                  <div key={date} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-heading font-semibold ${
                        isActive
                          ? "bg-green-400 text-white"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {isActive ? "\u2713" : ""}
                    </div>
                    <span className="font-body text-xs text-gray-500">
                      {dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Section 3: Statistik Mingguan */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.15 }}
          >
            <h2 className="font-heading text-lg font-semibold text-gray-700 mb-4">
              Waktu Belajar Mingguan (menit)
            </h2>
            <div className="flex items-end justify-between gap-2 h-40 sm:h-48">
              {weeklyMinutes.map((minutes, index) => {
                const heightPct = maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;
                return (
                  <div key={dayLabels[index]} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                    {minutes > 0 && (
                      <span className="font-body text-xs text-gray-500">{minutes}</span>
                    )}
                    <div
                      className="w-full max-w-[40px] bg-blue-400 rounded-t-md transition-all duration-500"
                      style={{ height: `${Math.max(heightPct, minutes > 0 ? 8 : 0)}%` }}
                    />
                    <span className="font-body text-xs text-gray-500">{dayLabels[index]}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Section 4: Level Tracker */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
          >
            <h2 className="font-heading text-lg font-semibold text-gray-700 mb-4">
              Level Tracker
            </h2>
            <div className="space-y-3">
              {levelDescriptions.map(({ level, label, icon }) => {
                const isCurrent = level === currentLevel;
                const isUnlocked = level <= currentLevel;
                const isLocked = level > currentLevel;

                return (
                  <div
                    key={level}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-colors ${
                      isCurrent
                        ? "bg-blue-100 border-blue-400"
                        : isUnlocked
                        ? "bg-white border-gray-200"
                        : "bg-gray-100 border-gray-200 opacity-60"
                    }`}
                  >
                    <span className="text-2xl">{icon}</span>
                    <div className="flex-1">
                      <div
                        className={`font-heading text-sm font-semibold ${
                          isLocked ? "text-gray-400" : "text-gray-700"
                        }`}
                      >
                        Level {level}
                      </div>
                      <div
                        className={`font-body text-xs ${
                          isLocked ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {label}
                      </div>
                    </div>
                    <span className="text-lg">
                      {isLocked
                        ? "\uD83D\uDD12"
                        : isCurrent
                        ? "\uD83D\uDC49"
                        : "\u2705"}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Section 5: Progres Islami */}
          <motion.div
            className="bg-emerald-50 rounded-2xl p-6 shadow-sm border border-emerald-100"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.25 }}
          >
            <h2 className="font-heading text-lg font-semibold text-emerald-800 mb-4">
              Progres Islami
            </h2>
            <div className="space-y-4">
              {/* Hijaiyah */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-sm text-gray-700">
                    Huruf Hijaiyah
                  </span>
                  <span className="font-heading text-sm font-semibold text-gray-600">
                    {hijaiyahLearned.length}/29
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${(hijaiyahLearned.length / 29) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Doa */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-sm text-gray-700">
                    Doa Harian
                  </span>
                  <span className="font-heading text-sm font-semibold text-gray-600">
                    {doasAttempted.length}/10
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${(doasAttempted.length / 10) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Asmaul Husna */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-body text-sm text-gray-700">
                    Asmaul Husna
                  </span>
                  <span className="font-heading text-sm font-semibold text-gray-600">
                    {asmaulHusnaLearned.length}/10
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                    style={{
                      width: `${(asmaulHusnaLearned.length / 10) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section 6: Atur Kata Custom */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-2"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-heading text-lg font-semibold text-gray-700 mb-4">
              Tambah Kata Baru
            </h2>
            <form onSubmit={handleAddWord} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-body text-sm text-gray-600 block mb-1">
                    Emoji
                  </label>
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    placeholder="contoh: \uD83C\uDF4E"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="font-body text-sm text-gray-600 block mb-1">
                    Kata
                  </label>
                  <input
                    type="text"
                    value={kata}
                    onChange={(e) => setKata(e.target.value)}
                    placeholder="contoh: apel"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="font-body text-sm text-gray-600 block mb-1">
                    Suku Kata
                  </label>
                  <input
                    type="text"
                    value={sukuKata}
                    onChange={(e) => setSukuKata(e.target.value)}
                    placeholder="pisahkan dengan koma, contoh: a, pel"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-body text-sm text-gray-600 block mb-1">
                      Kategori
                    </label>
                    <select
                      value={kategori}
                      onChange={(e) =>
                        setKategori(e.target.value as Word["category"])
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-body text-sm text-gray-600 block mb-1">
                      Kesulitan
                    </label>
                    <select
                      value={kesulitan}
                      onChange={(e) =>
                        setKesulitan(Number(e.target.value) as 1 | 2 | 3)
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>
                </div>
              </div>
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white font-heading font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
              >
                Tambah Kata
              </button>
            </form>

            {/* Custom words list */}
            {customWords.length > 0 && (
              <div className="mt-6">
                <h3 className="font-heading text-sm font-semibold text-gray-600 mb-3">
                  Kata Custom ({customWords.length})
                </h3>
                <div className="space-y-2">
                  {customWords.map((word) => (
                    <div
                      key={word.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{word.emoji}</span>
                        <div>
                          <span className="font-heading text-sm font-semibold text-gray-700">
                            {word.word}
                          </span>
                          <span className="font-body text-xs text-gray-400 ml-2">
                            [{word.syllables.join(" - ")}]
                          </span>
                        </div>
                        <span className="font-body text-xs text-gray-400 bg-gray-200 rounded-full px-2 py-0.5">
                          {word.category}
                        </span>
                      </div>
                      <button
                        onClick={() => removeCustomWord(word.id)}
                        className="text-red-400 hover:text-red-600 transition-colors text-sm font-body px-2 py-1"
                        title="Hapus kata"
                      >
                        Hapus
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Section 7: Atur Timer Sesi */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 md:col-span-2"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.35 }}
          >
            <h2 className="font-heading text-lg font-semibold text-gray-700 mb-4">
              Durasi Sesi Belajar
            </h2>
            <div className="flex items-center gap-6">
              <input
                type="range"
                min={3}
                max={15}
                step={1}
                value={sessionDuration}
                onChange={(e) => setSessionDuration(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-4 py-2 min-w-[100px] justify-center">
                <span className="font-heading text-2xl font-bold text-blue-600">
                  {sessionDuration}
                </span>
                <span className="font-body text-sm text-gray-500">menit</span>
              </div>
            </div>
            <div className="flex justify-between mt-2 px-1">
              <span className="font-body text-xs text-gray-400">3 menit</span>
              <span className="font-body text-xs text-gray-400">15 menit</span>
            </div>
          </motion.div>

          {/* Section 8: Reset Progress */}
          <motion.div
            className="bg-white rounded-2xl p-6 shadow-sm border border-red-100 md:col-span-2"
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.4 }}
          >
            <h2 className="font-heading text-lg font-semibold text-gray-700 mb-2">
              Reset Progres
            </h2>
            <p className="font-body text-sm text-gray-500 mb-4">
              Menghapus semua data belajar, bintang, streak, dan kata custom.
              Tindakan ini tidak bisa dibatalkan.
            </p>
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="bg-red-100 hover:bg-red-200 text-red-600 font-heading font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
              >
                Reset Semua Progres
              </button>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="font-body text-sm text-red-700 mb-3">
                  Yakin ingin menghapus semua progres? Data tidak bisa dikembalikan.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      resetProgress();
                      setShowResetConfirm(false);
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white font-heading font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
                  >
                    Ya, Reset
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-heading font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
                  >
                    Batal
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
