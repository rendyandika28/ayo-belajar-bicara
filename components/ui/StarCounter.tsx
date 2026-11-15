"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function StarCounter() {
  const totalStars = useAppStore((state) => state.totalStars);
  const [bounce, setBounce] = useState(false);
  const prevStars = useRef(totalStars);

  useEffect(() => {
    if (totalStars !== prevStars.current) {
      setBounce(true);
      prevStars.current = totalStars;
      const timer = setTimeout(() => setBounce(false), 300);
      return () => clearTimeout(timer);
    }
  }, [totalStars]);

  // .animate-star-bounce is disabled by globals.css under reduced motion and calm mode.
  return (
    <div
      className={`bg-surface border border-line rounded-full px-3 min-h-[44px] flex items-center gap-1.5 font-heading text-lg text-ink ${
        bounce ? "animate-star-bounce" : ""
      }`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" className="text-warn" aria-hidden="true">
        <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z" />
      </svg>
      <span className="font-bold">{totalStars}</span>
      <span className="sr-only">bintang</span>
    </div>
  );
}
