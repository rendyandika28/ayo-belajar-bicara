# Ayo Belajar Bicara!

Aplikasi terapi wicara interaktif untuk anak — belajar bicara sambil bermain.

PWA client-side, zero backend, localStorage-backed.

## Fitur

- **Kartu Kata** — Flashcard kosakata dengan gambar dan suara
- **Suku Kata** — Latihan membaca suku kata
- **Bunyi Kata** — Latihan fonetik bunyi huruf
- **Susun Kalimat** — Latihan menyusun kalimat
- **Ayo Ngomong** — Latihan pengucapan dengan speech recognition
- **Tebak Gambar** — Game menebak gambar
- **Tebak Suara** — Game menebak suara
- **Konten Islami** — Hijaiyah, Asmaul Husna, doa harian
- **Panduan Pendamping** — Tips untuk orang tua/terapis
- **Focus Mode** — Mode fokus ala Netflix kid lock + calm mode
- **PWA & Offline** — Installable, work offline

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion
- **State:** Zustand 5
- **Testing:** Vitest + Testing Library + jsdom
- **PWA:** Custom service worker (precache shell, cache-first static, network-first navigation)

## Getting Started

```bash
nvm use        # Node 22
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
  bunyi-kata/      — Latihan fonetik
  islami/          — Hijaiyah, Asmaul Husna, doa
  kartu-kata/      — Flashcard kosakata
  suku-kata/       — Latihan suku kata
  susun-kalimat/   — Latihan menyusun kalimat
  tebak-gambar/    — Game tebak gambar
  tebak-suara/     — Game tebak suara
  pendamping/      — Panduan orang tua
  offline/         — Fallback offline
components/        — UI components (focus, ui, layout)
data/              — Static word & islamic data
hooks/             — Custom hooks (useFocusMode)
lib/               — Utilities (speech, sounds, fuzzyMatch)
store/             — Zustand stores (app, focus)
public/
  sw.js            — Service worker
  manifest.json    — PWA manifest
  icons/           — PWA icons (SVG)
```

## License

Private project.
