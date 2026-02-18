"use client";

import { create } from "zustand";

interface FocusState {
  isFocusMode: boolean;
  focusDuration: number;
  secondsRemaining: number;
  isTabAway: boolean;
  exitStep: 0 | 1;
  showBreak: boolean;

  startFocusMode: (minutes: number) => void;
  stopFocusMode: () => void;
  tick: () => void;
  setTabAway: (val: boolean) => void;
  tapExit: () => void;
  resetExitStep: () => void;
}

export const useFocusStore = create<FocusState>()((set, get) => ({
  isFocusMode: false,
  focusDuration: 0,
  secondsRemaining: 0,
  isTabAway: false,
  exitStep: 0,
  showBreak: false,

  startFocusMode: (minutes: number) => {
    set({
      isFocusMode: true,
      focusDuration: minutes,
      secondsRemaining: minutes * 60,
      isTabAway: false,
      exitStep: 0,
      showBreak: false,
    });
  },

  stopFocusMode: () => {
    set({
      isFocusMode: false,
      focusDuration: 0,
      secondsRemaining: 0,
      isTabAway: false,
      exitStep: 0,
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

  tapExit: () => {
    const state = get();
    if (state.exitStep === 0) {
      set({ exitStep: 1 });
    } else {
      state.stopFocusMode();
    }
  },

  resetExitStep: () => {
    set({ exitStep: 0 });
  },
}));
