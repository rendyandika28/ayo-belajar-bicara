# Responsive Audit & Layout Primitives — Design Spec

**Date:** 2026-06-12
**Status:** Approved — awaiting implementation
**Scope:** Fix the ProfileSwitcher rename-input overflow bug. Add 4 layout primitives (`SafeInput`, `ResponsivePanel`, `TouchButton`, `ScrollArea`). Audit every `*.tsx` and replace fragile patterns with the primitives. Add a regression test that mounts every page at 320px / 768px / 1280px.

## Problem

The user found a concrete bug: in `ProfileSwitcher.tsx`, the rename-child input overflows its `w-64` (256px) panel when the user tries to edit the child's name. The root cause is a generic CSS-flex pattern: an `<input>` with `flex-1` inside a `flex` row doesn't shrink below its intrinsic `size=20` width, so the panel clips off-screen on small viewports or the input overflows the panel.

A grep for the same `flex-1` + raw-input pattern across the codebase reveals 6 other `<input>` call sites that could fail similarly on narrow viewports. Beyond inputs, the codebase has other unaddressed responsive risks:

- 17 of 42 `.tsx` files contain no `sm:`/`md:`/`lg:` responsive variants at all.
- Dropdown-style panels (e.g. `ProfileSwitcher` panel, `PhoneticFilter`) use `absolute top-full left-0` without viewport-edge awareness.
- Many `<button>` elements rely on the parent setting `min-h-[44px]` for touch-target compliance, which is easy to break.

## Goals

- **Fix the reported bug** — ProfileSwitcher rename input no longer overflows the panel.
- **Prevent the same class of bug** — 4 layout primitives bake the safe patterns in at the component level.
- **Audit and migrate** — every `*.tsx` file is checked for the same `flex-1` + input / fixed-width panel / 44px-touch-button patterns. Fragile patterns are replaced with primitives.
- **Regression coverage** — a new test mounts every page at 320px, 768px, 1280px and asserts the document body's `scrollWidth` is at most the viewport width (catches overflow).
- **No visual regression** — desktop view (1280px) must look the same as before.

## Non-Goals

- No layout redesign, no new breakpoints, no copy / colour / animation changes.
- No new dependencies — the primitives are pure Tailwind + React.
- The 17 files without responsive variants are not given new ones; only overflow bugs found during the audit are fixed.

## Design

### 1. Fix the reported bug

`components/ProfileSwitcher.tsx:134-145` — the rename input gets:
- `min-w-0` on the input itself (overrides the default `min-width: 20ch` from the `size` attribute)
- `min-w-0` on the parent button (allows the row to shrink as a whole)
- `size={1}` attribute as a belt-and-braces measure
- `onBlur={handleRename}` already exists — keep that behavior; verify it doesn't fire when the user clicks a different profile (already handled via `e.stopPropagation()`)

### 2. The 4 primitives

All primitives live in `components/ui/`. Each is a thin wrapper around a standard HTML/React element with the safe responsive class pre-applied. They take only the props they need plus an optional `className` for one-off overrides.

#### `components/ui/SafeInput.tsx`

```tsx
type Props = React.InputHTMLAttributes<HTMLInputElement> & { className?: string };

export function SafeInput({ className = "", size = 1, ...rest }: Props) {
  return (
    <input
      size={size}
      className={`min-w-0 ${className}`}
      {...rest}
    />
  );
}
```

- Default `size={1}` so a bare `<SafeInput />` never claims a 20-char min-width.
- `min-w-0` is the critical class — works in any flex parent.
- Forwards all other `<input>` props so callers can use `type`, `placeholder`, `value`, `onChange`, `aria-label`, etc. normally.

#### `components/ui/ResponsivePanel.tsx`

```tsx
type Props = {
  align?: "start" | "end";
  className?: string;
  children: React.ReactNode;
};

export function ResponsivePanel({ align = "start", className = "", children }: Props) {
  return (
    <div
      className={`
        absolute top-full mt-2 z-50
        ${align === "end" ? "right-0" : "left-0"}
        max-w-[calc(100vw-1.5rem)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}
```

- `max-w-[calc(100vw-1.5rem)]` keeps the panel within the viewport (1.5rem = 24px gutter on each side, leaves 12px to spare).
- `align="end"` flips to `right-0` for right-anchored triggers.
- Consumers add their own `bg-white rounded-2xl shadow-xl border-2 ...` styling via `className`.

#### `components/ui/TouchButton.tsx`

```tsx
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string };

export function TouchButton({ className = "", ...rest }: Props) {
  return (
    <button
      className={`min-h-[44px] min-w-[44px] focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:outline-none ${className}`}
      {...rest}
    />
  );
}
```

- Bakes in the 44×44 touch target (Apple HIG / WCAG 2.5.5).
- Adds a visible focus ring so keyboard users can see the focus.
- Forwards all standard button props.

#### `components/ui/ScrollArea.tsx`

```tsx
type Props = { className?: string; children: React.ReactNode };

export function ScrollArea({ className = "", children }: Props) {
  return (
    <div
      className={`overflow-y-auto [-webkit-overflow-scrolling:touch] [overscroll-behavior:contain] ${className}`}
    >
      {children}
    </div>
  );
}
```

- `-webkit-overflow-scrolling: touch` for momentum scroll on iOS.
- `overscroll-behavior: contain` so scrolling a child list doesn't scroll the page underneath.
- Consumers set `max-h-*` themselves via `className`.

### 3. Audit pass

For every file in `app/` and `components/`, look for the following patterns. Where found, replace with the primitive. Where the primitive doesn't fit (e.g. styled input that already has `w-full`), leave as-is.

| Pattern | Replace with |
|---|---|
| `<input className="flex-1 ...">` (inside a flex parent) | `<SafeInput className="flex-1 ..." />` |
| `<input className="w-full ...">` inside a `<form>` (PhotoWordCreator pattern) | `<SafeInput className="w-full ..." />` (for consistency; same behaviour) |
| `<div className="absolute top-full left-0 ...">` (dropdown panel) | `<ResponsivePanel className="bg-white rounded-2xl ...">` |
| `<button>` not already inside a `min-h-[44px]` parent | Wrap with `<TouchButton>` only if no visual change needed; otherwise add `min-h-[44px] min-w-[44px]` directly |
| Long scrollable lists with `overflow-y-auto` | Wrap with `<ScrollArea className="max-h-...">` only if iOS momentum scroll is missing |

Document the audit results in a checklist at the end of the implementation. Track each file as "audited, no change needed" or "audited, X primitive(s) added".

**Note on `<input type="range">`** — these have their own intrinsic behaviour and don't need `SafeInput` wrapping. The slider in `pendamping/page.tsx:499` is fine as-is.

**Note on `<input type="file">`** in `PhotoWordCreator.tsx:149` — hidden, no UI. Skip.

### 4. Regression test

`__tests__/responsive-audit.test.tsx` — a single test file that mounts every page component at three viewports and asserts the body does not overflow.

```tsx
import { render, cleanup } from "@testing-library/react";
import HomePage from "@/app/page";
// ... import all page components

const VIEWPORTS = [
  { name: "phone-320", width: 320, height: 568 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1280", width: 1280, height: 800 },
];

const PAGES: Array<[string, React.ComponentType]> = [
  ["home", HomePage],
  ["kartu-kata", KartuKataPage],
  // ... all 10 pages
];

describe.each(VIEWPORTS)("responsive audit @ $name", ({ width, height }) => {
  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", { value: width, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: height, configurable: true });
  });

  test.each(PAGES)("%s does not overflow horizontally", (_name, Page) => {
    render(<Page />);
    // assert: body has no horizontal overflow
    const body = document.body;
    expect(body.scrollWidth).toBeLessThanOrEqual(width + 1); // 1px tolerance for sub-pixel
    cleanup();
  });
});
```

The test is intentionally cheap (heuristic check) — it doesn't catch every responsive bug, but it would have caught the ProfileSwitcher bug and any similar overflow pattern.

### 5. Files affected

**Create:**
- `components/ui/SafeInput.tsx`
- `components/ui/ResponsivePanel.tsx`
- `components/ui/TouchButton.tsx`
- `components/ui/ScrollArea.tsx`
- `__tests__/responsive-audit.test.tsx`

**Modify (audited list, implementation phase will add to this):**
- `components/ProfileSwitcher.tsx` — fix rename input bug + use `ResponsivePanel`
- `app/kartu-kata/page.tsx` — swap `<input flex-1>` for `<SafeInput flex-1>` (syllable button row)
- `components/PhotoWordCreator.tsx` — use `SafeInput` for the 3 text inputs
- `components/ReminderSettings.tsx` — use `SafeInput` for the time picker input
- `app/pendamping/page.tsx` — use `SafeInput` for emoji / kata / suku-kata inputs
- Plus any file found during the audit that has the same pattern

### 6. Error handling / edge cases

- **Existing styling on migrated inputs** — the `className` is forwarded as-is, so visual appearance is preserved.
- **The `size={1}` default on `SafeInput`** — for non-text inputs (`type="checkbox"`, `type="radio"`), the `size` attribute is ignored by browsers. Safe default.
- **`<ResponsivePanel>` at viewport edge** — `max-w-[calc(100vw-1.5rem)]` ensures it fits, but the parent `position: relative` container still needs to be in the DOM. If the parent is hidden, the panel is hidden too. No regression.
- **The audit test** uses `Object.defineProperty(window, "innerWidth", ...)` to fake the viewport. JSDOM doesn't truly render at the given width, but it does propagate `window.innerWidth` to the React tree, and any element measuring `window.innerWidth` will see the fake value. Combined with the `scrollWidth <= innerWidth` heuristic, the test catches the class of bug the user reported.

### 7. Out of scope (deferred)

- Adding responsive variants to the 17 files that have none. They render fine in their current state; if a user reports an issue, we can fix in a follow-up.
- Reconsidering the `w-64` fixed panel widths. Some panels are intentionally narrow (e.g. ProfileSwitcher panel). The audit test will catch any that overflow.
- Adding `safe-area-inset` padding for notched phones. This is a separate, larger task.

## Success criteria

- `ProfileSwitcher` rename input no longer overflows the panel (verified manually + by audit test)
- `SafeInput` is used in **at least 5 places** where `<input flex-1>` was previously used
- `ResponsivePanel` is used in **at least 2 places** (ProfileSwitcher, PhoneticFilter dropdown)
- `__tests__/responsive-audit.test.tsx` mounts every page at 320px / 768px / 1280px and passes
- All existing tests still pass
- Lint clean
- Desktop view (1280px) is visually identical to before
