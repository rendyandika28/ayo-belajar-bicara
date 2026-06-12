"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { getDailyMission } from "@/lib/missions";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export default function DailyMission() {
  const dailyMission =
    useAppStore((s) => s.dailyMission) ?? { date: "", missionId: "", progress: 0, completed: false };
  const initDailyMission = useAppStore((s) => s.initDailyMission);
  const completeDailyMission = useAppStore((s) => s.completeDailyMission);

  const today = getToday();
  const mission = getDailyMission(today);
  const showNew = dailyMission.date !== today;
  const progress = showNew ? 0 : dailyMission.progress;
  const isCompleted = !showNew && dailyMission.completed;

  useEffect(() => {
    if (showNew && mission.id) {
      initDailyMission(mission.id, today);
    }
  }, [showNew, mission.id, today, initDailyMission]);

  const handleComplete = () => {
    completeDailyMission(mission.reward);
  };

  const percent = Math.min(100, (progress / mission.target) * 100);

  return (
    <motion.div
      className="max-w-lg mx-auto mb-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 }}
    >
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-lg" aria-hidden="true">{"\ud83c\udfaf"}</span>
        <h2 className="font-heading text-base font-semibold text-foreground/70">
          Misi Hari Ini
        </h2>
        {isCompleted && (
          <span className="font-body text-[10px] bg-green-100 text-green-700 rounded-full px-2 py-0.5 font-semibold">
            Selesai
          </span>
        )}
      </div>
      <div
        className={`rounded-2xl p-4 shadow-md border-2 ${
          isCompleted
            ? "bg-green-50 border-green-200"
            : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
        }`}
      >
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl flex-shrink-0" aria-hidden="true">{mission.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-base font-bold text-foreground leading-tight">
              {mission.title}
            </p>
            <p className="font-body text-xs text-foreground/60 mt-0.5">
              {mission.description}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-2 bg-white/80 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            />
          </div>
          <span className="font-heading text-xs font-bold text-foreground/70 min-w-[50px] text-right">
            {progress}/{mission.target}
          </span>
        </div>

        {!isCompleted && progress >= mission.target && (
          <motion.button
            onClick={handleComplete}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-foreground font-heading text-sm py-2.5 rounded-full shadow-md flex items-center justify-center gap-2 min-h-[44px]"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            aria-label={`Klaim ${mission.reward} bintang, misi selesai`}
          >
            <span>{"\ud83c\udf89"}</span>
            <span>Klaim {mission.reward} Bintang</span>
          </motion.button>
        )}

        {isCompleted && (
          <p className="font-body text-xs text-green-700 text-center font-semibold">
            +{mission.reward} bintang sudah ditambahkan!
          </p>
        )}
      </div>
    </motion.div>
  );
}
