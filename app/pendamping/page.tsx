"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { gameLabel } from "@/lib/games";
import { localDateKey, daysBetween } from "@/lib/date";
import { bestDayIndex, nextMilestone } from "@/lib/report";
import { LEVELS, levelProgress } from "@/lib/levels";

function getDayLabels(): string[] {
  const days = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const today = new Date().getDay();
  const labels: string[] = [];
  for (let i = 6; i >= 0; i--) {
    labels.push(days[(today - i + 7) % 7]);
  }
  return labels;
}

function getLast7DaysDates(): string[] {
  const dates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(localDateKey(d));
  }
  return dates;
}

// Shared class strings: one surface, one primary button.
const panel = "bg-surface rounded-2xl border border-line p-5 sm:p-6 min-w-0";
const h2 = "font-heading text-lg font-semibold text-ink mb-4";
const btnPrimary = `inline-flex items-center justify-center gap-2 bg-accent-strong text-on-accent font-heading font-semibold text-sm px-5 py-2.5 rounded-full transition-colors hover:bg-ink active:bg-ink disabled:opacity-50 disabled:cursor-not-allowed`;
const btnQuiet = `inline-flex items-center justify-center font-heading font-semibold text-sm px-5 py-2.5 rounded-full border border-line text-ink transition-colors hover:bg-paper active:bg-line disabled:opacity-50`;

function Bar({ value, max, tone }: { value: number; max: number; tone: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="w-full bg-paper rounded-full h-2.5 overflow-hidden" role="presentation">
      <div className={`${tone} h-full rounded-full`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function PendampingPage() {
  const todayStars = useAppStore((s) => s.todayStars);
  const wordsLearned = useAppStore((s) => s.wordsLearned);
  const sessionsCompleted = useAppStore((s) => s.sessionsCompleted);
  const todayMinutes = useAppStore((s) => s.todayMinutes);
  const dailyStreak = useAppStore((s) => s.dailyStreak);
  const lastActiveDate = useAppStore((s) => s.lastActiveDate);
  const currentLevel = useAppStore((s) => s.currentLevel);
  const hijaiyahLearned = useAppStore((s) => s.hijaiyahLearned);
  const doasAttempted = useAppStore((s) => s.doasAttempted);
  const asmaulHusnaLearned = useAppStore((s) => s.asmaulHusnaLearned);
  const weeklyMinutes = useAppStore((s) => s.weeklyMinutes);
  const gameStats = useAppStore((s) => s.gameStats);
  const sessionDuration = useAppStore((s) => s.sessionDuration);
  const setSessionDuration = useAppStore((s) => s.setSessionDuration);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const updateStreak = useAppStore((s) => s.updateStreak);
  // Roll the day over here too, so a deep link on a new day doesn't show yesterday as today.
  useEffect(() => { updateStreak(); }, [updateStreak]);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const dayLabels = getDayLabels();
  const maxMinutes = Math.max(...weeklyMinutes, 1);
  // store keeps today at index 0; chart reads left (6 days ago) to right (today)
  const chartMinutes = [...weeklyMinutes].reverse();

  const last7Days = getLast7DaysDates();
  const streakDays = last7Days.map((date) => {
    if (!lastActiveDate) return false;
    const diffDays = daysBetween(date, lastActiveDate);
    return diffDays >= 0 && diffDays < dailyStreak;
  });
  const activeDays = streakDays.filter(Boolean).length;
  const weekTotal = weeklyMinutes.reduce((a, b) => a + b, 0);
  const bestIdx = bestDayIndex(chartMinutes);
  const insight = bestIdx < 0
    ? "Belum ada kegiatan minggu ini."
    : `Paling rajin hari ${dayLabels[bestIdx]}, ${chartMinutes[bestIdx]} menit.`;
  const milestone = nextMilestone(dailyStreak);
  const playedToday = streakDays[6] && todayMinutes > 0;
  const goal = Math.max(sessionDuration, 1);
  const goalPct = Math.min(1, todayMinutes / goal);
  const goalDone = goalPct >= 1;
  const streakMessage = dailyStreak === 0
    ? "Mulai rutinitas hari ini. Cukup beberapa menit."
    : playedToday
      ? `Hebat! Rutinitas ${dailyStreak} hari terjaga.`
      : "Belum main hari ini. Main sebentar supaya rutinitas tidak putus.";

  const figures = [
    { value: todayStars, label: "Bintang hari ini" },
    { value: wordsLearned.length, label: "Kata dipelajari" },
    { value: sessionsCompleted, label: "Sesi selesai" },
    { value: weekTotal, label: "Menit minggu ini" },
  ];

  const copyReport = async () => {
    const text = `*Laporan Belajar ${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}*\n\n🔥 Rutinitas: ${dailyStreak} hari berturut-turut\n🎯 Target hari ini: ${todayMinutes}/${goal} menit\n⭐ Bintang hari ini: ${todayStars}\n📚 Kata dipelajari: ${wordsLearned.length}\n✅ Sesi selesai: ${sessionsCompleted}\n📅 Minggu ini: ${weekTotal} menit, aktif ${activeDays}/7 hari\n💡 ${insight}\n\n-- Ayo Belajar Bicara!`;
    try {
      await navigator.clipboard.writeText(text);
      alert("Laporan disalin! Tempel ke WhatsApp untuk dibagikan 📱");
    } catch {
      alert("Gagal menyalin laporan. Coba lagi.");
    }
  };

  const lvl = levelProgress(wordsLearned.length, currentLevel);
  const favorites = Object.entries(gameStats).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-16">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/"
              aria-label="Kembali ke beranda"
              className={`inline-flex items-center justify-center w-11 h-11 rounded-full bg-surface border border-line text-ink transition-colors hover:bg-accent-soft active:bg-line`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5" />
              </svg>
            </Link>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-ink" style={{ overflowWrap: "break-word", minWidth: 0 }}>
              Pendamping
            </h1>
          </div>
        </header>

        {/* Ringkasan + pengaturan dalam satu halaman */}
          <div className="pd-fade grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Laporan ala Duolingo: rutinitas + target harian + rekap minggu */}
            <section className={`${panel} md:col-span-2`}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="font-heading text-lg font-semibold text-ink">Laporan</h2>
                <button onClick={copyReport} className={btnPrimary}>Salin Laporan</button>
              </div>

              <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-start">
                {/* Rutinitas */}
                <div className="min-w-0">
                  <p className="flex items-center gap-2">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={dailyStreak > 0 ? "text-warn" : "text-line"}>
                      <path d="M12 21c-4 0-6.5-2.6-6.5-6 0-3.5 3-5.5 3.5-9 2 1.2 3 3 3 5 1-1 1.5-2.2 1.5-3.5 2.6 1.8 5 4.6 5 7.5 0 3.4-2.5 6-6.5 6Z" />
                    </svg>
                    <span className="font-heading text-4xl font-bold text-ink tabular-nums leading-none">{dailyStreak}</span>
                    <span className="font-body text-base text-ink-muted">hari berturut-turut</span>
                  </p>
                  <p className="font-body text-sm text-ink mt-2">{streakMessage}</p>
                  {milestone && dailyStreak > 0 && (
                    <p className="font-body text-sm text-ink-muted mt-0.5">{milestone - dailyStreak} hari lagi menuju {milestone} hari.</p>
                  )}
                  <ol className="flex gap-1.5 mt-3" aria-label="Aktif 7 hari terakhir">
                    {last7Days.map((date, i) => (
                      <li key={date} className="flex flex-col items-center gap-1">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center ${streakDays[i] ? "bg-good-strong text-on-accent" : i === 6 ? "border-2 border-dashed border-ink-muted" : "bg-paper border border-line"}`}>
                          {streakDays[i] && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12.5l4.5 4.5L19 7.5" />
                            </svg>
                          )}
                        </span>
                        <span className={`font-body text-xs ${i === 6 ? "text-ink font-semibold" : "text-ink-muted"}`}>
                          {dayLabels[i]}
                          <span className="sr-only">{streakDays[i] ? " aktif" : " tidak aktif"}</span>
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Target harian */}
                <div className="flex flex-col items-center">
                  <div className="relative w-24 h-24" role="img" aria-label={`Target harian ${todayMinutes} dari ${goal} menit`}>
                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90" aria-hidden="true">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--line)" strokeWidth="3.5" />
                      <circle
                        cx="18" cy="18" r="15.5" fill="none"
                        stroke={goalDone ? "var(--good-strong)" : "var(--accent-strong)"}
                        strokeWidth="3.5" strokeLinecap="round"
                        strokeDasharray={`${goalPct * 97.4} 97.4`}
                      />
                    </svg>
                    <span className="absolute inset-0 flex flex-col items-center justify-center leading-none" aria-hidden="true">
                      <span className="font-heading text-2xl font-bold text-ink tabular-nums">{todayMinutes}</span>
                      <span className="font-body text-xs text-ink-muted mt-0.5">/{goal} mnt</span>
                    </span>
                  </div>
                  <span className={`font-body text-sm mt-1.5 ${goalDone ? "text-good-strong font-semibold" : "text-ink-muted"}`}>
                    {goalDone ? "Target tercapai" : "Target hari ini"}
                  </span>
                </div>
              </div>

              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
                {figures.map((f) => (
                  <div key={f.label} className="flex flex-col-reverse bg-paper rounded-xl px-3 py-2 min-w-0">
                    <dt className="font-body text-sm text-ink-muted mt-1">{f.label}</dt>
                    <dd className="font-heading text-2xl font-bold text-ink tabular-nums leading-none">{f.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-wrap items-baseline justify-between gap-2 mt-5 mb-2">
                <h3 className="font-body text-sm text-ink-muted">Menit per hari, aktif {activeDays} dari 7 hari</h3>
                <p className="font-body text-sm text-ink">{insight}</p>
              </div>
              <ol className="flex items-end justify-between gap-2 h-24">
                {chartMinutes.map((minutes, index) => (
                  <li key={dayLabels[index]} className="flex-1 flex flex-col items-center gap-1 h-full justify-end min-w-0">
                    {minutes > 0 && <span className="font-body text-xs text-ink-muted tabular-nums">{minutes}</span>}
                    <div
                      className={`w-full max-w-[36px] rounded-t-md ${index === bestIdx ? "bg-accent-strong" : "bg-accent-muted"}`}
                      style={{ height: `${Math.max((minutes / maxMinutes) * 100, minutes > 0 ? 8 : 0)}%` }}
                    />
                    <span className="font-body text-xs text-ink-muted">{dayLabels[index]}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Kegiatan Favorit */}
            <section className={panel}>
              <h2 className={h2}>Kegiatan Favorit</h2>
              {favorites.length === 0 ? (
                <p className="font-body text-base text-ink-muted">Belum ada data. Ajak si kecil bermain!</p>
              ) : (
                <ol className="divide-y divide-line">
                  {favorites.map(([id, count], i) => (
                    <li key={id} className="flex items-center gap-3 py-2.5">
                      <span className="font-heading text-sm font-bold text-ink-muted w-5 tabular-nums">{i + 1}.</span>
                      <span className="font-body text-base text-ink flex-1">{gameLabel(id)}</span>
                      <span className="font-heading text-sm font-semibold text-accent-strong tabular-nums">{count}x</span>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* Progres Islami */}
            <section className={panel}>
              <h2 className={h2}>Progres Islami</h2>
              <div className="space-y-4">
                {[
                  { name: "Huruf Hijaiyah", value: hijaiyahLearned.length, max: 29, tone: "bg-good-strong" },
                  { name: "Doa Harian", value: doasAttempted.length, max: 10, tone: "bg-warn-strong" },
                  { name: "Asmaul Husna", value: asmaulHusnaLearned.length, max: 10, tone: "bg-accent" },
                ].map((row) => (
                  <div key={row.name}>
                    <div className="flex justify-between mb-1.5">
                      <span className="font-body text-sm text-ink">{row.name}</span>
                      <span className="font-heading text-sm font-semibold text-ink-muted tabular-nums">{row.value}/{row.max}</span>
                    </div>
                    <Bar value={row.value} max={row.max} tone={row.tone} />
                  </div>
                ))}
              </div>
            </section>

            {/* Level Belajar: posisi sekarang, kenapa terkunci, cara naik */}
            <section className={`${panel} md:col-span-2`}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-3">
                <h2 className="font-heading text-lg font-semibold text-ink">
                  Level {lvl.current.level}: {lvl.current.name}
                </h2>
                <span className="font-body text-sm text-ink-muted tabular-nums">
                  {lvl.next ? `${wordsLearned.length}/${lvl.next.minWords} kata menuju Level ${lvl.next.level}` : `${wordsLearned.length} kata dipelajari`}
                </span>
              </div>
              <Bar value={lvl.pct} max={1} tone="bg-accent-strong" />
              <p className="font-body text-base text-ink mt-3">
                {lvl.next
                  ? <>Pelajari <strong>{lvl.need} kata lagi</strong> untuk naik level. Kata dihitung saat anak membuka kartu di Kartu Kata atau berhasil mengucapkan di Ayo Ngomong.</>
                  : "Level tertinggi tercapai. Terus latih kalimat bersama si kecil."}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="font-body text-sm text-ink-muted">Coba:</span>
                {lvl.current.games.map((slug) => (
                  <Link key={slug} href={`/${slug}`} className="inline-flex items-center min-h-[44px] px-4 rounded-full bg-accent-soft text-accent-strong font-heading text-sm font-semibold transition-colors hover:bg-line active:bg-line">
                    {gameLabel(slug)}
                  </Link>
                ))}
              </div>
              <ol className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                {LEVELS.map((l) => {
                  const done = l.level < lvl.current.level;
                  const now = l.level === lvl.current.level;
                  return (
                    <li
                      key={l.level}
                      aria-current={now ? "step" : undefined}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 min-w-0 ${now ? "bg-accent-soft" : "bg-paper"}`}
                    >
                      <span className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center font-heading text-sm font-bold ${done ? "bg-good-strong text-on-accent" : now ? "bg-accent-strong text-on-accent" : "border border-line text-ink-muted"}`}>
                        {done ? (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                        ) : now ? l.level : (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-body text-sm text-ink leading-tight">{l.name}</span>
                        <span className="block font-body text-xs text-ink-muted">
                          {done ? "Selesai" : now ? "Sekarang" : `Terbuka di ${l.minWords} kata`}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Tips Pendampingan */}
            <details className={`${panel} md:col-span-2 group`}>
              <summary className="font-heading text-lg font-semibold text-ink cursor-pointer list-none flex items-center justify-between gap-3 min-h-[44px] -my-2">
                Tips Pendampingan
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-ink-muted group-open:rotate-180">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <ol className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 list-decimal list-inside marker:font-heading marker:text-accent">
                <li className="font-body text-base text-ink leading-relaxed">Ucapkan kata bersama anak. <strong>Contohkan langsung</strong> dengan mulut Anda.</li>
                <li className="font-body text-base text-ink leading-relaxed">Beri jeda 3-5 detik setelah bertanya. <strong>Tunggu anak merespons</strong>.</li>
                <li className="font-body text-base text-ink leading-relaxed">Jika anak salah, jangan koreksi langsung. <strong>Ulangi dengan benar</strong>.</li>
                <li className="font-body text-base text-ink leading-relaxed"><strong>Puji setiap usaha</strong> anak, bukan hanya hasil sempurna.</li>
              </ol>
            </details>

            {/* Durasi Sesi = target harian */}
            <section className={panel}>
              <h2 className="font-heading text-lg font-semibold text-ink mb-1">Target Harian</h2>
              <p className="font-body text-base text-ink-muted mb-5">Berapa menit anak belajar dalam satu sesi. Ideal: 10-15 menit.</p>
              <div className="flex items-center gap-6">
                <div className="flex-1 min-w-0">
                  <input
                    type="range"
                    min={3}
                    max={15}
                    step={1}
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                    aria-label="Durasi sesi (menit)"
                    className={`w-full cursor-pointer rounded`}
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <div className="flex justify-between mt-1">
                    <span className="font-body text-sm text-ink-muted">3 menit</span>
                    <span className="font-body text-sm text-ink-muted">15 menit</span>
                  </div>
                </div>
                <p className="text-right min-w-[88px]">
                  <span className="font-heading text-4xl font-bold text-ink tabular-nums">{sessionDuration}</span>
                  <span className="font-body text-sm text-ink-muted ml-1">menit</span>
                </p>
              </div>
            </section>

            {/* Reset Progres */}
            <section className="rounded-2xl border border-danger p-5 sm:p-6">
              <h2 className="font-heading text-lg font-semibold text-ink mb-1">Reset Progres</h2>
              <p className="font-body text-base text-ink-muted mb-4">Hapus semua data belajar si kecil. Tindakan ini tidak bisa dibatalkan.</p>
              {!showResetConfirm ? (
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className={`font-heading font-semibold text-sm px-5 py-2.5 rounded-full border border-danger text-danger-strong transition-colors hover:bg-danger-soft active:bg-line`}
                >
                  Reset Semua Progres
                </button>
              ) : (
                <div role="alert">
                  <p className="font-body text-base text-danger-strong mb-3">Yakin ingin menghapus semua progres? Data tidak bisa dikembalikan.</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => { resetProgress(); setShowResetConfirm(false); }}
                      className={`font-heading font-semibold text-sm px-5 py-2.5 rounded-full bg-danger-strong text-on-accent transition-opacity hover:opacity-90 active:opacity-80`}
                    >
                      Ya, Reset
                    </button>
                    <button onClick={() => setShowResetConfirm(false)} className={btnQuiet}>Batal</button>
                  </div>
                </div>
              )}
            </section>
          </div>
      </div>
    </div>
  );
}
