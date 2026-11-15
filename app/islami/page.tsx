"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import GameShell from "@/components/ui/GameShell";
import { useAppStore } from "@/store/useAppStore";
import { playPop } from "@/lib/sounds";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: "easeOut" as const } },
};

const svgProps = {
  width: 36,
  height: 36,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export default function IslamiPage() {
  const { hijaiyahLearned, doasAttempted, asmaulHusnaLearned } = useAppStore();

  const menuCards = [
    {
      icon: <span className="font-arabic text-5xl leading-none" dir="rtl" lang="ar">ا</span>,
      label: "Huruf Hijaiyah",
      href: "/islami/hijaiyah",
      subtitle: "Belajar 29 huruf hijaiyah",
      progress: `${hijaiyahLearned.length}/29 huruf`,
      progressPercent: (hijaiyahLearned.length / 29) * 100,
    },
    {
      // open hands (doa)
      icon: (
        <svg {...svgProps} aria-hidden="true">
          <path d="M7 21v-5l-3-4V6a1.5 1.5 0 0 1 3 0v5" />
          <path d="M17 21v-5l3-4V6a1.5 1.5 0 0 0-3 0v5" />
          <path d="M7 11l3 3v7M17 11l-3 3v7" />
        </svg>
      ),
      label: "Doa Harian",
      href: "/islami/doa",
      subtitle: "Belajar doa sehari-hari",
      progress: `${doasAttempted.length}/10 doa`,
      progressPercent: (doasAttempted.length / 10) * 100,
    },
    {
      // sparkle
      icon: (
        <svg {...svgProps} aria-hidden="true">
          <path d="M12 3l1.9 5.6L19.5 10.5 13.9 12.4 12 18l-1.9-5.6L4.5 10.5l5.6-1.9z" />
          <path d="M19 17v4M17 19h4" />
        </svg>
      ),
      label: "Asmaul Husna",
      href: "/islami/asmaul-husna",
      subtitle: "99 nama Allah yang indah",
      progress: `${asmaulHusnaLearned.length}/10 nama`,
      progressPercent: (asmaulHusnaLearned.length / 10) * 100,
    },
  ];

  return (
    <GameShell title="Belajar Islami">
      <p className="text-center font-body text-lg text-ink-muted mb-5">
        Yuk belajar agama Islam bersama!
      </p>

      <motion.div
        className="flex flex-col gap-4 max-w-md mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {menuCards.map((card) => (
          <motion.div key={card.href} variants={cardVariants}>
            <Link
              href={card.href}
              onClick={playPop}
              className="bg-surface border border-line rounded-3xl p-5 flex items-center gap-4 min-h-[100px] transition-colors hover:bg-accent-soft active:bg-line"
            >
              <span className="w-16 h-16 flex items-center justify-center bg-paper text-good-strong rounded-2xl flex-shrink-0">
                {card.icon}
              </span>

              <span className="flex-1 min-w-0">
                <span className="block font-heading text-xl font-bold text-ink">{card.label}</span>
                <span className="block font-body text-base text-ink-muted">{card.subtitle}</span>
                <span className="block mt-2 w-full h-2 bg-line rounded-full overflow-hidden">
                  <span
                    className="block h-full bg-good-strong rounded-full origin-left"
                    style={{ transform: `scaleX(${card.progressPercent / 100})` }}
                  />
                </span>
                <span className="block font-body text-sm text-ink-muted mt-1">{card.progress}</span>
              </span>

              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink-muted flex-shrink-0">
                <path d="m9 6 6 6-6 6" />
              </svg>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </GameShell>
  );
}
