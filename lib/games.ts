export type Game = { slug: string; label: string; href: string; desc: string };

export const beginnerGames: Game[] = [
  { slug: "kartu-kata", label: "Kartu Kata", href: "/kartu-kata", desc: "Lihat dan dengar kata baru" },
  { slug: "tebak-gambar", label: "Tebak Gambar", href: "/tebak-gambar", desc: "Cocokkan gambar dengan suara" },
  { slug: "suku-kata", label: "Suku Kata", href: "/suku-kata", desc: "Belajar merangkai suku kata" },
];

export const advancedGames: Game[] = [
  { slug: "ayo-ngomong", label: "Ayo Ngomong", href: "/ayo-ngomong", desc: "Latihan ucapkan kata" },
  { slug: "islami", label: "Islami", href: "/islami", desc: "Hijaiyah, doa, asmaul husna" },
  { slug: "tebak-suara", label: "Tebak Suara", href: "/tebak-suara", desc: "Tebak kata dari suara" },
  { slug: "susun-kalimat", label: "Susun Kalimat", href: "/susun-kalimat", desc: "Susun kata jadi kalimat" },
];

export const gameLabel = (slug: string): string =>
  [...beginnerGames, ...advancedGames].find((g) => g.slug === slug)?.label ?? slug;
