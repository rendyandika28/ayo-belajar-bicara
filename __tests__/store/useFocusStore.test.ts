import { useFocusStore } from "@/store/useFocusStore";

const initialState = {
  isFocusMode: false,
  focusDuration: 0,
  secondsRemaining: 0,
  isTabAway: false,
  showBreak: false,
};

function resetStore() {
  useFocusStore.setState(initialState);
}

describe("useFocusStore", () => {
  beforeEach(() => {
    resetStore();
  });

  describe("startFocusMode", () => {
    it("sets isFocusMode to true", () => {
      useFocusStore.getState().startFocusMode(10);
      expect(useFocusStore.getState().isFocusMode).toBe(true);
    });

    it("converts minutes to seconds", () => {
      useFocusStore.getState().startFocusMode(5);
      expect(useFocusStore.getState().secondsRemaining).toBe(300);
      expect(useFocusStore.getState().focusDuration).toBe(5);
    });

    it("resets flags on start", () => {
      useFocusStore.setState({ isTabAway: true, showBreak: true });
      useFocusStore.getState().startFocusMode(10);
      expect(useFocusStore.getState().isTabAway).toBe(false);
      expect(useFocusStore.getState().showBreak).toBe(false);
    });
  });

  describe("tick", () => {
    it("decrements secondsRemaining by 1", () => {
      useFocusStore.getState().startFocusMode(1);
      const before = useFocusStore.getState().secondsRemaining;
      useFocusStore.getState().tick();
      expect(useFocusStore.getState().secondsRemaining).toBe(before - 1);
    });

    it("sets showBreak to true when time reaches 0", () => {
      useFocusStore.setState({
        isFocusMode: true,
        secondsRemaining: 1,
        showBreak: false,
      });
      useFocusStore.getState().tick();
      expect(useFocusStore.getState().secondsRemaining).toBe(0);
      expect(useFocusStore.getState().showBreak).toBe(true);
    });

    it("does not tick when not in focus mode", () => {
      useFocusStore.setState({ isFocusMode: false, secondsRemaining: 100 });
      useFocusStore.getState().tick();
      expect(useFocusStore.getState().secondsRemaining).toBe(100);
    });

    it("does not tick when showBreak is true", () => {
      useFocusStore.setState({
        isFocusMode: true,
        secondsRemaining: 50,
        showBreak: true,
      });
      useFocusStore.getState().tick();
      expect(useFocusStore.getState().secondsRemaining).toBe(50);
    });
  });

  describe("stopFocusMode", () => {
    it("resets all fields", () => {
      useFocusStore.getState().startFocusMode(10);
      useFocusStore.getState().stopFocusMode();
      const state = useFocusStore.getState();
      expect(state.isFocusMode).toBe(false);
      expect(state.focusDuration).toBe(0);
      expect(state.secondsRemaining).toBe(0);
      expect(state.isTabAway).toBe(false);
      expect(state.showBreak).toBe(false);
    });
  });

  describe("setTabAway", () => {
    it("sets isTabAway to true", () => {
      useFocusStore.getState().setTabAway(true);
      expect(useFocusStore.getState().isTabAway).toBe(true);
    });

    it("sets isTabAway to false", () => {
      useFocusStore.setState({ isTabAway: true });
      useFocusStore.getState().setTabAway(false);
      expect(useFocusStore.getState().isTabAway).toBe(false);
    });
  });
});
