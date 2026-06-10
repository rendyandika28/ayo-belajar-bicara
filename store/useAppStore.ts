"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Word } from "@/data/words";

interface Profile {
  id: string;
  name: string;
  emoji: string;
}

interface ProfileData {
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
}

function emptyProfileData(): ProfileData {
  return {
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
    gameStats: {},
  };
}

function snapshot(state: AppState): ProfileData {
  return {
    totalStars: state.totalStars,
    currentLevel: state.currentLevel,
    wordsLearned: state.wordsLearned,
    sessionsCompleted: state.sessionsCompleted,
    hijaiyahLearned: state.hijaiyahLearned,
    doasAttempted: state.doasAttempted,
    asmaulHusnaLearned: state.asmaulHusnaLearned,
    dailyStreak: state.dailyStreak,
    lastActiveDate: state.lastActiveDate,
    todayMinutes: state.todayMinutes,
    todayStars: state.todayStars,
    sessionDuration: state.sessionDuration,
    customWords: state.customWords,
    sessionStartTime: state.sessionStartTime,
    isBreakTime: state.isBreakTime,
    weeklyMinutes: state.weeklyMinutes,
    gameStats: state.gameStats,
  };
}

interface AppState extends ProfileData {
  isMuted: boolean;
  toggleMute: () => void;
  calmMode: boolean;
  toggleCalmMode: () => void;
  profiles: Profile[];
  activeProfileId: string;
  profilesData: Record<string, ProfileData>;

  addProfile: (name: string, emoji: string) => string;
  removeProfile: (id: string) => void;
  switchProfile: (id: string) => void;
  renameProfile: (id: string, name: string) => void;

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

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isMuted: false,
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      calmMode: false,
      toggleCalmMode: () => set((state) => ({ calmMode: !state.calmMode })),

      profiles: [{ id: "default", name: "Si Kecil", emoji: "\ud83d\udc76" }],
      activeProfileId: "default",
      profilesData: { default: emptyProfileData() },

      ...emptyProfileData(),

      addProfile: (name: string, emoji: string) => {
        const id = crypto.randomUUID();
        set((state) => ({
          profiles: [...state.profiles, { id, name, emoji }],
          activeProfileId: id,
          profilesData: { ...state.profilesData, [id]: emptyProfileData() },
          ...emptyProfileData(),
        }));
        return id;
      },

      removeProfile: (id: string) => {
        set((state) => {
          const remaining = state.profiles.filter((p) => p.id !== id);
          if (remaining.length === 0) return state;
          const newProfilesData = { ...state.profilesData };
          delete newProfilesData[id];
          const newActiveId =
            state.activeProfileId === id ? remaining[0].id : state.activeProfileId;
          const activeData = newProfilesData[newActiveId] || emptyProfileData();
          return {
            profiles: remaining,
            activeProfileId: newActiveId,
            profilesData: newProfilesData,
            ...activeData,
          };
        });
      },

      switchProfile: (id: string) => {
        const state = get();
        if (id === state.activeProfileId || !state.profilesData[id]) return;
        const oldId = state.activeProfileId;
        const oldData = snapshot(state);
        set({
          profilesData: { ...state.profilesData, [oldId]: oldData },
          activeProfileId: id,
          ...state.profilesData[id],
        });
      },

      renameProfile: (id: string, name: string) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, name } : p
          ),
        }));
      },

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

      recordGamePlay: (gameId: string) => {
        set((state) => {
          const pid = state.activeProfileId;
          const data = state.profilesData[pid];
          if (!data) return state;
          const current = data.gameStats[gameId] || 0;
          const newGameStats = { ...data.gameStats, [gameId]: current + 1 };
          const updated = { ...data, gameStats: newGameStats };
          return {
            profilesData: { ...state.profilesData, [pid]: updated },
            gameStats: newGameStats,
          };
        });
      },

      resetProgress: () => {
        set(emptyProfileData());
      },
    }),
    {
      name: "speechTherapyData",
      partialize: (state) => ({
        isMuted: state.isMuted,
        calmMode: state.calmMode,
        profiles: state.profiles,
      activeProfileId: state.activeProfileId,
      profilesData: {
          ...state.profilesData,
          [state.activeProfileId]: snapshot(state),
        },
      }),
      merge: (persisted, current) => {
        const p = persisted as Record<string, unknown>;
        if (!p || !p.profiles || !Array.isArray(p.profiles) || p.profiles.length === 0) {
          const data: ProfileData = {
            totalStars: (p?.totalStars as number) ?? 0,
            currentLevel: (p?.currentLevel as number) ?? 1,
            wordsLearned: (p?.wordsLearned as string[]) ?? [],
            sessionsCompleted: (p?.sessionsCompleted as number) ?? 0,
            hijaiyahLearned: (p?.hijaiyahLearned as string[]) ?? [],
            doasAttempted: (p?.doasAttempted as string[]) ?? [],
            asmaulHusnaLearned: (p?.asmaulHusnaLearned as string[]) ?? [],
            dailyStreak: (p?.dailyStreak as number) ?? 0,
            lastActiveDate: (p?.lastActiveDate as string) ?? "",
            todayMinutes: (p?.todayMinutes as number) ?? 0,
            todayStars: (p?.todayStars as number) ?? 0,
            sessionDuration: (p?.sessionDuration as number) ?? 5,
            customWords: (p?.customWords as Word[]) ?? [],
            sessionStartTime: (p?.sessionStartTime as number | null) ?? null,
            isBreakTime: (p?.isBreakTime as boolean) ?? false,
            weeklyMinutes: (p?.weeklyMinutes as number[]) ?? [0, 0, 0, 0, 0, 0, 0],
            gameStats: (p?.gameStats as Record<string, number>) ?? {},
          };
          return {
            ...current,
            profiles: [{ id: "default", name: "Si Kecil", emoji: "\ud83d\udc76" }],
            activeProfileId: "default",
            profilesData: { default: data },
            ...data,
          };
        }
        const profiles = p.profiles as Profile[];
        const profilesData = p.profilesData as Record<string, ProfileData>;
        const activeProfileId = (p.activeProfileId as string) || profiles[0].id;
        const activeData = profilesData[activeProfileId] || emptyProfileData();
        return {
          ...current,
          profiles,
          activeProfileId,
          profilesData,
          ...activeData,
        };
      },
    }
  )
);
