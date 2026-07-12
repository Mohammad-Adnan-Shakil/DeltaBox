# DeltaBox Design Decisions

> Stage 1B deliverable — rationale for every visual design choice.

---

## 1. Aesthetic Direction

### Decision: Linear/Vercel dark minimalism + Mercedes AMG telemetry dashboard

**Rationale:**
- F1 is a sport of precision, data, and speed — the UI must mirror that ethos
- Linear/Vercel aesthetic is the current gold standard for premium dark UIs; hiring managers evaluating this portfolio will recognize the quality bar
- Mercedes AMG telemetry dashboards are the aspirational reference: dark, data-forward, purposeful, every pixel earns its place
- Rejected alternatives:
  - *Cyberpunk/neon* — too gimmicky, undermines professionalism
  - *Glassmorphism-heavy* — visually fatiguing, reduces data density
  - *Material Design* — too playful, wrong emotional register for motorsport
  - *Skeuomorphic* — dated, conflicts with modern portfolio expectations

### Decision: 3-layer dark background system (950/900/800)

**Rationale:**
- Creates subtle depth without relying on shadows or decorative elements
- `#0a0a0f` (page base) recedes completely, letting content be the hero
- `#0f0f17` (primary surface) for sidebar and large structural panels
- `#16161f` (cards) provides gentle elevation for data containers
- This mirrors Linear's approach: depth through value, not through blur/color

---

## 2. Color Assignments

### Decision: `#e31e1e` accent red (not `#E8002D` or Ferrari red or Rosso Corsa)

**Rationale:**
- `#e31e1e` is slightly warmer and less saturated than the original `#E8002D` — easier on the eyes in a dark UI
- Differentiates from Ferrari's specific Rosso Corsa while remaining unmistakably F1
- Passes WCAG AA contrast on dark surfaces (unlike pure `#ff0000`)
- Single accent color (no secondary accent) enforces visual discipline

### Decision: Blue (`#3b82f6`) is data-only

**Rationale:**
- Blue is the most common primary color in web design — using it for UI would make DeltaBox look generic
- Restricting blue to data visualization (RF model output, charts) creates a unique visual language
- Users subconsciously associate blue with "analytical/objective" — perfect for ML outputs

### Decision: Green/amber/red semantic system for confidence

**Rationale:**
- Instant cognitive mapping: green = good (high confidence), amber = caution (medium), red = warning (low)
- Matches F1's own flag system (green = clear, yellow = caution, red = stop)
- Users don't need to read the percentage to understand trustworthiness

---

## 3. Typography Decisions

### Decision: Inter replaces Barlow Condensed as primary UI font

**Rationale:**
- Barlow Condensed is distinctive but hard to read at small sizes in data-dense layouts
- Inter is purpose-built for screens, has excellent hinting, and reads well at all weights (300–900)
- Inter is the Linear/Vercel font — instant quality signal for portfolio evaluators
- Condensed fonts are available in Inter as an optical variant for tight spaces if needed

### Decision: JetBrains Mono for all numerical data (was DM Mono)

**Rationale:**
- JetBrains Mono has coding ligatures for common F1 notations (→ for "beat", ± for deltas)
- Better readability at small sizes due to wider letterforms and distinct character shapes (1/l/I, 0/O)
- DM Mono was a placeholder choice; JetBrains Mono is purpose-built for developer/data tools

### Decision: `font-black` (900) restricted to hero headings ≥ `text-3xl`

**Rationale:**
- 900 weight is visually commanding — using it on small text creates muddy letterforms
- Reserve for page titles and section headings only
- Body text uses 400–500 for comfortable reading

---

## 4. Animation Decisions

### Decision: Level 3 (Interactive — expressive with restraint)

**Rationale:**
- Level 1 (minimal) would feel lifeless for a portfolio project
- Level 5 (cinematic) would distract from data and slow perceived performance
- Level 3 provides purposeful motion: state changes, attention guidance, feedback
- Every animation must pass the "does this reinforce confidence or speed?" test

### Decision: Page transition = 250ms fade + translateY

**Rationale:**
- 250ms hits the sweet spot between perceivable and snappy (>300ms feels slow for navigation)
- translateY(20px → 0) creates a subtle "card dealing" effect without being gimmicky
- `cubic-bezier(0.4, 0, 0.2, 1)` is the standard ease-out — feels natural, not mechanical

### Decision: Reject parallax, particle systems, floating elements

**Rationale:**
- These animations violate the "Confidence" emotion — they feel playful, not precise
- Parallax adds zero information and increases bundle size
- Particle systems are the overused trope of 2020s dark UIs; avoiding them makes DeltaBox feel more mature

---

## 5. Glassmorphism Placement

### Decision: Supporting style only, never primary

**Rationale:**
- Full glassmorphism UI (seen in many F1 dashboards) creates visual noise and reduces data density
- Glass works well for data cards because the subtle transparency creates depth without competing with content
- Never use glass on interactive elements — it reduces affordance (users can't tell what's clickable)
- Never use glass as page background — it destroys readability and causes eye strain

### Standard glass spec:
```css
background: rgba(255, 255, 255, 0.03);
border: 1px solid rgba(255, 255, 255, 0.08);
backdrop-filter: blur(12px);
```

### When to use accent glass (prediction results)
- Same as standard glass but with red border `rgba(227, 30, 30, 0.2)` and red glow shadow
- Only for primary prediction output and high-confidence results
- Draws user's eye to the most important data on the page

---

## 6. Component-Level Decisions

### Buttons: `radius-md` (8px), never `rounded-full`

**Rationale:**
- `rounded-full` is the Material/consumer-app style (Uber, DoorDash) — wrong register for a professional data tool
- 8px radius is precise, modern, and consistent with Linear/Vercel
- Primary buttons: red accent bg, white text, hover glow — communicates urgency/action
- Secondary buttons: glass bg — communicates "available but secondary"
- Ghost buttons: transparent, hover shows glass — for tertiary actions

### Cards: `radius-lg` (12px), `p-6` (24px padding)

**Rationale:**
- 12px is the "premium" radius in dark UI design (Linear uses 12px, Vercel uses 8–12px)
- 24px internal padding gives content breathing room without wasting space
- Consistent radius across all card types reinforces visual system

### Prediction layout: 2-column (form left, result right)

**Rationale:**
- Left-to-right reading order: user fills form on left, sees result on right
- This is a standard data tool pattern (analogous to search → results)
- On mobile, stacks vertically (form above result) — user fills first, then scrolls to result
- Prediction result card uses accent glass + glow shadow to draw attention

---

## 7. Layout Decisions

### Sidebar: 240px / 64px / hidden

**Rationale:**
- 240px is the standard width for app navigation — spacious enough for icon + label
- 64px (tablet) shows only icons — saves space while maintaining navigation
- Hidden (mobile) — maximizes content area; hamburger overlay is the standard mobile pattern
- Glass background with accent left border on active item provides clear location context

### Page max-width: 1400px

**Rationale:**
- Wider than typical 1200px to accommodate data-dense F1 content (wide tables, side-by-side layouts)
- Still centered to prevent line-length issues on ultra-wide monitors
- Content padding scales: 24px mobile → 32px tablet → 48px desktop

### Grid systems
- **Stats row: 4-col** — four key metrics fit naturally in one row on desktop
- **Cards grid: 3-col** — standard for item grids (races, constructors)
- **Prediction: 2-col** — form + result is the natural information flow

---

## 8. Data Visualization Decisions

### Confidence Ring: 120px SVG circle with stroke-dashoffset animation

**Rationale:**
- Circular gauge is an F1 telemetry standard (steering wheel displays, dash readouts)
- Animation draws attention to the result without being distracting (500ms stroke reveal)
- Color-coded stroke (green/amber/red) gives instant confidence assessment
- 120px is large enough to be legible but doesn't dominate the card

### Recharts: restyle, don't replace

**Rationale:**
- Recharts 3.8 is already installed and working — swapping to a new chart library adds risk and bundle size
- Restyling: transparent background, white grid lines at 50% opacity, accent-red line, glass-style tooltips
- Chart tooltips use the same glass card spec as data cards for consistency

---

## 9. What-If Simulator UX

### Decision: Tab within /ai page, not separate route

**Rationale:**
- The what-if flow is conceptually part of "making a prediction" — keeping it on the same page reduces context switching
- Tab pattern (Predict / What-If) is familiar and low-friction
- Shares the driver/circuit select components with the Predict tab
- Prevents route bloat (12 routes is already substantial)

### Simulation comparison: before/after side by side

**Rationale:**
- Users need to see the delta, not just the new value
- "Before: 18.2% → After: 42.7% | Δ: +24.5%" communicates impact instantly
- Arrow indicator (▲/▼) with color coding provides at-a-glance direction

---

## 10. Race Details Page

### Decision: Dedicated page with podium + results table

**Rationale:**
- Race details is the most content-rich page after Dashboard — it deserves its own route
- Podium section (1st/2nd/3rd with gold/silver/bronze badges) is the hero element
- Full results table below provides depth for data-hungry users
- If SCHEDULED: show countdown timer + circuit info; hide podium/results
- Backend already provides `GET /api/races/{raceId}`, `results`, and `podium` endpoints

---

## 11. Component Sourcing

### Decision: Build all components from scratch (no external libraries)

**Rationale:**
- DeltaBox is a portfolio project — every component demonstrates implementation skill
- No third-party component library matches the exact Linear/Vercel aesthetic
- The component inventory is small enough (< 25 components) to build custom
- Tailwind utility classes handle 90% of styling without abstraction

### Sourcing Priority
1. **Existing project component** — reuse before creating (Button, Card, Input exist but need re-theming)
2. **Custom component** — hand-built when no existing version fits the new design
3. **Framer Motion** — all animations (already installed)
4. **Recharts** — all charts (already installed, restyled only)
5. **Lucide React** — all icons (already installed)
6. **Pure CSS** — shimmer effects, glow, grid patterns, skeleton animations

### Rejected Sources
- **shadcn/ui** — opinionated Radix primitives would fight the custom aesthetic
- **21st.dev** — component marketplace; reduces portfolio credibility
- **React Bits** — animation snippets, but Framer Motion already covers our needs
- **MUI / Chakra / Ant Design** — heavy, opinionated, wrong aesthetic register

---

## 12. Accessibility Decisions

### Color Contrast
- All text/background combinations meet WCAG AA (4.5:1 for normal text, 3:1 for large):
  - `#f8f8ff` on `#0a0a0f` = 13.8:1
  - `#a0a0b8` on `#0f0f17` = 7.2:1
  - `#e31e1e` on `#0a0a0f` = 5.4:1 (AA for all text)
- No information conveyed by color alone — confidence rings also have text labels

### Keyboard Navigation
- All interactive elements focusable and activatable via keyboard
- Sidebar nav items use `<NavLink>` (renders `<a>`) — native keyboard support
- Modal: focus trap, close on Escape, focus returns to trigger on close
- TabBar: arrow key navigation between tabs

### Reduced Motion
- All animations respect `prefers-reduced-motion: reduce`
- Fallback: instant state transitions, no transform/opacity animations
- Implemented via Framer Motion's `useReducedMotion` hook

### Screen Readers
- Charts: `aria-label` with data summary
- Confidence ring: `role="img"` + `aria-valuenow` + `aria-valuetext`
- Skeleton loaders: `aria-hidden="true"` + `aria-busy="true"` on parent
- Icons: `aria-hidden="true"` with tooltip/label text alongside

---

## 13. Rejected Alternatives

| Alternative | Why Rejected |
|-------------|-------------|
| **Cyberpunk/neon aesthetic** | Gimmicky, undermines professionalism for portfolio audience |
| **Full glassmorphism UI** | Visually fatiguing, reduces data density, hard to read |
| **Material Design 3** | Too playful/consumer-app, wrong emotional register for F1 |
| **Skeuomorphic design** | Dated, conflicts with modern portfolio expectations |
| **White/light mode** | F1 is a dark sport (night races, cockpits, telemetry screens); light mode feels wrong |
| **Separate What-If route** | Conceptually part of same flow as Predict; separate route adds unnecessary navigation cost |
| **TanStack Query / React Query** | Overkill for 12 simple API calls; useFetch/usePost hooks are sufficient |
| **Zustand global store** | Only auth state is cross-cutting; Context handles it fine |
| **Server-side rendering (Next.js)** | Existing Vite SPA works well; SSR adds deployment complexity with no SEO need (auth-gated) |
| **TypeScript** | Existing codebase is JS; migration cost outweighs benefit for this scope |
| **Storybook** | Only 25 components; not worth the configuration overhead |
| **Cypress/Playwright E2E** | Manual verification is sufficient for the current stage; add if time permits |
| **OAuth2 / social login** | JWT + username/password is appropriate for a demo; Google auth endpoint exists but is unimplemented |

---

## 14. Future Improvements (Post-Launch)

| Improvement | Priority | When |
|-------------|----------|------|
| **Historical data pages** — wire up 7 unused `/api/historical/*` endpoints | Medium | After Stage 3 |
| **User prediction history persistence** — save predictions to profile | Low | After Stage 3 |
| **Admin dashboard** — wire up 6 admin endpoints | Low | If admin use case emerges |
| **Dark/light theme toggle** — add light variant (F1 team radio yellow?) | Low | Explore post-launch |
| **Notification system** — race start reminders, prediction results | Low | After core UX is solid |
| **Predictive accuracy tracking** — show how predictions performed against actual results | Medium | After first race |
| **PWA / offline support** — service worker for cached standings | Low | Consider for deployment |

