# Ayo Belajar Bicara! — Deep Dive Audit

> **Dokumen untuk:** Product Team, UX Designer, Developer  
> **Target user:** Ibu-ibu dengan anak mengalami keterlambatan bicara (speech delay)  
> **Goals:** Meningkatkan fungsi app dan engagement — khususnya retensi pengguna baru (first-time user experience)  
> **Tanggal:** 9 Juni 2026

---

## Daftar Isi

1. [UX Audit & Improvement](#1-ux-audit--improvement)
2. [Referensi & Benchmark](#2-referensi--benchmark)
3. [Feature Plan (Prioritas Impact vs Effort)](#3-feature-plan)

---

## 1. UX Audit & Improvement

### 1.1 Critical Pain Points

#### ❌ 1. Tidak ada onboarding flow sama sekali

**Kondisi saat ini:** User mendarat langsung ke homepage dengan 6 kartu menu. Tidak ada konteks, panduan, atau penjelasan tentang apa itu aplikasi, bagaimana cara pakainya, dan apa yang harus dilakukan pertama kali.

**Dampak:** Ibu-ibu yang baru pertama kali buka akan bingung. Mereka tidak tahu apakah ini aplikasi yang tepat untuk anaknya, harus mulai dari mana, dan bagaimana cara menggunakannya secara efektif bersama anak.

**Rekomendasi:** Buat **3-step onboarding** yang sangat ringan:
1. **"Ayo bantu si kecil belajar bicara!"** — satu kalimat menjelaskan value prop  
2. **"Coba mulai dari Tebak Gambar"** — rekomendasi game pertama yang paling gampang  
3. **"Anda bisa pantau progres di menu Pendamping"** — tunjukin ke dashboard orang tua  

Plus: tambahkan tombol **"Nanti" / "Lewati"** untuk user yang sudah familiar.

---

#### ❌ 2. Homepage terlalu padat tanpa hierarki visual

**Kondisi saat ini:** 6 kartu menu (2x3 grid) dengan ukuran yang sama semua. Tidak ada perbedaan antara game yang cocok untuk pemula vs advanced. Semua terlihat setara.

**Dampak:** Ibu-ibu tidak tahu mana yang harus diklik duluan. Tidak ada "happy path" untuk new user. Decision paralysis untuk target user yang rata-rata tidak tech-savvy.

**Rekomendasi:** 
- Group kartu jadi 2 section: **"Mulai Belajar"** (Kartu Kata, Tebak Gambar, Suku Kata) dan **"Tantangan"** (Ayo Ngomong, Tebak Suara, Islami)
- Beri label **"Cocok untuk pemula"** di Kartu Kata
- Sort berdasarkan level anak — user yang levelnya rendah lihat game beginner di atas

---

#### ❌ 3. Tidak ada turorial in-app di game mana pun

**Kondisi saat ini:** Setiap game langsung mulai tanpa penjelasan. User harus coba-coba sendiri memahami mekanisme game.

**Dampak:** Friction tinggi di sesi pertama. Ibu-ibu mungkin akan keluar karena tidak paham cara kerja "Ayo Ngomong" (speech recognition) atau "Tebak Suara" (game audio tanpa label).

**Rekomendasi:** Tambahkan **tooltip tutorial 1-2 langkah** di setiap game saat pertama kali dibuka:
- "Tebak Gambar": _"Dengarkan suaranya, lalu pilih gambar yang cocok!"_  
- "Ayo Ngomong": _"Tekan mikrofon, lalu ucapkan kata yang muncul!"_  
- "Suku Kata": _"Gabungkan dua suku kata menjadi kata utuh!"_

Simpan di localStorage `hasSeenTutorial_<game>` agar hanya muncul sekali.

---

#### ❌ 4. Tidak ada dukungan multi-anak (single localStorage profile)

**Kondisi saat ini:** Semua progress tersimpan di satu key localStorage. Jika ada 2 anak dalam 1 rumah, data mereka bercampur. Tidak mungkin memisahkan progres per anak.

**Dampak fatal:** Ini adalah deal-breaker untuk keluarga dengan lebih dari 1 anak. Orang tua tidak bisa memantau perkembangan masing-masing anak secara terpisah. Reward dan level system menjadi tidak personal.

**Rekomendasi:** Buat **profil anak sederhana** — cukup nama dan avatar emoji. Tambahkan switcher di homepage. Semua data progress di-namespace per `profileId`. Ini bisa dilakukan murni di localStorage tanpa auth.

---

#### ❌ 5. Tidak ada panduan untuk orang tua / terapis

**Kondisi saat ini:** Halaman Pendamping hanya menampilkan statistik. Tidak menjelaskan **BAGAIMANA** seharusnya orang tua menggunakan aplikasi ini bersama anak.

**Dampak:** Orang tua hanya menjadi "pengawas" bukan "fasilitator". Mereka tidak tahu teknik-teknik dasar stimulasi bicara yang bisa dipadukan dengan app.

**Rekomendasi:** Tambahkan section **"Tips Pendampingan"** di halaman Pendamping:
- _"Ucapkan kata bersama anak, jangan hanya mengandalkan suara dari HP"_
- _"Beri jeda 3-5 detik setelah bertanya, tunggu anak merespons"_
- _"Jangan koreksi langsung kalau anak salah ucap. Ulangi yang benar saja."_
- _"Sesi ideal: 10-15 menit per hari, jangan lebih."_

---

#### ❌ 6. Focus Mode terlalu kompleks untuk non-tech user

**Kondisi saat ini:** Focus mode menggunakan Fullscreen API, history blocking, tab-away detection, double-tap exit. Sangat powerful secara teknis, tapi:

- Tombol "Focus (5m)" kecil dan cryptic — ibu-ibu tidak tahu apa fungsinya
- Lock 2-step exit membingungkan — user tidak sadar harus tap 2x
- Tidak ada indikasi bahwa mode ini "mengunci layar untuk anak"

**Rekomendasi:**
- Rename jadi **"Mode Belajar"** dengan deskripsi _"Kunci layar supaya anak fokus belajar, tidak pencet-pencet yang lain"_
- Ganti double-tap exit jadi **swipe ke atas** atau **long press 3 detik** — lebih intuitif
- Tambahkan **visual cue besar** saat mode aktif: _"Layar terkunci. Tekan lama untuk keluar."_

---

#### ❌ 7. Tidak ada fallback konten saat offline selain halaman /offline

**Kondisi saat ini:** Service worker meng-cache shell app, tapi konten game (audio TTS, speech recognition) membutuhkan koneksi internet. Kalau koneksi jelek, user cuma dapat halaman "Tidak Ada Koneksi Internet".

**Dampak:** Pengguna di daerah dengan internet tidak stabil (target market besar untuk aplikasi ini) tidak bisa menggunakan app. Speech recognition gagal tanpa error message yang jelas.

**Rekomendasi:**
- Tampilkan **indikator koneksi** di header (bulatan hijau/kuning/marah)  
- Kalau offline, sembunyikan game yang butuh online (Ayo Ngomong) dan tetap izinkan game offline-friendly (Kartu Kata, Suku Kata, Tebak Gambar)
- TTS synthesis harus tetap jalan offline — verifikasi apakah Web Speech API synthesis butuh koneksi

---

#### ❌ 8. Tidak ada progress sharing atau social proof

**Kondisi saat ini:** Progress hanya bisa dilihat di dalam app. Tidak ada cara untuk share atau export. Tidak ada testimoni atau social proof dari pengguna lain.

**Dampak:** Ibu-ibu tidak bisa membagikan progres anak ke pasangan, keluarga, atau terapis. Kehilangan momen "proud parent" yang powerful untuk retensi. Tidak ada social trust untuk new user.

**Rekomendasi:**
- Buat **screenshot card** yang bisa di-share: _"Adik sudah belajar 20 kata baru minggu ini! 🎉"_ — bisa share ke WhatsApp
- Di onboarding, tampilkan **testimoni** dari pengguna (atau cukup statistik: _"Rata-rata anak belajar 15 kata baru dalam 1 minggu"_)

---

#### ❌ 9. Feedback suara tidak bisa dimatikan (no global mute)

**Kondisi saat ini:** Setiap interaksi memicu sound effect (pop, correct, wrong, applause, celebration). Tidak ada tombol untuk mute semua suara.

**Dampak:** Situasi umum: ibu membuka app di tempat umum atau malam hari saat anak tidur. Suara langsung keluar — mengganggu dan memalukan.

**Rekomendasi:** Tambahkan **toggle suara** di header homepage (ikon speaker). State di-save ke store dan di-persist.

---

#### ❌ 10. Halaman Pendamping terlalu teknis, tidak ramah ibu-ibu

**Kondisi saat ini:** Dashboard menampilkan 8 section sekaligus dalam satu halaman scroll panjang. Full data mentah: weekly minutes array, level tracker dengan 4 level, form tambah kata dengan banyak field. Overwhelming.

**Dampak:** Ibu-ibu yang tidak tech-savvy akan kewalahan. Informasi paling penting (hari ini belajar berapa menit? dapat bintang berapa?) tenggelam di antara data teknis lainnya.

**Rekomendasi:**
- **Restruktur jadi 2 tab:**
  1. **"Ringkasan"** — statistik harian + streak + chart mini  
  2. **"Pengaturan"** — custom words, durasi sesi, reset  
- Gunakan **Bahasa yang lebih manusiawi**: ganti _"Session Completed"_ → _"Sesi belajar hari ini"_  
- Sembunyikan weekly minutes array, tampilkan sebagai **bar chart** saja (sudah ada chart-nya, tinggal hilangkan data mentahnya)

---

### 1.2 Friction Points Ringan

| Friction | Rekomendasi | Priority |
|---|---|---|
| Tidak ada loading indicator saat speech recognition inisialisasi (delay 1-3 detik di Android) | Tambahkan spinner "Menyiapkan mikrofon..." | Medium |
| Setiap kali masuk game, kata di-shuffle ulang — anak dapat kata yang sama berulang | Implementasi spaced repetition: kata yang sudah dikuasai muncul lebih jarang | Medium |
| Di Tebak Suara, tombol "Dengar" dan "Dengar Pelan" terlalu kecil dan berdekatan | Perbesar tombol dan pisahkan lebih jauh, tambah ikon yang jelas | Low |
| Confetti muncul terlalu sering — bisa overstimulasi anak | Tambahkan toggle "Mode Tenang" yang mengurangi animasi & suara | Low |
| Tidak ada cara kembali ke homepage dari dalam game selain tombol back kecil | Tambahkan gesture swipe kanan untuk kembali (natural di mobile) | Low |

---

### 1.3 Ringkasan Prioritas UX Fix

| No | Masalah | Impact | Effort | Priority |
|---|---|---|---|---|
| 1 | Tidak ada onboarding | Critical | Medium | 🔴 P0 |
| 2 | Tidak ada multi-anak support | Critical | High | 🔴 P0 |
| 3 | Tidak ada tutorial in-app | High | Low | 🟠 P1 |
| 4 | Focus Mode terlalu cryptic | High | Medium | 🟠 P1 |
| 5 | Tidak ada panduan orang tua | High | Low | 🟠 P1 |
| 6 | Global mute tidak ada | Medium | Low | 🟠 P1 |
| 7 | Homepage tanpa hierarki | Medium | Low | 🟡 P2 |
| 8 | Dashboard terlalu teknis | Medium | Medium | 🟡 P2 |
| 9 | Tidak ada fallback offline selain /offline | Medium | Medium | 🟡 P2 |
| 10 | Tidak ada progress sharing | Medium | Medium | 🟡 P2 |

---

## 2. Referensi & Benchmark

### 2.1 Produk Sejenis yang Dianalisis

---

#### 🥇 **Khan Academy Kids** (khanacademykids.com)

**Kenapa relevan:** Aplikasi edukasi anak terdepan dengan 5+ juta download. Fokus pada early learning (2-8 tahun). Struktur konten adaptif.

**Yang mereka lakukan dengan baik:**

1. **Onboarding seamless** — langsung masuk ke karakter yang bisa dipilih anak. Tidak ada form, tidak ada login. Cukup pilih nama dan avatar.

2. **Path-based learning** — konten disusun dalam jalur linear (ABC → 123 → dst). Anak selalu tahu "apa selanjutnya". Tidak ada decision paralysis.

3. **Character-driven UX** — 5 karakter hewan lucu yang menemani anak sepanjang belajar. Ada suara, ekspresi, dan interaksi. Membangun emotional connection.

4. **Library terpisah vs Path** — anak bisa pilih "ikuti jalur belajar" atau "jelajah perpustakaan bebas". Struktur ini memberi kebebasan tanpa kehilangan guidance.

**Inspirasi buat kita:**
- Buat **maskot karakter** (misalnya "Si Kucing Oren") yang menemani anak di homepage dan kasih semangat
- Tambahkan mode **"Jalur Belajar"** sebagai alternatif dari grid menu
- Gunakan struktur "Library" untuk akses bebas semua game

---

#### 🥈 **Lingumi** (lingumi.com)

**Kenapa relevan:** Aplikasi speech therapy / language learning untuk toddler (2-6 tahun). Berbasis UK, fokus pada pengucapan dan vocabulary. Model bisnis subscription.

**Yang mereka lakukan dengan baik:**

1. **Structured daily lessons** — setiap hari anak dapat 1 lesson baru (10-15 menit). Tidak bisa skip. Ini menciptakan kebiasaan (habit) dan mencegah overwhelming.

2. **Audio-first design** — hampir semua interaksi dipicu oleh suara, bukan teks. Anak yang belum bisa baca tetap bisa pakai mandiri. Iconography sangat sederhana dan konsisten.

3. **Parent dashboard yang actionable** — bukan cuma statistik, tapi rekomendasi: _"Hari ini coba ulangi lesson 3, Adik masih kesulitan dengan bunyi /r/"_ — plus video pendek parenting tips.

4. **Progress ring (bukan bar)** — gunakan circular progress ring yang sangat visual. Anak langsung ngerti "hampir selesai" tanpa harus membaca angka.

**Inspirasi buat kita:**
- Desain ulang progress bar jadi **progress ring** yang lebih child-friendly
- Tambahkan **rekomendasi harian** di dashboard orang tua
- Kurangi ketergantungan pada teks di game — perbanyak audio cues

---

#### 🥉 **Speech Blubs** (speechblubs.com)

**Kenapa relevan:** Aplikasi speech therapy paling populer di kategori ini. Target spesifik speech delay dan autism spectrum. Menggunakan video peer modeling.

**Yang mereka lakukan dengan baik:**

1. **Video modeling** — menampilkan video anak-anak lain mengucapkan kata. Anak melihat teman sebayanya, bukan cuma animasi. Ini teknik yang terbukti efektif dalam terapi bicara.

2. **Voice-activated gameplay** — game di mana karakter bergerak/aksi terjadi HANYA kalau anak bersuara. Membuat anak termotivasi untuk mencoba vokalisasi meskipun belum sempurna. Threshold suara sangat rendah.

3. **"Parents Academy" section** — konten edukasi terpisah khusus orang tua: artikel, video, webinar tentang speech delay. Memberikan value di luar app.

4. **Weekly progress email** — ringkasan mingguan otomatis ke email orang tua. Tidak perlu buka app untuk lihat progres.

**Inspirasi buat kita:**
- Kembangkan **voice-activated game** (bukan cuma speech recognition) — deteksi suara saja untuk trigger animasi
- Tambahkan **artikel singkat** tentang speech delay di halaman Pendamping
- Eksplor kemungkinan **weekly report** (cukup generate text yang bisa di-copy ke WhatsApp)

---

#### 4️⃣ **Marbel Belajar Membaca** (Educa Studio — Indonesia)

**Kenapa relevan:** Aplikasi edukasi anak Indonesia terbesar. Puluhan juta download. Target pasar dan bahasa yang sama persis. Desain visual sangat lokal.

**Yang mereka lakukan dengan baik:**

1. **Desain visual khas Indonesia** — warna-warna cerah, karakter lokal (bukan karakter ala Disney), font yang familiar. User Indonesia langsung merasa "ini aplikasi buat kita".

2. **Mini-game yang sangat pendek** — setiap game 1-2 menit saja, langsung reward, langsung selesai. Cocok untuk attention span anak yang pendek.

3. **Suara narator manusia (bukan TTS)** — menggunakan rekaman suara asli dengan intonasi yang hangat dan ekspresif. Jauh lebih engaging daripada TTS robotik.

4. **Satu app, banyak topik** — bukan app terpisah untuk membaca, berhitung, mewarnai. Semua jadi satu. Ini convenience untuk orang tua.

**Inspirasi buat kita:**
- Pertimbangkan **rekaman suara manusia** untuk kata-kata utama, bukan hanya TTS — terutama untuk konten Islami (doa, hijaiyah)
- Buat **mini-game pendek 1-2 menit** sebagai alternatif dari sesi belajar yang lebih panjang
- **Perkuat identitas lokal** — warna, karakter, bahasa, konteks budaya Indonesia

---

#### 5️⃣ **Endless Reader / Endless Alphabet** (Originator Inc.)

**Kenapa relevan:** Aplikasi vocabulary anak paling inovatif secara UX. Interaksi drag-and-drop yang sangat intuitif. Desain animasi karakter huruf yang "hidup".

**Yang mereka lakukan dengan baik:**

1. **Huruf yang hidup** — setiap huruf punya mata dan suara. Saat di-drag, huruf tersebut mengeluarkan bunyinya sendiri. Ini membuat anak belajar fonetik secara natural tanpa disadari.

2. **Animasi reward yang absurd dan lucu** — setelah kata tersusun, ada animasi pendek yang menggambarkan arti kata tersebut secara visual dan kocak. Membuat kata jadi memorable.

3. **Scaffolding sempurna** — di game pertama, huruf sudah ditaruh di posisinya tinggal di-drag sedikit. Difficulty naik perlahan: huruf acak → tanpa bayangan → tanpa suara.

**Inspirasi buat kita:**
- Di Suku Kata mode **Gabung Suku Kata**, tambahkan drag-and-drop (bukan cuma tap "Gabung!")
- Tambahkan **animasi lucu** setelah anak berhasil menyelesaikan sesuatu — bukan cuma confetti, tapi storytelling visual singkat

---

### 2.2 Benchmark Matrix

| Fitur | Khan Kids | Lingumi | Speech Blubs | Marbel | Endless | **Kita** |
|---|---|---|---|---|---|---|
| Onboarding | ✅ | ✅ | ✅ | ❌ | ✅ | **❌** |
| Multi-profile | ✅ | ✅ | ✅ | ❌ | ❌ | **❌** |
| Audio-first | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| Parent dashboard | ✅ | ✅✅ | ✅✅ | ❌ | ❌ | ⚠️ |
| Offline-ready | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ |
| Adaptive difficulty | ✅ | ✅ | ✅ | ❌ | ✅ | **❌** |
| Progress sharing | ✅ | ✅ | ✅ | ❌ | ❌ | **❌** |
| Voice recording | ❌ | ✅ | ✅ | ❌ | ❌ | **❌** |
| Local language | EN | EN | EN | ✅ ID | EN | ✅ ID |

> ✅ = Sangat baik | ⚠️ = Ada tapi kurang | ❌ = Tidak ada

---

## 3. Feature Plan

### 3.1 Impact vs Effort Matrix

```
                        HIGH IMPACT
                            |
     [DO NOW]               |           [PLAN CAREFULLY]
     - Onboarding flow      |           - Multi-anak profiles
     - Tutorial in-app      |           - Adaptive difficulty
     - Global mute          |           - Voice recording + playback
     - Tips pendampingan    |           - Supabase migration
     - Homepage restructure |           - Human voice audio (doa)
                            |
LOW EFFORT ─────────────────┼────────────────── HIGH EFFORT
                            |
     [QUICK WINS]           |           [BACKLOG]
     - Session summary      |           - Sentence building game
     - Calm mode            |           - Video peer modeling
     - Progress ring        |           - AI personalisasi
     - Koneksi indikator    |           - Weekly WhatsApp report
     - 150+ kata            |           - English vocabulary
                            |
                        LOW IMPACT
```

---

### 3.2 Detailed Feature List (Prioritas)

---

#### 🔴 P0 — Harus Ada Sebelum Launch / Rilis ke User Baru

---

**F-01: Onboarding Flow (3-Step)**

| Field | Detail |
|---|---|
| **Masalah** | User baru tidak tahu apa itu app, harus mulai dari mana, dan bagaimana cara pakainya. |
| **Solusi** | 3 screen onboarding dengan ilustrasi + teks singkat. Screen 1: Value prop. Screen 2: Rekomendasi game pertama. Screen 3: Tunjuk ke dashboard orang tua. |
| **Kenapa relevan** | First-time user experience menentukan retensi. Ibu-ibu yang tidak tech-savvy butuh panduan eksplisit. |
| **Effort** | Medium (2-3 hari) |
| **Impact** | Critical — retensi day-1 naik signifikan |
| **Tech notes** | Simpan `hasOnboarded: true` di localStorage. Bisa pakai komponen overlay/swipe sederhana tanpa library tambahan. |

---

**F-02: Multi-Anak Profiles**

| Field | Detail |
|---|---|
| **Masalah** | 1 device = 1 progress. Keluarga dengan 2+ anak tidak bisa pakai app secara terpisah. |
| **Solusi** | Buat profile selector di homepage. Setiap profile: nama + emoji avatar. Semua state di-namespace per `profileId`. |
| **Kenapa relevan** | Banyak keluarga Indonesia punya 2-3 anak. Tanpa ini, app tidak usable untuk mereka. |
| **Effort** | High (4-5 hari) |
| **Impact** | Critical — membuka seluruh segmen multi-anak |
| **Tech notes** | Restruktur localStorage jadi `{ profiles: { [id]: ProfileData }, activeProfileId }`. Zustand store perlu refactor — buat `useProfileStore` sebagai wrapper. |

---

#### 🟠 P1 — Harus Ada Dalam 1-2 Sprint

---

**F-03: Tutorial In-App per Game**

| Field | Detail |
|---|---|
| **Masalah** | Setiap game langsung mulai tanpa penjelasan. User harus trial-and-error. |
| **Solusi** | Tooltip overlay saat pertama kali buka game. 1-2 langkah dengan ilustrasi dan teks singkat. Simpan `hasSeenTutorial_<game>` di localStorage. |
| **Kenapa relevan** | Mengurangi friction dan dropout di sesi pertama. Terutama penting untuk game kompleks seperti "Ayo Ngomong" (speech recognition) dan "Gabung Suku Kata". |
| **Effort** | Low (1-2 hari) |
| **Impact** | High — menurunkan bounce rate per game |

---

**F-04: Global Mute Toggle**

| Field | Detail |
|---|---|
| **Masalah** | Tidak ada cara mematikan semua suara. Masalah besar untuk penggunaan di tempat umum / malam hari. |
| **Solusi** | Toggle suara di header homepage (ikon speaker). Simpan di store, persist, dan gunakan sebagai flag di semua pemanggilan `playSound()` dan `speak()`. |
| **Kenapa relevan** | Situasi umum: ibu buka app di tempat umum — suara langsung keluar dan memalukan. Bikin user males buka app lagi. |
| **Effort** | Low (½ hari) |
| **Impact** | High — UX hygiene |

---

**F-05: Tips Pendampingan untuk Orang Tua**

| Field | Detail |
|---|---|
| **Masalah** | Orang tua hanya jadi "pengawas", tidak tahu cara mendampingi anak belajar bicara dengan app. |
| **Solusi** | Section "Tips Pendampingan" di halaman Pendamping. 5-6 tips singkat dengan ilustrasi kecil. Bisa di-swipe horizontal. |
| **Kenapa relevan** | App ini bukan pengganti terapis — tapi alat bantu. Orang tua harus jadi fasilitator. Tips ini memberi value di luar fitur utama. |
| **Effort** | Low (1 hari) |
| **Impact** | High — meningkatkan efektivitas terapi dan trust ke app |

---

**F-06: Focus Mode UX Revamp**

| Field | Detail |
|---|---|
| **Masalah** | Focus mode sangat powerful tapi UI/UX-nya cryptic. Ibu-ibu tidak paham fungsinya. |
| **Solusi** | Rename jadi "Mode Belajar". Tambahkan deskripsi pendek. Ganti double-tap exit → long press 3 detik atau gesture swipe. Tambahkan overlay penjelasan saat mode pertama kali diaktifkan. |
| **Kenapa relevan** | Fitur bagus tapi useless kalau user tidak pakai karena tidak paham. |
| **Effort** | Medium (2 hari) |
| **Impact** | High — meningkatkan adopsi fitur kunci |

---

**F-07: Session Summary Screen**

| Field | Detail |
|---|---|
| **Masalah** | Setelah sesi selesai, user cuma dapat break overlay tanpa informasi tentang apa yang sudah dicapai. |
| **Solusi** | Tampilkan summary sebelum masuk break: kata yang dipelajari, bintang didapat, akurasi, waktu belajar. Bisa di-skip. |
| **Kenapa relevan** | Memberi sense of accomplishment dan membantu orang tua memahami progres anak di sesi itu. |
| **Effort** | Low (1 hari) |
| **Impact** | Medium — meningkatkan perceived value dan retensi |

---

#### 🟡 P2 — Harus Ada Dalam 1 Bulan

---

**F-08: Homepage Restruktur (Hierarki Visual)**

| Field | Detail |
|---|---|
| **Masalah** | Semua game terlihat setara. New user tidak tahu harus mulai dari mana. |
| **Solusi** | Group jadi 2 section: "Mulai Belajar" (Kartu Kata, Tebak Gambar, Suku Kata) — "Tantangan" (Ayo Ngomong, Tebak Suara, Islami). Beri label "Pemula" / "Mahir". Pertimbangkan menambah mode "Jalur Belajar" sebagai alternatif grid. |
| **Kenapa relevan** | Decision paralysis adalah silent killer untuk engagement. |
| **Effort** | Low (1 hari) |
| **Impact** | Medium |

---

**F-09: Pendamping Dashboard Humanization**

| Field | Detail |
|---|---|
| **Masalah** | Dashboard terlalu teknis, data mentah terlalu banyak, bahasa kurang manusiawi. |
| **Solusi** | Restruktur jadi 2 tab: Ringkasan + Pengaturan. Gunakan bahasa manusia. Kurangi data mentah. Tambahkan insight seperti "Adik paling suka game Tebak Gambar!" |
| **Kenapa relevan** | Dashboard adalah halaman yang paling sering dikunjungi orang tua. Harus nyaman dan informatif, bukan intimidating. |
| **Effort** | Medium (2-3 hari) |
| **Impact** | Medium |

---

**F-10: Adaptive Difficulty / Spaced Repetition**

| Field | Detail |
|---|---|
| **Masalah** | Kata di-shuffle acak setiap sesi. Anak dapat kata yang sama berulang-ulang. Kata yang sudah dikuasai terus muncul, kata yang sulit jarang dilatih. |
| **Solusi** | Implementasi sederhana: track `successCount` dan `failCount` per kata di store. Kata dengan success rate rendah muncul lebih sering. Kata dengan success rate > 80% muncul lebih jarang tapi tetap direview berkala (spaced repetition). |
| **Kenapa relevan** | Meningkatkan efisiensi belajar. Anak tidak bosan dengan kata yang sudah bisa, dan dapat latihan lebih untuk kata yang sulit. |
| **Effort** | Medium (2-3 hari) |
| **Impact** | High — meningkatkan efektivitas belajar secara signifikan |

---

**F-11: Offline Resilience**

| Field | Detail |
|---|---|
| **Masalah** | Saat offline, hanya tampil halaman "/offline". Tidak ada game yang bisa dimainkan. |
| **Solusi** | Deteksi status koneksi (navigator.onLine + listener). Tampilkan indikator di header. Sembunyikan game yang butuh online (Ayo Ngomong). Izinkan game offline-friendly lainnya. Pre-cache audio assets dengan service worker. |
| **Kenapa relevan** | Banyak pengguna di daerah dengan internet tidak stabil. App harus usable meskipun koneksi jelek. |
| **Effort** | Medium (2 hari) |
| **Impact** | Medium |

---

**F-12: Progress Sharing (WhatsApp Card)**

| Field | Detail |
|---|---|
| **Masalah** | Tidak ada cara untuk share progres anak ke pasangan atau keluarga. |
| **Solusi** | Generate teks + gambar sederhana yang bisa di-share ke WhatsApp: "Adik sudah belajar 20 kata baru minggu ini! 🌟" Bisa pakai HTML → canvas → image (html-to-image pattern) atau lebih sederhana: copy text + stats. |
| **Kenapa relevan** | Word-of-mouth adalah channel akuisisi terkuat untuk app parenting. Ibu-ibu senang share pencapaian anak. |
| **Effort** | Medium (2 hari) |
| **Impact** | Medium — viral loop potential |

---

#### 🔵 P3 — Backlog / Nice to Have

---

**F-13: Voice Recording & Playback**

| Field | Detail |
|---|---|
| **Masalah** | Tidak ada cara tracking pengucapan anak dari waktu ke waktu. |
| **Solusi** | Rekam suara anak saat "Ayo Ngomong", simpan di IndexedDB, bisa di-playback oleh orang tua untuk bandingkan progres. |
| **Kenapa relevan** | Teknik inti speech therapy: auditory feedback loop. Mendengar rekaman sendiri adalah cara ampuh untuk anak memperbaiki pengucapan. |
| **Effort** | High (4-5 hari) |
| **Impact** | High — tapi butuh pertimbangan storage dan privacy |

---

**F-14: Sentence Building Game**

| Field | Detail |
|---|---|
| **Masalah** | Data `simpleSentences` sudah ada tapi tidak digunakan. |
| **Solusi** | Buat game drag-and-drop menyusun kata menjadi kalimat sederhana: "mama makan nasi", "adik minum susu". |
| **Kenapa relevan** | Jembatan dari vocabulary ke komunikasi fungsional. Level selanjutnya setelah anak menguasai kata-kata dasar. |
| **Effort** | Medium (3-4 hari) |
| **Impact** | Medium |

---

**F-15: Human Voice Audio untuk Konten Islami**

| Field | Detail |
|---|---|
| **Masalah** | TTS robotik untuk doa dan hijaiyah kurang tepat — pengucapan Arab tidak akurat dan tidak khusyuk. |
| **Solusi** | Rekam suara qari untuk 29 hijaiyah + 10 doa + 10 asmaul husna. Simpan sebagai MP3, preload saat masuk halaman Islami. |
| **Kenapa relevan** | Konten Islami butuh ketepatan tajwid dan suasana khusyuk. TTS tidak bisa menggantikan suara manusia untuk ini. |
| **Effort** | Medium (cari qari + rekam) |
| **Impact** | High untuk engagement di fitur Islami |

---

**F-16: Maskot / Karakter Pendamping**

| Field | Detail |
|---|---|
| **Masalah** | App terasa "kosong" secara emosional. Tidak ada karakter yang menemani anak. |
| **Solusi** | Desain 1-2 karakter maskot (hewan lucu) yang muncul di homepage, memberi semangat, dan bereaksi saat anak berhasil. |
| **Kenapa relevan** | Emotional connection adalah kunci retensi untuk anak. Karakter menciptakan "alasan untuk kembali". |
| **Effort** | High (butuh illustrator + animasi) |
| **Impact** | High — long term engagement |

---

**F-17: Calm Mode / Mode Tenang**

| Field | Detail |
|---|---|
| **Masalah** | Confetti + sound effect + animasi bisa overstimulasi beberapa anak, terutama yang sensitif secara sensorik. |
| **Solusi** | Toggle "Mode Tenang" yang mengurangi animasi ke minimal dan mengganti confetti dengan bintang statis. |
| **Kenapa relevan** | Aksesibilitas dan inklusivitas — beberapa anak dengan speech delay juga memiliki sensory processing issues. |
| **Effort** | Low (½ hari) |
| **Impact** | Medium — membuka app untuk anak dengan sensory sensitivity |

---

**F-18: Supabase Migration (Database + Auth)**

| Field | Detail |
|---|---|
| **Masalah** | localStorage fragile (bisa kehapus kalau clear browser data). Tidak ada sync multi-device. |
| **Solusi** | Migrasi ke Supabase: free tier cukup. Auth sederhana (email/Google). PostgreSQL untuk simpan progress. Realtime sync antar device. |
| **Kenapa relevan** | User tidak akan kehilangan data. Bisa buka app dari HP dan tablet. Membuka fitur backup/restore. |
| **Effort** | Very High (1-2 minggu) |
| **Impact** | High — tapi kompleksitas besar. Kerjakan setelah P0-P2 selesai. |

---

**F-19: Tambah 80+ Kata + Kategori Baru**

| Field | Detail |
|---|---|
| **Masalah** | 70 kata tidak cukup untuk engagement jangka panjang. Tidak ada kategori: warna, angka, anggota tubuh, alam. |
| **Solusi** | Tambah kata ke total 150+. Kategori baru: warna (12), angka (10), tubuh (15), alam (15), pakaian (10), peralatan rumah (15). |
| **Kenapa relevan** | Lebih banyak konten = lebih lama user bertahan. Kategori baru = alasan untuk kembali. |
| **Effort** | Low (1 hari untuk data entry) |
| **Impact** | Medium — quantity matters untuk vocabulary app |

---

**F-20: Simple Analytics & Weekly Report**

| Field | Detail |
|---|---|
| **Masalah** | Orang tua tidak bisa melihat tren jangka panjang. |
| **Solusi** | Track: game yang paling sering dimainkan, kata tersulit, rata-rata akurasi per game, waktu belajar harian. Generate weekly report text yang bisa di-copy ke WhatsApp. |
| **Kenapa relevan** | Data ini sangat berharga untuk orang tua sharing ke terapis atau dokter anak. |
| **Effort** | Medium (2-3 hari) |
| **Impact** | Medium |

---

### 3.3 Sprint Roadmap (Rekomendasi)

```
SPRINT 1 (Minggu 1-2)           SPRINT 2 (Minggu 3-4)           SPRINT 3 (Minggu 5-8)
─────────────────────           ─────────────────────           ─────────────────────
✅ F-01: Onboarding             ✅ F-02: Multi-anak profiles     ✅ F-10: Adaptive difficulty
✅ F-03: Tutorial in-app        ✅ F-06: Focus mode revamp       ✅ F-11: Offline resilience
✅ F-04: Global mute            ✅ F-08: Homepage restruktur     ✅ F-12: Progress sharing
✅ F-05: Tips pendampingan      ✅ F-09: Dashboard humanisasi    ✅ F-19: 150+ kata
✅ F-07: Session summary        ✅ F-17: Calm mode               🔲 F-14: Sentence building
```

---

### 3.4 Metrik Sukses

| Metrik | Target | Cara Ukur |
|---|---|---|
| Onboarding completion rate | > 80% | Event log: user lihat screen 3 |
| Day-1 retention (return next day) | > 40% | Streak count day-2 |
| Game completion rate | > 70% | Sesi yang diselesaikan vs dimulai |
| Average session duration | 10-15 menit | `todayMinutes` di store |
| Multi-profile adoption | > 30% user | Profile count > 1 |
| Word mastery rate | 5+ kata/minggu | `wordsLearned` delta per minggu |
| Focus mode activation rate | > 50% | `isFocusMode` trigger count |

---

### 3.5 Catatan Teknis untuk Developer

1. **Zustand store restructuring:** Untuk F-02 (multi-anak), refactor `useAppStore` dengan pattern:
   ```typescript
   // Store shape baru
   {
     activeProfileId: string,
     profiles: Record<string, ProfileData>,
     settings: { mute: boolean, calmMode: boolean }
   }
   ```

2. **Onboarding & Tutorial state:** Gunakan key sederhana di localStorage, jangan dicampur dengan store Zustand yang di-persist (hindari re-render tidak perlu):
   ```typescript
   localStorage.setItem('hasOnboarded', 'true')
   localStorage.setItem('hasSeenTutorial_kartu-kata', 'true')
   ```

3. **Spaced repetition algorithm (SM-2 simplified):**
   ```typescript
   // Per word tracking
   {
     successCount: number,
     failCount: number,
     lastSeen: timestamp,
     interval: number,  // hari sebelum review berikutnya
     easeFactor: number  // 2.5 default
   }
   ```

4. **Offline detection:** Gunakan `navigator.onLine` + `online`/`offline` event listeners. Jangan hanya andalkan service worker.

5. **Voice recording (F-13):** Gunakan `MediaRecorder` API → simpan blob di IndexedDB. Jangan simpan di localStorage (batas 5-10MB).

6. **Supabase migration (F-18):** Ini effort paling besar. Jangan dikerjakan sebelum P0-P2 selesai. Butuh: auth UI, schema migration, offline-first sync strategy, conflict resolution.

---

> **Dokumen ini siap digunakan sebagai development backlog.**  
> Setiap item di Feature Plan bisa langsung dipecah menjadi ticket/task di project management tool (Jira, Linear, GitHub Projects).
