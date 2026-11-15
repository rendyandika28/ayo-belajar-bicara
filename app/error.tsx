"use client";

import { useEffect } from "react";
import BigButton from "@/components/ui/BigButton";

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
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="bg-surface rounded-3xl border border-line p-8 max-w-sm w-full flex flex-col items-center text-center gap-4">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-warn">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7.5v5.5" />
          <path d="M12 16.5h.01" />
        </svg>
        <h2 className="font-heading text-2xl font-bold text-ink">Oops, ada masalah!</h2>
        <p className="font-body text-base text-ink-muted">Tenang, coba tekan tombol di bawah ya.</p>
        <BigButton onClick={reset} className="w-full">Coba Lagi</BigButton>
      </div>
    </div>
  );
}
