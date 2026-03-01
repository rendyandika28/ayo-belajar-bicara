"use client";

import { useEffect, useState } from "react";
import FocusModeWrapper from "@/components/focus/FocusModeWrapper";

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
    if ("serviceWorker" in navigator) {
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
    <>
      {children}
      <FocusModeWrapper />

      {showBanner && (
        <div
          style={{
            position: "fixed",
            bottom: "1rem",
            left: "1rem",
            right: "1rem",
            maxWidth: "420px",
            margin: "0 auto",
            padding: "1rem 1.25rem",
            backgroundColor: "#FFF9E6",
            border: "2px solid #7C3AED",
            borderRadius: "1rem",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            zIndex: 9999,
            fontFamily: "Fredoka, sans-serif",
          }}
        >
          <span style={{ fontSize: "2rem", flexShrink: 0 }}>📲</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                color: "#7C3AED",
                fontSize: "0.95rem",
              }}
            >
              Pasang Aplikasi
            </div>
            <div style={{ color: "#6B7280", fontSize: "0.8rem" }}>
              Akses lebih cepat dari layar utama
            </div>
          </div>
          <button
            onClick={handleInstall}
            style={{
              padding: "0.5rem 1rem",
              fontSize: "0.85rem",
              fontFamily: "Fredoka, sans-serif",
              fontWeight: 600,
              color: "white",
              backgroundColor: "#7C3AED",
              border: "none",
              borderRadius: "9999px",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            Pasang
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Tutup"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.25rem",
              color: "#9CA3AF",
              cursor: "pointer",
              padding: "0.25rem",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
}
