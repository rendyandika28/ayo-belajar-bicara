export type Word = {
  id: string;
  emoji: string;
  word: string;
  syllables: string[];
  category: "hewan" | "buah" | "benda" | "keluarga" | "aktivitas" | "makanan" | "warna" | "angka" | "tubuh" | "alam" | "peralatan" | "foto";
  difficulty: 1 | 2 | 3;
};

export const words: Word[] = [
  // === KELUARGA (9 kata) ===
  { id: "kel-1", emoji: "👩", word: "mama", syllables: ["ma", "ma"], category: "keluarga", difficulty: 1 },
  { id: "kel-2", emoji: "👨", word: "papa", syllables: ["pa", "pa"], category: "keluarga", difficulty: 1 },
  { id: "kel-3", emoji: "👧", word: "kakak", syllables: ["ka", "kak"], category: "keluarga", difficulty: 1 },
  { id: "kel-4", emoji: "👶", word: "adik", syllables: ["a", "dik"], category: "keluarga", difficulty: 1 },
  { id: "kel-5", emoji: "👵", word: "nenek", syllables: ["ne", "nek"], category: "keluarga", difficulty: 1 },
  { id: "kel-6", emoji: "👴", word: "kakek", syllables: ["ka", "kek"], category: "keluarga", difficulty: 1 },
  { id: "kel-7", emoji: "👦", word: "abang", syllables: ["a", "bang"], category: "keluarga", difficulty: 1 },
  { id: "kel-8", emoji: "👶", word: "bayi", syllables: ["ba", "yi"], category: "keluarga", difficulty: 1 },
  { id: "kel-9", emoji: "👨‍👩‍👧‍👦", word: "keluarga", syllables: ["ke", "lu", "ar", "ga"], category: "keluarga", difficulty: 2 },

  // === HEWAN (15 kata) ===
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
  { id: "hew-13", emoji: "🐸", word: "katak", syllables: ["ka", "tak"], category: "hewan", difficulty: 1 },
  { id: "hew-14", emoji: "🐊", word: "buaya", syllables: ["bu", "a", "ya"], category: "hewan", difficulty: 2 },
  { id: "hew-15", emoji: "🦋", word: "kupu", syllables: ["ku", "pu"], category: "hewan", difficulty: 1 },

  // === BUAH (11 kata) ===
  { id: "bua-1", emoji: "🍎", word: "apel", syllables: ["a", "pel"], category: "buah", difficulty: 1 },
  { id: "bua-2", emoji: "🍊", word: "jeruk", syllables: ["je", "ruk"], category: "buah", difficulty: 1 },
  { id: "bua-3", emoji: "🍌", word: "pisang", syllables: ["pi", "sang"], category: "buah", difficulty: 1 },
  { id: "bua-4", emoji: "🥭", word: "mangga", syllables: ["mang", "ga"], category: "buah", difficulty: 1 },
  { id: "bua-5", emoji: "🍉", word: "semangka", syllables: ["se", "mang", "ka"], category: "buah", difficulty: 2 },
  { id: "bua-6", emoji: "🍇", word: "anggur", syllables: ["ang", "gur"], category: "buah", difficulty: 1 },
  { id: "bua-8", emoji: "🍈", word: "melon", syllables: ["me", "lon"], category: "buah", difficulty: 1 },
  { id: "bua-9", emoji: "🍓", word: "stroberi", syllables: ["stro", "be", "ri"], category: "buah", difficulty: 3 },
  { id: "bua-11", emoji: "🍍", word: "nanas", syllables: ["na", "nas"], category: "buah", difficulty: 1 },
  { id: "bua-12", emoji: "🥝", word: "kiwi", syllables: ["ki", "wi"], category: "buah", difficulty: 1 },
  { id: "bua-13", emoji: "🍑", word: "persik", syllables: ["per", "sik"], category: "buah", difficulty: 2 },

  // === MAKANAN (13 kata) ===
  { id: "mkn-1", emoji: "🍚", word: "nasi", syllables: ["na", "si"], category: "makanan", difficulty: 1 },
  { id: "mkn-2", emoji: "🥛", word: "susu", syllables: ["su", "su"], category: "makanan", difficulty: 1 },
  { id: "mkn-3", emoji: "🍞", word: "roti", syllables: ["ro", "ti"], category: "makanan", difficulty: 1 },
  { id: "mkn-4", emoji: "🥚", word: "telur", syllables: ["te", "lur"], category: "makanan", difficulty: 1 },
  { id: "mkn-5", emoji: "🍜", word: "mie", syllables: ["mi", "e"], category: "makanan", difficulty: 1 },
  { id: "mkn-6", emoji: "🍲", word: "bubur", syllables: ["bu", "bur"], category: "makanan", difficulty: 1 },
  { id: "mkn-7", emoji: "🍰", word: "kue", syllables: ["ku", "e"], category: "makanan", difficulty: 1 },
  { id: "mkn-8", emoji: "🍬", word: "permen", syllables: ["per", "men"], category: "makanan", difficulty: 1 },
  { id: "mkn-9", emoji: "🍦", word: "es krim", syllables: ["es", "krim"], category: "makanan", difficulty: 2 },
  { id: "mkn-10", emoji: "🍪", word: "biskuit", syllables: ["bis", "ku", "it"], category: "makanan", difficulty: 2 },
  { id: "mkn-11", emoji: "🥣", word: "soto", syllables: ["so", "to"], category: "makanan", difficulty: 1 },
  { id: "mkn-12", emoji: "🥗", word: "salad", syllables: ["sa", "lad"], category: "makanan", difficulty: 2 },
  { id: "mkn-13", emoji: "🍿", word: "popcorn", syllables: ["pop", "corn"], category: "makanan", difficulty: 2 },

  // === BENDA (13 kata) ===
  { id: "bnd-1", emoji: "⚽", word: "bola", syllables: ["bo", "la"], category: "benda", difficulty: 1 },
  { id: "bnd-2", emoji: "🚗", word: "mobil", syllables: ["mo", "bil"], category: "benda", difficulty: 1 },
  { id: "bnd-3", emoji: "📖", word: "buku", syllables: ["bu", "ku"], category: "benda", difficulty: 1 },
  { id: "bnd-4", emoji: "👟", word: "sepatu", syllables: ["se", "pa", "tu"], category: "benda", difficulty: 2 },
  { id: "bnd-5", emoji: "👕", word: "baju", syllables: ["ba", "ju"], category: "benda", difficulty: 1 },
  { id: "bnd-6", emoji: "🧢", word: "topi", syllables: ["to", "pi"], category: "benda", difficulty: 1 },
  { id: "bnd-7", emoji: "🪑", word: "kursi", syllables: ["kur", "si"], category: "benda", difficulty: 1 },
  { id: "bnd-8", emoji: "✏️", word: "pensil", syllables: ["pen", "sil"], category: "benda", difficulty: 1 },
  { id: "bnd-9", emoji: "📱", word: "handphone", syllables: ["hand", "pho", "ne"], category: "benda", difficulty: 3 },
  { id: "bnd-10", emoji: "🚲", word: "sepeda", syllables: ["se", "pe", "da"], category: "benda", difficulty: 2 },
  { id: "bnd-11", emoji: "🧸", word: "boneka", syllables: ["bo", "ne", "ka"], category: "benda", difficulty: 2 },
  { id: "bnd-12", emoji: "🧴", word: "sabun", syllables: ["sa", "bun"], category: "benda", difficulty: 1 },

  // === AKTIVITAS (13 kata) ===
  { id: "akt-1", emoji: "🍽️", word: "makan", syllables: ["ma", "kan"], category: "aktivitas", difficulty: 1 },
  { id: "akt-2", emoji: "🥤", word: "minum", syllables: ["mi", "num"], category: "aktivitas", difficulty: 1 },
  { id: "akt-3", emoji: "😴", word: "tidur", syllables: ["ti", "dur"], category: "aktivitas", difficulty: 1 },
  { id: "akt-4", emoji: "🛁", word: "mandi", syllables: ["man", "di"], category: "aktivitas", difficulty: 1 },
  { id: "akt-5", emoji: "🎮", word: "main", syllables: ["ma", "in"], category: "aktivitas", difficulty: 1 },
  { id: "akt-6", emoji: "🏃", word: "lari", syllables: ["la", "ri"], category: "aktivitas", difficulty: 1 },
  { id: "akt-8", emoji: "🧍", word: "berdiri", syllables: ["ber", "di", "ri"], category: "aktivitas", difficulty: 2 },
  { id: "akt-9", emoji: "✍️", word: "menulis", syllables: ["me", "nu", "lis"], category: "aktivitas", difficulty: 2 },
  { id: "akt-10", emoji: "📚", word: "belajar", syllables: ["be", "la", "jar"], category: "aktivitas", difficulty: 2 },
  { id: "akt-11", emoji: "🚶", word: "jalan", syllables: ["ja", "lan"], category: "aktivitas", difficulty: 1 },
  { id: "akt-12", emoji: "🗣️", word: "bicara", syllables: ["bi", "ca", "ra"], category: "aktivitas", difficulty: 2 },
  { id: "akt-13", emoji: "🎤", word: "nyanyi", syllables: ["nyan", "yi"], category: "aktivitas", difficulty: 2 },

  // === WARNA (12 kata) ===
  { id: "war-1", emoji: "🔴", word: "merah", syllables: ["me", "rah"], category: "warna", difficulty: 1 },
  { id: "war-2", emoji: "🔵", word: "biru", syllables: ["bi", "ru"], category: "warna", difficulty: 1 },
  { id: "war-3", emoji: "🟡", word: "kuning", syllables: ["ku", "ning"], category: "warna", difficulty: 1 },
  { id: "war-4", emoji: "🟢", word: "hijau", syllables: ["hi", "jau"], category: "warna", difficulty: 1 },
  { id: "war-5", emoji: "⚪", word: "putih", syllables: ["pu", "tih"], category: "warna", difficulty: 1 },
  { id: "war-6", emoji: "⚫", word: "hitam", syllables: ["hi", "tam"], category: "warna", difficulty: 1 },
  { id: "war-7", emoji: "🟤", word: "coklat", syllables: ["cok", "lat"], category: "warna", difficulty: 2 },
  { id: "war-8", emoji: "🩶", word: "abu", syllables: ["a", "bu"], category: "warna", difficulty: 1 },
  { id: "war-9", emoji: "🟣", word: "ungu", syllables: ["u", "ngu"], category: "warna", difficulty: 1 },
  { id: "war-10", emoji: "🟠", word: "oranye", syllables: ["o", "ra", "nye"], category: "warna", difficulty: 2 },
  { id: "war-11", emoji: "🩷", word: "pink", syllables: ["pink"], category: "warna", difficulty: 1 },

  // === ANGKA (10 kata) ===
  { id: "ang-1", emoji: "1️⃣", word: "satu", syllables: ["sa", "tu"], category: "angka", difficulty: 1 },
  { id: "ang-2", emoji: "2️⃣", word: "dua", syllables: ["du", "a"], category: "angka", difficulty: 1 },
  { id: "ang-3", emoji: "3️⃣", word: "tiga", syllables: ["ti", "ga"], category: "angka", difficulty: 1 },
  { id: "ang-4", emoji: "4️⃣", word: "empat", syllables: ["em", "pat"], category: "angka", difficulty: 1 },
  { id: "ang-5", emoji: "5️⃣", word: "lima", syllables: ["li", "ma"], category: "angka", difficulty: 1 },
  { id: "ang-6", emoji: "6️⃣", word: "enam", syllables: ["e", "nam"], category: "angka", difficulty: 1 },
  { id: "ang-7", emoji: "7️⃣", word: "tujuh", syllables: ["tu", "juh"], category: "angka", difficulty: 1 },
  { id: "ang-8", emoji: "8️⃣", word: "delapan", syllables: ["de", "la", "pan"], category: "angka", difficulty: 2 },
  { id: "ang-9", emoji: "9️⃣", word: "sembilan", syllables: ["sem", "bi", "lan"], category: "angka", difficulty: 2 },
  { id: "ang-10", emoji: "🔟", word: "sepuluh", syllables: ["se", "pu", "luh"], category: "angka", difficulty: 2 },

  // === TUBUH (15 kata) ===
  { id: "tub-1", emoji: "👁️", word: "mata", syllables: ["ma", "ta"], category: "tubuh", difficulty: 1 },
  { id: "tub-2", emoji: "👃", word: "hidung", syllables: ["hi", "dung"], category: "tubuh", difficulty: 1 },
  { id: "tub-3", emoji: "👄", word: "mulut", syllables: ["mu", "lut"], category: "tubuh", difficulty: 1 },
  { id: "tub-4", emoji: "👂", word: "telinga", syllables: ["te", "li", "nga"], category: "tubuh", difficulty: 2 },
  { id: "tub-5", emoji: "✋", word: "tangan", syllables: ["ta", "ngan"], category: "tubuh", difficulty: 1 },
  { id: "tub-6", emoji: "🦶", word: "kaki", syllables: ["ka", "ki"], category: "tubuh", difficulty: 1 },
  { id: "tub-8", emoji: "🦷", word: "gigi", syllables: ["gi", "gi"], category: "tubuh", difficulty: 1 },
  { id: "tub-9", emoji: "👅", word: "lidah", syllables: ["li", "dah"], category: "tubuh", difficulty: 1 },
  { id: "tub-10", emoji: "👆", word: "jari", syllables: ["ja", "ri"], category: "tubuh", difficulty: 1 },
  { id: "tub-15", emoji: "🤨", word: "alis", syllables: ["a", "lis"], category: "tubuh", difficulty: 1 },

  // === ALAM (15 kata) ===
  { id: "alm-1", emoji: "☀️", word: "matahari", syllables: ["ma", "ta", "ha", "ri"], category: "alam", difficulty: 2 },
  { id: "alm-2", emoji: "🌙", word: "bulan", syllables: ["bu", "lan"], category: "alam", difficulty: 1 },
  { id: "alm-3", emoji: "⭐", word: "bintang", syllables: ["bin", "tang"], category: "alam", difficulty: 1 },
  { id: "alm-4", emoji: "☁️", word: "awan", syllables: ["a", "wan"], category: "alam", difficulty: 1 },
  { id: "alm-5", emoji: "🌧️", word: "hujan", syllables: ["hu", "jan"], category: "alam", difficulty: 1 },
  { id: "alm-6", emoji: "🌬️", word: "angin", syllables: ["an", "gin"], category: "alam", difficulty: 1 },
  { id: "alm-7", emoji: "🌳", word: "pohon", syllables: ["po", "hon"], category: "alam", difficulty: 1 },
  { id: "alm-9", emoji: "⛰️", word: "gunung", syllables: ["gu", "nung"], category: "alam", difficulty: 1 },
  { id: "alm-10", emoji: "🌊", word: "laut", syllables: ["la", "ut"], category: "alam", difficulty: 1 },
  { id: "alm-12", emoji: "🪨", word: "batu", syllables: ["ba", "tu"], category: "alam", difficulty: 1 },
  { id: "alm-15", emoji: "🔥", word: "api", syllables: ["a", "pi"], category: "alam", difficulty: 1 },

  // === PERALATAN RUMAH (7 kata) ===
  { id: "prl-2", emoji: "🗄️", word: "lemari", syllables: ["le", "ma", "ri"], category: "peralatan", difficulty: 2 },
  { id: "prl-3", emoji: "🥄", word: "sendok", syllables: ["sen", "dok"], category: "peralatan", difficulty: 1 },
  { id: "prl-4", emoji: "🍽️", word: "piring", syllables: ["pi", "ring"], category: "peralatan", difficulty: 1 },
  { id: "prl-7", emoji: "📺", word: "tv", syllables: ["tv"], category: "peralatan", difficulty: 1 },
  { id: "prl-8", emoji: "💡", word: "lampu", syllables: ["lam", "pu"], category: "peralatan", difficulty: 1 },
  { id: "prl-9", emoji: "🛏️", word: "kasur", syllables: ["ka", "sur"], category: "peralatan", difficulty: 1 },
  { id: "prl-10", emoji: "🧹", word: "sapu", syllables: ["sa", "pu"], category: "peralatan", difficulty: 1 },
];

export const categories = [
  { id: "semua", label: "Semua", emoji: "📚" },
  { id: "keluarga", label: "Keluarga", emoji: "👨‍👩‍👧‍👦" },
  { id: "hewan", label: "Hewan", emoji: "🐾" },
  { id: "buah", label: "Buah", emoji: "🍎" },
  { id: "makanan", label: "Makanan", emoji: "🍚" },
  { id: "benda", label: "Benda", emoji: "🎒" },
  { id: "aktivitas", label: "Aktivitas", emoji: "🏃" },
  { id: "warna", label: "Warna", emoji: "🎨" },
  { id: "angka", label: "Angka", emoji: "🔢" },
  { id: "tubuh", label: "Tubuh", emoji: "🦷" },
  { id: "alam", label: "Alam", emoji: "🌳" },
  { id: "peralatan", label: "Peralatan", emoji: "🏠" },
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
  "bunga merah",
  "langit biru",
  "matahari terang",
  "adik mandi",
  "kakak main bola",
];
