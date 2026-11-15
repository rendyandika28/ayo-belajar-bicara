"use client";

import { useState } from "react";
import AssetImage from "@/components/ui/AssetImage";
import type { Word } from "@/data/words";

/**
 * A word's picture: the AI illustration in public/images/words/<id>.webp
 * (or a user photo in word.image), falling back to the emoji when no file exists.
 * Generate images with `npm run gen:words`.
 */
export default function WordPicture({
  word,
  className = "w-40 h-40 sm:w-48 sm:h-48",
  emojiClassName = "text-7xl sm:text-8xl",
}: {
  word: Word;
  className?: string;
  emojiClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const src = word.image ?? `/images/words/${word.id}.webp`;

  if (failed) {
    return (
      <span className={`${emojiClassName} leading-none`} aria-hidden="true">
        {word.emoji}
      </span>
    );
  }
  return (
    <AssetImage src={src} eager onError={() => setFailed(true)} className={`${className} rounded-2xl`} />
  );
}
