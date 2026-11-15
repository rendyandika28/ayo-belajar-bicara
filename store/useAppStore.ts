"use client";

import { localDateKey, daysBetween } from "@/lib/date";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Word } from "@/data/words";

interface AppState {
  isMuted: boolean;
  toggleMute: () => void;
  calmMode: boolean;
  toggleCalmMode: () => void;

  totalStars: number;
  currentLevel: number;
  wordsLearned: string[];
  sessionsCompleted: number;
  hijaiyahLearned: string[];
  doasAttempted: string[];
  asmaulHusnaLearned: string[];
  dailyStreak: number;
  lastActiveDate: string;
  todayMinutes: number;
  todayStars: number;
  sessionDuration: number;
  customWords: Word[];
  sessionStartTime: number | null;
  isBreakTime: boolean;
  weeklyMinutes: number[];
  gameStats: Record<string, number>;

  addStar: (count?: number) => void;
  markWordLearned: (wordId: string) => void;
  markHijaiyahLearned: (id: string) => void;
  markDoaAttempted: (id: string) => void;
  markAsmaulHusnaLearned: (id: string) => void;
  unlockLevel: (level: number) => void;
  updateStreak: () => void;
  startSession: () => void;
  checkBreakTime: () => boolean;
  addCustomWord: (word: Word) => void;
  removeCustomWord: (wordId: string) => void;
  setSessionDuration: (min: number) => void;
  setBreakTime: (val: boolean) => void;
  addMinutes: (min: number) => void;
  incrementSession: () => void;
  recordGamePlay: (gameId: string) => void;
  resetProgress: () => void;
}

/** v0 stored UTC date keys; v1 stores local ones. Exact instant is lost, so map UTC today/yesterday to local today/yesterday. */
export function migrateAppState(persisted: unknown, version: number) {
  const state = persisted as { lastActiveDate?: string };
  if (version < 1 && state?.lastActiveDate) {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const utcKey = (d: Date) => d.toISOString().slice(0, 10);
    if (state.lastActiveDate === utcKey(now)) state.lastActiveDate = localDateKey(now);
    else if (state.lastActiveDate === utcKey(new Date(now.getTime() - 86400000)))
      state.lastActiveDate = localDateKey(yesterday);
  }
  return state as AppState;
}

function getToday(): string {
  return localDateKey();
}

const initialState = {
  totalStars: 0,
  currentLevel: 1,
  wordsLearned: [] as string[],
  sessionsCompleted: 0,
  hijaiyahLearned: [] as string[],
  doasAttempted: [] as string[],
  asmaulHusnaLearned: [] as string[],
  dailyStreak: 0,
  lastActiveDate: "",
  todayMinutes: 0,
  todayStars: 0,
  sessionDuration: 5,
  customWords: [] as Word[],
  sessionStartTime: null as number | null,
  isBreakTime: false,
  weeklyMinutes: [0, 0, 0, 0, 0, 0, 0] as number[],
  gameStats: {} as Record<string, number>,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isMuted: false,
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      calmMode: false,
      toggleCalmMode: () => set((state) => ({ calmMode: !state.calmMode })),

      ...initialState,

      addStar: (count = 1) => {
        set((state) => ({
          totalStars: state.totalStars + count,
          todayStars: state.todayStars + count,
        }));
      },

      markWordLearned: (wordId: string) => {
        set((state) => {
          if (state.wordsLearned.includes(wordId)) return state;
          return { wordsLearned: [...state.wordsLearned, wordId] };
        });
      },

      markHijaiyahLearned: (id: string) => {
        set((state) => {
          if (state.hijaiyahLearned.includes(id)) return state;
          return { hijaiyahLearned: [...state.hijaiyahLearned, id] };
        });
      },

      markDoaAttempted: (id: string) => {
        set((state) => {
          if (state.doasAttempted.includes(id)) return state;
          return { doasAttempted: [...state.doasAttempted, id] };
        });
      },

      markAsmaulHusnaLearned: (id: string) => {
        set((state) => {
          if (state.asmaulHusnaLearned.includes(id)) return state;
          return { asmaulHusnaLearned: [...state.asmaulHusnaLearned, id] };
        });
      },

      unlockLevel: (level: number) => {
        set((state) => ({
          currentLevel: Math.max(state.currentLevel, level),
        }));
      },

      updateStreak: () => {
        const today = getToday();
        const state = get();

        if (state.lastActiveDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = localDateKey(yesterday);

        const newStreak =
          state.lastActiveDate === yesterdayStr ? state.dailyStreak + 1 : 1;

        const daysDiff = state.lastActiveDate
          ? daysBetween(state.lastActiveDate, today)
          : 7;
        const newWeekly = [...state.weeklyMinutes];
        for (let i = 0; i < Math.min(daysDiff, 7); i++) {
          newWeekly.pop();
          newWeekly.unshift(0);
        }

        set({
          dailyStreak: newStreak,
          lastActiveDate: today,
          todayMinutes: 0,
          todayStars: 0,
          weeklyMinutes: newWeekly,
        });
      },

      startSession: () => {
        set({ sessionStartTime: Date.now(), isBreakTime: false });
      },

      checkBreakTime: () => {
        const state = get();
        if (!state.sessionStartTime) return false;
        const elapsed = (Date.now() - state.sessionStartTime) / 60000;
        return elapsed >= state.sessionDuration;
      },

      addCustomWord: (word: Word) => {
        set((state) => ({
          customWords: [...state.customWords, word],
        }));
      },

      removeCustomWord: (wordId: string) => {
        set((state) => ({
          customWords: state.customWords.filter((w) => w.id !== wordId),
        }));
      },

      setSessionDuration: (min: number) => {
        set({ sessionDuration: min });
      },

      setBreakTime: (val: boolean) => {
        set({ isBreakTime: val });
      },

      addMinutes: (min: number) => {
        set((state) => {
          const newWeekly = [...state.weeklyMinutes];
          newWeekly[0] = (newWeekly[0] || 0) + min;
          return {
            todayMinutes: state.todayMinutes + min,
            weeklyMinutes: newWeekly,
          };
        });
      },

      incrementSession: () => {
        set((state) => ({
          sessionsCompleted: state.sessionsCompleted + 1,
        }));
      },

      recordGamePlay: (gameId: string) => {
        set((state) => {
          const current = state.gameStats[gameId] || 0;
          return {
            gameStats: { ...state.gameStats, [gameId]: current + 1 },
          };
        });
      },

      resetProgress: () => {
        set({ ...initialState });
      },
    }),
    { name: "speechTherapyData", version: 1, migrate: migrateAppState }
  )
);
