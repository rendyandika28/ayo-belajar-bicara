"use client";

import { forwardRef } from "react";

type Tone = "primary" | "quiet" | "good";

const tones: Record<Tone, string> = {
  primary: "bg-accent-strong text-on-accent hover:bg-ink active:bg-ink",
  quiet: "bg-surface text-ink border-2 border-line hover:bg-accent-soft active:bg-line",
  good: "bg-good-strong text-on-accent hover:bg-ink active:bg-ink",
};

/**
 * Child-sized button: at least 72px tall (about 2cm, NN/g children's UX),
 * label 18px+, colour change on press instead of motion.
 */
const BigButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }
>(function BigButton({ tone = "primary", className = "", type = "button", ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={`inline-flex items-center justify-center gap-3 min-h-[72px] min-w-[72px] px-6 rounded-3xl font-heading text-lg sm:text-xl font-semibold transition-colors [&>svg]:shrink-0 disabled:opacity-50 ${tones[tone]} ${className}`}
      {...rest}
    />
  );
});

export default BigButton;
