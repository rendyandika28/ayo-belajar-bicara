"use client";

const COLOR_BG: Record<string, string> = {
  yellow: "bg-yellow-200",
  pink: "bg-pink-200",
  blue: "bg-blue-200",
  purple: "bg-purple-200",
  green: "bg-green-200",
  orange: "bg-orange-200",
  red: "bg-red-200",
  sky: "bg-sky-200",
  amber: "bg-amber-200",
  emerald: "bg-emerald-200",
};

const ACCESSORY_EMOJI: Record<string, string> = {
  hat: "\ud83c\udfa9",
  crown: "\ud83d\udc51",
  glasses: "\ud83d\udc53",
  flower: "\ud83c\udf38",
  star: "\u2b50",
  bow: "\ud83c\udf80",
  balloon: "\ud83c\udf88",
};

interface AvatarDisplayProps {
  emoji: string;
  color: string;
  accessory: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<string, { container: string; emoji: string; accessory: string }> = {
  sm: { container: "w-10 h-10", emoji: "text-2xl", accessory: "text-base -top-1 -right-1" },
  md: { container: "w-14 h-14", emoji: "text-3xl", accessory: "text-xl -top-1 -right-1" },
  lg: { container: "w-20 h-20", emoji: "text-5xl", accessory: "text-3xl -top-1 -right-1" },
};

export default function AvatarDisplay({
  emoji,
  color,
  accessory,
  size = "md",
  className = "",
}: AvatarDisplayProps) {
  const sizes = SIZE_CLASSES[size];
  return (
    <div
      className={`relative ${sizes.container} rounded-full flex items-center justify-center flex-shrink-0 ${COLOR_BG[color] || "bg-yellow-200"} ${className}`}
      aria-label={`Avatar ${emoji}${accessory !== "none" ? ` dengan ${accessory}` : ""}`}
    >
      <span className={sizes.emoji} aria-hidden="true">{emoji}</span>
      {accessory !== "none" && accessory !== undefined && (
        <span
          className={`absolute ${sizes.accessory}`}
          aria-hidden="true"
        >
          {ACCESSORY_EMOJI[accessory] || ""}
        </span>
      )}
    </div>
  );
}
