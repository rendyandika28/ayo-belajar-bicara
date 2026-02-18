"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { dailyDoas } from "@/data/islamic";
import { useAppStore } from "@/store/useAppStore";
import { speak, createSpeechRecognition, isSpeechRecognitionSupported } from "@/lib/speech";
import { playPop, playApplause } from "@/lib/sounds";
import StarCounter from "@/components/ui/StarCounter";
import FocusModeButton from "@/components/focus/FocusModeButton";

function Confetti() {
  const pieces = useMemo(() => {
    const colors = ["#10b981","#f59e0b","#ef4444","#3b82f6","#8b5cf6","#ec4899","#14b8a6","#f97316"];
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[i % colors.length],
      delay: Math.random() * 1,
      size: 8 + Math.random() * 8,
      round: Math.random() > 0.5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece absolute"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.round ? "50%" : "2px",
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

export default function DoaHarianPage() {
  const { doasAttempted, markDoaAttempted, addStar } = useAppStore();
  const [selectedDoaId, setSelectedDoaId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition>>(null);

  const selectedDoa = selectedDoaId
    ? dailyDoas.find((d) => d.id === selectedDoaId) || null
    : null;

  const handleSelectDoa = useCallback((doaId: string) => {
    playPop();
    setSelectedDoaId(doaId);
    setShowSuccess(false);
    setIsListening(false);
  }, []);

  const handleBack = useCallback(() => {
    playPop();
    setSelectedDoaId(null);
    setShowSuccess(false);
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  }, []);

  const handleListen = useCallback(() => {
    if (!selectedDoa) return;
    speak(selectedDoa.latin, { rate: 0.6 });
  }, [selectedDoa]);

  const handleSyllableTap = useCallback((syllable: string) => {
    playPop();
    speak(syllable, { rate: 0.6 });
  }, []);

  const handleSuccess = useCallback(() => {
    if (!selectedDoa) return;
    setShowSuccess(true);
    setShowConfetti(true);
    setIsListening(false);
    playApplause();
    markDoaAttempted(selectedDoa.id);
    addStar(3);
    setTimeout(() => setShowConfetti(false), 3000);
  }, [selectedDoa, markDoaAttempted, addStar]);

  const handleTrySpeak = useCallback(() => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = createSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    setIsListening(true);

    recognition.onresult = () => {
      // VERY EASY mode - any sound detected counts as success
      recognition.stop();
      handleSuccess();
    };

    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [isListening, handleSuccess]);

  // Cleanup recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const supportsSpeechRecognition = isSpeechRecognitionSupported();

  return (
    <motion.div
      className="islamic-pattern min-h-screen px-4 py-4 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {showConfetti && <Confetti />}

      <AnimatePresence mode="wait">
        {!selectedDoa ? (
          /* ==================== LIST VIEW ==================== */
          <motion.div
            key="list-view"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Link href="/islami">
                  <motion.button
                    className="w-[52px] h-[52px] flex items-center justify-center bg-white/80 rounded-full shadow-md border-2 border-gray-200 text-2xl"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label="Kembali ke halaman Islami"
                  >
                    {"◀️"}
                  </motion.button>
                </Link>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-emerald-800">
                  Doa Harian {"🤲"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <FocusModeButton />
                <StarCounter />
              </div>
            </div>

            {/* Grid of doa cards */}
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {dailyDoas.map((doa, index) => {
                const isAttempted = doasAttempted.includes(doa.id);
                return (
                  <motion.button
                    key={doa.id}
                    onClick={() => handleSelectDoa(doa.id)}
                    className="relative bg-white rounded-2xl p-4 shadow-lg border-2 border-emerald-200 flex flex-col items-center text-center min-h-[140px] cursor-pointer active:bg-emerald-50 transition-colors"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.05,
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isAttempted && (
                      <div className="absolute top-2 right-2 text-lg">
                        {"✅"}
                      </div>
                    )}
                    <span className="text-4xl mb-2">{doa.emoji}</span>
                    <h3 className="font-heading text-lg font-bold text-emerald-800 leading-tight">
                      {doa.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 font-body">
                      {doa.situation}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* ==================== DETAIL VIEW ==================== */
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="max-w-lg mx-auto"
          >
            {/* Back button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleBack}
                  className="w-[52px] h-[52px] flex items-center justify-center bg-white/80 rounded-full shadow-md border-2 border-gray-200 text-2xl"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Kembali ke daftar doa"
                >
                  {"◀️"}
                </motion.button>
                <p className="font-body text-sm text-emerald-600/80">
                  Kembali ke daftar
                </p>
              </div>
              <StarCounter />
            </div>

            {/* Doa content card */}
            <div className="bg-white rounded-3xl shadow-xl border-2 border-emerald-200 p-5 sm:p-6">
              {/* Emoji */}
              <motion.div
                className="text-center mb-3"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <span className="text-6xl">{selectedDoa.emoji}</span>
              </motion.div>

              {/* Title */}
              <h2 className="font-heading text-2xl font-bold text-emerald-800 text-center mb-1">
                {selectedDoa.title}
              </h2>

              {/* Situation */}
              <p className="text-center text-sm text-amber-700 font-body mb-4">
                Dibaca saat: {selectedDoa.situation}
              </p>

              {/* Arabic text */}
              <div
                className="bg-emerald-50 p-6 rounded-2xl mb-4"
                dir="rtl"
              >
                <p
                  className="text-3xl text-right text-emerald-900 leading-loose"
                  style={{ fontFamily: "var(--font-amiri)" }}
                >
                  {selectedDoa.arabic}
                </p>
              </div>

              {/* Latin transliteration */}
              <div className="mb-3">
                <p className="text-xl text-emerald-800 leading-relaxed font-body text-center mb-3">
                  {selectedDoa.latin}
                </p>

                {/* Syllable pills */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {selectedDoa.syllablesLatin.map((syl, i) => (
                    <motion.button
                      key={`${syl}-${i}`}
                      onClick={() => handleSyllableTap(syl)}
                      className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-heading text-base px-3 py-1.5 rounded-full min-w-[44px] min-h-[44px] border border-emerald-300 active:bg-emerald-300 transition-colors"
                      whileTap={{ scale: 0.9 }}
                    >
                      {syl}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Meaning */}
              <p className="text-gray-600 italic text-center font-body text-sm mb-5 leading-relaxed">
                &ldquo;{selectedDoa.meaning}&rdquo;
              </p>

              {/* Action buttons */}
              <div className="flex flex-col gap-3">
                {/* Listen button */}
                <motion.button
                  onClick={handleListen}
                  className="w-full bg-emerald-600 text-white font-heading text-lg py-4 rounded-2xl shadow-lg min-h-[64px] active:bg-emerald-700 transition-colors"
                  whileTap={{ scale: 0.95 }}
                >
                  {"🔊"} Dengar
                </motion.button>

                {/* Try speaking button */}
                {!showSuccess && (
                  <>
                    {supportsSpeechRecognition ? (
                      <motion.button
                        onClick={handleTrySpeak}
                        className={`w-full font-heading text-lg py-4 rounded-2xl shadow-lg min-h-[64px] transition-colors ${
                          isListening
                            ? "bg-red-500 text-white animate-pulse-mic"
                            : "bg-amber-500 text-white active:bg-amber-600"
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isListening ? "🎤 Sedang mendengar..." : "🎤 Coba Ucapkan"}
                      </motion.button>
                    ) : (
                      <motion.button
                        onClick={handleSuccess}
                        className="w-full bg-amber-500 text-white font-heading text-lg py-4 rounded-2xl shadow-lg min-h-[64px] active:bg-amber-600 transition-colors"
                        whileTap={{ scale: 0.95 }}
                      >
                        Berhasil {"✅"}
                      </motion.button>
                    )}
                  </>
                )}

                {/* Success message */}
                {showSuccess && (
                  <motion.div
                    className="bg-gradient-to-r from-emerald-100 to-amber-100 rounded-2xl p-5 text-center border-2 border-emerald-300"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <p className="text-3xl mb-2">{"🌟"}</p>
                    <p className="font-heading text-xl text-emerald-800 font-bold">
                      MasyaAllah! Hebat! {"🌟"}
                    </p>
                    <p className="font-body text-sm text-emerald-600 mt-1">
                      +3 bintang
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
