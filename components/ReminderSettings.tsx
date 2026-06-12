"use client";

import { useAppStore } from "@/store/useAppStore";
import { SafeInput } from "@/components/ui/SafeInput";

export default function ReminderSettings() {
  const reminderEnabled = useAppStore((s) => s.reminderEnabled);
  const reminderTime = useAppStore((s) => s.reminderTime);
  const setReminderEnabled = useAppStore((s) => s.setReminderEnabled);
  const setReminderTime = useAppStore((s) => s.setReminderTime);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      alert("Browser ini tidak mendukung notifikasi.");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setReminderEnabled(true);
    } else {
      alert("Notifikasi diblokir. Aktifkan di pengaturan browser.");
    }
  };

  const handleToggle = () => {
    if (reminderEnabled) {
      setReminderEnabled(false);
    } else {
      requestPermission();
    }
  };

  return (
    <>
      <h2 className="font-heading text-lg font-semibold text-gray-700 mb-2">
        Pengingat Harian {"\ud83d\udd14"}
      </h2>
      <p className="font-body text-sm text-gray-500 mb-4">
        Dapatkan notifikasi setiap hari supaya si kecil tidak lupa belajar.
      </p>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-body text-sm text-gray-700">Aktifkan pengingat</span>
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors min-h-[44px] ${
              reminderEnabled ? "bg-purple-500" : "bg-gray-300"
            }`}
            role="switch"
            aria-checked={reminderEnabled}
            aria-label="Aktifkan pengingat harian"
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                reminderEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-body text-sm text-gray-700">Waktu pengingat</span>
          <SafeInput
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 font-body text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            aria-label="Waktu pengingat harian"
          />
        </div>
        <p className="font-body text-xs text-gray-400 italic">
          Notifikasi akan muncul kalau app terbuka di tab browser.
        </p>
      </div>
    </>
  );
}
