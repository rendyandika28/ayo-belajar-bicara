"use client";

import BigButton from "@/components/ui/BigButton";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="bg-surface rounded-3xl border border-line p-8 max-w-sm w-full flex flex-col items-center text-center gap-4">
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-accent-strong">
          <path d="M2 8.8a15 15 0 0 1 20 0" />
          <path d="M5.5 12.5a10 10 0 0 1 13 0" />
          <path d="M9 16.2a5 5 0 0 1 6 0" />
          <path d="M12 20h.01" />
          <path d="M3 3l18 18" />
        </svg>
        <h1 className="font-heading text-2xl font-bold text-ink">Tidak Ada Koneksi Internet</h1>
        <p className="font-body text-base text-ink-muted">Yuk coba lagi nanti ya! Pastikan kamu terhubung ke internet.</p>
        <BigButton onClick={() => window.location.reload()} className="w-full">Coba Lagi</BigButton>
      </div>
    </div>
  );
}
