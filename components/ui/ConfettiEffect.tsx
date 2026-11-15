"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

const COLORS = ["bg-accent", "bg-good", "bg-warn"];

interface ConfettiEffectProps {
  show: boolean;
}

export default function ConfettiEffect({ show }: ConfettiEffectProps) {
  const calmMode = useAppStore((s) => s.calmMode);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), calmMode ? 1500 : 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show, calmMode]);

  const pieces = useMemo(
    () =>
      Array.from({ length: calmMode ? 4 : 10 }, (_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        left: (i * 19 + 7) % 100,
        delay: (i * 0.1).toFixed(2),
        size: 6 + (i % 3) * 2,
      })),
    [calmMode]
  );

  if (!visible) return null;

  // Calm mode: a few still dots, no motion.
  if (calmMode) {
    return (
      <div className="fixed inset-0 pointer-events-none z-[100]" aria-hidden="true">
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className={`absolute rounded-full ${piece.color} opacity-60`}
            style={{
              left: `${piece.left}%`,
              top: `${20 + ((piece.id * 15) % 50)}%`,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden" aria-hidden="true">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={`confetti-piece absolute rounded-sm opacity-80 ${piece.color}`}
          style={{
            left: `${piece.left}%`,
            top: "-10px",
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
