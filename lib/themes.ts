export interface Theme {
  id: string;
  name: string;
  description: string;
  emoji: string;
  backgroundClass: string;
  bodyBackgroundClass: string;
  accentClass: string;
}

export const THEMES: Theme[] = [
  {
    id: "default",
    name: "Default",
    description: "Tema standar aplikasi",
    emoji: "\ud83c\udf1f",
    backgroundClass: "bg-[#FFF9E6]",
    bodyBackgroundClass: "bg-[#FFF9E6]",
    accentClass: "bg-purple-500",
  },
  {
    id: "ramadan",
    name: "Ramadan",
    description: "Tema spesial Ramadhan dengan nuansa hijau dan emas",
    emoji: "\ud83c\udf19",
    backgroundClass: "bg-emerald-50",
    bodyBackgroundClass: "bg-emerald-50",
    accentClass: "bg-emerald-600",
  },
  {
    id: "birthday",
    name: "Ulang Tahun",
    description: "Tema ceria untuk hari ulang tahun si kecil",
    emoji: "\ud83c\udf82",
    backgroundClass: "bg-pink-50",
    bodyBackgroundClass: "bg-pink-50",
    accentClass: "bg-pink-500",
  },
  {
    id: "ocean",
    name: "Laut",
    description: "Tema biru laut yang menyegarkan",
    emoji: "\ud83c\udf0a",
    backgroundClass: "bg-sky-50",
    bodyBackgroundClass: "bg-sky-50",
    accentClass: "bg-sky-500",
  },
  {
    id: "garden",
    name: "Taman",
    description: "Tema hijau alami yang menenangkan",
    emoji: "\ud83c\udf31",
    backgroundClass: "bg-green-50",
    bodyBackgroundClass: "bg-green-50",
    accentClass: "bg-green-600",
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}
