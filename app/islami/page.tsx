"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import StarCounter from "@/components/ui/StarCounter";
import { useAppStore } from "@/store/useAppStore";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 20 },
  },
};

export default function IslamiPage() {
  const { hijaiyahLearned, doasAttempted, asmaulHusnaLearned } = useAppStore();

  const menuCards = [
    {
      icon: "ا",
      label: "Huruf Hijaiyah",
      href: "/islami/hijaiyah",
      subtitle: "Belajar 29 huruf hijaiyah",
      progress: `${hijaiyahLearned.length}/29 huruf`,
      bg: "bg-emerald-100",
      border: "border-emerald-300",
      progressColor: "bg-emerald-500",
      progressTrack: "bg-emerald-200",
      progressPercent: (hijaiyahLearned.length / 29) * 100,
      iconStyle: "font-amiri text-4xl" as const,
    },
    {
      icon: "\ud83e\udd32",
      label: "Doa Harian",
      href: "/islami/doa",
      subtitle: "Belajar doa sehari-hari",
      progress: `${doasAttempted.length}/10 doa`,
      bg: "bg-amber-50",
      border: "border-amber-300",
      progressColor: "bg-amber-500",
      progressTrack: "bg-amber-200",
      progressPercent: (doasAttempted.length / 10) * 100,
      iconStyle: "text-4xl" as const,
    },
    {
      icon: "\u2728",
      label: "Asmaul Husna",
      href: "/islami/asmaul-husna",
      subtitle: "99 nama Allah yang indah",
      progress: `${asmaulHusnaLearned.length}/10 nama`,
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      progressColor: "bg-emerald-400",
      progressTrack: "bg-emerald-100",
      progressPercent: (asmaulHusnaLearned.length / 10) * 100,
      iconStyle: "text-4xl" as const,
    },
  ];

  return (
    <motion.div
      className="islamic-pattern min-h-screen px-4 py-6 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/">
          <motion.button
            className="w-[52px] h-[52px] flex items-center justify-center bg-white/80 rounded-full shadow-md border-2 border-gray-200 text-2xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            aria-label="Kembali ke beranda"
          >
            {"\ud83c\udfe0"}
          </motion.button>
        </Link>

        <StarCounter />
      </div>

      {/* Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
      >
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-emerald-800 leading-tight">
          Belajar Islami {"\ud83d\udd4c"}
        </h1>
        <p className="mt-2 font-body text-emerald-600/80 text-sm">
          Yuk belajar agama Islam bersama!
        </p>
      </motion.div>

      {/* Menu Cards */}
      <motion.div
        className="flex flex-col gap-4 max-w-md mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {menuCards.map((card) => (
          <Link key={card.href} href={card.href}>
            <motion.div
              className={`${card.bg} ${card.border} rounded-3xl p-5 flex items-center gap-4 shadow-lg border-2 cursor-pointer min-h-[100px]`}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Icon */}
              <div className="w-16 h-16 flex items-center justify-center bg-white/80 rounded-2xl shadow-sm flex-shrink-0">
                <span
                  className={card.iconStyle}
                  style={
                    card.iconStyle.includes("font-amiri")
                      ? { fontFamily: "var(--font-amiri)" }
                      : undefined
                  }
                  dir={card.iconStyle.includes("font-amiri") ? "rtl" : undefined}
                >
                  {card.icon}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h2 className="font-heading text-xl font-bold text-foreground/90">
                  {card.label}
                </h2>
                <p className="font-body text-sm text-foreground/60 mt-0.5">
                  {card.subtitle}
                </p>

                {/* Progress bar */}
                <div className="mt-2">
                  <div className={`w-full h-2 ${card.progressTrack} rounded-full overflow-hidden`}>
                    <motion.div
                      className={`h-full ${card.progressColor} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${card.progressPercent}%` }}
                      transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                  <p className="font-body text-xs text-foreground/50 mt-1">
                    {card.progress}
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <span className="text-foreground/30 text-2xl flex-shrink-0">
                {"\u203a"}
              </span>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  );
}
