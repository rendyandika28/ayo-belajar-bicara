"use client";

import * as React from "react";

type Props = {
  align?: "start" | "end";
  className?: string;
  children: React.ReactNode;
};

export function ResponsivePanel({ align = "start", className = "", children }: Props) {
  return (
    <div
      className={`
        absolute top-full mt-2 z-50
        ${align === "end" ? "right-0" : "left-0"}
        max-w-[calc(100vw-1.5rem)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
