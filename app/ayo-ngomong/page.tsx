"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { words } from "@/data/words";
import { useAppStore } from "@/store/useAppStore";
import {
  speak,
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  SpeechRecognitionInstance,
} from "@/lib/speech";
import { playCorrect, playPop, playApplause } from "@/lib/sounds";
import { judge } from "@/lib/fuzzyMatch";
import ConfettiEffect from "@/components/ui/ConfettiEffect";
import GameShell from "@/components/ui/GameShell";
import BigButton from "@/components/ui/BigButton";
import GameTutorial from "@/components/GameTutorial";
import WordPicture from "@/components/WordPicture";

const WORDS_PER_SESSION = 8;

export default function AyoNgomongPage() {
  const { addStar, markWordLearned, incrementSession, recordGamePlay } =
    useAppStore();

  useEffect(() => { recordGamePlay("ayo-ngomong"); }, [recordGamePlay]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<"match" | "close" | "no" | "no_speech" | "blocked" | null>(
    null
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const autoAdvanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const [sessionWords, setSessionWords] = useState<typeof words>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const pool = words.filter((w) => w.difficulty <= 2);
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setSessionWords(shuffled.slice(0, WORDS_PER_SESSION));
  }, []);

  const currentWord = sessionWords[currentIndex];

  // Check speech recognition support on mount
  useEffect(() => {
    setSupported(isSpeechRecognitionSupported());
  }, []);

  // Auto-play word when card appears
  useEffect(() => {
    if (currentWord && !sessionComplete) {
      const timer = setTimeout(() => {
        speak(currentWord.word);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentWord, sessionComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (autoAdvanceTimerRef.current) {
        clearTimeout(autoAdvanceTimerRef.current);
      }
    };
  }, []);

  const advancingRef = useRef(false);

  const advanceToNext = useCallback(() => {
    // Manual tap and the auto-advance timer must not both advance one word.
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    if (advancingRef.current) return;
    advancingRef.current = true;
    // A late onresult from the previous word must not score it or skip the next one.
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }
    setIsListening(false);
    if (currentIndex < sessionWords.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTranscript("");
      setFeedback(null);
      setShowConfetti(false);
    } else {
      // Session complete
      setSessionComplete(true);
      incrementSession();
      playApplause();
    }
  }, [currentIndex, sessionWords.length, incrementSession]);

  // Re-arm the advance guard once the next word (or a restart) has rendered.
  useEffect(() => {
    advancingRef.current = false;
  }, [currentIndex, sessionComplete]);

  const handleMatch = useCallback(() => {
    setFeedback("match");
    setShowConfetti(true);
    playCorrect();
    addStar(2);
    setScore((prev) => prev + 1);
    if (currentWord) {
      markWordLearned(currentWord.id);
    }

    if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
    autoAdvanceTimerRef.current = setTimeout(() => {
      autoAdvanceTimerRef.current = null;
      advanceToNext();
    }, 2000);
  }, [addStar, advanceToNext, currentWord, markWordLearned]);

  // Parent override (or no speech support): same reward as a heard match.
  const handleManualSuccess = handleMatch;

  const startListening = useCallback(() => {
    if (isListening) {
      // Stop listening
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // Reset state for new attempt
    setTranscript("");
    setFeedback(null);
    setShowConfetti(false);

    const recognition = createSpeechRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;

    let hasResult = false;
    let settled = false; // a verdict or error already shown

    recognition.onresult = (event) => {
      if (recognitionRef.current !== recognition || !currentWord) return; // aborted/stale instance
      let top = "";
      let isFinal = false;
      const alternatives: string[] = [];
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        hasResult = true;
        top += result[0].transcript;
        if (result.isFinal) isFinal = true;
        for (let j = 1; j < result.length; j++) alternatives.push(result[j].transcript);
      }

      const { result, heard } = judge(top, alternatives, currentWord.word, isFinal);
      setTranscript(heard); // show the guess that was judged, not always the top one
      if (result === "match") {
        settled = true;
        recognition.abort();
        recognitionRef.current = null;
        setIsListening(false);
        handleMatch();
      } else if (result) {
        settled = true;
        setFeedback(result);
        if (result === "close") playPop();
      }
    };

    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) return; // aborted/stale instance
      setIsListening(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        settled = true;
        setFeedback("blocked");
      }
    };

    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return; // aborted/stale instance
      setIsListening(false);
      if (settled) return;
      // Ended with nothing, or with only unfinished guesses that never matched.
      setFeedback(hasResult ? "no" : "no_speech");
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  }, [isListening, currentWord, handleMatch]);

  const handleReplay = useCallback(() => {
    if (currentWord) {
      speak(currentWord.word);
    }
  }, [currentWord]);

  const handleRestartSession = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setCurrentIndex(0);
    setTranscript("");
    setFeedback(null);
    setShowConfetti(false);
    setSessionComplete(false);
    setScore(0);
  }, []);

  // Render session complete / reward screen
  if (sessionComplete) {
    return (
      <GameShell title="Ayo Ngomong">
        <ConfettiEffect show={true} />

        <motion.section
          className="bg-surface rounded-3xl border border-line p-6 sm:p-8 max-w-md mx-auto text-center flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" className="text-warn" aria-hidden="true">
            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z" />
          </svg>
          <h2 className="font-heading text-3xl font-bold text-ink">Hebat Sekali!</h2>
          <p className="font-body text-xl text-ink-muted">Kamu sudah selesai latihan!</p>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-4xl font-heading font-bold text-ink">{score}</p>
              <p className="font-body text-base text-ink-muted">Benar</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-heading font-bold text-ink">{score * 2}</p>
              <p className="font-body text-base text-ink-muted">Bintang</p>
            </div>
          </div>
          <BigButton onClick={handleRestartSession} className="w-full sm:w-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            Main Lagi
          </BigButton>
        </motion.section>
      </GameShell>
    );
  }

  if (!isMounted || !currentWord) {
    return (
      <GameShell title="Ayo Ngomong">
        <p className="font-heading text-xl text-ink-muted text-center py-16">Memuat…</p>
      </GameShell>
    );
  }

  return (
    <GameShell title="Ayo Ngomong">
      <GameTutorial
        gameKey="ayo-ngomong"
        steps={[
          { image: "/images/ui/listen.webp", text: "Dengarkan kata yang muncul di layar, lalu tekan tombol mikrofon." },
          { image: "/images/words/akt-12.webp", text: "Ucapkan kata dengan jelas. Aplikasi akan menilai ucapanmu!" },
        ]}
      />

      {/* Fits one screen (dvh minus GameShell header/padding): no scrolling while playing. */}
      <div className="max-w-md mx-auto flex flex-col gap-3 h-[calc(100dvh-13rem)] sm:h-[calc(100dvh-11rem)] min-h-[460px] max-h-[760px]">
        {/* Progress bar */}
        <div className="shrink-0 flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-line rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-accent rounded-full origin-left"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: (currentIndex + 1) / WORDS_PER_SESSION }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <p className="font-body text-base text-ink-muted">
            {currentIndex + 1} / {WORDS_PER_SESSION}
          </p>
        </div>

        {/* Word Card: picture takes the leftover height */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord.id}
            className={`flex-1 min-h-0 bg-surface rounded-3xl border-2 p-4 sm:p-5 text-center flex flex-col items-center gap-2 transition-colors ${
              feedback === "match" ? "border-good-strong" : feedback ? "border-warn" : "border-line"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex-1 min-h-0 w-full flex items-center justify-center">
              <WordPicture word={currentWord} className="h-full max-h-56 aspect-square" />
            </div>
            <h2 className="shrink-0 font-heading text-3xl sm:text-4xl font-bold text-ink">
              {currentWord.word.toUpperCase()}
            </h2>

            {/* Transcript + feedback */}
            <div className="shrink-0 min-h-[32px]" aria-live="polite">
              {transcript && (
                <p className="font-body text-lg text-ink-muted">
                  Kamu bilang:{" "}
                  <span className="font-heading font-bold text-ink">{transcript}</span>
                </p>
              )}
              {feedback === "match" && (
                <p className="font-heading text-xl font-bold text-good-strong inline-flex items-center gap-2 mt-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12 5 5 9-10" />
              </svg>
                  Hebat!
                </p>
              )}
              {feedback === "close" && (
                <p className="font-heading text-lg font-bold text-ink mt-1">Bagus! Coba lagi ya!</p>
              )}
              {feedback === "no" && (
                <p className="font-heading text-lg font-bold text-ink mt-1">Coba lebih keras ya!</p>
              )}
              {feedback === "blocked" && (
                <p className="font-heading text-lg font-bold text-ink mt-1">Mikrofon belum diizinkan. Izinkan di pengaturan browser.</p>
              )}
              {feedback === "no_speech" && (
                <p className="font-heading text-lg font-bold text-ink mt-1">Suara tidak terdengar, coba lagi!</p>
              )}
            </div>

            {/* Parent override: mic missed a word the child did say */}
            {supported && (feedback === "close" || feedback === "no" || feedback === "no_speech" || feedback === "blocked") && (
              <button
                type="button"
                onClick={handleManualSuccess}
                className="shrink-0 min-h-[44px] px-4 rounded-full font-body text-base text-ink-muted underline underline-offset-4 transition-colors hover:text-ink"
              >
                Tandai berhasil
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* One action row: listen · mic (main) · skip */}
        <div className="shrink-0 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <BigButton tone="quiet" onClick={handleReplay} aria-label="Dengar lagi" className="px-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M11 5 6 9H3v6h3l5 4z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
            <span className="hidden sm:inline">Dengar</span>
          </BigButton>

          {supported ? (
            <button
              type="button"
              onClick={startListening}
              disabled={feedback === "match"}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-on-accent transition-colors ${
                isListening
                  ? "bg-ink animate-pulse-mic motion-reduce:animate-none"
                  : "bg-accent-strong hover:bg-ink active:bg-ink"
              }`}
              aria-label={isListening ? "Berhenti mendengar" : "Mulai bicara"}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="3" width="6" height="12" rx="3" />
                <path d="M5 11a7 7 0 0 0 14 0" />
                <path d="M12 18v3" />
              </svg>
            </button>
          ) : (
            <BigButton tone="good" onClick={handleManualSuccess} disabled={feedback === "match"} aria-label="Berhasil">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12 5 5 9-10" />
              </svg>
            </BigButton>
          )}

          <BigButton tone="quiet" onClick={advanceToNext} aria-label="Lewati" className="px-3">
            <span className="hidden sm:inline">Lewati</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 5 7 7-7 7" />
              <path d="M17 5v14" />
            </svg>
          </BigButton>
        </div>
        <p className="shrink-0 -mt-1 font-heading text-base text-ink-muted text-center">
          {!supported ? "Mikrofon butuh Chrome atau Edge. Tekan centang jika anak berhasil." : isListening ? "Sedang mendengarkan…" : "Tekan mikrofon, lalu bicara"}
        </p>
      </div>

      {/* Confetti */}
      <ConfettiEffect show={showConfetti} />
    </GameShell>
  );
}
