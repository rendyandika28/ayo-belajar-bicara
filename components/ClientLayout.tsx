"use client";

import FocusModeWrapper from "@/components/focus/FocusModeWrapper";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <FocusModeWrapper />
    </>
  );
}
