export type Word = {
  id: string;
  emoji: string;
  word: string;
  syllables: string[];
  category: "hewan" | "buah" | "benda" | "keluarga" | "aktivitas" | "makanan" | "islami";
  difficulty: 1 | 2 | 3;
};

export const words: Word[] = [
  // === KELUARGA (8 kata) ===
  { id: "kel-1", emoji: "👩", word: "mama", syllables: ["ma", "ma"], category: "keluarga", difficulty: 1 },
  { id: "kel-2", emoji: "👨", word: "papa", syllables: ["pa", "pa"], category: "keluarga", difficulty: 1 },
  { id: "kel-3", emoji: "👧", word: "kakak", syllables: ["ka", "kak"], category: "keluarga", difficulty: 1 },
  { id: "kel-4", emoji: "👶", word: "adik", syllables: ["a", "dik"], category: "keluarga", difficulty: 1 },
  { id: "kel-5", emoji: "👵", word: "nenek", syllables: ["ne", "nek"], category: "keluarga", difficulty: 1 },
  { id: "kel-6", emoji: "👴", word: "kakek", syllables: ["ka", "kek"], category: "keluarga", difficulty: 1 },
  { id: "kel-7", emoji: "👦", word: "abang", syllables: ["a", "bang"], category: "keluarga", difficulty: 1 },
  { id: "kel-8", emoji: "👼", word: "bayi", syllables: ["ba", "yi"], category: "keluarga", difficulty: 1 },

  // === HEWAN (12 kata) ===
  { id: "hew-1", emoji: "🐱", word: "kucing", syllables: ["ku", "cing"], category: "hewan", difficulty: 1 },
  { id: "hew-2", emoji: "🐶", word: "anjing", syllables: ["an", "jing"], category: "hewan", difficulty: 1 },
  { id: "hew-3", emoji: "🐔", word: "ayam", syllables: ["a", "yam"], category: "hewan", difficulty: 1 },
  { id: "hew-4", emoji: "🐟", word: "ikan", syllables: ["i", "kan"], category: "hewan", difficulty: 1 },
  { id: "hew-5", emoji: "🐦", word: "burung", syllables: ["bu", "rung"], category: "hewan", difficulty: 1 },
  { id: "hew-6", emoji: "🐄", word: "sapi", syllables: ["sa", "pi"], category: "hewan", difficulty: 1 },
  { id: "hew-7", emoji: "🐐", word: "kambing", syllables: ["kam", "bing"], category: "hewan", difficulty: 2 },
  { id: "hew-8", emoji: "🐴", word: "kuda", syllables: ["ku", "da"], category: "hewan", difficulty: 1 },
  { id: "hew-9", emoji: "🦆", word: "bebek", syllables: ["be", "bek"], category: "hewan", difficulty: 1 },
  { id: "hew-10", emoji: "🐰", word: "kelinci", syllables: ["ke", "lin", "ci"], category: "hewan", difficulty: 2 },
  { id: "hew-11", emoji: "🐘", word: "gajah", syllables: ["ga", "jah"], category: "hewan", difficulty: 1 },
  { id: "hew-12", emoji: "🦁", word: "singa", syllables: ["si", "nga"], category: "hewan", difficulty: 1 },

  // === BUAH (10 kata) ===
  { id: "bua-1", emoji: "🍎", word: "apel", syllables: ["a", "pel"], category: "buah", difficulty: 1 },
  { id: "bua-2", emoji: "🍊", word: "jeruk", syllables: ["je", "ruk"], category: "buah", difficulty: 1 },
  { id: "bua-3", emoji: "🍌", word: "pisang", syllables: ["pi", "sang"], category: "buah", difficulty: 1 },
  { id: "bua-4", emoji: "🥭", word: "mangga", syllables: ["mang", "ga"], category: "buah", difficulty: 1 },
  { id: "bua-5", emoji: "🍉", word: "semangka", syllables: ["se", "mang", "ka"], category: "buah", difficulty: 2 },
  { id: "bua-6", emoji: "🍇", word: "anggur", syllables: ["ang", "gur"], category: "buah", difficulty: 1 },
  { id: "bua-7", emoji: "🍈", word: "pepaya", syllables: ["pe", "pa", "ya"], category: "buah", difficulty: 2 },
  { id: "bua-8", emoji: "🍈", word: "melon", syllables: ["me", "lon"], category: "buah", difficulty: 1 },
  { id: "bua-9", emoji: "🍓", word: "stroberi", syllables: ["stro", "be", "ri"], category: "buah", difficulty: 3 },
  { id: "bua-10", emoji: "🫐", word: "jambu", syllables: ["jam", "bu"], category: "buah", difficulty: 1 },

  // === MAKANAN (10 kata) ===
  { id: "mkn-1", emoji: "🍚", word: "nasi", syllables: ["na", "si"], category: "makanan", difficulty: 1 },
  { id: "mkn-2", emoji: "🥛", word: "susu", syllables: ["su", "su"], category: "makanan", difficulty: 1 },
  { id: "mkn-3", emoji: "🍞", word: "roti", syllables: ["ro", "ti"], category: "makanan", difficulty: 1 },
  { id: "mkn-4", emoji: "🥚", word: "telur", syllables: ["te", "lur"], category: "makanan", difficulty: 1 },
  { id: "mkn-5", emoji: "🍜", word: "mie", syllables: ["mi", "e"], category: "makanan", difficulty: 1 },
  { id: "mkn-6", emoji: "🍲", word: "bubur", syllables: ["bu", "bur"], category: "makanan", difficulty: 1 },
  { id: "mkn-7", emoji: "🧁", word: "kue", syllables: ["ku", "e"], category: "makanan", difficulty: 1 },
  { id: "mkn-8", emoji: "🍬", word: "permen", syllables: ["per", "men"], category: "makanan", difficulty: 1 },
  { id: "mkn-9", emoji: "🍦", word: "es krim", syllables: ["es", "krim"], category: "makanan", difficulty: 2 },
  { id: "mkn-10", emoji: "🍪", word: "biskuit", syllables: ["bis", "ku", "it"], category: "makanan", difficulty: 2 },

  // === BENDA (10 kata) ===
  { id: "bnd-1", emoji: "⚽", word: "bola", syllables: ["bo", "la"], category: "benda", difficulty: 1 },
  { id: "bnd-2", emoji: "🚗", word: "mobil", syllables: ["mo", "bil"], category: "benda", difficulty: 1 },
  { id: "bnd-3", emoji: "📖", word: "buku", syllables: ["bu", "ku"], category: "benda", difficulty: 1 },
  { id: "bnd-4", emoji: "👟", word: "sepatu", syllables: ["se", "pa", "tu"], category: "benda", difficulty: 2 },
  { id: "bnd-5", emoji: "👕", word: "baju", syllables: ["ba", "ju"], category: "benda", difficulty: 1 },
  { id: "bnd-6", emoji: "🧢", word: "topi", syllables: ["to", "pi"], category: "benda", difficulty: 1 },
  { id: "bnd-7", emoji: "🪑", word: "kursi", syllables: ["kur", "si"], category: "benda", difficulty: 1 },
  { id: "bnd-8", emoji: "🖍️", word: "pensil", syllables: ["pen", "sil"], category: "benda", difficulty: 1 },
  { id: "bnd-9", emoji: "📱", word: "handphone", syllables: ["hand", "pho", "ne"], category: "benda", difficulty: 3 },
  { id: "bnd-10", emoji: "🚲", word: "sepeda", syllables: ["se", "pe", "da"], category: "benda", difficulty: 2 },

  // === AKTIVITAS (10 kata) ===
  { id: "akt-1", emoji: "🍽️", word: "makan", syllables: ["ma", "kan"], category: "aktivitas", difficulty: 1 },
  { id: "akt-2", emoji: "🥤", word: "minum", syllables: ["mi", "num"], category: "aktivitas", difficulty: 1 },
  { id: "akt-3", emoji: "😴", word: "tidur", syllables: ["ti", "dur"], category: "aktivitas", difficulty: 1 },
  { id: "akt-4", emoji: "🛁", word: "mandi", syllables: ["man", "di"], category: "aktivitas", difficulty: 1 },
  { id: "akt-5", emoji: "🎮", word: "main", syllables: ["ma", "in"], category: "aktivitas", difficulty: 1 },
  { id: "akt-6", emoji: "🏃", word: "lari", syllables: ["la", "ri"], category: "aktivitas", difficulty: 1 },
  { id: "akt-7", emoji: "🪑", word: "duduk", syllables: ["du", "duk"], category: "aktivitas", difficulty: 1 },
  { id: "akt-8", emoji: "🧍", word: "berdiri", syllables: ["ber", "di", "ri"], category: "aktivitas", difficulty: 2 },
  { id: "akt-9", emoji: "✍️", word: "menulis", syllables: ["me", "nu", "lis"], category: "aktivitas", difficulty: 2 },
  { id: "akt-10", emoji: "📚", word: "belajar", syllables: ["be", "la", "jar"], category: "aktivitas", difficulty: 2 },

  // === ISLAMI (10 kata) ===
  { id: "isl-1", emoji: "☪️", word: "allah", syllables: ["al", "lah"], category: "islami", difficulty: 1 },
  { id: "isl-2", emoji: "🕌", word: "masjid", syllables: ["mas", "jid"], category: "islami", difficulty: 1 },
  { id: "isl-3", emoji: "🤲", word: "sholat", syllables: ["sho", "lat"], category: "islami", difficulty: 1 },
  { id: "isl-4", emoji: "📖", word: "quran", syllables: ["qur", "an"], category: "islami", difficulty: 1 },
  { id: "isl-5", emoji: "🙏", word: "doa", syllables: ["do", "a"], category: "islami", difficulty: 1 },
  { id: "isl-6", emoji: "💧", word: "wudhu", syllables: ["wu", "dhu"], category: "islami", difficulty: 1 },
  { id: "isl-7", emoji: "🌙", word: "puasa", syllables: ["pu", "a", "sa"], category: "islami", difficulty: 2 },
  { id: "isl-8", emoji: "🌿", word: "surga", syllables: ["sur", "ga"], category: "islami", difficulty: 1 },
  { id: "isl-9", emoji: "✨", word: "amin", syllables: ["a", "min"], category: "islami", difficulty: 1 },
  { id: "isl-10", emoji: "🌟", word: "bismillah", syllables: ["bis", "mil", "lah"], category: "islami", difficulty: 2 },
];

export const categories = [
  { id: "semua", label: "Semua", emoji: "📚" },
  { id: "keluarga", label: "Keluarga", emoji: "👨‍👩‍👧‍👦" },
  { id: "hewan", label: "Hewan", emoji: "🐾" },
  { id: "buah", label: "Buah", emoji: "🍎" },
  { id: "makanan", label: "Makanan", emoji: "🍚" },
  { id: "benda", label: "Benda", emoji: "🎒" },
  { id: "aktivitas", label: "Aktivitas", emoji: "🏃" },
  { id: "islami", label: "Islami", emoji: "🕌" },
] as const;

export const simpleSentences = [
  "makan nasi",
  "minum susu",
  "kucing lucu",
  "bola besar",
  "baju baru",
  "mama cantik",
  "papa hebat",
  "ikan renang",
  "burung terbang",
  "adik tidur",
];
