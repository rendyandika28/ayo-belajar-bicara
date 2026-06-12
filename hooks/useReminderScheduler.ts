"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

const FIRED_KEY = "reminderFiredDate";

function shouldFireNow(time: string, lastFiredDate: string | null): boolean {
  if (!("Notification" in window) || Notification.permission !== "granted") return false;
  const [hh, mm] = time.split(":").map(Number);
  const now = new Date();
  if (now.getHours() !== hh || now.getMinutes() !== mm) return false;
  const today = now.toISOString().split("T")[0];
  return lastFiredDate !== today;
}

export function useReminderScheduler() {
  const reminderEnabled = useAppStore((s) => s.reminderEnabled);
  const reminderTime = useAppStore((s) => s.reminderTime);
  const lastFiredRef = useRef<string | null>(null);

  useEffect(() => {
    lastFiredRef.current = localStorage.getItem(FIRED_KEY);
  }, []);

  useEffect(() => {
    if (!reminderEnabled) return;
    if (!("Notification" in window)) return;

    const interval = setInterval(() => {
      if (shouldFireNow(reminderTime, lastFiredRef.current)) {
        const today = new Date().toISOString().split("T")[0];
        localStorage.setItem(FIRED_KEY, today);
        lastFiredRef.current = today;

        new Notification("Ayo Belajar Bicara! \ud83c\udf1f", {
          body: "Saatnya belajar sama si kecil! \ud83d\ude0a Ayo selesaikan misi hari ini.",
          icon: "/icons/icon-192.svg",
          tag: "daily-reminder",
        });
      }
    }, 30000); // check every 30 seconds

    return () => clearInterval(interval);
  }, [reminderEnabled, reminderTime]);
}
