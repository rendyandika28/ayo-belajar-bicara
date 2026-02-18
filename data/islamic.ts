export type Hijaiyah = {
  id: string;
  letter: string;
  name: string;
  transliteration: string;
  syllables: string[];
  emoji: string;
};

export type Doa = {
  id: string;
  title: string;
  arabic: string;
  latin: string;
  meaning: string;
  emoji: string;
  syllablesLatin: string[];
  situation: string;
};

export type AsmaulHusna = {
  id: string;
  number: number;
  arabic: string;
  latin: string;
  meaning: string;
  syllables: string[];
};

export const hijaiyahLetters: Hijaiyah[] = [
  { id: "hij-1", letter: "ا", name: "Alif", transliteration: "a", syllables: ["a", "lif"], emoji: "🦁" },
  { id: "hij-2", letter: "ب", name: "Ba", transliteration: "b", syllables: ["ba"], emoji: "🏠" },
  { id: "hij-3", letter: "ت", name: "Ta", transliteration: "t", syllables: ["ta"], emoji: "🌟" },
  { id: "hij-4", letter: "ث", name: "Tsa", transliteration: "ts", syllables: ["tsa"], emoji: "🍇" },
  { id: "hij-5", letter: "ج", name: "Jim", transliteration: "j", syllables: ["jim"], emoji: "🐪" },
  { id: "hij-6", letter: "ح", name: "Ha", transliteration: "h", syllables: ["ha"], emoji: "🌙" },
  { id: "hij-7", letter: "خ", name: "Kha", transliteration: "kh", syllables: ["kha"], emoji: "🍞" },
  { id: "hij-8", letter: "د", name: "Dal", transliteration: "d", syllables: ["dal"], emoji: "🐻" },
  { id: "hij-9", letter: "ذ", name: "Dzal", transliteration: "dz", syllables: ["dzal"], emoji: "🐝" },
  { id: "hij-10", letter: "ر", name: "Ra", transliteration: "r", syllables: ["ra"], emoji: "🌈" },
  { id: "hij-11", letter: "ز", name: "Zai", transliteration: "z", syllables: ["zai"], emoji: "🌺" },
  { id: "hij-12", letter: "س", name: "Sin", transliteration: "s", syllables: ["sin"], emoji: "☀️" },
  { id: "hij-13", letter: "ش", name: "Syin", transliteration: "sy", syllables: ["syin"], emoji: "🌳" },
  { id: "hij-14", letter: "ص", name: "Shad", transliteration: "sh", syllables: ["shad"], emoji: "🦅" },
  { id: "hij-15", letter: "ض", name: "Dhad", transliteration: "dh", syllables: ["dhad"], emoji: "🐸" },
  { id: "hij-16", letter: "ط", name: "Tha", transliteration: "th", syllables: ["tha"], emoji: "🐦" },
  { id: "hij-17", letter: "ظ", name: "Zha", transliteration: "zh", syllables: ["zha"], emoji: "🦋" },
  { id: "hij-18", letter: "ع", name: "'Ain", transliteration: "'a", syllables: ["'a", "in"], emoji: "👁️" },
  { id: "hij-19", letter: "غ", name: "Ghain", transliteration: "gh", syllables: ["gha", "in"], emoji: "☁️" },
  { id: "hij-20", letter: "ف", name: "Fa", transliteration: "f", syllables: ["fa"], emoji: "🐘" },
  { id: "hij-21", letter: "ق", name: "Qaf", transliteration: "q", syllables: ["qaf"], emoji: "🌕" },
  { id: "hij-22", letter: "ك", name: "Kaf", transliteration: "k", syllables: ["kaf"], emoji: "🐕" },
  { id: "hij-23", letter: "ل", name: "Lam", transliteration: "l", syllables: ["lam"], emoji: "🍋" },
  { id: "hij-24", letter: "م", name: "Mim", transliteration: "m", syllables: ["mim"], emoji: "💧" },
  { id: "hij-25", letter: "ن", name: "Nun", transliteration: "n", syllables: ["nun"], emoji: "🐟" },
  { id: "hij-26", letter: "و", name: "Wau", transliteration: "w", syllables: ["wau"], emoji: "🌹" },
  { id: "hij-27", letter: "ه", name: "Ha", transliteration: "h", syllables: ["ha"], emoji: "🏔️" },
  { id: "hij-28", letter: "ء", name: "Hamzah", transliteration: "'", syllables: ["ham", "zah"], emoji: "⭐" },
  { id: "hij-29", letter: "ي", name: "Ya", transliteration: "y", syllables: ["ya"], emoji: "🌊" },
];

export const dailyDoas: Doa[] = [
  {
    id: "doa-1",
    title: "Bismillah",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ",
    latin: "Bismillahirrahmanirrahim",
    meaning: "Dengan menyebut nama Allah Yang Maha Pengasih lagi Maha Penyayang",
    emoji: "🌟",
    syllablesLatin: ["bis", "mil", "la", "hir", "rah", "ma", "nir", "ra", "him"],
    situation: "Memulai segala kegiatan",
  },
  {
    id: "doa-2",
    title: "Doa Sebelum Makan",
    arabic: "اَللَّهُمَّ بَارِكْ لَنَا فِيْمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ",
    latin: "Allahumma barik lana fiima razaqtana waqina 'adzaban nar",
    meaning: "Ya Allah, berkahilah kami dalam rezeki yang telah Engkau berikan dan lindungilah kami dari siksa api neraka",
    emoji: "🍽️",
    syllablesLatin: ["al", "la", "hum", "ma", "ba", "rik", "la", "na", "fi", "ma", "ra", "zaq", "ta", "na", "wa", "qi", "na", "a", "dza", "ban", "nar"],
    situation: "Sebelum makan",
  },
  {
    id: "doa-3",
    title: "Doa Sesudah Makan",
    arabic: "اَلْحَمْدُ لِلَّهِ الَّذِيْ أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِيْنَ",
    latin: "Alhamdulillahil ladzi ath'amana wasaqana waja'alana minal muslimin",
    meaning: "Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami termasuk orang-orang Islam",
    emoji: "😊",
    syllablesLatin: ["al", "ham", "du", "lil", "la", "hil", "la", "dzi", "ath", "a", "ma", "na", "wa", "sa", "qa", "na", "wa", "ja", "a", "la", "na", "mi", "nal", "mus", "li", "min"],
    situation: "Sesudah makan",
  },
  {
    id: "doa-4",
    title: "Doa Sebelum Tidur",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوْتُ",
    latin: "Bismikallaahumma ahyaa wa amuutu",
    meaning: "Dengan menyebut nama-Mu ya Allah, aku hidup dan aku mati",
    emoji: "🛏️",
    syllablesLatin: ["bis", "mi", "kal", "la", "hum", "ma", "ah", "ya", "wa", "a", "mu", "tu"],
    situation: "Sebelum tidur",
  },
  {
    id: "doa-5",
    title: "Doa Bangun Tidur",
    arabic: "اَلْحَمْدُ لِلَّهِ الَّذِيْ أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُوْرُ",
    latin: "Alhamdulillahil ladzi ahyana ba'da maa amaatana wa ilaihin nusyuur",
    meaning: "Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami dan kepada-Nya kami akan dikembalikan",
    emoji: "🌅",
    syllablesLatin: ["al", "ham", "du", "lil", "la", "hil", "la", "dzi", "ah", "ya", "na", "ba'", "da", "ma", "a", "ma", "ta", "na", "wa", "i", "lai", "hin", "nu", "syur"],
    situation: "Bangun tidur",
  },
  {
    id: "doa-6",
    title: "Doa Masuk Kamar Mandi",
    arabic: "اَللَّهُمَّ إِنِّيْ أَعُوْذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ",
    latin: "Allahumma inni a'udzubika minal khubutsi wal khabaa'its",
    meaning: "Ya Allah, aku berlindung kepada-Mu dari kejahatan setan laki-laki dan setan perempuan",
    emoji: "🚽",
    syllablesLatin: ["al", "la", "hum", "ma", "in", "ni", "a", "u", "dzu", "bi", "ka", "mi", "nal", "khu", "bu", "tsi", "wal", "kha", "ba", "its"],
    situation: "Masuk kamar mandi",
  },
  {
    id: "doa-7",
    title: "Doa Keluar Kamar Mandi",
    arabic: "غُفْرَانَكَ",
    latin: "Ghufraanaka",
    meaning: "Aku mohon ampunan-Mu ya Allah",
    emoji: "🚪",
    syllablesLatin: ["ghuf", "ra", "na", "ka"],
    situation: "Keluar kamar mandi",
  },
  {
    id: "doa-8",
    title: "Doa untuk Kedua Orang Tua",
    arabic: "رَبِّ اغْفِرْ لِيْ وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِيْ صَغِيْرًا",
    latin: "Rabbighfirli waliwalidayya warhamhuma kama rabbayani shaghira",
    meaning: "Ya Tuhanku, ampunilah aku dan kedua orang tuaku, sayangilah mereka sebagaimana mereka menyayangiku di waktu kecil",
    emoji: "👨‍👩‍👧",
    syllablesLatin: ["rab", "bigh", "fir", "li", "wa", "li", "wa", "li", "day", "ya", "war", "ham", "hu", "ma", "ka", "ma", "rab", "ba", "ya", "ni", "sha", "ghi", "ra"],
    situation: "Mendoakan orang tua",
  },
  {
    id: "doa-9",
    title: "Doa Sebelum Belajar",
    arabic: "رَبِّ زِدْنِيْ عِلْمًا وَارْزُقْنِيْ فَهْمًا",
    latin: "Rabbi zidni 'ilman warzuqni fahman",
    meaning: "Ya Tuhanku, tambahkanlah aku ilmu dan berikanlah aku pemahaman",
    emoji: "📚",
    syllablesLatin: ["rab", "bi", "zid", "ni", "il", "man", "war", "zuq", "ni", "fah", "man"],
    situation: "Sebelum belajar",
  },
  {
    id: "doa-10",
    title: "Doa Naik Kendaraan",
    arabic: "سُبْحَانَ الَّذِيْ سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِيْنَ",
    latin: "Subhanalladzi sakhkhara lana hadza wama kunna lahu muqrinin",
    meaning: "Maha Suci Tuhan yang telah menundukkan ini untuk kami padahal kami tidak mampu menguasainya",
    emoji: "🚗",
    syllablesLatin: ["sub", "ha", "nal", "la", "dzi", "sakh", "kha", "ra", "la", "na", "ha", "dza", "wa", "ma", "kun", "na", "la", "hu", "muq", "ri", "nin"],
    situation: "Naik kendaraan",
  },
];

export const asmaulHusna: AsmaulHusna[] = [
  { id: "asma-1", number: 1, arabic: "الرَّحْمَنُ", latin: "Ar-Rahman", meaning: "Yang Maha Pengasih", syllables: ["ar", "rah", "man"] },
  { id: "asma-2", number: 2, arabic: "الرَّحِيمُ", latin: "Ar-Rahiim", meaning: "Yang Maha Penyayang", syllables: ["ar", "ra", "him"] },
  { id: "asma-3", number: 3, arabic: "الْمَلِكُ", latin: "Al-Malik", meaning: "Yang Maha Merajai", syllables: ["al", "ma", "lik"] },
  { id: "asma-4", number: 4, arabic: "الْقُدُّوسُ", latin: "Al-Quddus", meaning: "Yang Maha Suci", syllables: ["al", "qud", "dus"] },
  { id: "asma-5", number: 5, arabic: "السَّلَامُ", latin: "As-Salaam", meaning: "Yang Maha Memberi Kesejahteraan", syllables: ["as", "sa", "lam"] },
  { id: "asma-6", number: 6, arabic: "الْمُؤْمِنُ", latin: "Al-Mu'min", meaning: "Yang Maha Memberi Keamanan", syllables: ["al", "muk", "min"] },
  { id: "asma-7", number: 7, arabic: "الْمُهَيْمِنُ", latin: "Al-Muhaimin", meaning: "Yang Maha Pemelihara", syllables: ["al", "mu", "hai", "min"] },
  { id: "asma-8", number: 8, arabic: "الْعَزِيزُ", latin: "Al-'Aziiz", meaning: "Yang Maha Perkasa", syllables: ["al", "a", "ziz"] },
  { id: "asma-9", number: 9, arabic: "الْجَبَّارُ", latin: "Al-Jabbaar", meaning: "Yang Maha Memaksa", syllables: ["al", "jab", "bar"] },
  { id: "asma-10", number: 10, arabic: "الْمُتَكَبِّرُ", latin: "Al-Mutakabbir", meaning: "Yang Maha Megah", syllables: ["al", "mu", "ta", "kab", "bir"] },
];
