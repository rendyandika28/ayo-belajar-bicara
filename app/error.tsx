"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <span className="text-7xl mb-4">{"😢"}</span>
      <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
        Oops, ada masalah!
      </h2>
      <p className="font-body text-foreground/60 mb-6">
        Tenang, coba tekan tombol di bawah ya.
      </p>
      <button
        onClick={reset}
        className="bg-purple-500 text-white font-heading text-lg px-8 py-3 rounded-2xl shadow-lg active:scale-95 transition-transform min-h-[52px]"
      >
        Coba Lagi
      </button>
    </div>
  );
}
