"use client";

import { useState, useCallback, useEffect } from "react";

type LiveRegionProps = {
  message: string;
  politeness?: "polite" | "assertive";
};

export function LiveRegion({ message, politeness = "polite" }: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

let globalAnnouncer: ((message: string, politeness?: "polite" | "assertive") => void) | null = null;

export function setGlobalAnnouncer(
  fn: (message: string, politeness?: "polite" | "assertive") => void
) {
  globalAnnouncer = fn;
}

export function announce(message: string, politeness: "polite" | "assertive" = "polite") {
  globalAnnouncer?.(message, politeness);
}

export function useAnnouncer() {
  const [message, setMessage] = useState("");
  const [politeness, setPoliteness] = useState<"polite" | "assertive">("polite");

  const announce = useCallback(
    (msg: string, level: "polite" | "assertive" = "polite") => {
      setMessage("");
      requestAnimationFrame(() => {
        setPoliteness(level);
        setMessage(msg);
      });
    },
    []
  );

  useEffect(() => {
    setGlobalAnnouncer(announce);
    return () => {
      setGlobalAnnouncer(() => {});
    };
  }, [announce]);

  return { message, politeness };
}
