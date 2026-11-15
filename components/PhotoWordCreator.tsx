"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { speak } from "@/lib/speech";
import { Word } from "@/data/words";

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
          className="fixed inset-0 z-[95] flex items-center justify-center bg-[var(--scrim)] px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-surface border border-line rounded-3xl max-w-md w-full"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="photo-word-title"
          >
            <div className="max-h-[90vh] overflow-y-auto [-webkit-overflow-scrolling:touch] [overscroll-behavior:contain] p-6">
              <h2
                id="photo-word-title"
                className="flex items-center justify-center gap-2 font-heading text-xl font-bold text-ink text-center mb-2"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
                Tambah Kata dari Foto
              </h2>
              <p className="font-body text-sm text-ink-muted text-center mb-4">
                Foto benda di rumah, jadi flashcard personal untuk si kecil
              </p>

            {/* Image upload */}
            <div className="mb-4">
              <p className="font-heading text-base font-semibold text-ink mb-2">
                1. Pilih Foto
              </p>
              {imageData ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageData}
                    alt="Preview foto"
                    className="w-full h-48 object-cover rounded-2xl border border-line"
                  />
                  <button
                    onClick={() => setImageData(null)}
                    className="absolute top-2 right-2 bg-surface text-ink border border-line rounded-full w-11 h-11 flex items-center justify-center hover:bg-accent-soft transition-colors"
                    aria-label="Hapus foto"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-line rounded-2xl flex flex-col items-center justify-center gap-2 text-accent-strong hover:border-accent hover:bg-accent-soft transition-colors"
                >
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></svg>
                  <span className="font-heading text-base text-ink">
                    Ambil / Pilih Foto
                  </span>
                  <span className="font-body text-sm text-ink-muted">
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
              <label className="font-heading text-base font-semibold text-ink block mb-1">
                2. Kata
              </label>
              <input
                type="text"
                size={1}
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="contoh: boneka"
                className="min-w-0 w-full min-h-[44px] bg-surface border border-line rounded-xl px-3 py-2 font-body text-base text-ink"
                aria-label="Kata"
              />
            </div>

            {/* Syllables input */}
            <div className="mb-3">
              <label className="font-heading text-base font-semibold text-ink block mb-1">
                3. Suku Kata
              </label>
              <input
                type="text"
                size={1}
                value={syllables}
                onChange={(e) => setSyllables(e.target.value)}
                placeholder="bo, ne, ka"
                className="min-w-0 w-full min-h-[44px] bg-surface border border-line rounded-xl px-3 py-2 font-body text-base text-ink"
                aria-label="Suku kata, pisahkan dengan koma"
              />
              <p className="font-body text-sm text-ink-muted mt-1">
                Pisahkan dengan koma atau spasi
              </p>
            </div>

            {/* Difficulty */}
            <div className="mb-3">
              <label className="font-heading text-base font-semibold text-ink block mb-1">
                4. Kesulitan
              </label>
              <div className="flex gap-2">
                {[1, 2, 3].map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d as 1 | 2 | 3)}
                    className={`flex-1 py-2 rounded-xl font-heading text-base text-ink border-2 min-h-[44px] transition-colors ${
                      difficulty === d
                        ? "bg-accent-soft border-accent-strong"
                        : "bg-surface border-line hover:bg-accent-soft"
                    }`}
                    aria-pressed={difficulty === d}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <p className="font-body text-sm text-danger-strong mb-3" role="alert">
                {error}
              </p>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  handleReset();
                  onClose();
                }}
                className="flex-1 bg-paper text-ink border border-line font-heading text-base min-h-[48px] rounded-full hover:bg-accent-soft transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={!imageData || !word.trim() || !syllables.trim()}
                className="flex-1 bg-accent-strong text-on-accent font-heading text-base min-h-[48px] rounded-full hover:bg-ink transition-colors"
              >
                Simpan
              </button>
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
