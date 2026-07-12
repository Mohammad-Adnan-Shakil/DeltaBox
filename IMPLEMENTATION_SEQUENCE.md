# DeltaBox Implementation Sequence

> Stage 1B deliverable — ordered build plan. Each milestone is independently buildable and testable.

---

## Phase 0: API & Bug Fixes

> Pre-requisite: fix broken endpoints before any frontend work.

### Milestone 0.1 — Fix dead prediction endpoint ✅ DONE
**Files**: `frontend/src/services/api.js`, `frontend/src/pages/AIPage.jsx`
**Changes applied**:
- `api.js`: Added `predict()` → `POST /api/ai/predict`, `simulate()`, `getModelMetrics()`, `getDriverIntelligence()`
- `AIPage.jsx:98`: Changed `usePost("/ai/intelligence")` → `usePost("/ai/predict")`
- `POST /api/ai/predict` confirmed returning **200** (tested with `{gridPosition, driverForm, teamPerformance, trackAffinity}`)
**⚠️ Known issue**: Frontend sends `{driverId, raceId, simulatedPosition}` but backend expects `{gridPosition, driverForm, teamPerformance, trackAffinity}`. Also, backend response lacks `performanceBreakdown`, `probabilityDistribution`, `modelPredictions`, `simulation` fields that AIPage.jsx reads. Must reconcile contract before AI page functions.

### Milestone 0.2 — Remove dead Google auth endpoint ✅ DONE
**File**: `frontend/src/pages/Register.jsx`
**Change**: Removed `GoogleLogin` import, `handleGoogleLogin` function, and Google Login JSX block
**Completion criteria**: Register page no longer makes 404 calls to `/auth/google`

### Milestone 0.3 — Deduplicate user profile endpoints
**File**: `frontend/src/providers/AuthProvider.jsx`, `frontend/src/pages/Profile.jsx`
**Change**: Ensure all user data fetches go through `GET /api/user/me`; remove direct `GET /api/user/profile` calls
**Completion criteria**: Profile page fetches user data via the same endpoint as AuthProvider

---

## Phase 1: Design Token Foundation

> No visual changes yet — just infrastructure.

### Milestone 1.1 — Inject CSS custom properties
**File**: `frontend/src/index.css`
**Changes**:
- Add `:root` block with all design tokens from `design_system.txt`:
  - Base colors (950/900/800/700/600/500)
  - Accent colors (600/500/400/300/glow)
  - Data colors (primary/secondary/success/warning/danger/neutral)
  - Text colors (primary/secondary/tertiary/accent/data)
  - Glass colors (bg/border/hover/glow)
  - Font families (Inter, JetBrains Mono)
  - Font sizes (xs through 6xl)
  - Font weights (normal through black)
  - Letter spacing (tighter through widest)
  - Spacing (1 through 32)
  - Border radii (sm/md/lg/xl/2xl/full)
  - Shadows (sm/md/lg/xl/glow/glow-sm/data)
  - Animation durations (instant/fast/normal/slow/slower/cinematic)
  - Animation easings (default/in/out/spring/sharp)
- Keep Tailwind `@import` (already using Tailwind 3.4.3)
- Add `@font-face` or Google Fonts import for Inter + JetBrains Mono
- Add `prefers-reduced-motion` media query fallback
**Completion criteria**: All design system values available as `var(--color-base-950)`, etc. in the browser dev tools

### Milestone 1.2 — Create constants and helpers
**File**: `frontend/src/utils/constants.js`
**Content**:
```js
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const CONFIDENCE_THRESHOLDS = { HIGH: 70, MEDIUM: 40 };
export const SIDEBAR_WIDTHS = { EXPANDED: 240, COLLAPSED: 64 };
export const BREAKPOINTS = { DESKTOP: 1024, TABLET: 768 };
```
**File**: `frontend/src/utils/helpers.js`
**Content**:
- `formatDate(dateString)` — "Mar 8, 2026"
- `formatPoints(points)` — "128 pts"
- `getConfidenceColor(value)` → "green" | "amber" | "red"
- `getConfidenceLabel(value)` → "High" | "Medium" | "Low"
- `getStatusColor(status)` → "green" | "gray"
- `getInitials(name)` → "LH"
- `classNames(...classes)` — conditional class joining
**Completion criteria**: Both files exportable and importable; helpers return correct values

---

## Phase 2: Layout & Navigation

### Milestone 2.1 — Re-theme Sidebar
**File**: `frontend/src/layout/Sidebar.jsx`
**Changes**:
- Background: `var(--color-base-900)` / `#0f0f17`
- Border right: `1px solid var(--color-base-600)` / `#252535`
- Active nav item: red accent left border (2px solid `var(--color-accent-500)`) + glass background (`var(--color-glass-bg)`)
- Hover nav item: `var(--color-glass-hover)` background
- Icons: Lucide React, 20px, consistent style
- Collapsed state: 64px wide, icons only (labels hidden)
- Mobile state: hidden, overlay drawer on hamburger tap with `z-50`
- Logo area: DeltaBox text + small red accent bar
- User menu at bottom: avatar (initials circle) + name (hidden when collapsed)
- Animation: width transition 200ms, `ease-out`
**Completion criteria**: Sidebar matches design_system spec at all 3 breakpoints (expanded, collapsed, mobile overlay)

### Milestone 2.2 — Update MainLayout
**File**: `frontend/src/layout/MainLayout.jsx`
**Changes**:
- Wrap `<Outlet>` in `<AnimatePresence mode="wait">` with `<motion.div>` page transitions
- Transition: fade + translateY(20→0), 250ms, ease-out
- Responsive content padding: `24px` mobile, `32px` tablet, `48px` desktop
- Max content width: `1400px`, centered with `mx-auto`
- Mobile top bar with hamburger toggle
- Sidebar collapse toggle for tablet
**Completion criteria**: Layout renders correctly at all breakpoints; page transitions animate smoothly

---

## Phase 3: Core UI Components

### Milestone 3.1 — Button
**File**: `frontend/src/components/common/Button.jsx`
**Variants**:
- Primary: `bg-[var(--color-accent-500)]` / `#e31e1e`, white text, `hover:brightness-110` + glow shadow
- Secondary: `bg-[var(--color-glass-bg)]`, `border-[var(--color-glass-border)]`, white text
- Ghost: transparent, white text, hover shows glass background
- Danger: same as primary but `bg-[var(--color-data-danger)]` / `#ef4444`
**Props**: `variant`, `size` (sm/md/lg), `disabled`, `loading` (shows spinner), `icon`, `children`, `onClick`, `type`, `className`
**States**: default, hover (brightness increase + glow), active (scale 0.98), disabled (opacity 50%), loading (spinner replaces content)
**Completion criteria**: All 4 variants render correctly; all states (hover/active/disabled/loading) work

### Milestone 3.2 — Card
**File**: `frontend/src/components/common/Card.jsx`
**Variants**:
- Default: `bg-[var(--color-base-800)]` / `#16161f`, `radius-lg` / `12px`, `p-6` / `24px`, `border border-[var(--color-base-600)]`, `shadow-md`
- Accent: same + red border `1px solid rgba(227, 30, 30, 0.2)` + `shadow-glow-sm`
**Props**: `children`, `className`, `hoverable` (adds translateY(-2px) on hover, 150ms), `accent` (red border + glow)
**Completion criteria**: Both variants render; hover lift animation works; accent variant has red border

### Milestone 3.3 — Input + Select
**File**: `frontend/src/components/common/Input.jsx`
**Styles**: `bg-[var(--color-base-700)]` / `#1e1e2a`, `border border-[var(--color-base-500)]` / `#32324a`, `radius-md` / `8px`, `h-11` / `44px`, text `var(--color-text-primary)`, placeholder `var(--color-text-tertiary)`
**Focus**: border `var(--color-accent-500)` / `#e31e1e`, ring effect
**Error**: border `var(--color-data-danger)` / `#ef4444`, error message below
**Props**: `value`, `onChange`, `placeholder`, `type`, `error`, `disabled`, `label`, `className`
**File**: `frontend/src/components/common/Select.jsx`
**Styles**: Same as Input
**Props**: `value`, `onChange`, `options: [{value, label}]`, `placeholder`, `disabled`, `error`
**Completion criteria**: Both components render; focus ring, error state, and disabled state work

### Milestone 3.4 — Badge
**File**: `frontend/src/components/common/Badge.jsx`
**Variants**: `completed` (green bg), `scheduled` (gray bg), `p1` (gold), `p2` (silver), `p3` (bronze), `default` (accent bg)
**Styles**: `text-xs`, `tracking-wide`, `uppercase`, `font-medium`, `px-2 py-1`, `radius-sm` / `4px`
**Props**: `children`, `variant`, `className`
**Completion criteria**: All variants render with correct colors

### Milestone 3.5 — Skeleton
**File**: `frontend/src/components/common/Skeleton.jsx`
**Variants**:
- `text`: `h-4 w-full bg-white/5 rounded animate-pulse`
- `card`: `h-32 w-full bg-white/5 rounded-2xl animate-pulse`
- `table-row`: `h-10 w-full bg-white/5 rounded animate-pulse`
- `circle`: `h-10 w-10 bg-white/5 rounded-full animate-pulse`
**Animation**: shimmer effect (background gradient sweep) — pure CSS
**Props**: `variant`, `className`, `count` (renders multiple)
**Completion criteria**: All variants render with shimmer animation

### Milestone 3.6 — StateViews (Empty / Error)
**File**: `frontend/src/components/common/StateViews.jsx`
**Empty state**: Centered icon (Lucide `Inbox`), message text, optional CTA button
**Error state**: Centered icon (Lucide `AlertTriangle`), error message, optional retry button
**Props**: `type: 'empty'|'error'`, `icon`, `message`, `action: {label, onClick}`, `className`
**Completion criteria**: Both states render with correct icons, text, and CTA

### Milestone 3.7 — Modal
**File**: `frontend/src/components/common/Modal.jsx`
**Styles**: Glass (`bg-black/40 backdrop-blur-xl`), centered, `z-50`, `radius-xl` / `16px`
**Animation**: scale 0.95→1, 300ms, ease-out (Framer Motion)
**Props**: `open`, `onClose`, `title`, `children`, `className`
**Behavior**: Close on Escape, close on backdrop click, focus trap, body scroll lock
**Completion criteria**: Modal opens/closes with animation; Escape key and backdrop click work

### Milestone 3.8 — Table
**File**: `frontend/src/components/common/Table.jsx`
**Styles**: Sticky header (`top-0`, `bg-[var(--color-base-800)]`), header text `var(--color-text-secondary)`, row hover `bg-white/[0.03]`, alternating row bg `bg-white/[0.015]`
**Sort**: Clickable headers with sort direction indicator arrow
**Props**: `columns: [{key, label, sortable, render}]`, `data: any[]`, `sortKey`, `sortDir`, `onSort`, `loading`, `emptyMessage`, `className`
**Completion criteria**: Table renders data, sorts on click, shows loading skeleton rows, shows empty message

### Milestone 3.9 — TabBar
**File**: `frontend/src/components/common/TabBar.jsx`
**Styles**: Horizontal row of tabs, active tab has bottom border (accent-red) + `font-semibold`, inactive tabs `text-[var(--color-text-tertiary)]`
**Props**: `tabs: [{key, label}]`, `active: string`, `onChange: fn`, `className`
**Completion criteria**: Tabs render, active tab highlighted, click switches active

### Milestone 3.10 — StatCard
**File**: `frontend/src/components/common/StatCard.jsx`
**Styles**: Glass card (`bg-[var(--color-glass-bg)]`, `border-[var(--color-glass-border)]`, `backdrop-blur-xl`, `p-6`, `radius-lg`)
**Content**: Icon (top-left), label (secondary text), value (primary text, large), trend indicator (optional, green up / red down)
**Animation**: Count-up on value (Framer Motion `useSpring` or `AnimatedCount`), 500ms
**Props**: `label`, `value`, `icon: LucideIcon`, `trend: 'up'|'down'|null`, `loading: boolean`, `className`
**Completion criteria**: StatCard renders with glass style; count-up animation plays on mount

### Milestone 3.11 — Loader
**File**: `frontend/src/components/common/Loader.jsx`
**Styles**: Centered flex, spinner (CSS border animation), optional label below
**Props**: `size: 'sm'|'md'|'lg'`, `label: string`, `className`
**Completion criteria**: Spinner animates at 3 sizes

---

## Phase 4: Data Layer Fixes

### Milestone 4.1 — Update api.js
**File**: `frontend/src/services/api.js`
**Changes**:
- Add `getRace(id)` → `GET /api/races/{id}`
- Add `getRaceResults(id)` → `GET /api/races/{id}/results`
- Add `predict(payload)` → `POST /api/ai/predict`
- Add `simulate(payload)` → `POST /api/ai/simulate`
- Fix `fetchPredictions` (rename or fix route to `/ai/predict`)
- Remove any `/auth/google` references
- Verify all existing function names match page usage
**Completion criteria**: All endpoint functions exist and match backend contracts

### Milestone 4.2 — Ensure AuthProvider consistency
**File**: `frontend/src/providers/AuthProvider.jsx`
**Changes**:
- Fetch user data exclusively through `GET /api/user/me`
- Store minimal user state (id, username, email)
- Token persistence in localStorage
- Clear token on 401
**Completion criteria**: AuthProvider fetches user on mount, provides user + token via context, logs out on 401

---

## Phase 5: Feature Components

### Milestone 5.1 — Dashboard feature components
**Files**:
- `frontend/src/components/dashboard/StatCardsRow.jsx` — 4-column grid of StatCards (drivers count, races count, predictions made, prediction accuracy)
- `frontend/src/components/dashboard/StandingsChart.jsx` — Recharts AreaChart: data from drivers, x-axis = rounds, y-axis = points, accent-red fill gradient, dark grid lines at 50%, glass tooltip
- `frontend/src/components/dashboard/NextRaceWidget.jsx` — Card showing next SCHEDULED race (name, circuit, date + countdown). If all COMPLETED, show "Season Complete" message
**Completion criteria**: All 3 components render with real data; StandingsChart has dark theme styling

### Milestone 5.2 — Race feature components
**Files**:
- `frontend/src/components/races/RaceCard.jsx` — Race name, circuit, date, status badge (green COMPLETED / gray SCHEDULED). Click links to `/races/:id`. Red left border on COMPLETED. Hover lift.
- `frontend/src/components/races/RaceCardGrid.jsx` — 3-col grid (responsive: 3→2→1) of RaceCards
- `frontend/src/components/races/FilterBar.jsx` — Status filter: ALL | COMPLETED | SCHEDULED
- `frontend/src/components/races/PodiumDisplay.jsx` — 3 cards: P1 gold bg, P2 silver bg, P3 bronze bg. Driver name, team, points.
- `frontend/src/components/races/ResultsTable.jsx` — Table: Pos, Driver, Team, Grid, Status, Points. Uses <Table> component.
- `frontend/src/components/races/CountdownTimer.jsx` — Days/Hours/Minutes/Seconds countdown to race date
**Completion criteria**: All 6 components render with real/mock data

### Milestone 5.3 — AI feature components
**Files**:
- `frontend/src/components/ai/PredictTab.jsx` — Form (driver Select, circuit Select) + Predict Button → ModelOutputCard. States: input, loading (skeleton form left, skeleton result right), result, error.
- `frontend/src/components/ai/WhatIfTab.jsx` — Form (circuit Select, weather Select, tire Select, grid position Slider) + Simulate Button → comparison result. Before/after layout.
- `frontend/src/components/ai/ModelOutputCard.jsx` — Accent glass card. Win probability (large number), podium breakdown (P1-P4+ bars), ConfidenceRing, confidence label (High/Medium/Low).
- `frontend/src/components/ai/ConfidenceRing.jsx` — SVG circle, 120px, stroke 6px. Color: green (>70%) / amber (40-70%) / red (<40%). Stroke-dashoffset animation on mount, 500ms. `aria-valuenow`, `aria-valuetext`.
- `frontend/src/components/ai/ComparisonChart.jsx` — Simple bar comparison (before vs after) for What-If results
**Completion criteria**: All 5 components render; Prediction flow works end-to-end (form → API → result); What-If flow works end-to-end

---

## Phase 6: Page Assembly

### Milestone 6.1 — Dashboard page
**File**: `frontend/src/pages/Dashboard.jsx`
**Composition**: PageHeading + StatCardsRow + 2-col layout (StandingsChart left, NextRaceWidget right) + Recent Activity (optional)
**States**: loading (skeletons), empty (no data → "Sync season" CTA), error (retry), success
**Completion criteria**: Page renders with all data; empty state shows sync CTA; error state shows retry

### Milestone 6.2 — Drivers page
**File**: `frontend/src/pages/Drivers.jsx`
**Composition**: PageHeading + SearchInput + Table (columns: Pos, Code, Name, Team badge, Nationality flag, Points)
**States**: loading (skeleton rows), empty ("No drivers"), error, success
**Behavior**: Client-side search by name/team, sort by any column
**Completion criteria**: Table renders 22 drivers; search filters; sort works

### Milestone 6.3 — Races page
**File**: `frontend/src/pages/Races.jsx`
**Composition**: PageHeading + FilterBar + RaceCardGrid
**States**: loading (skeleton cards), empty ("No races"), error, success
**Behavior**: Filter by COMPLETED/SCHEDULED/ALL; click card → /races/:id
**Completion criteria**: 22 race cards render; filter works; click navigates to detail

### Milestone 6.4 — Race Details page (NEW)
**File**: `frontend/src/pages/RaceDetails.jsx`
**Composition**:
- PageHeading (race name, circuit, date, status badge)
- If COMPLETED: PodiumDisplay + ResultsTable
- If SCHEDULED: CountdownTimer + "Race hasn't started yet" message
- Back button to /races
**States**: loading (skeleton heading + podium + table), empty (invalid ID → "Race not found"), error (retry + back), success (COMPLETED or SCHEDULED variant)
**APIs**: `GET /api/races/{id}`, `GET /api/races/{id}/results`
**Completion criteria**: Both COMPLETED and SCHEDULED variants render correctly; data loads from API

### Milestone 6.5 — Constructors page
**File**: `frontend/src/pages/Constructors.jsx`
**Composition**: PageHeading + 3-col constructor card grid (responsive: 3→2→1)
**States**: loading (skeleton cards), empty, error, success
**Completion criteria**: Constructor cards render with team name, nationality, points

### Milestone 6.6 — AI Prediction page
**File**: `frontend/src/pages/AIPrediction.jsx`
**Composition**: PageHeading + TabBar (Predict | What-If) + active tab content
**States**: unauthenticated ("Login to access AI predictions" + Login CTA), loading, error, success
**Behavior**: Tab switch preserves form state; prediction calls `POST /api/ai/predict`; simulation calls `POST /api/ai/simulate`
**Bug fix**: Change `usePost("/ai/intelligence")` → `usePost("/ai/predict")` and update request body
**Completion criteria**: Both tabs work end-to-end; unauthenticated state shows login prompt

### Milestone 6.7 — Race Engineer page
**File**: `frontend/src/pages/RaceEngineer.jsx`
**Composition**: PageHeading + ChatHeader + MessageList (ChatBubble components) + TypingIndicator + ChatInput
**Restyling**: ChatBubble — user right-aligned (accent bg), bot left-aligned (glass bg + avatar). Timestamps. Scroll-to-bottom on new message.
**States**: initial (welcome message), loading (typing indicator), error (error bubble), success
**Completion criteria**: Chat UI works end-to-end; typing indicator shows during API call; messages scroll

### Milestone 6.8 — Profile page
**File**: `frontend/src/pages/Profile.jsx`
**Composition**: Avatar (initials circle) + username + email + Favorite Driver select (populated from drivers data) + prediction stats
**States**: loading (skeleton), error, success
**Behavior**: Save favorite driver via `PUT /api/user/profile`
**Completion criteria**: User data loads; favorite driver save works; stats display (or show "No predictions yet")

### Milestone 6.9 — Login + Register pages
**Files**: `frontend/src/pages/Login.jsx`, `frontend/src/pages/Register.jsx`
**Restyling**: design_system-compliant inputs, buttons, error states
**Changes**: Remove dead `/auth/google` call from Register
**States**: default (clean form), loading (spinner on button + disabled inputs), error (inline error message), success (redirect)
**Completion criteria**: Forms submit and authenticate; error messages display inline; redirect works

---

## Phase 7: Polish

### Milestone 7.1 — Recharts theming
**File**: `frontend/src/components/dashboard/StandingsChart.jsx` (and any other chart)
**Changes**:
- Chart background: transparent
- Grid lines: `rgba(37, 37, 53, 0.5)` (`--color-base-600` at 50%)
- Axis text: `var(--color-text-secondary)` / `#a0a0b8`
- Line color: `var(--color-accent-500)` / `#e31e1e`
- Tooltip: glass card style (`bg-[var(--color-glass-bg)]`, `backdrop-blur-xl`, `border-[var(--color-glass-border)]`)
- Fill gradient: accent-red to transparent
- Animation duration: 300ms
**Completion criteria**: All charts follow dark theme consistently

### Milestone 7.2 — Animation audit
**Check each animation**:
- Does it serve a purpose (state change, attention guide, speed/confidence)?
- Duration within approved range (micro: 150ms, normal: 250ms, slow: 350ms, cinematic: 500-800ms)?
- No animation on UI chrome >800ms?
- No parallax, particles, or decorative animation?
- `prefers-reduced-motion` respected?
- No more than 3 simultaneous animations?
**Completion criteria**: All animations pass audit; reduced-motion fallback works

### Milestone 7.3 — Responsive verification
**Test each page at**:
- Desktop ≥1024px — sidebar 240px, 3-4 col grids
- Tablet 768-1023px — sidebar 64px, 2 col grids
- Mobile <768px — sidebar hidden (hamburger), 1 col grids
**Check**: Card reflow, font sizing, touch targets (min 44px), sidebar overlay on mobile
**Completion criteria**: All pages render correctly at all 3 breakpoints

### Milestone 7.4 — Error state coverage
**Verify every page handles**:
- Loading state (skeleton or spinner)
- Empty state (icon + message + optional CTA)
- Error state (icon + message + retry button)
- Edge cases (invalid IDs, missing data, offline)
**Completion criteria**: No page shows broken UI on any state; all transitions are smooth

---

## Build Order Summary

```
Phase 0: API Fixes (0.1 → 0.2 → 0.3)
    ↓
Phase 1: Design Tokens (1.1 → 1.2)
    ↓
Phase 2: Layout & Nav (2.1 → 2.2)
    ↓
Phase 3: Core Components (3.1 → 3.11)
    ↓
Phase 4: Data Layer (4.1 → 4.2)
    ↓
Phase 5: Feature Components (5.1 → 5.2 → 5.3)
    ↓
Phase 6: Pages (6.1 → 6.2 → 6.3 → 6.4 → 6.5 → 6.6 → 6.7 → 6.8 → 6.9)
    ↓
Phase 7: Polish (7.1 → 7.2 → 7.3 → 7.4)
```
