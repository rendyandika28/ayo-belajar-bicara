"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { speak } from "@/lib/speech";
import { Word } from "@/data/words";
import { SafeInput } from "@/components/ui/SafeInput";
import { ScrollArea } from "@/components/ui/ScrollArea";

interface PhotoWordCreatorProps {
  open: boolean;
  onClose: () => void;
}

export default function PhotoWordCreator({ open, onClose }: PhotoWordCreatorProps) {
  const addCustomWord = useAppStore((s) => s.addCustomWord);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [word, setWord] = useState("");
  const [syllables, setSyllables] = useState("");
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(1);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setError("File terlalu besar. Maks 500KB.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("File harus gambar (JPEG, PNG, dll).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result as string);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!imageData || !word.trim() || !syllables.trim()) {
      setError("Lengkapi semua field.");
      return;
    }
    const syllableArr = syllables
      .split(/[,\s-]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (syllableArr.length === 0) {
      setError("Suku kata tidak valid.");
      return;
    }

    const newWord: Word = {
      id: "foto-" + Date.now(),
      emoji: "\ud83d\udcf7",
      image: imageData,
      word: word.trim().toLowerCase(),
      syllables: syllableArr,
      category: "foto",
      difficulty,
    };

    addCustomWord(newWord);
    handleReset();
    onClose();
    // Speak the word to confirm
    setTimeout(() => speak(newWord.word, { rate: 0.7 }), 300);
  };

  const handleReset = () => {
    setImageData(null);
    setWord("");
    setSyllables("");
    setDifficulty(1);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-word-title"
          >
            <ScrollArea className="max-h-[90vh] p-6">
              <h2
                id="photo-word-title"
                className="font-heading text-xl font-bold text-foreground text-center mb-2"
              >
                {"\ud83d\udcf7"} Tambah Kata dari Foto
              </h2>
              <p className="font-body text-xs text-foreground/60 text-center mb-4">
                Foto benda di rumah, jadi flashcard personal untuk si kecil
              </p>

            {/* Image upload */}
            <div className="mb-4">
              <p className="font-heading text-sm font-semibold text-foreground/70 mb-2">
                1. Pilih Foto
              </p>
              {imageData ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageData}
                    alt="Preview foto"
                    className="w-full h-48 object-cover rounded-2xl border-2 border-gray-200"
                  />
                  <button
                    onClick={() => setImageData(null)}
                    className="absolute top-2 right-2 bg-white/80 rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-white"
                    aria-label="Hapus foto"
                  >
                    {"\u2716"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-purple-400 transition-colors"
                >
                  <span className="text-4xl" aria-hidden="true">{"\ud83d\udcf7"}</span>
                  <span className="font-heading text-sm text-foreground/70">
                    Ambil / Pilih Foto
                  </span>
                  <span className="font-body text-xs text-foreground/40">
                    Maks 500KB
                  </span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFile}
                className="hidden"
                aria-label="Upload foto"
              />
            </div>

            {/* Word input */}
            <div className="mb-3">
              <label className="font-heading text-sm font-semibold text-foreground/70 block mb-1">
                2. Kata
              </label>
              <SafeInput
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="contoh: boneka"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                aria-label="Kata"
              />
            </div>

            {/* Syllables input */}
            <div className="mb-3">
              <label className="font-heading text-sm font-semibold text-foreground/70 block mb-1">
                3. Suku Kata
              </label>
              <SafeInput
                type="text"
                value={syllables}
                onChange={(e) => setSyllables(e.target.value)}
                placeholder="bo, ne, ka"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 font-body text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                aria-label="Suku kata, pisahkan dengan koma"
              />
              <p className="font-body text-[10px] text-foreground/40 mt-1">
                Pisahkan dengan koma atau spasi
              </p>
            </div>

            {/* Difficulty */}
            <div className="mb-3">
              <label className="font-heading text-sm font-semibold text-foreground/70 block mb-1">
                4. Kesulitan
              </label>
              <div className="flex gap-2">
                {[1, 2, 3].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d as 1 | 2 | 3)}
                    className={`flex-1 py-2 rounded-lg font-heading text-sm border-2 min-h-[44px] ${
                      difficulty === d
                        ? "bg-purple-100 border-purple-400"
                        : "bg-white border-gray-200"
                    }`}
                    aria-pressed={difficulty === d}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="font-body text-sm text-red-500 mb-3" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="flex-1 bg-gray-100 text-foreground/70 font-heading text-base py-3 rounded-full"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={!imageData || !word.trim() || !syllables.trim()}
                className="flex-1 bg-purple-500 text-white font-heading text-base py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Simpan
              </button>
            </div>
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
