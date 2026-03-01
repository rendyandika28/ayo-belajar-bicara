import { useAppStore } from "@/store/useAppStore";

const initialState = {
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
};

function resetStore() {
  localStorage.clear();
  useAppStore.setState(initialState);
}

describe("useAppStore", () => {
  beforeEach(() => {
    resetStore();
  });

  // addStar
  describe("addStar", () => {
    it("adds 1 star by default", () => {
      useAppStore.getState().addStar();
      expect(useAppStore.getState().totalStars).toBe(1);
      expect(useAppStore.getState().todayStars).toBe(1);
    });

    it("adds custom star count", () => {
      useAppStore.getState().addStar(5);
      expect(useAppStore.getState().totalStars).toBe(5);
      expect(useAppStore.getState().todayStars).toBe(5);
    });

    it("accumulates stars across calls", () => {
      useAppStore.getState().addStar(3);
      useAppStore.getState().addStar(2);
      expect(useAppStore.getState().totalStars).toBe(5);
      expect(useAppStore.getState().todayStars).toBe(5);
    });
  });

  // markWordLearned
  describe("markWordLearned", () => {
    it("adds a word to wordsLearned", () => {
      useAppStore.getState().markWordLearned("hew-1");
      expect(useAppStore.getState().wordsLearned).toContain("hew-1");
    });

    it("deduplicates word IDs", () => {
      useAppStore.getState().markWordLearned("hew-1");
      useAppStore.getState().markWordLearned("hew-1");
      expect(useAppStore.getState().wordsLearned).toEqual(["hew-1"]);
    });
  });

  // markHijaiyahLearned
  describe("markHijaiyahLearned", () => {
    it("adds hijaiyah and deduplicates", () => {
      useAppStore.getState().markHijaiyahLearned("hij-1");
      useAppStore.getState().markHijaiyahLearned("hij-1");
      expect(useAppStore.getState().hijaiyahLearned).toEqual(["hij-1"]);
    });
  });

  // markDoaAttempted
  describe("markDoaAttempted", () => {
    it("adds doa and deduplicates", () => {
      useAppStore.getState().markDoaAttempted("doa-1");
      useAppStore.getState().markDoaAttempted("doa-1");
      expect(useAppStore.getState().doasAttempted).toEqual(["doa-1"]);
    });
  });

  // markAsmaulHusnaLearned
  describe("markAsmaulHusnaLearned", () => {
    it("adds asmaul husna and deduplicates", () => {
      useAppStore.getState().markAsmaulHusnaLearned("asma-1");
      useAppStore.getState().markAsmaulHusnaLearned("asma-1");
      expect(useAppStore.getState().asmaulHusnaLearned).toEqual(["asma-1"]);
    });
  });

  // unlockLevel
  describe("unlockLevel", () => {
    it("unlocks a higher level", () => {
      useAppStore.getState().unlockLevel(3);
      expect(useAppStore.getState().currentLevel).toBe(3);
    });

    it("does not downgrade level", () => {
      useAppStore.getState().unlockLevel(3);
      useAppStore.getState().unlockLevel(1);
      expect(useAppStore.getState().currentLevel).toBe(3);
    });
  });

  // updateStreak
  describe("updateStreak", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("sets streak to 1 on first day", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T10:00:00Z"));
      useAppStore.getState().updateStreak();
      expect(useAppStore.getState().dailyStreak).toBe(1);
      expect(useAppStore.getState().lastActiveDate).toBe("2025-06-15");
    });

    it("increments streak on consecutive day", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T10:00:00Z"));
      useAppStore.getState().updateStreak();

      vi.setSystemTime(new Date("2025-06-16T10:00:00Z"));
      useAppStore.getState().updateStreak();
      expect(useAppStore.getState().dailyStreak).toBe(2);
    });

    it("resets streak to 1 after a gap", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T10:00:00Z"));
      useAppStore.getState().updateStreak();
      useAppStore.setState({ dailyStreak: 5 });

      vi.setSystemTime(new Date("2025-06-20T10:00:00Z"));
      useAppStore.getState().updateStreak();
      expect(useAppStore.getState().dailyStreak).toBe(1);
    });

    it("does not change streak on same day", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T10:00:00Z"));
      useAppStore.getState().updateStreak();
      const streakAfterFirst = useAppStore.getState().dailyStreak;

      useAppStore.getState().updateStreak();
      expect(useAppStore.getState().dailyStreak).toBe(streakAfterFirst);
    });

    it("shifts weekly minutes on new day", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T10:00:00Z"));
      useAppStore.setState({
        lastActiveDate: "2025-06-14",
        weeklyMinutes: [10, 20, 30, 40, 50, 60, 70],
      });
      useAppStore.getState().updateStreak();
      // 1 day gap: pop last, unshift 0
      expect(useAppStore.getState().weeklyMinutes).toEqual([0, 10, 20, 30, 40, 50, 60]);
    });

    it("fully resets weekly minutes on 7+ day gap", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-22T10:00:00Z"));
      useAppStore.setState({
        lastActiveDate: "2025-06-10",
        weeklyMinutes: [10, 20, 30, 40, 50, 60, 70],
      });
      useAppStore.getState().updateStreak();
      expect(useAppStore.getState().weeklyMinutes).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });

    it("resets daily stats on new day", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-06-15T10:00:00Z"));
      useAppStore.setState({
        lastActiveDate: "2025-06-14",
        todayMinutes: 30,
        todayStars: 10,
      });
      useAppStore.getState().updateStreak();
      expect(useAppStore.getState().todayMinutes).toBe(0);
      expect(useAppStore.getState().todayStars).toBe(0);
    });
  });

  // startSession & checkBreakTime
  describe("startSession / checkBreakTime", () => {
    it("sets session start time", () => {
      useAppStore.getState().startSession();
      expect(useAppStore.getState().sessionStartTime).toBeTypeOf("number");
      expect(useAppStore.getState().isBreakTime).toBe(false);
    });

    it("returns false when no session started", () => {
      expect(useAppStore.getState().checkBreakTime()).toBe(false);
    });

    it("returns false when session duration not elapsed", () => {
      const now = Date.now();
      useAppStore.setState({
        sessionStartTime: now,
        sessionDuration: 5,
      });
      expect(useAppStore.getState().checkBreakTime()).toBe(false);
    });

    it("returns true when session duration elapsed", () => {
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      useAppStore.setState({
        sessionStartTime: fiveMinutesAgo,
        sessionDuration: 5,
      });
      expect(useAppStore.getState().checkBreakTime()).toBe(true);
    });
  });

  // addMinutes
  describe("addMinutes", () => {
    it("updates todayMinutes and weeklyMinutes[0]", () => {
      useAppStore.getState().addMinutes(10);
      expect(useAppStore.getState().todayMinutes).toBe(10);
      expect(useAppStore.getState().weeklyMinutes[0]).toBe(10);
    });

    it("accumulates minutes", () => {
      useAppStore.getState().addMinutes(5);
      useAppStore.getState().addMinutes(3);
      expect(useAppStore.getState().todayMinutes).toBe(8);
      expect(useAppStore.getState().weeklyMinutes[0]).toBe(8);
    });
  });

  // customWords
  describe("customWords", () => {
    const testWord = {
      id: "custom-1",
      emoji: "🎈",
      word: "balon",
      syllables: ["ba", "lon"],
      category: "benda" as const,
      difficulty: 1 as const,
    };

    it("adds a custom word", () => {
      useAppStore.getState().addCustomWord(testWord);
      expect(useAppStore.getState().customWords).toHaveLength(1);
      expect(useAppStore.getState().customWords[0].id).toBe("custom-1");
    });

    it("removes a custom word by id", () => {
      useAppStore.getState().addCustomWord(testWord);
      useAppStore.getState().removeCustomWord("custom-1");
      expect(useAppStore.getState().customWords).toHaveLength(0);
    });
  });

  // resetProgress
  describe("resetProgress", () => {
    it("resets all fields to initial values", () => {
      useAppStore.getState().addStar(10);
      useAppStore.getState().markWordLearned("hew-1");
      useAppStore.getState().unlockLevel(3);
      useAppStore.getState().resetProgress();

      const state = useAppStore.getState();
      expect(state.totalStars).toBe(0);
      expect(state.currentLevel).toBe(1);
      expect(state.wordsLearned).toEqual([]);
      expect(state.sessionsCompleted).toBe(0);
      expect(state.weeklyMinutes).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });
  });

  // incrementSession
  describe("incrementSession", () => {
    it("increments sessionsCompleted by 1", () => {
      useAppStore.getState().incrementSession();
      expect(useAppStore.getState().sessionsCompleted).toBe(1);
      useAppStore.getState().incrementSession();
      expect(useAppStore.getState().sessionsCompleted).toBe(2);
    });
  });
});
