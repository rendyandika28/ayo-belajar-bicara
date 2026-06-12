"use client";

import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function TouchButton({ className = "", ...rest }: Props) {
  return (
    <button
      className={`min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:outline-none ${className}`}
      {...rest}
    />
  );
}
