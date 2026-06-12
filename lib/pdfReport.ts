"use client";

import { jsPDF } from "jspdf";
import { Word } from "@/data/words";
import { getPhoneticTags } from "@/lib/phonetics";
import { getMasteryLevel, SRState } from "@/lib/spacedRepetition";

interface ReportData {
  profileName: string;
  totalStars: number;
  wordsLearned: string[];
  sessionsCompleted: number;
  todayMinutes: number;
  dailyStreak: number;
  gameStats: Record<string, number>;
  weeklyMinutes: number[];
  customWords: Word[];
  srState: Record<string, SRState>;
  allWords: Word[];
}

const COLORS = {
  primary: "#7C3AED",
  secondary: "#9333EA",
  text: "#1F2937",
  textLight: "#6B7280",
  border: "#E5E7EB",
  success: "#10B981",
  warning: "#F59E0B",
  background: "#FFF9E6",
};

export function generateProgressPDF(data: ReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // === HEADER ===
  doc.setFillColor(COLORS.primary);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Laporan Progres Belajar", margin, 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Ayo Belajar Bicara! - ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}`, margin, 27);

  y = 50;

  // === PROFILE INFO ===
  doc.setTextColor(COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`Profil: ${data.profileName}`, margin, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(COLORS.textLight);
  doc.text(
    `Tanggal: ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })}`,
    margin,
    y
  );
  y += 12;

  // === SUMMARY STATS (4 boxes) ===
  const statBoxes = [
    { label: "Total Bintang", value: String(data.totalStars), color: COLORS.warning },
    { label: "Kata Dikuasai", value: String(data.wordsLearned.length), color: COLORS.success },
    { label: "Sesi Selesai", value: String(data.sessionsCompleted), color: COLORS.primary },
    { label: "Streak", value: `${data.dailyStreak} hari`, color: "#EF4444" },
  ];

  const boxWidth = (contentWidth - 6) / 4;
  statBoxes.forEach((box, i) => {
    const x = margin + i * (boxWidth + 2);
    const rgb = hexToRgb(box.color);
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.roundedRect(x, y, boxWidth, 22, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(box.value, x + boxWidth / 2, y + 10, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(box.label, x + boxWidth / 2, y + 17, { align: "center" });
  });

  y += 30;

  // === WEEKLY ACTIVITY ===
  doc.setTextColor(COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Aktivitas Mingguan (menit)", margin, y);
  y += 6;
  const maxMinutes = Math.max(...data.weeklyMinutes, 1);
  const barWidth = (contentWidth - 14) / 7;
  const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  last7Days.forEach((date, i) => {
    const minutes = data.weeklyMinutes[i] || 0;
    const heightPct = minutes / maxMinutes;
    const barHeight = 30 * heightPct;
    const x = margin + i * (barWidth + 2);
    const barY = y + 30 - barHeight;
    const isToday = date.toDateString() === today.toDateString();
    const rgb = isToday ? hexToRgb(COLORS.primary) : hexToRgb(COLORS.border);
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.roundedRect(x, barY, barWidth, barHeight, 1, 1, "F");
    doc.setTextColor(COLORS.textLight);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text(dayLabels[date.getDay()], x + barWidth / 2, y + 38, { align: "center" });
    if (minutes > 0) {
      doc.text(String(minutes), x + barWidth / 2, barY - 1, { align: "center" });
    }
  });

  y += 48;

  // === GAME STATS ===
  doc.setTextColor(COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Aktivitas Game", margin, y);
  y += 6;
  const gameEntries = Object.entries(data.gameStats).sort((a, b) => b[1] - a[1]);
  if (gameEntries.length > 0) {
    doc.setFontSize(9);
    gameEntries.slice(0, 8).forEach(([game, count]) => {
      doc.setTextColor(COLORS.text);
      doc.text(formatGameName(game), margin, y);
      doc.setTextColor(COLORS.textLight);
      doc.text(`${count}x dimainkan`, pageWidth - margin, y, { align: "right" });
      y += 5;
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(COLORS.textLight);
    doc.text("Belum ada aktivitas game", margin, y);
    y += 5;
  }
  y += 8;

  // === WORDS BY PHONETIC ===
  doc.setTextColor(COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Analisis Bunyi Sulit", margin, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(COLORS.textLight);
  doc.text("Kata yang mengandung bunyi tertentu:", margin, y);
  y += 6;

  const soundCounts: Record<string, number> = {};
  for (const wordId of data.wordsLearned) {
    const word = data.allWords.find((w) => w.id === wordId);
    if (!word) continue;
    const tags = getPhoneticTags(word);
    for (const tag of tags) {
      soundCounts[tag] = (soundCounts[tag] || 0) + 1;
    }
  }
  const soundEntries = Object.entries(soundCounts).sort((a, b) => b[1] - a[1]);
  if (soundEntries.length > 0) {
    doc.setFontSize(9);
    for (const [tag, count] of soundEntries) {
      doc.setTextColor(COLORS.text);
      doc.text(`/ ${tag.toUpperCase()} /`, margin, y);
      doc.setTextColor(COLORS.textLight);
      doc.text(`${count} kata`, pageWidth - margin, y, { align: "right" });
      y += 5;
    }
  } else {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(COLORS.textLight);
    doc.text("Belum ada data", margin, y);
    y += 5;
  }
  y += 10;

  // === MASTERY BREAKDOWN ===
  if (y > pageHeight - 60) {
    doc.addPage();
    y = margin;
  }

  doc.setTextColor(COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Detail Kata yang Dikuasai", margin, y);
  y += 8;

  const masteredWords = data.wordsLearned
    .map((id) => data.allWords.find((w) => w.id === id))
    .filter(Boolean) as Word[];

  doc.setFontSize(8);
  const columns = [
    { x: margin, label: "Kata" },
    { x: margin + 35, label: "Suku Kata" },
    { x: margin + 70, label: "Kategori" },
    { x: margin + 105, label: "Bunyi" },
    { x: margin + 130, label: "Level" },
  ];

  // Header row
  doc.setFont("helvetica", "bold");
  doc.setTextColor(COLORS.primary);
  columns.forEach((c) => doc.text(c.label, c.x, y));
  y += 4;
  doc.setDrawColor(COLORS.border);
  doc.line(margin, y, pageWidth - margin, y);
  y += 3;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(COLORS.text);

  const displayWords = masteredWords.slice(0, 25);
  for (const word of displayWords) {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = margin;
    }
    doc.text(word.word.slice(0, 12), columns[0].x, y);
    doc.setTextColor(COLORS.textLight);
    doc.text(word.syllables.join("-").slice(0, 15), columns[1].x, y);
    doc.setTextColor(COLORS.text);
    doc.text(word.category.slice(0, 10), columns[2].x, y);
    const tags = getPhoneticTags(word);
    doc.setTextColor(COLORS.textLight);
    doc.text(tags.length > 0 ? tags.map((t) => `/${t}/`).join(" ") : "-", columns[3].x, y);
    doc.setTextColor(COLORS.text);
    const sr = data.srState[word.id];
    const level = getMasteryLevel(sr);
    const levelLabel = level === "mastered" ? "Master" : level === "familiar" ? "Familiar" : level === "learning" ? "Learning" : "New";
    doc.text(levelLabel, columns[4].x, y);
    y += 5;
  }
  if (masteredWords.length > displayWords.length) {
    doc.setFont("helvetica", "italic");
    doc.setTextColor(COLORS.textLight);
    doc.text(
      `+ ${masteredWords.length - displayWords.length} kata lainnya...`,
      margin,
      y
    );
    y += 5;
  }
  y += 8;

  // === RECOMMENDATIONS ===
  if (y > pageHeight - 50) {
    doc.addPage();
    y = margin;
  }

  doc.setTextColor(COLORS.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Rekomendasi untuk Terapis", margin, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const recommendations = generateRecommendations(data);
  for (const rec of recommendations) {
    if (y > pageHeight - 15) {
      doc.addPage();
      y = margin;
    }
    doc.setTextColor(COLORS.textLight);
    doc.text("•", margin, y);
    doc.setTextColor(COLORS.text);
    const lines = doc.splitTextToSize(rec, contentWidth - 5);
    doc.text(lines, margin + 4, y);
    y += 5 * lines.length + 1;
  }
  y += 6;

  // === FOOTER ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setTextColor(COLORS.textLight);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.text(
      `Ayo Belajar Bicara! - Laporan dibuat otomatis pada ${new Date().toLocaleString("id-ID")}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(`Halaman ${i} dari ${totalPages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  // Save
  const filename = `laporan-progres-${data.profileName.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

function formatGameName(game: string): string {
  const map: Record<string, string> = {
    "kartu-kata": "Kartu Kata",
    "tebak-gambar": "Tebak Gambar",
    "suku-kata": "Suku Kata",
    "ayo-ngomong": "Ayo Ngomong",
    "tebak-suara": "Tebak Suara",
    "susun-kalimat": "Susun Kalimat",
    "bunyi-kata": "Bunyi Kata",
    "kata-hari-ini": "Kata Hari Ini",
  };
  return map[game] || game;
}

function generateRecommendations(data: ReportData): string[] {
  const recs: string[] = [];

  if (data.dailyStreak === 0) {
    recs.push(
      "Anak belum memiliki streak harian. Dorong untuk bermain minimal 1x setiap hari untuk membangun konsistensi."
    );
  } else if (data.dailyStreak < 3) {
    recs.push(
      `Streak ${data.dailyStreak} hari menunjukkan awal yang baik. Targetkan 7 hari berturut-turut untuk membentuk kebiasaan.`
    );
  } else {
    recs.push(
      `Streak ${data.dailyStreak} hari sangat baik! Pertahankan konsistensi ini.`
    );
  }

  if (data.wordsLearned.length < 10) {
    recs.push(
      "Kosakata masih terbatas. Fokuskan pada kategori yang relevan dengan kebutuhan anak (misal: benda di rumah)."
    );
  }

  if (data.todayMinutes < 5) {
    recs.push(
      "Waktu belajar hari ini kurang dari 5 menit. Sesi ideal untuk terapi bicara adalah 10-15 menit per hari."
    );
  }

  // Sound-specific recommendations
  const soundCounts: Record<string, number> = {};
  for (const wordId of data.wordsLearned) {
    const word = data.allWords.find((w) => w.id === wordId);
    if (!word) continue;
    for (const tag of getPhoneticTags(word)) {
      soundCounts[tag] = (soundCounts[tag] || 0) + 1;
    }
  }
  const challengingSounds = ["r", "s", "l"].filter(
    (s) => (soundCounts[s] || 0) < 3
  );
  if (challengingSounds.length > 0) {
    recs.push(
      `Latih kata dengan bunyi /${challengingSounds.join(", /")}/ secara lebih intensif — ini bunyi yang sering sulit untuk anak dengan keterlambatan bicara.`
    );
  }

  if (data.gameStats["ayo-ngomong"] === undefined) {
    recs.push(
      "Ayo Ngomong (latihan pengucapan) belum pernah dimainkan. Ini fitur utama untuk terapi bicara — prioritaskan sesi ini."
    );
  }

  if (recs.length === 0) {
    recs.push(
      "Progres anak sangat baik. Lanjutkan sesi rutin dan eksplorasi kategori kata baru."
    );
  }

  return recs;
}
