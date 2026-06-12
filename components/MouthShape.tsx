"use client";

import { motion } from "framer-motion";

interface MouthShapeProps {
  phoneme: "r" | "s" | "l" | "ng" | "default";
  size?: number;
  animated?: boolean;
}

/**
 * Simple SVG mouth shape diagram for different phonemes.
 * Educational tool — shows how mouth/tongue should be positioned.
 */
export default function MouthShape({ phoneme, size = 120, animated = true }: MouthShapeProps) {
  const animateProps = animated
    ? {
        animate: { scale: [1, 1.1, 1] },
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const },
      }
    : {};

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className="select-none"
      role="img"
      aria-label={`Posisi mulut untuk bunyi ${phoneme.toUpperCase()}`}
      {...animateProps}
    >
      {/* Face outline (subtle) */}
      <circle cx="60" cy="60" r="55" fill="#FCE5CD" stroke="#E8B7A0" strokeWidth="2" />

      {/* Eyes */}
      <ellipse cx="42" cy="45" rx="3" ry="4" fill="#2D1B69" />
      <ellipse cx="78" cy="45" rx="3" ry="4" fill="#2D1B69" />

      {/* Eyebrows */}
      <path d="M 35 35 Q 42 32 49 35" stroke="#2D1B69" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M 71 35 Q 78 32 85 35" stroke="#2D1B69" strokeWidth="2" fill="none" strokeLinecap="round" />

      {phoneme === "r" && <RSound />}
      {phoneme === "s" && <SSound />}
      {phoneme === "l" && <LSound />}
      {phoneme === "ng" && <NgSound />}
      {phoneme === "default" && <DefaultMouth />}
    </motion.svg>
  );
}

function RSound() {
  return (
    <g>
      {/* Mouth — slightly open with rounded lips */}
      <ellipse cx="60" cy="80" rx="12" ry="9" fill="#C44536" />
      <ellipse cx="60" cy="80" rx="9" ry="6" fill="#8B2E25" />
      {/* Tongue tip up */}
      <ellipse cx="60" cy="74" rx="6" ry="3" fill="#FF9999" />
      {/* Hint label */}
      <text x="60" y="105" textAnchor="middle" fontSize="10" fill="#2D1B69" fontWeight="bold">
        Bibir bulat, ujung lidah naik
      </text>
    </g>
  );
}

function SSound() {
  return (
    <g>
      {/* Mouth — wide flat, teeth showing */}
      <path d="M 48 80 Q 60 88 72 80" stroke="#C44536" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Teeth */}
      <rect x="51" y="78" width="18" height="4" rx="1" fill="white" stroke="#999" strokeWidth="0.5" />
      {/* Tongue behind teeth */}
      <ellipse cx="60" cy="83" rx="7" ry="3" fill="#FF9999" />
      {/* Hint label */}
      <text x="60" y="105" textAnchor="middle" fontSize="10" fill="#2D1B69" fontWeight="bold">
        Gigi rapat, lidah di belakang gigi
      </text>
    </g>
  );
}

function LSound() {
  return (
    <g>
      {/* Mouth — open */}
      <ellipse cx="60" cy="80" rx="10" ry="8" fill="#C44536" />
      <ellipse cx="60" cy="80" rx="7" ry="5" fill="#8B2E25" />
      {/* Tongue tip touching roof of mouth */}
      <path d="M 60 75 L 60 67" stroke="#FF6666" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="60" cy="66" rx="4" ry="2" fill="#FF9999" />
      {/* Hint label */}
      <text x="60" y="105" textAnchor="middle" fontSize="10" fill="#2D1B69" fontWeight="bold">
        Ujung lidah sentuh langit-langit
      </text>
    </g>
  );
}

function NgSound() {
  return (
    <g>
      {/* Mouth — open */}
      <ellipse cx="60" cy="80" rx="11" ry="8" fill="#C44536" />
      <ellipse cx="60" cy="80" rx="8" ry="5" fill="#8B2E25" />
      {/* Tongue back of mouth */}
      <ellipse cx="60" cy="76" rx="8" ry="3" fill="#FF9999" />
      <ellipse cx="55" cy="78" rx="3" ry="2" fill="#FF6666" />
      {/* Hint label */}
      <text x="60" y="105" textAnchor="middle" fontSize="10" fill="#2D1B69" fontWeight="bold">
        Lidah di belakang mulut
      </text>
    </g>
  );
}

function DefaultMouth() {
  return (
    <g>
      {/* Mouth — smile */}
      <path d="M 48 78 Q 60 88 72 78" stroke="#C44536" strokeWidth="3" fill="none" strokeLinecap="round" />
    </g>
  );
}
