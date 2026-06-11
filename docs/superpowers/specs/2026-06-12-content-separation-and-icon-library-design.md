# Content Separation & Icon Library — Design Spec

**Date:** 2026-06-12
**Status:** Approved — awaiting implementation
**Scope:** Isolate islami content to `/islami` route, replace emoji icons with lucide-react SVG icons, keep custom-word image uploads working.

## Problem

Two related issues reported by the user:

1. **Inappropriate content mixing.** A `bunyi-kata` (phonological awareness) question paired the word *"bismillah"* with the word *"anjing"* in the same multi-choice set. Root cause: every game (bunyi-kata, tebak-gambar, tebak-suara, suku-kata, ayo-ngomong, kartu-kata) reads from a single `words` array in `data/words.ts`. That array includes 10 entries tagged `category: "islami"`, which the games draw from randomly. Islamic vocabulary should not appear outside the dedicated `/islami` route.
2. **Emoji icons don't match the word.** `kulkas` (refrigerator) was rendered with 🧊 (ice cube). `tv` uses 📺 which is fine, but several other words (buku/quran share 📖, etc.) have weak or misleading emoji choices. The user wants a real icon library that maps to the words properly.

## Goals

- Islamic content is reachable **only** through the `/islami` route.
- Every word in the main `words` array renders with a recognizable, well-mapped icon.
- Existing user-generated custom words (with uploaded photos) keep working unchanged.
- No regression in existing tests or persisted progress.

## Non-Goals

- No new "Belajar Kata Islami" section under `/islami`. The existing hijaiyah/doa/asmaul-husna pages stay as-is.
- No changes to game mechanics, scoring, or persistence.
- No redesign of the `/islami` route UI.

## Design

### 1. Data layer — `data/words.ts`

**Remove** the 10 entries under `// === ISLAMI (10 kata) ===` (ids `isl-1` through `isl-10`).

**Tighten the type** — drop `"islami"` from the `Word.category` union:

```ts
export type Word = {
  id: string;
  emoji: string;
  image?: string;
  word: string;
  syllables: string[];
  category: "hewan" | "buah" | "benda" | "keluarga" | "aktivitas"
          | "makanan" | "warna" | "angka" | "tubuh" | "alam" | "peralatan" | "foto";
  difficulty: 1 | 2 | 3;
};
```

The type system now statically guarantees no islami word can be added back accidentally.

**Remove** `{ id: "islami", label: "Islami", emoji: "🕌" }` from the exported `categories` array — the kartu-kata filter chip disappears.

The `image` field stays — `PhotoWordCreator` writes custom words with uploaded images into it.

### 2. Icon mapping — `lib/wordIcons.ts` (new file)

```ts
import { Cat, Dog, Bird, Fish, Baby, User, Users, /* ... */ } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const wordIconMap: Record<string, LucideIcon> = {
  // keluarga
  "kel-1": Baby,          // mama
  "kel-2": User,          // papa
  "kel-3": Users,         // kakak
  "kel-4": Baby,          // adik
  "kel-5": UserRound,     // nenek
  "kel-6": UserRound,     // kakek
  "kel-7": User,          // abang
  "kel-8": Baby,          // bayi
  "kel-9": Users,         // keluarga

  // hewan
  "hew-1": Cat,
  "hew-2": Dog,
  "hew-3": Bird,
  "hew-4": Fish,
  "hew-5": Bird,
  "hew-6": Beef,          // sapi (closest lucide has)
  "hew-7": Sheep,         // kambing
  "hew-9": Bird,          // bebek

  // benda — most important fixes here
  "bnd-4": Shirt,         // baju
  "bnd-5": Shirt,         // (was 👕)
  "bnd-6": Refrigerator,  // kulkas — fixes the 🧊 bug
  "bnd-7": Tv,            // tv

  // ... (full mapping in implementation; see Implementation Plan)
};
```

**Mapping policy:** include an entry **only when lucide has a recognisable icon for the word**. Words where lucide has no good match (e.g. `hew-8` kuda/horse, `hew-10` kelinci/rabbit, `hew-11` gajah/elephant, `hew-13` katak/frog, `hew-14` buaya/crocodile, `hew-15` kupu/butterfly) are deliberately **left unmapped** so the `WordIcon` component's emoji fallback renders their existing emoji. The original emoji is more recognisable for these animals than any generic `PawPrint` or `Bug` stand-in. The full mapping in the implementation phase is reviewed word-by-word against the actual lucide-react icon set in the dependency version we install.

### 3. Icon component — `components/WordIcon.tsx` (new file)

```tsx
import { wordIconMap } from "@/lib/wordIcons";
import type { Word } from "@/data/words";

type Props = {
  word: Word;
  size?: number;       // px, default 48
  className?: string;
};

export function WordIcon({ word, size = 48, className }: Props) {
  // 1. Custom uploaded photo wins
  if (word.image) {
    return (
      <img
        src={word.image}
        alt={word.word}
        width={size}
        height={size}
        className={className}
      />
    );
  }
  // 2. Lucide icon if mapped
  const Icon = wordIconMap[word.id];
  if (Icon) {
    return <Icon size={size} className={className} aria-hidden="true" />;
  }
  // 3. Emoji fallback for unmapped words
  return (
    <span style={{ fontSize: size }} className={className} aria-hidden="true">
      {word.emoji}
    </span>
  );
}
```

Rendering priority is fixed at the component level: custom photo > lucide > emoji. This means:
- User-created `PhotoWordCreator` words keep rendering their uploaded photo.
- A future "show photo" feature on built-in words would just need to populate `word.image` at data layer — no rendering change.

### 4. Render-site migrations

Replace every `{word.emoji}` (and emoji render via `<span>`) with `<WordIcon word={word} size={...} />`. The implementation plan will read each file to confirm exact line numbers; below is the file-level scope (every file that currently renders `word.emoji`):

- `app/bunyi-kata/page.tsx` — target word + 3 options grid
- `app/kartu-kata/page.tsx` — main flashcard hero
- `app/tebak-gambar/page.tsx` — game cards
- `app/tebak-suara/page.tsx` — game cards
- `app/suku-kata/page.tsx` — syllable cards
- `app/ayo-ngomong/page.tsx` — word list
- `components/PhotoWordCreator.tsx` — preview
- `components/TherapistDashboard.tsx` — word list
- `components/MouthPositionGuide.tsx` — only if it renders word icons (implementation phase verifies)

Existing `className="text-7xl"` style on emoji spans gets dropped; lucide icons inherit color from `currentColor` and size from the `size` prop.

### 5. Dependency

Add `lucide-react` to `package.json` (latest stable, currently `^0.460.0`). Tree-shakeable — only the icons we import ship to the bundle. The implementation phase will pin the version that ships in the npm registry at install time.

### 6. Testing

**New test files:**

- `__tests__/components/WordIcon.test.tsx`
  - Renders `<img>` when `word.image` is set, ignoring icon map and emoji
  - Renders lucide icon when `word.id` is in `wordIconMap`
  - Renders emoji `<span>` when word is unmapped
  - For known-fix words: `bnd-6` (kulkas) renders a non-emoji element (the `Refrigerator` icon)
  - Snapshot the rendered SVG for one word

- `__tests__/data/words.test.ts`
  - `words` array has no entry with `category: "islami"`
  - `categories` array has no entry with `id: "islami"`
  - Total word count is 95 (was 105 minus 10 islami)

**Regression coverage:**

All 197 existing tests should keep passing. No persistence changes — words that no longer exist simply stop being rendered; any in-progress flashcard session where a user was viewing an islami word falls through to the next/previous word via the existing array-bounds check in `kartu-kata/page.tsx:65-79`.

### 7. Edge cases

- **Custom words without image** (if any exist) — they have no entry in `wordIconMap`, so they fall through to emoji. Same behavior as today.
- **Words with `image` set to empty string** — current code treats truthy `image` as "has photo", so empty string falls through to icon map. Acceptable.
- **Lucide icon imports are missing at build time** — TypeScript catches this at compile. No runtime risk.
- **Bundle size** — lucide-react tree-shakes per-icon, so importing ~50 distinct icons adds maybe 30-50KB to the bundle. Acceptable for the visual improvement.

## Files affected

**Modify:**
- `data/words.ts` — remove 10 entries, tighten type, remove islami category chip
- `package.json` — add `lucide-react` dependency
- `app/bunyi-kata/page.tsx` — use `WordIcon`
- `app/kartu-kata/page.tsx` — use `WordIcon`
- `app/tebak-gambar/page.tsx` — use `WordIcon`
- `app/tebak-suara/page.tsx` — use `WordIcon`
- `app/suku-kata/page.tsx` — use `WordIcon`
- `app/ayo-ngomong/page.tsx` — use `WordIcon`
- `components/PhotoWordCreator.tsx` — use `WordIcon`
- `components/TherapistDashboard.tsx` — use `WordIcon`
- `components/MouthPositionGuide.tsx` — use `WordIcon` if it renders word icons

**Create:**
- `lib/wordIcons.ts`
- `components/WordIcon.tsx`
- `__tests__/components/WordIcon.test.tsx`
- `__tests__/data/words.test.ts`

## Rollout

Single PR. No migration script needed — old localStorage data still works (none of the persisted state references `words` array by id for critical operations, and removing entries is a safe no-op for what's saved).

## Success criteria

- `bunyi-kata` and other random-mix games never display an islami word (verified by reading the generated question set; no `category: "islami"` entry exists in the source data)
- `kartu-kata` has no "Islami" filter chip
- The `Word.category` type excludes `"islami"` (compiler-verified — assigning `{ category: "islami", ... }` to a `Word` is a type error)
- `kulkas` renders a refrigerator icon, not an ice cube
- `anjing` still appears in animal category games — this is intentional, the user kept it. The only mixing fix is removing islami words from non-islami games; "anjing" mixed with "kucing" or "sapi" is fine
- All existing tests pass; new tests pass; lint clean
