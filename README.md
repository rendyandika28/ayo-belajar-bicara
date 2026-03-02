# Ayo Belajar Bicara!

Aplikasi terapi wicara interaktif untuk anak — belajar bicara sambil bermain!

Built with Next.js, designed as a PWA for offline-ready mobile use.

## Fitur

- **Kartu Kata** — Flashcard kosakata dengan gambar dan suara
- **Suku Kata** — Latihan membaca suku kata
- **Ayo Ngomong** — Latihan pengucapan dengan speech recognition
- **Tebak Gambar** — Game menebak gambar untuk melatih kosakata
- **Tebak Suara** — Game menebak suara untuk melatih pendengaran
- **Konten Islami** — Hijaiyah, Asmaul Husna, dan doa harian
- **Panduan Pendamping** — Tips untuk orang tua/terapis
- **Focus Mode** — Mode fokus ala Netflix kid lock
- **PWA & Offline** — Bisa dipasang di home screen, support offline

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **State:** Zustand
- **Testing:** Vitest
- **PWA:** Custom service worker (cache-first static, network-first navigation)

## Getting Started

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Keterangan |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |

## Project Structure

```
app/
  ayo-ngomong/     — Latihan pengucapan
  islami/          — Konten Islami (hijaiyah, doa, asmaul husna)
  kartu-kata/      — Flashcard kosakata
  suku-kata/       — Latihan suku kata
  tebak-gambar/    — Game tebak gambar
  tebak-suara/     — Game tebak suara
  pendamping/      — Panduan orang tua
  offline/         — Halaman offline fallback
components/        — Reusable components
lib/               — Utilities & data
public/
  sw.js            — Service worker
  manifest.json    — PWA manifest
```

## License

Private project.
