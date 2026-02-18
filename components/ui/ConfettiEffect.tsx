"use client";

import { useEffect, useMemo, useState } from "react";

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
  const [visible, setVisible] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (show) {
      setKey((k) => k + 1);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [show]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        color: COLORS[i % COLORS.length],
        left: (i * 7.1 + 3) % 100,
        delay: (i * 0.09).toFixed(2),
        size: 6 + (i % 4) * 2,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  if (!visible) return null;

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
