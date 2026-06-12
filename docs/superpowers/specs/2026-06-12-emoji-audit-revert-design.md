# Revert lucide + Emoji Audit — Design Spec

**Date:** 2026-06-12
**Status:** Approved — awaiting implementation
**Scope:** Full revert of the lucide-react icon library work. Restore direct `{word.emoji}` rendering at every site. Fix 7 clear emoji mismatches in `data/words.ts`. Keep the responsive primitives (SafeInput / ResponsivePanel / TouchButton / ScrollArea) — only the lucide stuff is reverted.

## Problem

The previous design introduced `lucide-react` as an icon library, with `lib/wordIcons.ts` mapping each word to a lucide component and `components/WordIcon.tsx` choosing between lucide and emoji. The user has decided lucide icons look bad and wants to go back to native emoji, with the constraint that **emoji must visually match the word**. The user reported:

- `kulkas` (refrigerator) is rendered with 🧊 (ice cube) — explicit complaint.
- "Makesure gambar dan teksnya itu match ya, jangan teks kulkas gambar es batu lagi."

A full audit found 7 additional clear mismatches, plus 3 cases where the *same* emoji is used for two different words (forcing at least one to change).

## Goals

- Full revert of lucide-react: dependency, `lib/wordIcons.ts`, `components/WordIcon.tsx`, all render-site changes.
- Restore `{word.emoji}` rendering at every site that was migrated in the previous design.
- Fix the 7 clear emoji mismatches in `data/words.ts` so every emoji visually matches its word.
- Keep the 4 responsive primitives from the previous responsive-audit design — they're unrelated to the icon library and still serve their purpose (44px touch targets, viewport-edge-aware dropdowns, iOS momentum scroll, safe flex inputs).
- No regression in tests, lint, or the previous design's work.

## Non-Goals

- No new icon library (no emoji-picker, no SVG replacements, no images).
- No layout redesign.
- No changes to game mechanics, scoring, or persistence.
- No new "perfect match" emoji hunt for words that already have an acceptable emoji (e.g. kucing 🐱 is fine — we're not picking a "better" emoji for it).

## Design

### 1. Revert the lucide work

**Delete files:**
- `lib/wordIcons.ts`
- `components/WordIcon.tsx`

**Modify `package.json`:**
- Remove `"lucide-react": "^1.17.0"` from `dependencies`.

**Revert render sites** (replace `<WordIcon word={...} ... />` with direct `{word.emoji}` rendering using the original sizing/spacing the site had before):

| File | What to revert |
|---|---|
| `components/ProfileSwitcher.tsx` | `SafeInput` rename and "Nama anak..." inputs already use `SafeInput` (not `WordIcon`) — leave them. Just drop the unused `WordIcon` import. |
| `components/WordOfTheDay.tsx` | Replace `<WordIcon word={word} size={96} className="flex-shrink-0" />` with `<div className="text-6xl flex-shrink-0" aria-hidden="true">{word.emoji}</div>`. Drop the `WordIcon` import. |
| `components/PhotoWordCreator.tsx` | Photo upload preview, the 2 text inputs — drop `WordIcon` (not actually imported here, was a false-positive from earlier). Keep `SafeInput` for the 2 text inputs. |
| `components/TherapistDashboard.tsx` | Replace `<WordIcon word={word} size={20} ... />` with `<span className="text-sm flex-shrink-0" aria-hidden="true">{word.emoji}</span>`. Drop the `WordIcon` import. |
| `app/pendamping/page.tsx` | Replace `<WordIcon word={word} size={24} ... />` with `<span className="text-xl flex-shrink-0" aria-hidden="true">{word.emoji}</span>`. Drop the `WordIcon` import. Keep `SafeInput`. |
| `app/kartu-kata/page.tsx` | Replace `<WordIcon word={currentWord} size={120} ... />` with `<motion.span className="text-6xl sm:text-8xl leading-none mb-4" whileTap={...} transition={...}>{currentWord.emoji}</motion.span>`. Drop the `WordIcon` import. |
| `app/tebak-gambar/page.tsx` | Replace `<WordIcon word={option} size={64} ... />` with `<span className="text-5xl sm:text-6xl leading-none mb-2">{option.emoji}</span>`. Drop the `WordIcon` import. |
| `app/tebak-suara/page.tsx` | Replace `<WordIcon word={opt} size={64} ... />` with `<span className="text-5xl sm:text-6xl">{opt.emoji}</span>`. Drop the `WordIcon` import. |
| `app/suku-kata/page.tsx` | Replace both `<WordIcon ... />` calls with `<motion.span className="text-7xl" ...>{currentWord.emoji}</motion.span>` (merged state) and `<span className="text-6xl sm:text-8xl select-none">{currentWord.emoji}</span>` (idle state). Drop the `WordIcon` import. |
| `app/ayo-ngomong/page.tsx` | Replace `<WordIcon word={currentWord} size={96} ... />` with `<motion.span className="text-6xl sm:text-8xl block mb-4" ...>{currentWord.emoji}</motion.span>`. Drop the `WordIcon` import. |

### 2. Emoji audit — 7 fixes in `data/words.ts`

| id | word | current | new | rationale |
|---|---|---|---|---|
| `kel-8` | bayi | 👼 | 👶 | bayi is a baby, not a baby angel |
| `bua-10` | jambu | 🫐 | 🟢 | jambu = guava (green), blueberry is wrong color and shape; green circle is the best signal |
| `bua-7` | pepaya | 🍈 | 🍐 | pepaya and `bua-8` melon both used 🍈 — pear is the closest oval-fruit emoji and is distinct from melon |
| `bua-8` | melon | 🍈 | (keep) | melon is correct, but the duplicate was masking the pepaya issue |
| `mkn-7` | kue | 🧁 | 🍰 | kue is cake generically; 🧁 is specifically cupcake with frosting |
| `prl-1` | meja | 🪑 | 🟫 | meja = table, chair emoji is for `bnd-7` kursi; brown square evokes a wooden tabletop |
| `bnd-7` | kursi | 🪑 | (keep) | chair is correct; was being shadowed by meja using the same — now meja is 🟫 so the 🪑 stays correct |
| `prl-6` | kulkas | 🧊 | ❄️ | the user-reported bug; no refrigerator emoji in Unicode; snowflake is at least cold-related and clearly not an ice cube |

Notes:
- `prl-1` meja → 🟫 is a soft compromise; there's no "table" emoji in Unicode. The brown square is a colour cue, not a shape match. We accept this trade-off.
- `prl-6` kulkas → ❄️ same trade-off. The user said "no ice cube" — snowflake satisfies that even though neither is a refrigerator.
- Words with no perfect emoji but an acceptable one (e.g. 👨 for papa, 🐔 for ayam, 🦆 for bebek) are **not** changed — "fix clear mismatches only" per the user's choice.

### 3. Keep the responsive primitives

`SafeInput`, `ResponsivePanel`, `TouchButton`, `ScrollArea` stay. They were used in:
- `ProfileSwitcher` (`SafeInput` for the rename and add-name inputs, `ResponsivePanel` for the dropdown)
- `PhotoWordCreator` (`SafeInput` for the 2 text inputs, `ScrollArea` for the modal body)
- `ReminderSettings` (`SafeInput` for the time input)
- `app/pendamping/page.tsx` (`SafeInput` for the 3 text inputs)

All of these stay. The primitives' responsibilities (44px touch targets, viewport-edge panels, iOS momentum scroll, `min-w-0` flex inputs) are independent of the icon library.

### 4. Tests

- `__tests__/components/ProfileSwitcher.test.tsx` — should keep passing. The component still uses `SafeInput` and `ResponsivePanel`.
- `__tests__/components/WordIcon.test.tsx` — **delete this file** entirely. The component no longer exists.
- `__tests__/responsive-audit.test.tsx` — keep. The `SafeInput` and `ResponsivePanel` describe() blocks at the bottom still apply.
- Add a new test `__tests__/data/words.test.ts` (if not already present from the previous design) that asserts:
  - `kel-8` emoji is `👶` (not `👼`)
  - `bua-10` emoji is `🟢` (not `🫐`)
  - `prl-6` emoji is `❄️` (not `🧊`)
  - No two distinct word ids share the same emoji (catches the duplicate-meloon bug going forward)

### 5. Files affected

**Delete:**
- `lib/wordIcons.ts`
- `components/WordIcon.tsx`
- `__tests__/components/WordIcon.test.tsx`

**Modify:**
- `package.json` — remove lucide-react
- `data/words.ts` — 7 emoji fixes
- 10 render sites listed in section 1
- `__tests__/responsive-audit.test.tsx` — drop the `WordIcon`-specific describe block if it was added (the file currently tests SafeInput and ResponsivePanel, which still exist; no edit needed if those blocks are intact)

### 6. Error handling / edge cases

- **Range inputs in pendamping** (line 499) were never wrapped with `WordIcon` or `SafeInput` — no change.
- **File input in PhotoWordCreator** (the hidden `<input type="file">`) was never wrapped — no change.
- **Custom words added by `PhotoWordCreator`** still get a `📷` emoji (line 59 of the file) — that's a reasonable default for a photo-sourced word. No change.
- **`lucide-react` is no longer used** in any file, so the dep can be safely removed without dangling imports.

### 7. Out of scope

- A "perfect emoji for everything" hunt. We accept "close enough" emojis for words like kulkas, pepaya, jambu, meja.
- Reusing the `WordIcon` abstraction. The user said emoji is enough.
- A "real image" library like react-icons. Sticking to native Unicode emoji per the user's request.

## Success criteria

- `lucide-react` is removed from `package.json` and `node_modules`
- `lib/wordIcons.ts`, `components/WordIcon.tsx`, and `__tests__/components/WordIcon.test.tsx` are deleted
- Every render site that was migrated in the previous design now uses `{word.emoji}` directly
- All 7 emoji fixes are applied
- No two words share the same emoji (regression test catches this)
- All existing tests pass (203+1 new = 204)
- Lint clean
- Responsive primitives (`SafeInput`, `ResponsivePanel`, `TouchButton`, `ScrollArea`) still in use and working
