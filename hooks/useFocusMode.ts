"use client";

import { useEffect, useRef, useCallback } from "react";
import { useFocusStore } from "@/store/useFocusStore";

export function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) {
    el.requestFullscreen().catch(() => {});
  } else if ((el as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
    (el as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen().catch(() => {});
  }
}

function exitFullscreen() {
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  } else if ((document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement) {
    (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen().catch(() => {});
  }
}

export function useFocusMode() {
  const isFocusMode = useFocusStore((s) => s.isFocusMode);
  const tick = useFocusStore((s) => s.tick);
  const setTabAway = useFocusStore((s) => s.setTabAway);
  const stopFocusMode = useFocusStore((s) => s.stopFocusMode);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dummyPushedRef = useRef(false);

  // Timer: tick every second
  useEffect(() => {
    if (!isFocusMode) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      tick();
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isFocusMode, tick]);

  // Body class for CSS-based navigation blocking + iOS pseudo-fullscreen
  useEffect(() => {
    if (isFocusMode) {
      document.body.classList.add("focus-mode-active");
    } else {
      document.body.classList.remove("focus-mode-active");
    }

    return () => {
      document.body.classList.remove("focus-mode-active");
    };
  }, [isFocusMode]);

  // Page Visibility API: detect tab switch
  useEffect(() => {
    if (!isFocusMode) return;

    const handleVisibility = () => {
      setTabAway(document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isFocusMode, setTabAway]);

  // History blocking: push dummy state + prevent back
  const handlePopState = useCallback(() => {
    if (useFocusStore.getState().isFocusMode) {
      window.history.pushState(null, "", window.location.href);
    }
  }, []);

  useEffect(() => {
    if (!isFocusMode) {
      dummyPushedRef.current = false;
      return;
    }

    if (!dummyPushedRef.current) {
      window.history.pushState(null, "", window.location.href);
      dummyPushedRef.current = true;
    }

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isFocusMode, handlePopState]);

  // beforeunload: prevent closing tab
  useEffect(() => {
    if (!isFocusMode) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isFocusMode]);

  // Exit fullscreen when focus mode stops
  useEffect(() => {
    if (!isFocusMode) {
      exitFullscreen();
    }
  }, [isFocusMode]);

  // Cleanup on unmount — always exit fullscreen and reset state
  useEffect(() => {
    return () => {
      exitFullscreen();
      document.body.classList.remove("focus-mode-active");
      stopFocusMode();
    };
  }, [stopFocusMode]);
}
