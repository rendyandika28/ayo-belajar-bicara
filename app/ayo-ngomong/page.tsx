"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
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
import { isMatch } from "@/lib/fuzzyMatch";
import ConfettiEffect from "@/components/ui/ConfettiEffect";
import FocusModeButton from "@/components/focus/FocusModeButton";
import GameTutorial from "@/components/GameTutorial";

const WORDS_PER_SESSION = 8;

export default function AyoNgomongPage() {
  const { totalStars, addStar, markWordLearned, incrementSession, recordGamePlay } =
    useAppStore();

  useEffect(() => { recordGamePlay("ayo-ngomong"); }, [recordGamePlay]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [feedback, setFeedback] = useState<"match" | "close" | "no" | "no_speech" | null>(
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

  const advanceToNext = useCallback(() => {
    if (currentIndex < WORDS_PER_SESSION - 1) {
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
  }, [currentIndex, incrementSession]);

  const handleMatch = useCallback(() => {
    setFeedback("match");
    setShowConfetti(true);
    playCorrect();
    addStar(2);
    setScore((prev) => prev + 1);
    if (currentWord) {
      markWordLearned(currentWord.id);
    }

    autoAdvanceTimerRef.current = setTimeout(() => {
      advanceToNext();
    }, 2000);
  }, [addStar, advanceToNext, currentWord, markWordLearned]);

  const handleManualSuccess = useCallback(() => {
    setFeedback("match");
    setShowConfetti(true);
    playCorrect();
    addStar(2);
    setScore((prev) => prev + 1);
    if (currentWord) {
      markWordLearned(currentWord.id);
    }

    autoAdvanceTimerRef.current = setTimeout(() => {
      advanceToNext();
    }, 2000);
  }, [addStar, advanceToNext, currentWord, markWordLearned]);

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

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          hasResult = true;
        } else {
          interimTranscript += result[0].transcript;
          hasResult = true;
        }
      }

      // Show interim results in real-time
      if (interimTranscript) {
        setTranscript(interimTranscript);
      }

      // Process final result
      if (finalTranscript && currentWord) {
        setTranscript(finalTranscript);
        const matchResult = isMatch(finalTranscript, currentWord.word);

        if (matchResult === "match") {
          handleMatch();
        } else if (matchResult === "close") {
          setFeedback("close");
          playPop();
        } else {
          setFeedback("no");
        }
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!hasResult) {
        setFeedback("no_speech");
      }
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
      <div className="min-h-screen bg-purple-50 flex flex-col items-center justify-center px-4">
        <ConfettiEffect show={true} />

        <motion.div
          className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <motion.span
            className="text-8xl block mb-4"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
          >
            🏆
          </motion.span>
          <h2 className="font-heading text-3xl font-bold text-purple-700 mb-2">
            Hebat Sekali!
          </h2>
          <p className="font-body text-lg text-gray-600 mb-4">
            Kamu sudah selesai latihan!
          </p>
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="text-center">
              <p className="text-4xl font-heading font-bold text-yellow-500">
                {score}
              </p>
              <p className="font-body text-sm text-gray-500">Benar</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-heading font-bold text-yellow-500">
                ⭐ {score * 2}
              </p>
              <p className="font-body text-sm text-gray-500">Bintang</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <motion.button
              onClick={handleRestartSession}
              className="bg-purple-500 text-white rounded-2xl px-8 py-4 font-heading text-lg shadow-lg min-h-[64px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔄 Main Lagi
            </motion.button>
            <Link href="/">
              <motion.button
                className="w-full bg-yellow-400 rounded-2xl px-8 py-4 font-heading text-lg shadow-lg min-h-[64px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                🏠 Kembali
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isMounted || !currentWord) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="text-5xl"
        >
          🌟
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 px-4 py-6 pb-12">
      <GameTutorial
        gameKey="ayo-ngomong"
        steps={[
          { emoji: "\ud83c\udfa4", text: "Dengarkan kata yang muncul di layar, lalu tekan tombol mikrofon." },
          { emoji: "\ud83d\udde3\ufe0f", text: "Ucapkan kata dengan jelas. Aplikasi akan menilai ucapanmu!" },
        ]}
      />
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/">
          <motion.button
            className="w-12 h-12 min-w-[48px] min-h-[48px] bg-white rounded-full flex items-center justify-center shadow-md text-2xl"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            🏠
          </motion.button>
        </Link>
        <div className="flex items-center gap-2">
          <FocusModeButton />
          <div className="bg-yellow-400 rounded-full px-4 py-2 shadow-lg flex items-center gap-2 font-heading text-lg">
            <span className="text-xl">⭐</span>
            <span className="font-bold">{totalStars}</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-md mx-auto mb-6">
        <div className="w-full h-3 bg-purple-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + 1) / WORDS_PER_SESSION) * 100}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-center font-body text-sm text-purple-400 mt-1">
          {currentIndex + 1} / {WORDS_PER_SESSION}
        </p>
      </div>

      {/* Word Card */}
      <div className="max-w-md mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord.id}
            className="bg-white rounded-3xl p-5 sm:p-8 shadow-xl text-center mb-6"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ type: "tween", duration: 0.25 }}
          >
            <motion.span
              className="text-6xl sm:text-8xl block mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 15,
                delay: 0.1,
              }}
            >
              {currentWord.emoji}
            </motion.span>
            <motion.h2
              className="font-heading text-3xl font-bold text-purple-700"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {currentWord.word.toUpperCase()}
            </motion.h2>
          </motion.div>
        </AnimatePresence>

        {/* Listen button & Skip button */}
        <div className="flex justify-center gap-4 mb-6">
          <motion.button
            onClick={handleReplay}
            className="bg-blue-400 hover:bg-blue-500 text-white rounded-2xl px-6 py-3 font-heading text-lg shadow-md flex items-center gap-2 min-h-[48px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🔊 Dengar
          </motion.button>
          
          <motion.button
            onClick={advanceToNext}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-2xl px-6 py-3 font-heading text-lg shadow-md flex items-center gap-2 min-h-[48px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Lewati ⏭️
          </motion.button>
        </div>

        {/* Mic Button */}
        {supported ? (
          <div className="flex flex-col items-center gap-4">
            <motion.button
              onClick={startListening}
              disabled={feedback === "match"}
              className={`w-20 h-20 min-w-[64px] min-h-[64px] rounded-full flex items-center justify-center text-4xl shadow-lg transition-colors ${
                isListening
                  ? "bg-red-500 animate-pulse-mic"
                  : "bg-pink-400 hover:bg-pink-500"
              } ${
                feedback === "match"
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              whileHover={feedback !== "match" ? { scale: 1.1 } : {}}
              whileTap={feedback !== "match" ? { scale: 0.9 } : {}}
              aria-label={
                isListening ? "Berhenti mendengar" : "Mulai bicara"
              }
            >
              🎤
            </motion.button>

            {isListening && (
              <motion.p
                className="font-body text-sm text-red-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Sedang mendengarkan...
              </motion.p>
            )}
          </div>
        ) : (
          /* Fallback for unsupported browsers */
          <div className="flex flex-col items-center gap-4">
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-4 text-center max-w-sm">
              <p className="font-body text-sm text-yellow-800">
                Fitur ini memerlukan browser Chrome atau Edge
              </p>
            </div>
            <motion.button
              onClick={handleManualSuccess}
              disabled={feedback === "match"}
              className={`bg-green-500 hover:bg-green-600 text-white rounded-2xl px-8 py-4 font-heading text-xl shadow-lg min-h-[64px] ${
                feedback === "match"
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
              whileHover={feedback !== "match" ? { scale: 1.05 } : {}}
              whileTap={feedback !== "match" ? { scale: 0.95 } : {}}
            >
              Berhasil ✅
            </motion.button>
          </div>
        )}

        {/* Transcript display */}
        <AnimatePresence>
          {transcript && (
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <p className="font-body text-lg text-gray-600">
                Kamu bilang:{" "}
                <span className="font-heading font-bold text-purple-600">
                  {transcript}
                </span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback display */}
        <AnimatePresence>
          {feedback === "match" && (
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <p className="font-heading text-3xl font-bold text-green-500">
                Hebat! 🎉
              </p>
            </motion.div>
          )}

          {feedback === "close" && (
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <p className="font-heading text-2xl font-bold text-orange-500">
                Bagus! Coba lagi ya! 😊
              </p>
            </motion.div>
          )}

          {feedback === "no" && (
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <p className="font-heading text-2xl font-bold text-blue-500">
                Coba lebih keras ya! 💪
              </p>
            </motion.div>
          )}

          {feedback === "no_speech" && (
            <motion.div
              className="mt-4 text-center"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <p className="font-heading text-xl font-bold text-gray-500">
                Suara tidak terdengar, coba lagi! 🎤
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Manual fallback button also shown when speech is supported but for parent assistance */}
        {supported && (feedback === "close" || feedback === "no" || feedback === "no_speech") && (
          <motion.div
            className="mt-4 flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <motion.button
              onClick={handleManualSuccess}
              className="bg-green-400 hover:bg-green-500 text-white rounded-2xl px-6 py-3 font-heading text-base shadow-md min-h-[48px]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Berhasil ✅
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Confetti */}
      <ConfettiEffect show={showConfetti} />
    </div>
  );
}
