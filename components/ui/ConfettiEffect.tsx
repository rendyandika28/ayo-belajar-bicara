"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

const COLORS = [
  "bg-pink-400",
  "bg-yellow-400",
  "bg-green-400",
  "bg-blue-400",
  "bg-purple-400",
];

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
      Array.from({ length: calmMode ? 6 : 15 }, (_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        left: (i * 12 + 5) % 100,
        delay: (i * 0.12).toFixed(2),
        size: calmMode ? 10 + (i % 3) * 4 : 6 + (i % 4) * 2,
      })),
    [calmMode]
  );

  if (!visible) return null;

  if (calmMode) {
    return (
      <div className="fixed inset-0 pointer-events-none z-[100] flex items-center justify-center">
        {pieces.map((piece) => (
          <div
            key={piece.id}
            className={`absolute rounded-full ${piece.color} opacity-70`}
            style={{
              left: `${piece.left}%`,
              top: `${20 + (piece.id * 8) % 60}%`,
              width: `${piece.size}px`,
              height: `${piece.size}px`,
              animation: `star-bounce 1.5s ease-in-out ${piece.delay}s infinite`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={`confetti-piece absolute rounded-sm ${piece.color}`}
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
