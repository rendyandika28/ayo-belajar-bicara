# Premium Monetization — Implementation Plan

**Spec:** `docs/superpowers/specs/2026-06-12-monetization-design.md`
**Date:** 2026-06-12
**Phases:** 7 (0 through 6, plus a final 7 for polish)
**Estimated total effort:** 4–6 working days

## How to read this plan

Each phase is one logical chunk of work that produces a working, deployable state.
Each task lists the files it touches and has a clear **Done when** check.
Each phase ends with a **Commit point** so work can be paused and reviewed.
Tests are interleaved with implementation, not deferred to the end.

The plan is dependency-ordered: nothing in Phase N can start until Phase N-1 commits.
Within a phase, tasks are ordered top-to-bottom.

**Stop and ask** if any **Done when** check fails — don't push past it.

---

## Phase 0 — Infrastructure setup (no behavior change)

Estimated: 30–60 min. End state: empty Supabase project, env vars wired, test harness ready, no user-facing change.

### Task 0.1 — Add Supabase dependency
- **Files:** `package.json`, `package-lock.json`
- **Action:** `npm install @supabase/supabase-js`
- **Done when:** `package.json` lists `@supabase/supabase-js` (any recent version); `npm install` clean.

### Task 0.2 — Document env vars
- **Files:** `.env.example` (new if missing)
- **Action:** add the 8 env vars from the spec (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `LYNK_WEBHOOK_SECRET`, `NEXT_PUBLIC_LYNK_MONTHLY_URL`, `NEXT_PUBLIC_LYNK_YEARLY_URL`, `LYNK_PRODUCT_MONTHLY_UUID`, `LYNK_PRODUCT_YEARLY_UUID`).
- **Done when:** `.env.example` lists all 8 with comments describing each (no real values, just placeholders like `https://YOUR-PROJECT.supabase.co`).

### Task 0.3 — Create test setup file
- **Files:** `vitest.setup.ts` (new), `vitest.config.ts` (verify `setupFiles` includes it)
- **Action:** add `window.open` mock (returns a fake `Window`-shaped object with `closed: false`, supports `.close()`), polyfill `crypto.timingSafeEqual` for jsdom if not present, mock `IntersectionObserver` and `ResizeObserver` no-ops.
- **Done when:** `npm test` runs without "window is not defined" errors on any existing test. Existing 197+ tests still pass.

### Task 0.4 — Create Supabase project + run migration
- **Files:** `supabase/migrations/20260612_create_subscribers.sql` (new)
- **Action:** create a Supabase project in the dashboard, copy `subscribers` table SQL from the spec (Section 2 of the design) into the migration file. Apply it via Supabase SQL editor (or `supabase db push` if CLI is set up). Confirm the table exists in Table Editor.
- **Done when:** `subscribers` table visible in Supabase dashboard with all 9 columns, 2 indexes, RLS enabled. No real data.

### Task 0.5 — Commit point
```
docs: phase 0 — supabase setup, env vars, test harness
```

---

## Phase 1 — Pure functions (no I/O, fully unit-testable)

Estimated: 2–3 hours. End state: 4 small lib files with 100% test coverage, all green. Nothing imports them yet.

This is the cheapest phase to get right because there is no browser, no network, no database.

### Task 1.1 — `lib/premium/status.ts`
- **Action:** create `isPremiumActive(subscriber, now?)` and `daysUntilExpiry(subscriber, now?)`. `isPremiumActive` returns `true` iff `subscriber.is_premium === true && subscriber.premium_until != null && new Date(subscriber.premium_until) > now`. Both functions handle `null` / `undefined` subscriber defensively.
- **Tests:** `__tests__/unit/lib/premium/status.test.ts` — 8+ cases: active premium, expired premium, is_premium=false, null subscriber, null premium_until, malformed timestamp, daysUntilExpiry positive/zero/negative, daysUntilExpiry with null premium_until.
- **Done when:** tests pass; `npm run test:coverage` shows 100% on this file.

### Task 1.2 — `lib/premium/plans.ts`
- **Action:** `getPlanFromUuid(uuid)` — looks up `process.env.LYNK_PRODUCT_MONTHLY_UUID` and `process.env.LYNK_PRODUCT_YEARLY_UUID`. Returns `{ plan: 'monthly' | 'yearly', days: 30 | 365 }`. Throws `Error('Unknown Lynk.id product UUID: …')` on unknown. Note: at test time the env vars won't be set, so the module should be importable in tests via `vi.stubEnv` in setup.
- **Tests:** `__tests__/unit/lib/premium/plans.test.ts` — known monthly UUID → monthly, known yearly UUID → yearly, unknown UUID → throws, env vars unset → throws on first call. Use `vi.stubEnv` to set env per test.
- **Done when:** tests pass.

### Task 1.3 — `lib/lynk/signature.ts`
- **Action:** `verifyLynkSignature(headerValue, expectedToken)` per the spec code. Strips "Token " prefix, trims, constant-time compare. Returns `false` on null/empty/short tokens.
- **Tests:** `__tests__/unit/lib/lynk/signature.test.ts` — valid token matches, prefix is stripped ("Token abc123" == "abc123"), wrong token fails, empty header fails, whitespace-only fails, null fails, length mismatch fails.
- **Done when:** tests pass.

### Task 1.4 — `lib/lynk/webhook-handler.ts`
- **Action:** pure function `parseWebhookPayload(rawBody, env)` returning `{ email, plan, premiumUntil, refId, messageId } | { error: 'invalid_signature' | 'invalid_payload' | 'unknown_product' | 'non_success_action' }`. Pulls `verifyLynkSignature` from Task 1.3. Reads `data.message_action === 'SUCCESS'`, looks up product by `data.message_data.items[0].uuid`, computes `premiumUntil = now + days`. Takes `env` as a parameter (not from `process.env`) so it's fully testable. Also export `parseWebhookPayloadForRoute(req)` wrapper that reads headers and `req.text()` (Next.js Web Request) — but the pure function is the testable unit; the wrapper is trivial and not unit-tested.
- **Tests:** `__tests__/unit/lib/lynk/webhook-handler.test.ts` — happy path (monthly, yearly), invalid signature, non-SUCCESS action, missing items, unknown product UUID, missing email. Also use the real fixture file (Task 1.5) for one happy-path test.
- **Done when:** tests pass.

### Task 1.5 — Webhook fixture
- **Files:** `__tests__/fixtures/lynk-payment-received.json` (new)
- **Action:** copy the `payment.received` payload from the spec into a JSON file. Validate it parses with `JSON.parse`. (The Task 1.4 test imports it.)
- **Done when:** file exists, valid JSON, referenced by tests.

### Task 1.6 — Commit point
```
feat(premium): pure lib functions for status, plans, lynk signature + webhook
```

---

## Phase 2 — Server-side (API routes)

Estimated: 3–4 hours. End state: 2 route files, 3 endpoints, all tested with mocked Supabase. Not wired to the frontend yet.

### Task 2.1 — `lib/supabase/server.ts`
- **Action:** server-side Supabase client using `SUPABASE_SERVICE_ROLE_KEY` from env. Two factory functions: `getSupabaseAdmin()` (service role, bypasses RLS) and `getSupabaseAnon()` (anon key, RLS-enforced). Reads from `process.env` and throws a clear error if env vars are missing.
- **Tests:** none (thin wrapper, validated by integration in Task 2.2+).
- **Done when:** file exists, no TypeScript errors, env-var-throws tested manually by running `npm run build`.

### Task 2.2 — `app/api/subscribers/route.ts` (POST + GET)
- **Action:** Next.js App Router route with two handlers.
  - `POST(req)`: parse body, validate email (simple regex), call `getSupabaseAdmin().from('subscribers').upsert({ email }, { onConflict: 'email' }).select().single()`. Return 400 on bad email, 500 on DB error, 200 with row on success.
  - `GET(req)`: read `?email=`, call `getSupabaseAdmin().from('subscribers').select('email, is_premium, plan, premium_until, created_at, updated_at').eq('email', email).single()`. Return 400 on missing email, 404 on not-found, 200 with row on success. Sensitive fields (id, lynk_ref_id, lynk_message_id) are not selected.
- **Tests:** `__tests__/api/subscribers.test.ts` — mock `lib/supabase/server.ts` with `vi.mock`. Cases: POST happy, POST invalid email, POST DB error; GET happy, GET not found, GET missing email. Use the same `SubscriberRow` type from `lib/supabase/types.ts` (Task 2.3).
- **Done when:** tests pass, `npm run build` clean.

### Task 2.3 — `lib/supabase/types.ts`
- **Action:** manual type for `SubscriberRow` (public-facing fields only): `{ email: string; is_premium: boolean; plan: 'monthly' | 'yearly' | null; premium_until: string | null; created_at: string; updated_at: string }`. Plus `SubscriberRowInternal` (all fields including lynk_*) for the webhook handler.
- **Done when:** types compile.

### Task 2.4 — `app/api/lynk/webhook/route.ts`
- **Action:** Next.js App Router route. Reads raw body via `req.text()`, calls `parseWebhookPayload(body, env)` from Task 1.4. On `error` returns the appropriate status code (401 for invalid_signature, 200 + log for non_success_action, 422 for invalid_payload, 422 for unknown_product). On success, upserts the row in Supabase: `getSupabaseAdmin().from('subscribers').upsert({ email, is_premium: true, plan, premium_until, lynk_ref_id: refId, lynk_message_id: messageId, updated_at: now }, { onConflict: 'lynk_ref_id' })`. Returns 200 fast.
- **Tests:** `__tests__/api/lynk-webhook.test.ts` — mock `lib/supabase/server.ts`. Cases: valid payload (monthly + yearly) → DB upsert called with correct args, invalid signature → 401, non-SUCCESS → 200 no DB change, unknown product → 422, missing env → 500. Use the real fixture file.
- **Done when:** tests pass, `npm run build` clean.

### Task 2.5 — Manual smoke test
- **Action:** start `npm run dev`. Use `curl` or Postman to:
  1. `POST /api/subscribers` with `{ "email": "test@example.com" }` → 200, row visible in Supabase.
  2. `GET /api/subscribers?email=test@example.com` → 200, row returned.
  3. `POST /api/lynk/webhook` with the fixture body (and a valid `X-Lynk-Signature: Token <secret>`) → 200, row's `is_premium` is now true.
  4. Same webhook call again → 200, no duplicate row.
  5. Webhook with wrong signature → 401.
- **Done when:** all 5 manual checks pass.

### Task 2.6 — Commit point
```
feat(api): subscribers + lynk webhook routes with supabase
```

---

## Phase 3 — Client state + hooks (no UI yet)

Estimated: 2–3 hours. End state: state store, 2 hooks, all tested. App still shows no paywall anywhere.

### Task 3.1 — `store/useAppStore.ts` — add `subscriber` slice
- **Action:** open the existing store file. Add a new `subscriber` slice with state: `{ email: string | null, isPremium: boolean, plan, premiumUntil: string | null, hydrated: boolean }`. Actions: `setFromApi(row)`, `clear()`. Add `persist` middleware (Zustand) with key `web-adek:subscriber`. On hydration, the persisted state loads first; then the app calls `usePremiumStatus` to refresh from API.
- **Tests:** `__tests__/unit/store/subscriber-slice.test.ts` — setFromApi updates state, clear resets, persist round-trip (set → reload → state preserved).
- **Done when:** tests pass, existing store tests still pass.

### Task 3.2 — `hooks/usePremiumStatus.ts`
- **Action:** reads from store + provides `refresh()` which calls `GET /api/subscribers?email=<store.email>` and calls `setFromApi` on the result. Re-runs on `focus` and `visibilitychange` window events. Returns `{ isPremium, plan, premiumUntil, email, loading, refresh }`.
- **Tests:** `__tests__/hooks/usePremiumStatus.test.ts` — `renderHook` from Testing Library. Cases: initial state from store, refresh on focus, refresh handles 404 (treats as not premium), refresh handles network error (keeps previous state, no crash), debounced rapid focus events.
- **Done when:** tests pass.

### Task 3.3 — `hooks/useRestoreAccess.ts`
- **Action:** exposes `lookup(email: string): Promise<'premium' | 'not_premium' | 'error'>`. Calls `GET /api/subscribers?email=…`, on 200 with `is_premium=true` calls `setFromApi` and returns `'premium'`. On 404 returns `'not_premium'`. On other errors returns `'error'`.
- **Tests:** `__tests__/hooks/useRestoreAccess.test.ts` — happy (premium), 404 (not_premium), 500 (error). Use `vi.mock` on global `fetch`.
- **Done when:** tests pass.

### Task 3.4 — Commit point
```
feat(premium): subscriber store slice + usePremiumStatus + useRestoreAccess
```

---

## Phase 4 — UI components (no integration into pages yet)

Estimated: 4–5 hours. End state: 4 components, 1 checkout hook, all tested. Nothing on the home page changes.

### Task 4.1 — `components/premium/PremiumBadge.tsx`
- **Action:** tiny pill component, "🔒 Premium" text with a tooltip on hover. Props: `className?: string`. No state, no hooks.
- **Tests:** `__tests__/components/premium/PremiumBadge.test.tsx` — renders text, applies className, has `aria-label` for accessibility.
- **Done when:** tests pass.

### Task 4.2 — `components/premium/FeatureLock.tsx`
- **Action:** wrapper component. Props: `children: ReactNode, lockedTitle?: string`. Reads `usePremiumStatus()`. If `isPremium === true`, renders `children`. Otherwise renders a lock overlay/card with: lock icon, title (defaults to "Fitur Premium"), subtitle, and a "Buka dengan Premium" button. On click, calls a passed-in `onLockedClick` prop OR dispatches a global event the PaywallModal listens for (decide during implementation; recommend the prop pattern for testability).
- **Tests:** `__tests__/components/premium/FeatureLock.test.tsx` — renders children when premium, renders lock UI when not, button has accessible role + label, click calls onLockedClick.
- **Done when:** tests pass.

### Task 4.3 — `components/premium/UpgradeCelebration.tsx`
- **Action:** full-screen overlay. Props: `open: boolean, onClose: () => void, plan: 'monthly' | 'yearly'`. Shows "Selamat! 🎉" + "Premium aktif selama 30 / 365 hari" + "Mulai Belajar" button. Uses Framer Motion for entrance animation. Closes on button click and on Escape key.
- **Tests:** `__tests__/components/premium/UpgradeCelebration.test.tsx` — renders when open, doesn't render when closed, button calls onClose, plan-specific text shown.
- **Done when:** tests pass.

### Task 4.4 — `hooks/useLynkCheckout.ts`
- **Action:** exposes `openCheckout({ email, plan }): void` and `status: 'idle' | 'opening' | 'pending' | 'paid' | 'closed' | 'error'`. Internally:
  1. POST `/api/subscribers` with the email (idempotent).
  2. `window.open(LYNK_MONTHLY_URL?email=…` or yearly) with `width=480,height=720`.
  3. Set status to `opening` then `pending` after popup is confirmed.
  4. Poll `usePremiumStatus` (which polls the API) every 1.5s.
  5. On `isPremium === true` → status `paid`, auto-close popup if `!popup.closed`.
  6. On popup.closed === true without premium → status `closed`.
  7. Timeout after 30s for `window.open` itself (popup-blocked case) → status `error`.
  8. 5-min hard timeout for the whole flow → status `closed`.
- **Tests:** `__tests__/hooks/useLynkCheckout.test.ts` — mock `window.open`, mock `fetch`. Cases: opens popup with correct URL, calls POST subscribers first, transitions to `paid` on `isPremium=true`, transitions to `closed` on popup closed without payment, transitions to `error` when popup blocked (returns null), timeout works.
- **Done when:** tests pass.

### Task 4.5 — `components/premium/PaywallModal.tsx`
- **Action:** the centerpiece. Props: `open: boolean, onClose: () => void`. Uses `useLynkCheckout` and `useRestoreAccess`. Internal state machine per the spec Section 6. UI matches the centered modal design (option B):
  - Default (`idle`): headline "Ayo Belajar Bicara Premium", 3-4 benefit bullets, email input, Bulanan/Tahunan segmented toggle (Rp 29K / Rp 199K, Tahunan shows "HEMAT 43%" badge), "Mulai Premium" CTA, footer link "Sudah pernah berlangganan? Masuk".
  - Restore mode: single email field + "Pulihkan Akses" button. Result shows "Selamat datang kembali! 🎉" on success or "Email belum terdaftar" on 404.
  - State transitions: `submitting` (spinner) → `pending` (message + cancel) → `paid` (celebration) | `closed_unpaid` (retry) | `error` (retry).
- **Tests:** `__tests__/components/premium/PaywallModal.test.tsx` — mock `useLynkCheckout` and `useRestoreAccess`. Cases: idle renders all parts, restore mode toggle works, submitting hides form, pending shows cancel, paid shows celebration trigger, closed_unpaid shows retry, error shows retry, footer restore link toggles mode.
- **Done when:** tests pass, no a11y violations on axe-core quick scan.

### Task 4.6 — Commit point
```
feat(premium): PaywallModal, FeatureLock, PremiumBadge, UpgradeCelebration + useLynkCheckout
```

---

## Phase 5 — Pages + integration (wire it all up)

Estimated: 3–4 hours. End state: paywall appears on locked features, restoration works, success page works. End-to-end flow runs locally with a stub for the popup.

### Task 5.1 — `app/upgrade/success/page.tsx`
- **Action:** the return URL for Lynk.id. Reads `?email=` from query. Shows the celebration + polls `usePremiumStatus` for up to 10s. If still not premium after 10s, shows "Belum ada konfirmasi. Hubungi kami via WhatsApp" fallback. (The popup is supposed to be closed by then, but this is the safety net.)
- **Done when:** page renders, polling works, fallback works.

### Task 5.2 — `app/restore/page.tsx`
- **Action:** standalone restore form. Same UI as the in-modal restore mode, but full-page. On success → redirect to home with a small "Selamat datang kembali!" toast (or just navigate).
- **Done when:** page renders, lookup works, redirect works.

### Task 5.3 — Wrap premium pages with `<FeatureLock>`
- **Files:** `app/suku-kata/page.tsx`, `app/ayo-ngomong/page.tsx`, `app/bunyi-kata/page.tsx`, `app/tebak-gambar/page.tsx`, `app/tebak-suara/page.tsx`, `app/susun-kalimat/page.tsx`, `app/islami/page.tsx`, `app/pendamping/page.tsx`
- **Action:** wrap each page's content with `<FeatureLock onLockedClick={openPaywall}>`. The `openPaywall` is passed in from a parent context — for simplicity in v1, use a Zustand store flag `paywallOpen` + setter. Mount the PaywallModal at the root layout level. The FeatureLock button click sets the flag; the modal reads it and opens.
- **Done when:** each premium page shows the lock card when not premium, content when premium. No regression in Kartu Kata.

### Task 5.4 — Update `app/page.tsx` (home)
- **Action:** show all feature cards. For non-Kartu-Kata cards, add `<PremiumBadge />` overlay. On card click, if the feature is premium and user isn't, open the paywall instead of navigating. (This is different from the FeatureLock flow because cards are on the home page, not in the page itself.)
- **Done when:** home shows all cards with badges on premium ones, clicking a premium card opens the paywall, clicking Kartu Kata navigates normally.

### Task 5.5 — Mount `PaywallModal` at the root layout
- **Files:** `app/layout.tsx`
- **Action:** mount the PaywallModal at the top of the layout. It reads the global `paywallOpen` flag and the `setPaywallOpen` setter. Also mount an `ExpiryBanner` (small "Premium berakhir dalam X hari" banner) that shows when `daysUntilExpiry <= 3 && isPremium === true`. The banner is dismissible (state in store, resets on logout).
- **Done when:** modal can be opened from any page, banner shows for users near expiry, both dismissable.

### Task 5.6 — Manual E2E walkthrough
- **Action:** with `npm run dev`, walk through:
  1. Open `/` → all cards visible, premium cards have 🔒 badge.
  2. Click Suku Kata → paywall opens.
  3. Click "Sudah pernah berlangganan? Masuk" → restore mode shows.
  4. Click "Kembali" → idle mode shows.
  5. Enter email, click "Mulai Premium" (with Lynk.id URL pointing to a real test product) → popup opens (or redirects if blocked).
  6. Pay in Lynk.id sandbox → celebration appears.
  7. Refresh → still premium.
  8. Open in incognito → premium gone.
  9. In incognito, go to Suku Kata → paywall, click "Masuk", enter same email → "Selamat datang kembali".
  10. Manually set `premium_until` in Supabase to a past date → refresh → premium gone, lock re-engages.
- **Done when:** all 10 steps pass.

### Task 5.7 — Commit point
```
feat(premium): wire PaywallModal into pages + FeatureLock + expiry banner
```

---

## Phase 6 — Lynk.id sandbox testing (manual, no code changes)

Estimated: 1–2 hours. End state: all 4 open items from the spec are answered. Some may require code tweaks (loop back to earlier phases).

This phase is a checklist, not code. Each item either confirms a working assumption or triggers a follow-up task.

### Task 6.1 — Create sandbox products
- **Action:** in Lynk.id dashboard, create 2 products: "Premium Bulanan Rp 29.000" and "Premium Tahunan Rp 199.000". Copy each product's checkout URL. Note the product UUID from the URL or dashboard. Copy the webhook secret value (or generate a new one).
- **Done when:** both products exist, URLs/UUIDs/secret recorded in `.env.local` (NOT `.env.example`).

### Task 6.2 — Configure webhook
- **Action:** in Lynk.id dashboard, set the webhook URL to your deployed dev URL + `/api/lynk/webhook` (use ngrok if testing locally). Set the secret to match `LYNK_WEBHOOK_SECRET`. Save.
- **Done when:** Lynk.id shows the webhook as "active" in their dashboard.

### Task 6.3 — Open item 1: `?email=` query param
- **Action:** open the monthly product URL + `?email=test@example.com` in an incognito window. Does the checkout pre-fill the email?
- **Outcome:** Yes (no code change) / No (adjust `useLynkCheckout` to NOT pass email and rely on Lynk.id's own field; update spec if behavior changes).
- **Done when:** behavior confirmed + spec note added if needed.

### Task 6.4 — Open item 2: signature shape
- **Action:** trigger a real sandbox payment. Capture the `X-Lynk-Signature` header from the incoming webhook (log it in `app/api/lynk/webhook/route.ts` temporarily). Compare against the spec's assumption.
- **Outcome:** matches "Token <static-secret>" (no code change) / differs (update `verifyLynkSignature` and add a new test case).
- **Done when:** signature verification actually validates against a real test payment.

### Task 6.5 — Open item 3: mobile popup
- **Action:** test on (a) iOS Safari, (b) Android Chrome, (c) PWA installed on iOS home screen. Trigger the paywall → Mulai Premium → does the popup open and survive through payment?
- **Outcome:** works on all (no code change) / breaks on some → fall back to `window.location.href = url` (full redirect) for the affected platform; feature-detect via user agent.
- **Done when:** at least desktop + one mobile platform work.

### Task 6.6 — Open item 4: product UUIDs
- **Action:** confirm both product UUIDs are in `.env.local`. Trigger a real payment. Webhook fires. API looks up the UUID via `getPlanFromUuid`. If unknown, webhook returns 422 and logs warning.
- **Done when:** real payment → API returns 200 → Supabase row updated with `is_premium=true`.

### Task 6.7 — Commit point
```
chore: lynk sandbox smoke-test results (in spec or CHANGELOG)
```

(If any open item required a code change, that change is its own commit before this one.)

---

## Phase 7 — Polish + production rollout

Estimated: 1–2 hours. End state: lint clean, all tests pass, README updated, deployed to production, real Lynk.id products live.

### Task 7.1 — Final test pass
- **Action:** `npm test` and `npm run test:coverage`. Coverage should be >80% on the new files. Fix any flakey tests. Re-run `npm run lint` and `npm run build`.
- **Done when:** all green, coverage target met.

### Task 7.2 — Update README
- **Files:** `README.md`
- **Action:** add a "Premium" section: pricing, what unlocks, payment via Lynk.id, support contact, link to `/restore` for device-switching.
- **Done when:** README reflects the new feature.

### Task 7.3 — Production deploy
- **Action:** set all 8 env vars in production (Vercel / hosting). Deploy. Configure the production webhook in Lynk.id dashboard to point at the production URL. Create the real products in Lynk.id (not sandbox).
- **Done when:** production app reachable, webhook configured, env vars set.

### Task 7.4 — Production smoke test
- **Action:** with a real (small) payment, verify: paywall opens, popup opens, payment succeeds, webhook fires, celebration appears, premium persists across reload, premium restored on second device. Then refund the test payment to yourself (if Lynk.id allows) or just delete the test row in Supabase.
- **Done when:** full E2E works in production.

### Task 7.5 — Commit + tag
```
docs: update README with premium info
chore: production rollout of premium
```
Then `git tag v0.2.0` (or whatever the next sensible version is).

---

## Rollback plan

If anything goes wrong post-deploy:

1. **Feature flag off** — add a `NEXT_PUBLIC_PREMIUM_ENABLED=false` env var (one-line change in the FeatureLock + home page). All locks show as unlocked for everyone. ~15 min to ship.
2. **Webhook disabled** — in Lynk.id dashboard, deactivate the webhook. No new premium flips. Existing premium users keep access until `premium_until`.
3. **Full revert** — `git revert` the production commit. No DB schema change to roll back (Supabase migration is forward-only, but the `subscribers` table is harmless if empty).

## Success criteria (from spec, restated)

- `npm test` passes with coverage >80% on the new files.
- `npm run build` succeeds.
- Manual sandbox checklist (Phase 6) fully ✅.
- New user can: open app → use Kartu Kata free → tap Suku Kata → see paywall → enter email → pay in popup → see celebration → use Suku Kata.
- Returning user on new device: open app → tap Suku Kata → see paywall → click "Masuk" → enter same email → see "Selamat datang kembali" → use Suku Kata.
- After 30 days (or 365 days), `is_premium` flips to false on the next focus.
- Admin can open Supabase dashboard, see the row with email + plan + `premium_until`.
- All 197+ existing tests keep passing.

## Open questions (raised during planning, not blockers)

- **Expiry banner**: should it show 7 days, 3 days, or 1 day before? Spec says 3 days. Fine for v1.
- **PaywallModal accessibility**: keyboard navigation, screen reader, focus trap. Tests cover basics; full a11y audit in v2.
- **Multiple kids per device**: out of scope. v1 assumes one subscriber per device.
- **PWA install prompt interaction**: the modal might appear before the install prompt. No interaction designed; not a blocker.
