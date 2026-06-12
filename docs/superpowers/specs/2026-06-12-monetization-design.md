# Premium Monetization — Design Spec

**Date:** 2026-06-12
**Status:** Approved — awaiting implementation plan
**Scope:** Add a freemium subscription system to *Ayo Belajar Bicara!* with Lynk.id as the payment gateway, Supabase as the subscriber database, and a popup-window checkout flow.

## Problem

The app is currently 100% free with no way to support ongoing development or unlock premium features. The user (developer + product owner) wants to monetize while keeping the app accessible to Indonesian mothers — a price-sensitive audience — by:

- Letting users try the app first with one feature unlocked for free
- Gating the rest behind a single premium package (no Free/Basic/Pro tier sprawl)
- Using Lynk.id as the payment gateway (no in-house billing)
- Making the payment feel safe via a popup window (instead of a full page redirect)
- Having a way to see who's paid (admin visibility)

The open question — *"how does the app know a user has paid?"* — is the core technical problem. Lynk.id's webhook provides the answer, but requires a backend the app currently lacks.

## Goals

- **One premium package** (no tier sprawl). Pricing: **Rp 29.000/bulan** or **Rp 199.000/tahun** (5 months free vs monthly).
- **Free tier = Kartu Kata only.** All other features (Suku Kata, Ayo Ngomong, Bunyi Kata, Tebak Gambar, Tebak Suara, Susun Kalimat, Islami, Panduan Pendamping) are locked.
- **Popup-window checkout** to Lynk.id (user's app stays in background, feels safer than full redirect).
- **Persistent premium state** — survives reloads, syncs across devices when the same email is entered.
- **Email is the only account identifier.** No passwords, no magic-link verification for v1.
- **Admin visibility** — open Supabase dashboard, see the `subscribers` table, sort/filter/export.
- **Time-pass model**, not auto-recurring subscriptions. Lynk.id only emits `payment.received` (one-time), so "monthly" and "yearly" are 30-day and 365-day passes that the user manually renews. This is also better for the Indonesian mom audience (no surprise charges, intentional renewal).
- **No regression** in existing features, tests, PWA offline behavior, or persisted state for Kartu Kata.

## Non-Goals

- No multiple premium tiers (Basic / Pro / Enterprise). One package.
- No free trial period. The free feature (Kartu Kata) *is* the trial.
- No subscription auto-renewal via Lynk.id (their webhook model doesn't support lifecycle events).
- No custom admin dashboard in v1 — Supabase's hosted dashboard is sufficient.
- No WhatsApp OTP / phone-based auth. Email is the only identifier.
- No refunds, dunning, or churn-recovery flows in v1.
- No analytics on conversion funnel. Supabase table counts are enough for early traction.
- No Playwright E2E tests. Lynk.id sandbox is the real E2E.
- No payments in the `/islami` route context (it's a sub-feature of the app's premium, not a separate purchase).

## Decisions Made (Brainstorming Summary)

| Decision | Choice | Why |
|---|---|---|
| Free vs premium split | Kartu Kata free, everything else premium | Lets moms feel the app's learning value before paying |
| Activation mechanism | Lynk.id webhook → Supabase row update | Lynk.id doesn't expose a query API; webhook is the only signal |
| Pricing rhythm | Monthly Rp 29K + Yearly Rp 199K (toggle) | Lowest entry barrier + clear "best value" framing for yearly |
| Paywall UI style | Centered modal (option B) | Less intrusive, keeps context visible |
| Email capture point | Inside the paywall modal | One-screen flow, no sign-in step |
| Account restoration | In-modal "Sudah pernah berlangganan? Masuk" toggle + standalone `/restore` page | Covers 90% in-modal + 10% URL-share cases |
| Admin view | Supabase dashboard (option A) | Zero extra code, sufficient for v1 |
| Subscription model | Time passes (30d / 365d), manual renewal | Matches what Lynk.id actually exposes; better for moms |
| Payment UX | `window.open()` popup with polling + webhook fallback | Works on desktop, mostly works on mobile, webhook is source of truth |

## Design

### 1. Architecture

```
┌─────────────┐    click "Mulai Premium"
│   Browser   │ ─────────────────────────────────────┐
│  (PWA app)  │                                      │
└──────┬──────┘                                      │
       │                                             ▼
       │  ┌─────────────────────────────────────────────────┐
       │  │  1. Open centered modal (price + email field)   │
       │  │  2. User enters email + clicks                  │
       │  │  3. POST /api/subscribers  { email }            │
       │  │  4. window.open(lynk.id/checkout?email=…)       │
       │  │  5. Poll subscribers?email=… until is_premium   │
       │  │  6. Unlock features + show celebration         │
       │  └─────────────────────────────────────────────────┘
       │
       │  ┌──────────────── API routes (Vercel) ─────────────┐
       │  │  POST /api/subscribers  → upsert by email         │
       │  │  GET  /api/subscribers?email=… → read status      │
       │  │  POST /api/lynk/webhook → flip is_premium=true    │
       │  └───────────────────────┬──────────────────────────┘
       │                          │
       │                          ▼
       │                  ┌──────────────┐
       │                  │   Supabase   │
       │                  │  (Postgres)  │
       │                  │  1 table:    │
       │                  │ subscribers  │
       │                  └──────────────┘
       │
       │  Lynk.id (separate flow, runs in popup):
       │  ┌────────────────────────────────────────┐
       │  │  1. Renders checkout page              │
       │  │  2. User pays (QRIS / e-wallet / VA)   │
       │  │  3. Lynk.id → POST /api/lynk/webhook   │
       │  │  4. Lynk.id → popup redirects to       │
       │  │     /upgrade/success?email=…           │
       │  └────────────────────────────────────────┘
```

**The only server code we add is 2 thin route files** under `app/api/` (the `subscribers` route file handles both `POST` and `GET`; the `lynk/webhook` route is the third endpoint). Everything else stays in the existing frontend. Supabase replaces both the database and the admin dashboard.

### 2. Supabase Schema

Single table, no Supabase Auth used (Supabase is a plain Postgres database accessed via service role key server-side, anon key client-side where needed).

```sql
create table public.subscribers (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null unique,
  is_premium          boolean not null default false,
  plan                text,                              -- 'monthly' | 'yearly' | null
  premium_until       timestamp with time zone,           -- computed: now + 30d / 365d
  lynk_ref_id         text unique,                       -- Lynk.id payment refId (idempotency)
  lynk_message_id     text,                              -- Lynk.id webhook message_id
  created_at          timestamp with time zone default now(),
  updated_at          timestamp with time zone default now()
);

create index subscribers_email_idx on public.subscribers (email);
create index subscribers_premium_until_idx on public.subscribers (premium_until)
  where is_premium = true;
```

**Row Level Security**: enabled. For v1, all read/write goes through the server-side API routes which use the service role key. No direct client access. (If we later want to query from the client, we add a policy scoped to a session.)

**Why this shape:**
- `email` is the user identifier (no separate users table — keeps it simple).
- `premium_until` is the source of truth; the app computes `is_premium` by checking `is_premium && premium_until > now()` on every read. No cron job needed.
- `lynk_ref_id` is unique → same payment can't be processed twice (idempotency).
- `created_at` / `updated_at` give admin instant visibility into new signups.

### 3. Components

**New client components** (`components/premium/`):
- `PaywallModal.tsx` — centered modal with state machine: `idle | submitting | pending | paid | closed_unpaid | error`. Benefits list, email field, monthly/yearly toggle, "Mulai Premium" CTA. Footer: "Sudah pernah berlangganan? Masuk" link.
- `FeatureLock.tsx` — wrapper component. Renders children if `usePremiumStatus().isPremium === true`; otherwise shows lock icon + tap-to-upgrade CTA. Used in pages.
- `PremiumBadge.tsx` — small "🔒 Premium" pill shown on locked cards in the home grid.
- `UpgradeCelebration.tsx` — full-screen "Selamat! 🎉" overlay shown once when premium flips on.

**New hooks** (`hooks/`):
- `usePremiumStatus.ts` — single source of truth. Reads from Zustand store + re-fetches from `GET /api/subscribers?email=…` on app `focus` and `visibilitychange`. Returns `{ isPremium, plan, premiumUntil, loading, refresh }`.
- `useLynkCheckout.ts` — opens the popup (`window.open(url, 'lynk-checkout', 'width=480,height=720')`) and returns `{ open, status }` where `status` is `'idle' | 'opening' | 'pending' | 'paid' | 'closed' | 'error'`. Detects popup close via `window.closed` polling every 1.5s AND reacts to webhook-driven DB update via shared `usePremiumStatus` re-fetch.
- `useRestoreAccess.ts` — small flow for new devices: `lookup(email)` → calls `GET /api/subscribers` → unlocks on success.

**New pages** (`app/`):
- `app/upgrade/success/page.tsx` — return URL for Lynk.id popup. Shows celebration + polls status for max 10s. (Also serves as fallback if popup is killed but Lynk.id still redirects.)
- `app/restore/page.tsx` — simple form to enter email and recover premium on a new device. Linked from PaywallModal footer.

**State** (extend `store/`):
- New slice `subscriber` in existing Zustand store:
  ```ts
  type SubscriberState = {
    email: string | null;
    isPremium: boolean;
    plan: 'monthly' | 'yearly' | null;
    premiumUntil: string | null;  // ISO timestamp
    hydrated: boolean;
    setFromApi: (row: SubscriberRow) => void;
    clear: () => void;
  };
  ```
- Persisted in `localStorage` under `web-adek:subscriber` (Zustand `persist` middleware).
- Hydration: on app mount, if `email` exists in localStorage → `GET /api/subscribers?email=…` → `setFromApi` to refresh.

**API routes** (`app/api/`):
- `POST /api/subscribers` — body `{ email }`. Validates email format. Upserts a row in Supabase (creates with `is_premium=false` if not exists, otherwise returns the existing row). Returns the full row.
- `GET /api/subscribers` — query `?email=…`. Returns the row, or 404 with `{ error: 'not_found' }`. Strips sensitive fields before responding.
- `POST /api/lynk/webhook` — Lynk.id's webhook target. Verifies `X-Lynk-Signature` against `LYNK_WEBHOOK_SECRET`, validates payload shape, looks up product by `items[0].uuid`, upserts subscriber with `is_premium=true`, `premium_until=now+30d|+365d`, `plan=…`, `lynk_ref_id=…`, `lynk_message_id=…`. Idempotent on `lynk_ref_id` (DB unique constraint + upsert).

**Lynk.id setup (manual, one-time in their dashboard):**
- Create 2 one-time payment products: "Premium Bulanan" Rp 29.000, "Premium Tahunan" Rp 199.000.
- Set webhook URL → `https://<your-domain>/api/lynk/webhook`.
- Set webhook secret → copy value to env var `LYNK_WEBHOOK_SECRET`.
- Set return URL → `https://<your-domain>/upgrade/success`.
- Copy each product's checkout URL → put in env vars `NEXT_PUBLIC_LYNK_MONTHLY_URL`, `NEXT_PUBLIC_LYNK_YEARLY_URL`.
- Record each product's UUID → put in env vars `LYNK_PRODUCT_MONTHLY_UUID`, `LYNK_PRODUCT_YEARLY_UUID` (server-side only, used by webhook handler).

**Modified existing pages:**
- `app/page.tsx` (home) — show all feature cards. Kartu Kata = normal. Others = `PremiumBadge` overlay + on-tap → `PaywallModal`.
- `app/suku-kata/page.tsx`, `app/ayo-ngomong/page.tsx`, `app/bunyi-kata/page.tsx`, `app/tebak-gambar/page.tsx`, `app/tebak-suara/page.tsx`, `app/susun-kalimat/page.tsx`, `app/islami/page.tsx`, `app/pendamping/page.tsx` — wrap with `<FeatureLock>`. Kartu Kata stays free.

### 4. Data Flow (with real Lynk.id payload)

**Webhook payload we'll implement against:**

```json
POST {WEBHOOK_URL}
Headers:
  X-Lynk-Signature: <token>
  Content-Type: application/json

Body:
{
  "event": "payment.received",
  "data": {
    "message_action": "SUCCESS",
    "message_code": "0",
    "message_data": {
      "refId": "13f8d23beeb2aacbbc01c94060cc88d7",
      "message_id": "API_CALL_1744270275143115_4624014",
      "createdAt": "2025-04-10T14:30:45",
      "customer": {
        "email": "user@lynk.id",
        "name": "Lynk User",
        "phone": "0812345677889"
      },
      "items": [{
        "uuid": "63cfd869524d15196a557388-8244-36439",
        "title": "Digital Produk",
        "price": 25000,
        "qty": 1
      }],
      "totals": { "grandTotal": 72000 }
    }
  }
}
```

**Product identification** (server-side, in `lib/premium/plans.ts`):

```ts
export const LYNK_PRODUCTS: Record<string, { plan: 'monthly' | 'yearly'; days: number }> = {
  [process.env.LYNK_PRODUCT_MONTHLY_UUID!]: { plan: 'monthly', days: 30 },
  [process.env.LYNK_PRODUCT_YEARLY_UUID!]:  { plan: 'yearly',  days: 365 },
};

export function getPlanFromUuid(uuid: string) {
  const entry = LYNK_PRODUCTS[uuid];
  if (!entry) throw new Error(`Unknown Lynk.id product UUID: ${uuid}`);
  return entry;
}
```

**Happy path (end to end):**

```
1. User taps locked feature
2. PaywallModal opens (centered, idle state)
3. User enters email, picks Bulanan / Tahunan, clicks CTA
4. Client → POST /api/subscribers { email } → Supabase upsert
5. Client → window.open(LYNK_MONTHLY_URL?email=…  or  LYNK_YEARLY_URL?email=…)
6. Popup shows Lynk.id checkout → user pays
7. Lynk.id → POST /api/lynk/webhook (X-Lynk-Signature, payment.received)
8. API: verify signature → check message_action=SUCCESS
      → look up product uuid → set is_premium=true,
        plan=monthly|yearly, premium_until=now+30d|+365d
9. Client poller (every 3s, max 5 min) sees is_premium=true
      → close popup (if still open), show celebration
10. Lynk.id → popup redirects to /upgrade/success?email=…
      (backup path — if step 9 missed it)
```

**Popup detection (hybrid):**

Two signals in parallel — neither is single-point-of-failure:

1. **Webhook path (source of truth):** Lynk.id → `/api/lynk/webhook` → Supabase. Flips `is_premium` server-side regardless of popup state.
2. **Client poll path (user feedback):** After opening popup, `usePremiumStatus` polls every 3s. On `is_premium=true`, show celebration.

If the popup is killed (mobile PWA background, popup blocker), the webhook still updates Supabase. The next app focus or reopen shows premium. Worst case: 1 re-open delay.

**Signature verification** (`lib/lynk/signature.ts`):

```ts
export function verifyLynkSignature(
  headerValue: string | null,
  expectedToken: string
): boolean {
  if (!headerValue) return false;
  // Header is "Token <value>" per the Lynk.id docs example
  const token = headerValue.startsWith('Token ')
    ? headerValue.slice('Token '.length).trim()
    : headerValue.trim();
  if (token.length === 0) return false;
  // Constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(expectedToken)
  );
}
```

(The exact shape of the signature value is one of the open items — to be confirmed against a real test payment before v1 ships.)

**Expiry + renewal flow (no webhook — handled client-side):**

- App checks `premium_until < now()` on every focus → flips `is_premium=false` in store.
- 3 days before expiry: in-app banner "Premium berakhir 3 hari lagi · Perpanjang sekarang" (dismissible).
- After expiry: lock UI re-engages; "Perpanjang" CTA opens Lynk.id with same email (if `?email=` param works — to be tested).
- If user pays again, webhook updates `premium_until = now + days` (extends from payment time, not from previous expiry — a fresh pass).

### 5. Account Restoration & Admin

**Restoration flow (new device, same email):**

```
1. User on new device taps a locked feature
2. PaywallModal opens (normal idle state)
3. Footer shows: "Sudah pernah berlangganan? Masuk"
4. Tap "Masuk" → modal switches to restore mode:
     • Single field: email
     • Button: "Pulihkan Akses"
5. GET /api/subscribers?email=…
     • is_premium=true  → "Selamat datang kembali! 🎉"
                          → save email in localStorage
                          → unlock features
     • is_premium=false → "Email belum terdaftar sebagai premium.
                          Yuk, mulai sekarang."
                          → switch back to PaywallModal idle
```

A standalone `/restore` page exists with the same form, linkable from WhatsApp / email support replies.

**Admin view (Supabase dashboard):**

Open `supabase.com` → log in → open the `subscribers` table. See all rows with email, plan, is_premium, premium_until, created_at, updated_at. Filter (`is_premium = true`), sort (newest first), export as CSV. Sort by `updated_at` desc to see new paying customers in real time as webhooks fire.

No custom admin page in v1.

### 6. Error Handling & Edge Cases

**PaywallModal state machine:**

| State | When | What user sees |
|---|---|---|
| `idle` | First open | Benefits + email + price toggle + "Mulai Premium" + "Sudah pernah berlangganan? Masuk" link |
| `submitting` | After click, before popup opens | "Membuka pembayaran…" + spinner |
| `pending` | Popup opened, polling | "Selesaikan pembayaran di jendela Lynk.id" + "Batal" link |
| `paid` | Poller sees is_premium=true | Celebration overlay (modal → celebration transition) |
| `closed_unpaid` | Popup closed, is_premium still false | "Pembayaran belum selesai. Coba lagi?" + retry |
| `error` | API/Lynk.id error | "Ada masalah. Coba lagi?" + retry |

**Edge cases:**

1. **User closes popup without paying** → `closed_unpaid`. Reassure, don't shame. Retry button keeps the same email.
2. **Webhook arrives late (5+ seconds)** → poller keeps going up to 5 min. As soon as DB flips, celebration shows.
3. **User kills popup before webhook fires** (common on mobile background) → webhook still runs server-side. Next app focus → `usePremiumStatus` re-fetches → user sees premium. Worst case: 1 re-open delay.
4. **User mistypes email at modal** → still POSTs to /api/subscribers (creates wrong row), opens Lynk.id with that wrong email. **Mitigation:** success page echoes back the email Lynk.id used. If user notices the mismatch, support link visible.
5. **Network failure on `POST /api/subscribers`** → modal goes to `error` state with retry. Email field keeps its value.
6. **Lynk.id service is down** → `useLynkCheckout` has a 30s timeout on `window.open`. If it fails (popup blocked, network down, Lynk.id 500), modal shows "Tidak bisa membuka pembayaran. Coba lagi atau hubungi kami." A `Hubungi Kami via WhatsApp` link is always visible in the modal footer (good for trust + support).

**Idempotency (no double-charge, no double-flip):**
- `POST /api/subscribers` uses `email` as a unique key — duplicate POSTs are no-ops, not new rows.
- Webhook handler uses `refId` as idempotency key (DB `UNIQUE(lynk_ref_id)` constraint). If the same payment event arrives twice, the second is a no-op upsert.
- Webhook returns 200 fast (Lynk.id retries on non-200). DB write is sync.

**Loading + retry budget:**
- Modal poller: every 3s, max 5 min. After 5 min, stops, shows "Belum ada konfirmasi. Cek email Anda atau hubungi kami." (Most payments confirm in 5–15 seconds.)
- Webhook handler: returns 200 fast (Lynk.id retries on non-200). DB write is sync.

### 7. Testing

The repo already has Vitest + Testing Library + jsdom set up. All new code lives in the same test framework. No new tooling.

**Unit tests** (`__tests__/unit/`):
- `lib/premium/status.ts` — `isPremiumActive(subscriber)`: true when `is_premium && premium_until > now`, false on expiry, handles null/expired states
- `lib/premium/plans.ts` — `getPlanFromUuid(uuid)`: returns `{ plan, days }` for known UUIDs, throws on unknown
- `lib/lynk/signature.ts` — `verifyLynkSignature(token, rawBody, header)`: valid → true, tampered → false, missing → false
- `lib/premium/expiry.ts` — `daysUntilExpiry(subscriber)`: positive, 0, negative
- `store/subscriber-slice.test.ts` — Zustand slice: hydrates, sets premium, persists, clears

**Component tests** (`__tests__/components/premium/`):
- `PaywallModal.test.tsx`:
  - Renders default state (idle, benefits, email field, price toggle)
  - Submitting state shows spinner, hides form
  - Pending state shows "Selesaikan pembayaran…" with cancel
  - Closed-unpaid state shows retry
  - Restore-mode toggle swaps UI cleanly
  - Calls `useLynkCheckout` with correct email + product URL
- `FeatureLock.test.tsx`:
  - Renders children when `isPremium=true`
  - Renders lock UI + onClick handler when not premium
  - Lock UI is accessible (button role, aria-label)
- `PremiumBadge.test.tsx`: renders "🔒 Premium" text, optional tooltip

**Hook tests** (`__tests__/hooks/`):
- `usePremiumStatus.test.ts`: re-fetches on focus, debounces, handles 404 gracefully
- `useLynkCheckout.test.ts`: opens popup with correct URL, polls every 3s, stops on success, handles popup-blocked (returns error state)
- `useRestoreAccess.test.ts`: looks up by email, unlocks on success, falls back to "not registered" message

**API route tests** (`__tests__/api/`) — mock Supabase with `vi.mock`:
- `POST /api/subscribers`:
  - Upserts by email, returns row
  - Validates email format (400 on invalid)
- `GET /api/subscribers?email=…`:
  - Returns row for existing email
  - 404 for unknown
  - Strips sensitive fields
- `POST /api/lynk/webhook`:
  - Returns 401 on invalid signature
  - Returns 200 on valid `payment.received` with `message_action=SUCCESS` → updates DB
  - Returns 200 (no DB change) on `message_action` other than SUCCESS
  - **Idempotency**: same `refId` twice → only one DB update (uses `refId` as unique key)
  - Unknown `items[].uuid` → logs warning, doesn't crash
  - Sets `premium_until = now + days` based on product mapping

**Webhook fixture** (`__tests__/fixtures/lynk-payment-received.json`):
A real-shape payload saved as a fixture file, so all webhook tests use the same data. Easy to update when Lynk.id changes their payload.

**Vitest setup additions** (`vitest.setup.ts`):
- Mock `window.open` globally (used by `useLynkCheckout`, not in jsdom by default).
- Mock `IntersectionObserver`, `ResizeObserver` if needed for components.

**Manual test checklist** (not automated — runs against Lynk.id sandbox before v1 ships):

```
[ ] Lynk.id sandbox: create 2 products (monthly Rp 29K, yearly Rp 199K)
[ ] Configure webhook URL → our /api/lynk/webhook
[ ] Set X-Lynk-Signature secret → copy to LYNK_WEBHOOK_SECRET env var
[ ] Desktop Chrome: click "Mulai Premium" → popup opens → sandbox payment → celebration appears
[ ] Mobile Safari (iOS): same flow
[ ] Mobile Chrome (Android): same flow
[ ] PWA installed on phone home screen: same flow
[ ] Popup blocked (Chrome setting): modal shows error state
[ ] Close popup before paying: modal shows closed_unpaid
[ ] Network off: modal shows error, retry works when network returns
[ ] Lynk.id checkout URL: does ?email= pre-fill? Yes/No (record answer)
[ ] New device: enter same email → premium restored
[ ] Wait for premium_until to pass (or set it to past in DB): premium flips off
[ ] Re-pay after expiry: premium extends correctly
[ ] Same email paid twice: idempotency holds (no duplicate rows)
```

**Test commands** (already in package.json):
- `npm test` — runs all unit + integration + API tests
- `npm run test:watch` — during dev
- `npm run test:coverage` — confirm we keep coverage >80% on the new files

## Files affected

**Create:**
- `lib/premium/status.ts` — `isPremiumActive`, `daysUntilExpiry`
- `lib/premium/plans.ts` — `getPlanFromUuid`, `LYNK_PRODUCTS` map
- `lib/lynk/signature.ts` — `verifyLynkSignature`
- `lib/lynk/webhook-handler.ts` — pure function: `(payload) => { email, plan, premiumUntil }` (testable in isolation)
- `lib/supabase/server.ts` — server-side Supabase client (service role key)
- `lib/supabase/types.ts` — generated/manual types for `subscribers` row
- `components/premium/PaywallModal.tsx`
- `components/premium/FeatureLock.tsx`
- `components/premium/PremiumBadge.tsx`
- `components/premium/UpgradeCelebration.tsx`
- `hooks/usePremiumStatus.ts`
- `hooks/useLynkCheckout.ts`
- `hooks/useRestoreAccess.ts`
- `app/api/subscribers/route.ts` (POST + GET in one file)
- `app/api/lynk/webhook/route.ts`
- `app/upgrade/success/page.tsx`
- `app/restore/page.tsx`
- `__tests__/unit/lib/premium/status.test.ts`
- `__tests__/unit/lib/premium/plans.test.ts`
- `__tests__/unit/lib/lynk/signature.test.ts`
- `__tests__/unit/lib/lynk/webhook-handler.test.ts`
- `__tests__/unit/store/subscriber-slice.test.ts`
- `__tests__/components/premium/PaywallModal.test.tsx`
- `__tests__/components/premium/FeatureLock.test.tsx`
- `__tests__/components/premium/PremiumBadge.test.tsx`
- `__tests__/hooks/usePremiumStatus.test.ts`
- `__tests__/hooks/useLynkCheckout.test.ts`
- `__tests__/hooks/useRestoreAccess.test.ts`
- `__tests__/api/subscribers.test.ts`
- `__tests__/api/lynk-webhook.test.ts`
- `__tests__/fixtures/lynk-payment-received.json`
- `supabase/migrations/20260612_create_subscribers.sql`

**Modify:**
- `app/page.tsx` — show all feature cards, gate non-Kartu-Kata with `PremiumBadge` + on-tap → `PaywallModal`
- `app/suku-kata/page.tsx`, `app/ayo-ngomong/page.tsx`, `app/bunyi-kata/page.tsx`, `app/tebak-gambar/page.tsx`, `app/tebak-suara/page.tsx`, `app/susun-kalimat/page.tsx`, `app/islami/page.tsx`, `app/pendamping/page.tsx` — wrap with `<FeatureLock>`
- `store/useAppStore.ts` — add `subscriber` slice, persist middleware
- `package.json` — add `@supabase/supabase-js`
- `vitest.setup.ts` — **new file**. Mock `window.open` globally (used by `useLynkCheckout`, not in jsdom by default). Add other test-time polyfills as needed.
- `.env.example` — document new env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `LYNK_WEBHOOK_SECRET`, `NEXT_PUBLIC_LYNK_MONTHLY_URL`, `NEXT_PUBLIC_LYNK_YEARLY_URL`, `LYNK_PRODUCT_MONTHLY_UUID`, `LYNK_PRODUCT_YEARLY_UUID`
- `docs/superpowers/specs/` — this file (done)

## Open Items / Risks

These are real things we need to verify with a real Lynk.id test payment before v1 ships:

1. **Does the Lynk.id checkout URL accept `?email=` query param and pre-fill the customer field?** If not, we rely on Lynk.id's own email field (no mitigation, user just needs to type it again at checkout).
2. **What does the actual `X-Lynk-Signature` value look like in production?** Is it a static token we set in the dashboard, or a per-event signature? Our `verifyLynkSignature` implementation assumes the former.
3. **Does Lynk.id's hosted checkout work in a `window.open()` popup on mobile PWA** (Android Chrome, iOS Safari)? Some mobile browsers block or kill these. Worst case: fall back to full-page redirect for mobile.
4. **What are the actual product UUIDs** for our monthly / yearly products? Grab from Lynk.id dashboard after product creation.

If any of (1)–(3) fail at sandbox time, the affected pieces are localized — we can ship anyway with documented workarounds.

## Success Criteria

- `npm test` passes with coverage > 80% on the new files.
- `npm run build` succeeds with no TypeScript errors.
- Manual sandbox checklist above is fully ✅.
- New user can: open app → use Kartu Kata free → tap Suku Kata → see paywall → enter email → pay in popup → see celebration → use Suku Kata.
- Returning user on new device: open app → tap Suku Kata → see paywall → click "Masuk" → enter same email → see "Selamat datang kembali" → use Suku Kata.
- After 30 days (or 365 days), `is_premium` flips to false on the next focus, lock UI re-engages.
- Admin can open Supabase dashboard, see the row with email + plan + `premium_until`, sort by `updated_at` desc to see new signups.
- All 197+ existing tests keep passing — no regression in Kartu Kata, focus mode, PWA, or service worker.

## Out of scope (v2+)

- Multiple premium tiers (Basic / Pro / Family)
- Free trial period
- Auto-recurring subscriptions (requires Lynk.id lifecycle events we don't have)
- Custom admin dashboard with metrics / MRR chart
- WhatsApp OTP sign-in
- Conversion funnel analytics
- Refunds / dunning
- Paywall A/B testing
- AI Pronunciation Coach, Photo Flashcards, PDF Therapist Report (already in `BRAINSTORM_IDEAS.md` as separate specs)
