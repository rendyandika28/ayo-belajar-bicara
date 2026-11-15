"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BigButton from "@/components/ui/BigButton";

const steps = [
  {
    title: "Ayo Belajar Bicara!",
    body: "Aplikasi ini membantu si kecil belajar bicara sambil bermain. Setiap aktivitas dirancang untuk merangsang perkembangan bicara anak dengan cara yang menyenangkan.",
  },
  {
    title: "Mulai dari Tebak Gambar",
    body: "Dengarkan suara kata, lalu pilih gambar yang cocok. Cara paling mudah dan seru untuk memulai petualangan belajar bicara!",
  },
  {
    title: "Pantau Perkembangan",
    body: "Buka menu Pendamping untuk melihat progres, mengatur sesi belajar, dan menambahkan kata-kata baru yang ingin dipelajari si kecil.",
  },
];

const ICONS = [
  // star
  <path key="0" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z" />,
  // picture
  <g key="1"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="m21 16-5-5-8 8" /></g>,
  // people
  <g key="2"><circle cx="9" cy="8" r="3" /><path d="M3 20a6 6 0 0 1 12 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.2A5 5 0 0 1 21 19" /></g>,
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
    <div className="fixed inset-0 z-[10000] bg-paper flex flex-col items-center justify-center px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="flex flex-col items-center text-center max-w-sm w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <span className="flex items-center justify-center w-24 h-24 rounded-full bg-accent-soft text-accent-strong mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              {ICONS[step]}
            </svg>
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-ink mb-4 leading-tight">
            {current.title}
          </h2>
          <p className="font-body text-lg text-ink-muted leading-relaxed mb-10">
            {current.body}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2 mb-8" aria-hidden="true">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-2.5 rounded-full transition-colors ${
              i === step ? "bg-accent-strong w-6" : "bg-line w-2.5"
            }`}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3 w-full max-w-sm">
        <BigButton className="w-full" onClick={handleNext}>
          {isLast ? "Mulai Belajar!" : "Lanjut"}
        </BigButton>
        {!isLast && (
          <button
            type="button"
            className="text-ink-muted font-heading text-base min-h-[44px] px-4 rounded-full hover:text-ink transition-colors"
            onClick={handleSkip}
          >
            Lewati
          </button>
        )}
      </div>
    </div>
  );
}
