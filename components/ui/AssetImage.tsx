"use client";

import { useEffect, useRef, useState } from "react";
import { asset } from "@/lib/asset";

/**
 * <img> for generated assets (served from R2): shows the soft skeleton pulse
 * until the picture has loaded, then fades it in. onError lets callers fall back.
 * The wrapper sizes the box; pass size/rounding via className.
 */
export default function AssetImage({
  src,
  className = "",
  imgClassName = "object-cover",
  eager,
  onError,
}: {
  src: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
  onError?: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false); // stop pulsing when the file is missing
  const ref = useRef<HTMLImageElement>(null);
  // A cached or SSR-rendered image can finish before React attaches onLoad.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) setLoaded(true);
  }, [src]);
  return (
    <span aria-hidden="true" className={`relative block overflow-hidden ${loaded ? "bg-paper" : failed ? "bg-accent-soft" : "skeleton bg-line"} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={asset(src)}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => { setFailed(true); onError?.(); }}
        className={`absolute inset-0 w-full h-full transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"} ${imgClassName}`}
      />
    </span>
  );
}
