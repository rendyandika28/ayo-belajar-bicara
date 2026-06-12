"use client";

import { motion, AnimatePresence } from "framer-motion";

interface ShareModalProps {
  show: boolean;
  onClose: () => void;
  text: string;
  title?: string;
}

export default function ShareModal({
  show,
  onClose,
  text,
  title = "Bagikan Pencapaian!",
}: ShareModalProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Tersalin! Tempel ke WhatsApp atau chat keluarga \ud83d\udcf1");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      alert("Tersalin! Tempel ke WhatsApp atau chat keluarga \ud83d\udcf1");
    }
  };

  const handleShareWa = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/50 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <span className="text-5xl">{"\ud83d\udce4"}</span>
              <h2 className="font-heading text-xl font-bold text-foreground mt-2">
                {title}
              </h2>
              <p className="font-body text-sm text-foreground/60 mt-1">
                Bagikan ke keluarga supaya mereka tahu kabar baik ini!
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-5 max-h-40 overflow-y-auto">
              <pre className="font-body text-xs text-foreground/80 whitespace-pre-wrap font-mono">
                {text}
              </pre>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleShareWa}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-heading text-base py-3 rounded-full shadow-md flex items-center justify-center gap-2"
              >
                <span className="text-lg">{"\ud83d\udcac"}</span>
                <span>Bagikan ke WhatsApp</span>
              </button>
              <button
                onClick={handleCopy}
                className="w-full bg-white border-2 border-gray-200 text-foreground/70 font-heading text-sm py-2.5 rounded-full"
              >
                {"\ud83d\udccb"} Salin Teks
              </button>
              <button
                onClick={onClose}
                className="w-full text-foreground/40 font-body text-sm py-2"
              >
                Nanti saja
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
