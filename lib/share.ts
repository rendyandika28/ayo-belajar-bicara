import { useAppStore } from "@/store/useAppStore";

export function generateDailyReport() {
  const state = useAppStore.getState();
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  return `*Ayo Belajar Bicara! ${today}* \ud83c\udf1f

Halo Bunda! \ud83d\udc4b Ini laporan belajar si kecil hari ini:

\ud83c\udfaf Sesi selesai: *${state.sessionsCompleted} kali*
\ud83d\udcda Kata dipelajari: *${state.wordsLearned.length} kata*
\ud83d\udd25 Streak: *${state.dailyStreak} hari berturut-turut*
\u23f1\ufe0f Waktu belajar: *${state.todayMinutes} menit*

Terima kasih sudah mendampingi si kecil belajar! \ud83d\udcab
--
Ayo Belajar Bicara!`;
}

export function generateSessionReport(opts: {
  gameName: string;
  starsEarned: number;
  accuracy?: number;
  profileName?: string;
}) {
  const state = useAppStore.getState();
  const name = opts.profileName || "si kecil";
  return `*${name} baru selesai main ${opts.gameName}!* \ud83c\udf89

\ud83c\udfaf Perolehan: *${opts.starsEarned} bintang*
${opts.accuracy !== undefined ? `\ud83c\udfaf Akurasi: *${opts.accuracy}%*\n` : ""}\u2b50 Total bintang: *${state.totalStars}*
\ud83d\udd25 Streak: *${state.dailyStreak} hari*

\ud83d\udc4f Mari terus dampingi si kecil belajar!
--
Ayo Belajar Bicara!`;
}
