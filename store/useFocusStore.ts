"use client";

import { create } from "zustand";

interface FocusState {
  isFocusMode: boolean;
  focusDuration: number;
  secondsRemaining: number;
  isTabAway: boolean;
  showBreak: boolean;

  startFocusMode: (minutes: number) => void;
  stopFocusMode: () => void;
  tick: () => void;
  setTabAway: (val: boolean) => void;
}

export const useFocusStore = create<FocusState>()((set, get) => ({
  isFocusMode: false,
  focusDuration: 0,
  secondsRemaining: 0,
  isTabAway: false,
  showBreak: false,

  startFocusMode: (minutes: number) => {
    set({
      isFocusMode: true,
      focusDuration: minutes,
      secondsRemaining: minutes * 60,
      isTabAway: false,
      showBreak: false,
    });
  },

  stopFocusMode: () => {
    set({
      isFocusMode: false,
      focusDuration: 0,
      secondsRemaining: 0,
      isTabAway: false,
      showBreak: false,
    });
  },

  tick: () => {
    const state = get();
    if (!state.isFocusMode || state.showBreak) return;

    const next = state.secondsRemaining - 1;
    if (next <= 0) {
      set({ secondsRemaining: 0, showBreak: true });
    } else {
      set({ secondsRemaining: next });
    }
  },

  setTabAway: (val: boolean) => {
    set({ isTabAway: val });
  },
}));
