"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const AVATAR_EMOJIS = [
  "\ud83d\udc76", "\ud83d\udc67", "\ud83d\udc66", "\ud83d\udc68", "\ud83d\udc69",
  "\ud83e\uddd2", "\ud83d\udc70", "\ud83e\uddd1", "\ud83c\udf85", "\ud83d\udc7c",
];

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

const ACCESSORIES = [
  { id: "none", emoji: "", label: "Tidak Ada" },
  { id: "hat", emoji: "\ud83c\udfa9", label: "Topi" },
  { id: "crown", emoji: "\ud83d\udc51", label: "Mahkota" },
  { id: "glasses", emoji: "\ud83d\udc53", label: "Kacamata" },
  { id: "flower", emoji: "\ud83c\udf38", label: "Bunga" },
  { id: "star", emoji: "\u2b50", label: "Bintang" },
  { id: "bow", emoji: "\ud83c\udf80", label: "Pita" },
  { id: "balloon", emoji: "\ud83c\udf88", label: "Balon" },
];

interface AvatarBuilderProps {
  initialEmoji: string;
  initialColor: string;
  initialAccessory: string;
  onSave: (emoji: string, color: string, accessory: string) => void;
  onClose: () => void;
  profileName?: string;
}

export default function AvatarBuilder({
  initialEmoji,
  initialColor,
  initialAccessory,
  onSave,
  onClose,
  profileName,
}: AvatarBuilderProps) {
  const [emoji, setEmoji] = useState(initialEmoji);
  const [color, setColor] = useState(initialColor);
  const [accessory, setAccessory] = useState(initialAccessory);

  const handleSave = () => {
    onSave(emoji, color, accessory);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-3xl p-6 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="avatar-builder-title"
      >
        <h2
          id="avatar-builder-title"
          className="font-heading text-xl font-bold text-foreground text-center mb-4"
        >
          Atur Avatar{profileName ? ` ${profileName}` : ""}
        </h2>

        {/* Preview */}
        <div className="flex justify-center mb-6">
          <div
            className={`relative w-32 h-32 rounded-full flex items-center justify-center ${COLOR_BG[color] || "bg-yellow-200"}`}
            aria-label="Preview avatar"
          >
            <span className="text-6xl" aria-hidden="true">{emoji}</span>
            {accessory !== "none" && (
              <span
                className="absolute -top-2 -right-2 text-3xl"
                aria-hidden="true"
              >
                {ACCESSORIES.find((a) => a.id === accessory)?.emoji}
              </span>
            )}
          </div>
        </div>

        {/* Emoji picker */}
        <div className="mb-4">
          <p className="font-heading text-sm font-semibold text-foreground/70 mb-2">
            Pilih Karakter
          </p>
          <div className="grid grid-cols-5 gap-2">
            {AVATAR_EMOJIS.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-2xl min-h-[48px] ${
                  emoji === e
                    ? "bg-purple-100 border-purple-400"
                    : "bg-gray-50 border-gray-200"
                }`}
                aria-pressed={emoji === e}
                aria-label={`Pilih karakter ${e}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="mb-4">
          <p className="font-heading text-sm font-semibold text-foreground/70 mb-2">
            Pilih Warna Latar
          </p>
          <div className="grid grid-cols-5 gap-2">
            {Object.keys(COLOR_BG).map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`aspect-square rounded-full border-2 min-h-[44px] ${COLOR_BG[c]} ${
                  color === c ? "border-foreground" : "border-white"
                }`}
                aria-pressed={color === c}
                aria-label={`Pilih warna ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Accessory picker */}
        <div className="mb-6">
          <p className="font-heading text-sm font-semibold text-foreground/70 mb-2">
            Pilih Aksesoris
          </p>
          <div className="grid grid-cols-4 gap-2">
            {ACCESSORIES.map((a) => (
              <button
                key={a.id}
                onClick={() => setAccessory(a.id)}
                className={`rounded-2xl border-2 flex flex-col items-center gap-1 py-2 min-h-[60px] ${
                  accessory === a.id
                    ? "bg-purple-100 border-purple-400"
                    : "bg-gray-50 border-gray-200"
                }`}
                aria-pressed={accessory === a.id}
                aria-label={`Pilih aksesoris ${a.label}`}
              >
                <span className="text-xl" aria-hidden="true">{a.emoji || "\u2796"}</span>
                <span className="font-body text-[10px] text-foreground/60">
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-foreground/70 font-heading text-base py-3 rounded-full"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-purple-500 text-white font-heading text-base py-3 rounded-full"
          >
            Simpan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
