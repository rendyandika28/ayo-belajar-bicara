"use client";

import * as React from "react";

type Props = {
  className?: string;
  children: React.ReactNode;
};

export function ScrollArea({ className = "", children }: Props) {
  return (
    <div
      className={`overflow-y-auto [-webkit-overflow-scrolling:touch] [overscroll-behavior:contain] ${className}`}
    >
      {children}
    </div>
  );
}
