"use client";

import * as React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function SafeInput({ className = "", size = 1, ...rest }: Props) {
  return (
    <input
      size={size}
      className={`min-w-0 ${className}`}
      {...rest}
    />
  );
}
