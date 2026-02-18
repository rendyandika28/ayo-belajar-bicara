"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Word } from "@/data/words";

interface AppState {
  // Progress
  totalStars: number;
  currentLevel: number;
  wordsLearned: string[];
  sessionsCompleted: number;
  hijaiyahLearned: string[];
  doasAttempted: string[];
  asmaulHusnaLearned: string[];

  // Daily
  dailyStreak: number;
  lastActiveDate: string;
  todayMinutes: number;
  todayStars: number;

  // Settings
  sessionDuration: number;
  customWords: Word[];

  // Session
  sessionStartTime: number | null;
  isBreakTime: boolean;

  // Weekly stats
  weeklyMinutes: number[];

  // Actions
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
  resetProgress: () => void;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      totalStars: 0,
      currentLevel: 1,
      wordsLearned: [],
      sessionsCompleted: 0,
      hijaiyahLearned: [],
      doasAttempted: [],
      asmaulHusnaLearned: [],

      dailyStreak: 0,
      lastActiveDate: "",
      todayMinutes: 0,
      todayStars: 0,

      sessionDuration: 5,
      customWords: [],

      sessionStartTime: null,
      isBreakTime: false,

      weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],

      // Actions
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
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        const newStreak =
          state.lastActiveDate === yesterdayStr ? state.dailyStreak + 1 : 1;

        // Shift weekly minutes
        const daysDiff = state.lastActiveDate
          ? Math.floor(
              (new Date(today).getTime() -
                new Date(state.lastActiveDate).getTime()) /
                86400000
            )
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

      resetProgress: () => {
        set({
          totalStars: 0,
          currentLevel: 1,
          wordsLearned: [],
          sessionsCompleted: 0,
          hijaiyahLearned: [],
          doasAttempted: [],
          asmaulHusnaLearned: [],
          dailyStreak: 0,
          lastActiveDate: "",
          todayMinutes: 0,
          todayStars: 0,
          customWords: [],
          sessionStartTime: null,
          isBreakTime: false,
          weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
        });
      },
    }),
    {
      name: "speechTherapyData",
    }
  )
);
