"use client";

import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";

interface PremiumGateProps {
  feature: string;
  description: string;
  children: React.ReactNode;
}

export default function PremiumGate({ feature, description, children }: PremiumGateProps) {
  const isPremium = useAppStore((s) => s.isPremium);
  const setPremium = useAppStore((s) => s.setPremium);

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-40 pointer-events-none blur-sm select-none">
        {children}
      </div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-center p-4 max-w-xs">
          <div className="text-5xl mb-2" aria-hidden="true">{"\ud83d\udd12"}</div>
          <h3 className="font-heading text-base font-bold text-foreground mb-1">
            Fitur Premium
          </h3>
          <p className="font-body text-xs text-foreground/70 mb-3">
            <strong>{feature}</strong> — {description}
          </p>
          <p className="font-body text-[10px] text-foreground/50 mb-3 italic">
            Saat ini semua fitur gratis untuk pengguna. Tombol ini hanya untuk demo gating.
          </p>
          <button
            onClick={() => {
              // Demo only: in production this would open a payment flow
              setPremium(true);
            }}
            className="bg-gradient-to-r from-yellow-400 to-orange-400 text-foreground font-heading text-xs px-4 py-2 rounded-full min-h-[36px] shadow-md"
          >
            Aktifkan (Demo)
          </button>
        </div>
      </motion.div>
    </div>
  );
}
