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

  return (
    <div
      className={`bg-yellow-400 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 font-heading text-lg ${
        bounce ? "animate-star-bounce" : ""
      }`}
    >
      <span className="text-xl">&#11088;</span>
      <span className="font-bold">{totalStars}</span>
    </div>
  );
}
