"use client";

import { useEffect, useState } from "react";
import { MotionConfig, MotionGlobalConfig } from "framer-motion";
import FocusModeWrapper from "@/components/focus/FocusModeWrapper";
import OnboardingOverlay from "@/components/OnboardingOverlay";
import LevelNotice from "@/components/LevelNotice";
import { useAppStore } from "@/store/useAppStore";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Register service worker
    // Dev chunk names never change, so the cache-first SW would pin stale JS.
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Listen for install prompt
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // Unlock Audio and Speech APIs on first interaction
  useEffect(() => {
    const unlock = () => {
      import("@/lib/sounds").then((m) => m.initAudio());
      import("@/lib/speech").then((m) => m.initSpeech());
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("click", unlock, { once: true });
    return () => {
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("click", unlock);
    };
  }, []);

  // Sync calm mode to body class
  const calmMode = useAppStore((s) => s.calmMode);
  useEffect(() => {
    document.body.classList.toggle("calm-mode-active", calmMode);
    // reducedMotion is read once per element at mount; skipAnimations is checked on every animation start.
    MotionGlobalConfig.skipAnimations = calmMode;
  }, [calmMode]);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setInstallPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setInstallPrompt(null);
    localStorage.setItem("pwa-install-dismissed", "1");
  };

  return (
    // Calm mode (or the OS reduced-motion setting) turns off every framer-motion animation.
    <MotionConfig reducedMotion={calmMode ? "always" : "user"}>
      <OnboardingOverlay />
      <LevelNotice />
      {children}
      <FocusModeWrapper />

      {showBanner && (
        <div className="fixed bottom-4 inset-x-4 mx-auto max-w-[420px] z-[9999] flex items-center gap-3 p-4 bg-surface border border-line rounded-2xl font-heading">
          <span className="flex items-center justify-center w-11 h-11 shrink-0 rounded-full bg-accent-soft text-accent-strong">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="6" y="2" width="12" height="20" rx="2" />
              <path d="M12 7v7m-3-3 3 3 3-3" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-ink text-base">Pasang Aplikasi</div>
            <div className="font-body text-ink-muted text-sm">Akses lebih cepat dari layar utama</div>
          </div>
          <button
            onClick={handleInstall}
            className="shrink-0 min-h-[44px] px-4 rounded-full bg-accent-strong text-on-accent font-semibold text-base hover:bg-ink transition-colors"
          >
            Pasang
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Tutup"
            className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full text-ink-muted hover:bg-accent-soft transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
      )}
    </MotionConfig>
  );
}
