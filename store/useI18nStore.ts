"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type Locale = "id" | "en";

interface I18nState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      locale: "id",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "app-locale" }
  )
);

const TRANSLATIONS: Record<Locale, Record<string, string>> = {
  id: {
    "common.back": "Kembali",
    "common.next": "Lanjut",
    "common.start": "Mulai",
    "common.finish": "Selesai",
    "common.cancel": "Batal",
    "common.save": "Simpan",
    "common.play": "Main",
    "common.learnMore": "Pelajari",
    "common.loading": "Memuat...",
    "common.retry": "Coba Lagi",

    "home.welcome": "Ayo Belajar Bicara!",
    "home.startLearning": "Mulai Belajar",
    "home.challenge": "Tantangan",
    "home.beginner": "Pemula",
    "home.advanced": "Lanjutan",
    "home.todayWord": "Kata Hari Ini",
    "home.dailyMission": "Misi Hari Ini",
    "home.selesai": "Selesai",

    "nav.dashboard": "Pendamping",
    "nav.profile": "Profil",
    "nav.theme": "Tema",
    "nav.mute": "Suara",
    "nav.calm": "Tenang",

    "streak.iceCream": "Es Krim Penyelamat",
    "streak.days": "hari",

    "game.hear": "Dengar",
    "game.skip": "Lewati",
    "game.correct": "Benar!",
    "game.wrong": "Coba lagi",
    "game.finished": "Permainan Selesai!",
  },
  en: {
    "common.back": "Back",
    "common.next": "Next",
    "common.start": "Start",
    "common.finish": "Finish",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.play": "Play",
    "common.learnMore": "Learn",
    "common.loading": "Loading...",
    "common.retry": "Try Again",

    "home.welcome": "Let's Learn to Talk!",
    "home.startLearning": "Start Learning",
    "home.challenge": "Challenge",
    "home.beginner": "Beginner",
    "home.advanced": "Advanced",
    "home.todayWord": "Today's Word",
    "home.dailyMission": "Daily Mission",
    "home.selesai": "Done",

    "nav.dashboard": "Parent",
    "nav.profile": "Profile",
    "nav.theme": "Theme",
    "nav.mute": "Mute",
    "nav.calm": "Calm",

    "streak.iceCream": "Streak Saver",
    "streak.days": "days",

    "game.hear": "Hear",
    "game.skip": "Skip",
    "game.correct": "Correct!",
    "game.wrong": "Try again",
    "game.finished": "Game Over!",
  },
};

export function t(key: string, locale?: Locale): string {
  const lang = locale || useI18nStore.getState().locale;
  return TRANSLATIONS[lang]?.[key] || TRANSLATIONS.id[key] || key;
}

export function useT() {
  const locale = useI18nStore((s) => s.locale);
  return (key: string) => {
    return TRANSLATIONS[locale]?.[key] || TRANSLATIONS.id[key] || key;
  };
}
