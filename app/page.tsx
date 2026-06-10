"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import StarCounter from "@/components/ui/StarCounter";
import ProfileSwitcher from "@/components/ProfileSwitcher";
import MuteButton from "@/components/MuteButton";
import CalmModeToggle from "@/components/CalmModeToggle";
import { useAppStore } from "@/store/useAppStore";
import { playPop } from "@/lib/sounds";

const beginnerGames = [
  { emoji: "\ud83d\udcda", label: "Kartu Kata", href: "/kartu-kata", bg: "bg-yellow-200", desc: "Lihat dan dengar kata baru" },
  { emoji: "\ud83c\udfaf", label: "Tebak Gambar", href: "/tebak-gambar", bg: "bg-pink-200", desc: "Cocokkan gambar dengan suara" },
  { emoji: "\ud83d\udd24", label: "Suku Kata", href: "/suku-kata", bg: "bg-blue-200", desc: "Belajar merangkai suku kata" },
];

const advancedGames = [
  { emoji: "\ud83c\udfa4", label: "Ayo Ngomong", href: "/ayo-ngomong", bg: "bg-purple-200", desc: "Latihan ucapkan kata" },
  { emoji: "\ud83d\udd4c", label: "Islami", href: "/islami", bg: "bg-emerald-200", desc: "Hijaiyah, doa, asmaul husna" },
  { emoji: "\ud83d\udd0a", label: "Tebak Suara", href: "/tebak-suara", bg: "bg-teal-200", desc: "Tebak kata dari suara" },
  { emoji: "\ud83e\udde9", label: "Susun Kalimat", href: "/susun-kalimat", bg: "bg-orange-200", desc: "Susun kata jadi kalimat" },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "tween" as const, duration: 0.25 },
  },
};

export default function HomePage() {
  const updateStreak = useAppStore((s) => s.updateStreak);
  const startSession = useAppStore((s) => s.startSession);
  const dailyStreak = useAppStore((s) => s.dailyStreak);
  const currentLevel = useAppStore((s) => s.currentLevel);

  useEffect(() => {
    updateStreak();
    startSession();
  }, [updateStreak, startSession]);

  return (
    <motion.div
      className="min-h-screen px-4 py-6 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ProfileSwitcher />
          <Link href="/pendamping">
            <motion.button
              className="flex items-center gap-1.5 bg-white/80 rounded-full px-3 py-2 shadow-md border-2 border-gray-200 text-sm font-heading min-h-[44px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={playPop}
            >
              <span className="text-lg">{"\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67"}</span>
              <span className="hidden sm:inline">Pendamping</span>
            </motion.button>
          </Link>
        </div>

        <div className="flex items-center gap-1.5">
          <CalmModeToggle />
          <MuteButton />
          {dailyStreak > 0 && (
            <motion.div
              className="flex items-center gap-1 bg-orange-100 rounded-full px-3 py-1.5 shadow-md border-2 border-orange-300"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <span className="text-xl">{"\ud83d\udd25"}</span>
              <span className="font-heading text-lg font-bold text-orange-700">
                {dailyStreak}
              </span>
            </motion.div>
          )}
          <StarCounter />
        </div>
      </div>

      {/* Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground leading-tight">
          Ayo Belajar Bicara! {"\ud83c\udf1f"}
        </h1>
        <motion.div
          className="mt-3 inline-flex items-center gap-2 bg-white/70 rounded-full px-4 py-1.5 shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-sm font-body text-foreground/70">
            Level {currentLevel}
          </span>
          <div className="flex gap-0.5">
            {Array.from({ length: currentLevel }).map((_, i) => (
              <span key={i} className="text-yellow-500 text-sm">{"\u2b50"}</span>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Mulai Belajar Section */}
      <div className="max-w-lg mx-auto mb-8">
        <motion.div
          className="flex items-center gap-2 mb-3 px-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-lg">{"\ud83c\udf1f"}</span>
          <h2 className="font-heading text-base font-semibold text-foreground/70">
            Mulai Belajar
          </h2>
          <span className="font-body text-[10px] bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-semibold">
            Pemula
          </span>
        </motion.div>
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {beginnerGames.map((item) => (
            <Link key={item.href} href={item.href} className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)]">
              <motion.div
                className={`${item.bg} rounded-3xl p-4 flex flex-col items-center justify-center gap-1.5 shadow-lg border-2 border-white/50 cursor-pointer min-h-[130px] h-full`}
                variants={cardVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={playPop}
              >
                <span className="text-4xl sm:text-5xl leading-none">{item.emoji}</span>
                <span className="font-heading text-base sm:text-lg text-center text-foreground/90">
                  {item.label}
                </span>
                <span className="font-body text-[10px] text-foreground/50 text-center leading-tight">
                  {item.desc}
                </span>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>

      {/* Tantangan Section */}
      <div className="max-w-lg mx-auto">
        <motion.div
          className="flex items-center gap-2 mb-3 px-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
        >
          <span className="text-lg">{"\ud83c\udf96\ufe0f"}</span>
          <h2 className="font-heading text-base font-semibold text-foreground/70">
            Tantangan
          </h2>
          <span className="font-body text-[10px] bg-orange-100 text-orange-700 rounded-full px-2 py-0.5 font-semibold">
            Lanjutan
          </span>
        </motion.div>
        <motion.div
          className="flex flex-wrap justify-center gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {advancedGames.map((item) => (
            <Link key={item.href} href={item.href} className="w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)]">
              <motion.div
                className={`${item.bg} rounded-3xl p-4 flex flex-col items-center justify-center gap-1.5 shadow-lg border-2 border-white/50 cursor-pointer min-h-[130px] h-full`}
                variants={cardVariants}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={playPop}
              >
                <span className="text-4xl sm:text-5xl leading-none">{item.emoji}</span>
                <span className="font-heading text-base sm:text-lg text-center text-foreground/90">
                  {item.label}
                </span>
                <span className="font-body text-[10px] text-foreground/50 text-center leading-tight">
                  {item.desc}
                </span>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
