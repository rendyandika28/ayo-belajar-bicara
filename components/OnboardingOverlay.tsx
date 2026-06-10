"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    emoji: "\ud83c\udf1f",
    title: "Ayo Belajar Bicara!",
    body: "Aplikasi ini membantu si kecil belajar bicara sambil bermain. Setiap aktivitas dirancang untuk merangsang perkembangan bicara anak dengan cara yang menyenangkan.",
  },
  {
    emoji: "\ud83c\udfaf",
    title: "Mulai dari Tebak Gambar",
    body: "Dengarkan suara kata, lalu pilih gambar yang cocok. Cara paling mudah dan seru untuk memulai petualangan belajar bicara!",
  },
  {
    emoji: "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67",
    title: "Pantau Perkembangan",
    body: "Buka menu Pendamping untuk melihat progres, mengatur sesi belajar, dan menambahkan kata-kata baru yang ingin dipelajari si kecil.",
  },
];

export default function OnboardingOverlay() {
  const [step, setStep] = useState(0);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem("onboardingDone");
    if (!done) {
      setShow(true);
    }
  }, []);

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
    } else {
      localStorage.setItem("onboardingDone", "true");
      setShow(false);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("onboardingDone", "true");
    setShow(false);
  };

  if (!show) return null;

  const current = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[10000] bg-[#FFF9E6] flex flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="flex flex-col items-center text-center max-w-sm w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
        >
          <span className="text-7xl mb-6">{current.emoji}</span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#2D1B69] mb-4 leading-tight">
            {current.title}
          </h2>
          <p className="font-body text-base sm:text-lg text-[#2D1B69]/80 leading-relaxed mb-10">
            {current.body}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 mb-8">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === step ? "bg-[#7C3AED] w-6" : "bg-[#7C3AED]/30"
            }`}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <motion.button
          className="bg-[#7C3AED] text-white font-heading text-lg px-10 py-3 rounded-full shadow-lg min-h-[52px] min-w-[220px]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
        >
          {isLast ? "Mulai Belajar! \ud83d\ude80" : "Lanjut"}
        </motion.button>
        {!isLast && (
          <motion.button
            className="text-[#2D1B69]/50 font-heading text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSkip}
          >
            Lewati
          </motion.button>
        )}
      </div>
    </div>
  );
}
