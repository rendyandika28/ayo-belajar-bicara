"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

const VARIANT_CLASSES = {
  default: "bg-white rounded-3xl shadow-lg p-6",
  islamic: "bg-emerald-50 border-2 border-emerald-200 rounded-3xl shadow-lg p-6",
} as const;

type CardVariant = keyof typeof VARIANT_CLASSES;

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: CardVariant;
}

export default function Card({
  children,
  onClick,
  className = "",
  variant = "default",
}: CardProps) {
  return (
    <motion.div
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
      className={`${VARIANT_CLASSES[variant]} ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}
