"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAppStore } from "@/store/useAppStore";
import { Word } from "@/data/words";
import { SafeInput } from "@/components/ui/SafeInput";
import { gameLabel } from "@/lib/games";
import { localDateKey, daysBetween } from "@/lib/date";

const categories = [
  "hewan", "buah", "benda", "keluarga", "aktivitas", "makanan",
  "warna", "angka", "tubuh", "alam", "peralatan",
] as const;

const levelDescriptions = [
  { level: 1, label: "Mengenal Suara" },
  { level: 2, label: "Meniru Suku Kata" },
  { level: 3, label: "Gabung Suku Kata" },
  { level: 4, label: "Kata Utuh + Kalimat" },
];

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

const tabs = [
  { key: "ringkasan", label: "Ringkasan" },
  { key: "pengaturan", label: "Pengaturan" },
];

type Tab = "ringkasan" | "pengaturan";

// Shared class strings: one surface, one primary button, one field.
const panel = "bg-surface rounded-2xl border border-line p-5 sm:p-6 min-w-0";
const h2 = "font-heading text-lg font-semibold text-ink mb-4";
const btnPrimary = `inline-flex items-center justify-center gap-2 bg-accent-strong text-on-accent font-heading font-semibold text-sm px-5 py-2.5 rounded-full transition-colors hover:bg-ink active:bg-ink disabled:opacity-50 disabled:cursor-not-allowed`;
const btnQuiet = `inline-flex items-center justify-center font-heading font-semibold text-sm px-5 py-2.5 rounded-full border border-line text-ink transition-colors hover:bg-paper active:bg-line disabled:opacity-50`;
const field = `w-full bg-surface border border-line rounded-xl px-3 py-2.5 font-body text-base text-ink placeholder:text-ink-muted transition-colors hover:border-ink-muted disabled:opacity-50`;
const label = "font-body text-sm text-ink-muted block mb-1.5";

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
  const customWords = useAppStore((s) => s.customWords);
  const sessionDuration = useAppStore((s) => s.sessionDuration);
  const addCustomWord = useAppStore((s) => s.addCustomWord);
  const removeCustomWord = useAppStore((s) => s.removeCustomWord);
  const setSessionDuration = useAppStore((s) => s.setSessionDuration);
  const resetProgress = useAppStore((s) => s.resetProgress);
  const updateStreak = useAppStore((s) => s.updateStreak);
  // Roll the day over here too, so a deep link on a new day doesn't show yesterday as today.
  useEffect(() => { updateStreak(); }, [updateStreak]);

  const [activeTab, setActiveTab] = useState<Tab>("ringkasan");
  const [emoji, setEmoji] = useState("");
  const [kata, setKata] = useState("");
  const [sukuKata, setSukuKata] = useState("");
  const [kategori, setKategori] = useState<Word["category"]>("benda");
  const [kesulitan, setKesulitan] = useState<1 | 2 | 3>(1);
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

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emoji.trim() || !kata.trim() || !sukuKata.trim()) return;

    const newWord: Word = {
      id: "custom-" + Date.now(),
      emoji: emoji.trim(),
      word: kata.trim().toLowerCase(),
      syllables: sukuKata.split(",").map((s) => s.trim()).filter(Boolean),
      category: kategori,
      difficulty: kesulitan,
    };

    addCustomWord(newWord);
    setEmoji("");
    setKata("");
    setSukuKata("");
    setKategori("benda");
    setKesulitan(1);
  };

  const todayFigures = [
    { value: todayStars, label: "Bintang" },
    { value: wordsLearned.length, label: "Kata dipelajari" },
    { value: sessionsCompleted, label: "Sesi selesai" },
    { value: todayMinutes, label: "Waktu (menit)" },
  ];

  const favorites = Object.entries(gameStats).sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-16">
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

          {/* Tab Bar */}
          <div role="group" aria-label="Bagian pendamping" className="inline-flex gap-1 bg-surface rounded-full p-1 border border-line">
            {tabs.map((tab) => {
              const selected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  aria-pressed={selected}
                  onClick={() => setActiveTab(tab.key as Tab)}
                  className={`px-4 sm:px-5 py-2 rounded-full font-heading text-sm font-semibold transition-colors ${
                    selected
                      ? "bg-accent-strong text-on-accent"
                      : "text-ink-muted hover:text-ink hover:bg-paper active:bg-line"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </header>

        {/* Ringkasan Tab */}
        {activeTab === "ringkasan" && (
          <div className="pd-fade grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Hari Ini — signature */}
            <section className={`${panel} md:col-span-2`}>
              <h2 className={h2}>Hari Ini</h2>
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-y-5">
                {todayFigures.map((f, i) => (
                  <div
                    key={f.label}
                    className={`flex flex-col-reverse px-1 sm:px-5 min-w-0 ${i % 2 === 1 ? "border-l border-line pl-4" : ""} ${i > 0 ? "sm:border-l sm:border-line" : "sm:pl-0"}`}
                  >
                    <dt className="font-body text-sm text-ink-muted mt-2">{f.label}</dt>
                    <dd className="font-heading text-4xl sm:text-5xl font-bold text-ink tabular-nums leading-none">{f.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Rutinitas Harian */}
            <section className={panel}>
              <h2 className={h2}>Rutinitas Harian</h2>
              <p className="mb-5">
                <span className="font-heading text-4xl font-bold text-ink tabular-nums">{dailyStreak}</span>
                <span className="font-body text-base text-ink-muted ml-2">hari berturut-turut</span>
              </p>
              <ol className="grid grid-cols-7 gap-1">
                {last7Days.map((date, i) => {
                  const isActive = streakDays[i];
                  return (
                    <li key={date} className="flex flex-col items-center gap-1.5">
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center ${isActive ? "bg-good-strong text-on-accent" : "bg-paper border border-line"}`}
                      >
                        {isActive && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                        )}
                        <span className="sr-only">{isActive ? "aktif" : "tidak aktif"}</span>
                      </span>
                      <span className="font-body text-xs text-ink-muted">{dayLabels[i]}</span>
                    </li>
                  );
                })}
              </ol>
            </section>

            {/* Waktu Belajar */}
            <section className={panel}>
              <h2 className={h2}>Waktu Belajar</h2>
              <div className="flex items-end justify-between gap-2 h-40">
                {chartMinutes.map((minutes, index) => {
                  const heightPct = maxMinutes > 0 ? (minutes / maxMinutes) * 100 : 0;
                  return (
                    <div key={dayLabels[index]} className="flex-1 flex flex-col items-center gap-1 h-full justify-end min-w-0">
                      {minutes > 0 && <span className="font-body text-xs text-ink-muted tabular-nums">{minutes}</span>}
                      <div
                        className={`w-full max-w-[36px] rounded-t-md ${index === chartMinutes.length - 1 ? "bg-accent-strong" : "bg-accent-muted"}`}
                        style={{ height: `${Math.max(heightPct, minutes > 0 ? 8 : 0)}%` }}
                      />
                      <span className="font-body text-xs text-ink-muted">{dayLabels[index]}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Level Belajar */}
            <section className={`${panel} md:col-span-2`}>
              <h2 className={h2}>Level Belajar</h2>
              <ol className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {levelDescriptions.map(({ level, label: lvl }) => {
                  const isCurrent = level === currentLevel;
                  const isUnlocked = level <= currentLevel;
                  return (
                    <li
                      key={level}
                      aria-current={isCurrent ? "step" : undefined}
                      className={`rounded-xl p-4 border-2 ${isCurrent ? "border-accent bg-accent-soft" : isUnlocked ? "border-line" : "border-dashed border-line opacity-60"}`}
                    >
                      <div className="flex items-center justify-between font-heading text-sm font-semibold text-ink">
                        <span>Level {level}</span>
                        <span className="font-body text-xs font-normal text-ink-muted">
                          {isCurrent ? "Sekarang" : isUnlocked ? "Selesai" : "Terkunci"}
                        </span>
                      </div>
                      <div className="font-body text-sm text-ink-muted mt-1">{lvl}</div>
                    </li>
                  );
                })}
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

            {/* Tips Pendampingan */}
            <section className={`${panel} md:col-span-2`}>
              <h2 className={h2}>Tips Pendampingan</h2>
              <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 list-decimal list-inside marker:font-heading marker:text-accent">
                <li className="font-body text-base text-ink leading-relaxed">Ucapkan kata bersama anak. <strong>Contohkan langsung</strong> dengan mulut Anda.</li>
                <li className="font-body text-base text-ink leading-relaxed">Beri jeda 3-5 detik setelah bertanya. <strong>Tunggu anak merespons</strong>.</li>
                <li className="font-body text-base text-ink leading-relaxed">Jika anak salah, jangan koreksi langsung. <strong>Ulangi dengan benar</strong>.</li>
                <li className="font-body text-base text-ink leading-relaxed"><strong>Puji setiap usaha</strong> anak, bukan hanya hasil sempurna.</li>
              </ol>
            </section>

            {/* Laporan Mingguan */}
            <section className={`${panel} md:col-span-2 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-5 md:items-end`}>
              <div className="min-w-0">
                <h2 className={h2}>Laporan Mingguan</h2>
                <pre className="font-body text-sm text-ink whitespace-pre-wrap leading-relaxed bg-paper rounded-xl p-4">
                  {`✨ Laporan Belajar ${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}

⭐ Bintang hari ini: ${todayStars}
📚 Kata dipelajari: ${wordsLearned.length} kata
✅ Sesi belajar: ${sessionsCompleted} kali
⏱️ Waktu belajar: ${todayMinutes} menit
🔥 Streak: ${dailyStreak} hari berturut-turut`}
                </pre>
              </div>
              <button
                onClick={async () => {
                  const text = `*Laporan Belajar ${new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}*\n\n⭐ Bintang: ${todayStars}\n📚 Kata: ${wordsLearned.length}\n✅ Sesi: ${sessionsCompleted}\n⏱️ Waktu: ${todayMinutes} menit\n🔥 Streak: ${dailyStreak} hari\n\n-- Ayo Belajar Bicara!`;
                  try {
                    await navigator.clipboard.writeText(text);
                    alert("Laporan disalin! Tempel ke WhatsApp untuk dibagikan 📱");
                  } catch {
                    alert("Gagal menyalin. Tekan lama teks laporan di atas lalu pilih Salin.");
                  }
                }}
                className={btnPrimary}
              >
                Salin Laporan
              </button>
            </section>
          </div>
        )}

        {/* Pengaturan Tab */}
        {activeTab === "pengaturan" && (
          <div className="pd-fade grid grid-cols-1 gap-5">
            {/* Tambah Kata Baru */}
            <section className={panel}>
              <h2 className={h2}>Tambah Kata Baru</h2>
              <form onSubmit={handleAddWord} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="pd-emoji" className={label}>Emoji</label>
                    <SafeInput id="pd-emoji" type="text" value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="tempel satu emoji" className={field} />
                  </div>
                  <div>
                    <label htmlFor="pd-kata" className={label}>Kata</label>
                    <SafeInput id="pd-kata" type="text" value={kata} onChange={(e) => setKata(e.target.value)} placeholder="contoh: apel" className={field} />
                  </div>
                  <div>
                    <label htmlFor="pd-suku" className={label}>Suku Kata</label>
                    <SafeInput id="pd-suku" type="text" value={sukuKata} onChange={(e) => setSukuKata(e.target.value)} placeholder="pisahkan dengan koma, contoh: a, pel" className={field} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="pd-kategori" className={label}>Kategori</label>
                      <select id="pd-kategori" value={kategori} onChange={(e) => setKategori(e.target.value as Word["category"])} className={field}>
                        {categories.map((cat) => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="pd-kesulitan" className={label}>Kesulitan</label>
                      <select id="pd-kesulitan" value={kesulitan} onChange={(e) => setKesulitan(Number(e.target.value) as 1 | 2 | 3)} className={field}>
                        <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button type="submit" className={btnPrimary}>Tambah Kata</button>
              </form>

              {customWords.length > 0 && (
                <div className="mt-8">
                  <h3 className="font-heading text-base font-semibold text-ink mb-2">Kata Custom ({customWords.length})</h3>
                  <ul className="divide-y divide-line border-y border-line">
                    {customWords.map((word) => (
                      <li key={word.id} className="flex items-center justify-between gap-3 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xl flex-shrink-0" aria-hidden="true">{word.emoji}</span>
                          <div className="min-w-0">
                            <span className="font-heading text-base font-semibold text-ink">{word.word}</span>
                            <span className="font-body text-sm text-ink-muted ml-2">[{word.syllables.join(" - ")}]</span>
                          </div>
                          <span className="font-body text-sm text-ink-muted">{word.category}</span>
                        </div>
                        <button
                          onClick={() => removeCustomWord(word.id)}
                          className={`text-danger-strong font-body text-sm px-3 py-1.5 rounded-full transition-colors hover:bg-danger-soft active:bg-line`}
                        >
                          Hapus
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {/* Durasi Sesi */}
            <section className={panel}>
              <h2 className="font-heading text-lg font-semibold text-ink mb-1">Durasi Sesi Belajar</h2>
              <p className="font-body text-base text-ink-muted mb-5">Atur berapa lama anak belajar dalam satu sesi. Sesi ideal: 10-15 menit.</p>
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
        )}
      </div>
    </div>
  );
}
