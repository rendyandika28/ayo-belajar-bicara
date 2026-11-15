"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { dailyDoas } from "@/data/islamic";
import { useAppStore } from "@/store/useAppStore";
import { speak, playWithProgress, partFills, stopAudio, createSpeechRecognition, isSpeechRecognitionSupported } from "@/lib/speech";
import { playPop, playApplause } from "@/lib/sounds";
import GameShell from "@/components/ui/GameShell";
import BigButton from "@/components/ui/BigButton";
import Icon from "@/components/ui/Icon";
import ConfettiEffect from "@/components/ui/ConfettiEffect";
import AssetImage from "@/components/ui/AssetImage";

export default function DoaHarianPage() {
  const { doasAttempted, markDoaAttempted, addStar } = useAppStore();
  const [selectedDoaId, setSelectedDoaId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shownDoas = q
    ? dailyDoas.filter((d) => `${d.title} ${d.situation} ${d.latin}`.toLowerCase().includes(q))
    : dailyDoas;
  const [isListening, setIsListening] = useState(false);
  // Playback progress of "Dengar" (0..1, -1 = not playing); drives the live highlight.
  const [progress, setProgress] = useState(-1);
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
    stopAudio();
    setSelectedDoaId(doaId);
    setProgress(-1);
    setShowSuccess(false);
    successRef.current = false;
    setIsListening(false);
  }, []);

  const handleBack = useCallback(() => {
    playPop();
    stopAudio();
    setSelectedDoaId(null);
    setProgress(-1);
    setShowSuccess(false);
    successRef.current = false;
    setIsListening(false);
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
  }, []);

  const handleListen = useCallback(() => {
    if (!selectedDoa) return;
    const played = playWithProgress(
      selectedDoa.latin,
      setProgress,
      () => setProgress(-1)
    );
    if (!played) speak(selectedDoa.latin, { rate: 0.6 });
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

  // Cleanup recognition and audio on unmount
  useEffect(() => {
    return () => {
      stopAudio();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const supportsSpeechRecognition = isSpeechRecognitionSupported();

  // Karaoke fill: how much of each Arabic word / Latin syllable has been read (0..1).
  // Arabic weighted by letters without harakat so vowel marks don't skew timing.
  const arabicWords = selectedDoa ? selectedDoa.arabic.split(" ") : [];
  const playing = progress >= 0;
  const wordFill = playing ? partFills(arabicWords.map((w) => w.replace(/[\u064B-\u0652\u0670]/g, "")), progress) : [];
  const sylFill = playing && selectedDoa ? partFills(selectedDoa.syllablesLatin, progress) : [];

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
            <label className="block mb-3">
              <span className="sr-only">Cari doa</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari doa, misal: makan, tidur"
                className="w-full min-h-[52px] rounded-full border-2 border-line bg-surface px-5 font-body text-lg text-ink placeholder:text-ink-muted focus:border-accent-strong focus:outline-none"
              />
            </label>
            {shownDoas.length === 0 && (
              <p className="font-body text-lg text-ink-muted text-center py-8">Doa &ldquo;{query}&rdquo; belum ada.</p>
            )}
            {/* Square cards: picture on top, title + when to read below */}
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {shownDoas.map((doa) => {
                const isAttempted = doasAttempted.includes(doa.id);
                return (
                  <li key={doa.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectDoa(doa.id)}
                      className="relative w-full h-full bg-surface rounded-3xl p-2 border border-line flex flex-col gap-2 text-left transition-colors hover:bg-accent-soft active:bg-line"
                    >
                      <AssetImage src={`/images/doa/${doa.id}.webp`} className="w-full aspect-square rounded-2xl" />
                      <span className="px-1 pb-1 min-w-0">
                        <span className="block font-heading text-base sm:text-lg font-bold text-ink leading-tight">{doa.title}</span>
                        <span className="block text-sm text-ink-muted font-body">{doa.situation}</span>
                      </span>
                      {isAttempted && (
                        <span className="absolute top-3 right-3 w-8 h-8 rounded-full bg-good-strong text-on-accent flex items-center justify-center" role="img" aria-label="Sudah dicoba">
                          <Icon name="check" size={20} />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        ) : (
          /* ==================== DETAIL VIEW ==================== */
          <motion.div
            key="detail-view"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25 }}
            className="max-w-lg mx-auto flex flex-col gap-3 h-[calc(100dvh-13rem)] sm:h-[calc(100dvh-11rem)] min-h-[440px] max-h-[760px]"
          >
            {/* Title row */}
            <div className="shrink-0 flex items-center gap-3">
              <AssetImage src={`/images/doa/${selectedDoa.id}.webp`} eager className="w-14 h-14 shrink-0 rounded-xl" />
              <div className="min-w-0">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-ink leading-tight">{selectedDoa.title}</h2>
                <p className="text-sm text-ink-muted font-body">Dibaca saat: {selectedDoa.situation}</p>
              </div>
            </div>

            {/* Text: scrolls inside the card when a doa is long */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-surface rounded-3xl border border-line p-4 flex flex-col gap-3">
              <p className="font-arabic text-3xl sm:text-4xl text-right text-ink leading-loose" dir="rtl" lang="ar">
                {arabicWords.map((w, i) => (
                  <span key={i}>
                    {/* Coloured copy on top, revealed right-to-left: whole word stays one shaped run. */}
                    <span className="relative inline-block">
                      {/* While playing, unread text dims so the read part stands out */}
                      <span className={playing ? "text-ink-muted opacity-60" : ""}>{w}</span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 text-accent-strong"
                        style={{ clipPath: `inset(-50% 0 -50% ${(1 - (wordFill[i] ?? 0)) * 100}%)` }}
                      >
                        {w}
                      </span>
                    </span>{" "}
                  </span>
                ))}
              </p>
              <p className="text-lg text-ink leading-relaxed font-body text-center">{selectedDoa.latin}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {selectedDoa.syllablesLatin.map((syl, i) => (
                  <button
                    key={`${syl}-${i}`}
                    type="button"
                    onClick={() => handleSyllableTap(syl)}
                    className="relative overflow-hidden bg-accent-soft text-ink font-heading text-base px-3 rounded-full min-w-[44px] min-h-[44px] border border-line hover:bg-line active:bg-line"
                  >
                    {syl}
                    {/* Fill sweeps left-to-right as the syllable is read */}
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center bg-accent-strong text-on-accent"
                      style={{ clipPath: `inset(0 ${(1 - (sylFill[i] ?? 0)) * 100}% 0 0)` }}
                    >
                      {syl}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-ink-muted text-center font-body text-base leading-relaxed">
                Artinya: {selectedDoa.meaning}
              </p>
              <p className="mt-auto pt-1 text-center font-body text-xs text-ink-muted">
                {selectedDoa.quran ? (
                  <>Sumber teks: {selectedDoa.quran}, mushaf Tanzil (<a href="https://tanzil.net" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">tanzil.net</a>)</>
                ) : (
                  <>Sumber: doa harian dari hadits, teks belum diverifikasi ustadz</>
                )}
              </p>
            </div>

            {/* Actions */}
            {showSuccess ? (
              <div className="shrink-0 bg-surface border border-good-strong rounded-3xl min-h-[72px] px-4 flex items-center justify-center gap-3">
                <span className="w-10 h-10 rounded-full bg-good-strong text-on-accent flex items-center justify-center">
                  <Icon name="star" size={22} />
                </span>
                <p className="font-heading text-xl text-ink font-bold">MasyaAllah! +3 bintang</p>
              </div>
            ) : (
              <div className="shrink-0 grid grid-cols-2 gap-3">
                <BigButton tone="quiet" onClick={handleListen}>
                  <Icon name="speaker" /> Dengar
                </BigButton>
                {supportsSpeechRecognition ? (
                  <BigButton tone={isListening ? "primary" : "good"} onClick={handleTrySpeak} aria-pressed={isListening}>
                    <Icon name="mic" /> {isListening ? "Mendengar…" : "Ucapkan"}
                  </BigButton>
                ) : (
                  <BigButton tone="good" onClick={handleSuccess}>
                    <Icon name="check" /> Berhasil
                  </BigButton>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GameShell>
  );
}
