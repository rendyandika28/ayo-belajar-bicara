"use client";

import { motion } from "framer-motion";
import React, { ButtonHTMLAttributes } from "react";

const VARIANT_CLASSES = {
  primary: "bg-yellow-400 text-gray-900",
  success: "bg-green-400 text-gray-900",
  pink: "bg-pink-400 text-white",
  blue: "bg-blue-400 text-white",
  islamic: "bg-emerald-600 text-white",
} as const;

type ButtonVariant = keyof typeof VARIANT_CLASSES;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  emoji?: string;
}

export default function Button({
  variant = "primary",
  emoji,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`rounded-2xl min-h-[64px] px-6 py-3 font-heading text-xl shadow-lg transition-colors ${VARIANT_CLASSES[variant]} ${className}`}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {emoji && <span className="mr-2">{emoji}</span>}
      {children}
    </motion.button>
  );
}
