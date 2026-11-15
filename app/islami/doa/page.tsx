"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dailyDoas } from "@/data/islamic";
import { useAppStore } from "@/store/useAppStore";
import { speak, createSpeechRecognition, isSpeechRecognitionSupported } from "@/lib/speech";
import { playPop, playApplause } from "@/lib/sounds";
import GameShell from "@/components/ui/GameShell";
import BigButton from "@/components/ui/BigButton";
import Icon from "@/components/ui/Icon";
import ConfettiEffect from "@/components/ui/ConfettiEffect";

export default function DoaHarianPage() {
  const { doasAttempted, markDoaAttempted, addStar } = useAppStore();
  const [selectedDoaId, setSelectedDoaId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const recognitionRef = useRef<ReturnType<typeof createSpeechRecognition>>(null);
  // Speech can fire onresult more than once per attempt; award the stars once.
  const successRef = useRef(false);

  const selectedDoa = selectedDoaId
    ? dailyDoas.find((d) => d.id === selectedDoaId) || null
    : null;

  const handleSelectDoa = useCallback((doaId: string) => {
    playPop();
    setSelectedDoaId(doaId);
    setShowSuccess(false);
    successRef.current = false;
    setIsListening(false);
  }, []);

  const handleBack = useCallback(() => {
    playPop();
    setSelectedDoaId(null);
    setShowSuccess(false);
    successRef.current = false;
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
    if (!selectedDoa || successRef.current) return;
    successRef.current = true;
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
    <GameShell title="Doa Harian" backHref="/islami" onBack={selectedDoa ? handleBack : undefined} backLabel={selectedDoa ? "Kembali ke daftar doa" : "Kembali ke menu Islami"}>
      <ConfettiEffect show={showConfetti} />

      <AnimatePresence mode="wait">
        {!selectedDoa ? (
          /* ==================== LIST VIEW ==================== */
          <motion.div
            key="list-view"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
          >
            <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
              {dailyDoas.map((doa) => {
                const isAttempted = doasAttempted.includes(doa.id);
                return (
                  <motion.button
                    key={doa.id}
                    onClick={() => handleSelectDoa(doa.id)}
                    className="relative bg-surface rounded-3xl p-4 border border-line flex flex-col items-center text-center min-h-[140px] transition-colors hover:bg-accent-soft active:bg-line"
                    whileTap={{ scale: 0.97 }}
                  >
                    {isAttempted && (
                      <span className="absolute top-2 right-2 w-8 h-8 rounded-full bg-good-strong text-on-accent flex items-center justify-center" role="img" aria-label="Sudah dicoba">
                        <Icon name="check" size={20} />
                      </span>
                    )}
                    <span className="text-5xl mb-2">{doa.emoji}</span>
                    <h3 className="font-heading text-lg font-bold text-ink leading-tight">{doa.title}</h3>
                    <p className="text-sm text-ink-muted mt-1 font-body">{doa.situation}</p>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          /* ==================== DETAIL VIEW ==================== */
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25 }}
            className="max-w-lg mx-auto flex flex-col gap-4"
          >
            <div className="bg-surface rounded-3xl border border-line p-5 sm:p-6">
              <div className="text-center mb-3">
                <span className="text-6xl">{selectedDoa.emoji}</span>
              </div>

              <h2 className="font-heading text-3xl font-bold text-ink text-center mb-1">{selectedDoa.title}</h2>
              <p className="text-center text-base text-ink-muted font-body mb-4">
                Dibaca saat: {selectedDoa.situation}
              </p>

              {/* Arabic text */}
              <div className="bg-paper p-6 rounded-2xl mb-4" dir="rtl" lang="ar">
                <p className="font-arabic text-4xl text-right text-ink leading-loose">{selectedDoa.arabic}</p>
              </div>

              {/* Latin transliteration */}
              <div className="mb-3">
                <p className="text-xl text-ink leading-relaxed font-body text-center mb-3">{selectedDoa.latin}</p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {selectedDoa.syllablesLatin.map((syl, i) => (
                    <button
                      key={`${syl}-${i}`}
                      type="button"
                      onClick={() => handleSyllableTap(syl)}
                      className="bg-accent-soft text-ink font-heading text-lg px-4 rounded-full min-w-[48px] min-h-[48px] border border-line transition-colors hover:bg-line active:bg-line"
                    >
                      {syl}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-ink-muted italic text-center font-body text-base mb-5 leading-relaxed">
                &ldquo;{selectedDoa.meaning}&rdquo;
              </p>

              <div className="flex flex-col gap-3">
                <BigButton onClick={handleListen} className="w-full">
                  <Icon name="speaker" /> Dengar
                </BigButton>

                {!showSuccess && (
                  <>
                    {supportsSpeechRecognition ? (
                      <BigButton
                        tone={isListening ? "primary" : "good"}
                        onClick={handleTrySpeak}
                        aria-pressed={isListening}
                        className="w-full"
                      >
                        <Icon name="mic" /> {isListening ? "Sedang mendengar…" : "Coba Ucapkan"}
                      </BigButton>
                    ) : (
                      <BigButton tone="good" onClick={handleSuccess} className="w-full">
                        <Icon name="check" /> Berhasil
                      </BigButton>
                    )}
                  </>
                )}

                {showSuccess && (
                  <motion.div
                    className="bg-paper rounded-2xl p-5 text-center flex flex-col items-center gap-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                  >
                    <span className="w-14 h-14 rounded-full bg-good-strong text-on-accent flex items-center justify-center">
                      <Icon name="star" size={28} />
                    </span>
                    <p className="font-heading text-2xl text-ink font-bold">MasyaAllah! Hebat!</p>
                    <p className="font-body text-base text-ink-muted">+3 bintang</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
