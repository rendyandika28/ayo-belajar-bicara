# Ayo Belajar Bicara!

Interactive speech therapy app for kids — learn to speak through play.

Client-side PWA, zero backend, localStorage-backed.

## Features

- **Kartu Kata** — Vocabulary flashcards with images and audio
- **Suku Kata** — Syllable reading practice
- **Bunyi Kata** — Phonetic letter-sound exercises
- **Susun Kalimat** — Sentence construction practice
- **Ayo Ngomong** — Pronunciation practice with speech recognition
- **Tebak Gambar** — Picture guessing game
- **Tebak Suara** — Sound guessing game
- **Konten Islami** — Hijaiyah, Asmaul Husna, daily prayers
- **Panduan Pendamping** — Tips for parents and therapists
- **Focus Mode** — Netflix-style kid lock + calm mode
- **PWA & Offline** — Installable on home screen, works offline

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

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
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
  ayo-ngomong/     — Pronunciation practice
  bunyi-kata/      — Phonetic exercises
  islami/          — Hijaiyah, Asmaul Husna, prayers
  kartu-kata/      — Vocabulary flashcards
  suku-kata/       — Syllable reading
  susun-kalimat/   — Sentence construction
  tebak-gambar/    — Picture guessing game
  tebak-suara/     — Sound guessing game
  pendamping/      — Parent/therapist guide
  offline/         — Offline fallback
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
