# Ayo Belajar Bicara — design system (locked)

Audience: young children with speech delay / special needs (incl. autism), and their mother/therapist. Calm, predictable, one task per screen.

## Evidence → rules
- Muted, low-saturation colours; little visual noise (Aspect Autism Friendly Design Guide 2025; usability reviews of apps for children with ASD).
- No unexpected motion; honour reduced motion; a calm mode (Aspect; National Autistic Society calm/vivid switch).
- Same layout and navigation on every screen (W3C COGA "Making Content Usable").
- Familiar icons always paired with a text label (W3C COGA).
- Child touch targets ≥ 72px (≈2cm, NN/g children's UX); ≥ 12px apart. Parent targets ≥ 44px.
- One symbol/task in focus, no competing stimuli (AAC design research for ASD).

## Tokens (app/globals.css `:root`, Tailwind names in tailwind.config.ts)
`paper` page bg · `surface` cards · `line` borders · `ink` text · `ink-muted` secondary text ·
`accent` decorative purple · `accent-soft` tinted fills/selected state · `accent-strong` primary buttons & accent text (≥4.5:1 with white) ·
`good` / `good-strong` correct/done (use `-strong` behind white text) · `warn` streak/attention · `danger` / `danger-strong` / `danger-soft` destructive only (parent screens) · `on-accent` white text.
Never Tailwind palette colours (`bg-purple-500`, `text-gray-600`…), never hex in components, never gradients, never heavy shadows (`shadow-lg`); a 1px `border-line` separates surfaces.

## Type
`font-heading` for titles, words and buttons; `font-body` for prose. Child-facing text ≥ 20px (target word 40px+); button labels ≥ 18px; parent body 16px. Never < 14px. No tracked caps.

## Components
- `components/ui/GameShell.tsx` — every game page wraps in it: home button left, title centre, focus+stars right.
- `components/ui/BigButton.tsx` — child actions (`tone`: primary | quiet | good).
- Cards: `bg-surface rounded-3xl border border-line`. No card inside a card: inner groups use spacing or `bg-paper` fills without borders.
- Icons: inline SVG, `stroke="currentColor"`, `aria-hidden`, always beside a text label or with `aria-label`. Emoji only as **content** (a word's picture from `data/`), never as a UI icon on buttons/headings/badges.

## Feedback
- Correct: `good` fill + check icon + the existing sound/speech. Short (≤ 300ms), opacity/scale only.
- Wrong: gentle — neutral `line` → `warn` outline + "Coba lagi"; never red, never ✗, never shake longer than 300ms.
- Rewards/confetti: small, once; off in calm mode.

## Motion
framer-motion is wrapped in `MotionConfig reducedMotion={calmMode ? "always" : "user"}` (components/ClientLayout.tsx). Only `opacity`/`transform`. No `transition-all`, no looping/infinite animations except a progress spinner, no `whileHover` scale on child UI (taps are enough). CSS animations need a `prefers-reduced-motion` and `.calm-mode-active` fallback.

## Compact
One screen = header + one task area + ≤ 3 actions. Secondary controls (category filter, settings) go in a single row that scrolls horizontally or collapse behind one "Pilih" button. Instructions: one short sentence max, spoken where speech exists.
