# DeltaBox — Project Summary

> Generated: Stage 1A (Project Discovery & Design Intelligence) — foundation document for all frontend decisions.

---

## 1. Product Overview

**DeltaBox** is a production-grade F1 intelligence platform that combines historical race data, live standings, and machine learning (XGBoost + Random Forest ensemble) to deliver driver performance predictions, what-if simulations, and confidence-scored race forecasts. It is a personal portfolio project targeting senior/staff engineering roles.

### Core Features
- **Live Standings** — 2026 season driver/constructor standings from the Ergast API
- **Historical Data** — Full race calendar, results, and per-race telemetry (team, grid, position, status, laps)
- **AI Prediction Engine** — Ensemble ML model trained on 1,951 real F1 races (1950–2025); outputs win probability + 4-class podium prediction + inter-model agreement confidence score
- **What-If Simulator** — Adjust circuit type, weather, and tire compounds to see impact on driver projections
- **Race Engineer** — Conversational AI chat (powered by Groq/LLaMA-3) that answers F1 questions with context from the live database
- **Confidence Scoring** — Bar displayed beneath each prediction showing inter-model agreement (Low/Medium/High)

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8.0.4, Tailwind 3.4.3, Framer Motion 12.38, Recharts 3.8, Lucide React 1.7 |
| Backend | Spring Boot 3.2.5, Java 21, Spring Security + JWT, Spring Data JPA, PostgreSQL |
| ML Service | Python Flask microservice, scikit-learn, XGBoost, joblib |
| Database | PostgreSQL (production), H2 in-memory (dev — `create-drop`, seeds on startup) |
| Auth | Username/password + JWT tokens (stateless) |
| API | Reverse proxy: Spring Boot (`/api/*`) → Flask (`/api/ml/*`) |

### Architecture
```
React SPA (:5173) → Spring Boot API (:8080) → Flask ML (:5000)
                                       ↓
                                  PostgreSQL/H2
```

---

## 2. Current State of the Codebase

### Frontend (Running — Vite 8.0.4, port 5173)
- **12 routes**: Dashboard, Drivers, Races, RaceDetails, Constructors, AI Prediction, Race Engineer, Profile, Login, Register
- **Design**: Dark theme (`#0a0a0f` base, `#e31e1e` accent), glassmorphism cards, Inter + JetBrains Mono fonts, framer-motion page transitions
- **Charts**: Recharts area chart on Dashboard (standings over time), line chart on AI Prediction
- **Data layer**: Axios instance with JWT interceptor → `http://localhost:8080/api` base; service layer in `src/services/api.js`
- **State**: React hooks (useState/useEffect), no global state manager
- **Auth**: JWT stored in localStorage, interceptor auto-attaches token, 401 redirects to /login
- **Build**: `npm run build` completes in ~14.5s (under 15.5s threshold)
- **Known gaps**: Mobile UX incomplete, no loading substates on some pages, recharts tooltips unstyled, race details page not yet implemented

### Backend (Running — Spring Boot, port 8080)
- **14/14 tests passing**
- **H2 in-memory** with `create-drop` (data lost on restart, reseeded via sync endpoint)
- **JWT auth** with 24h expiration, no refresh tokens yet
- **Sync endpoint**: `POST /api/sync/season/2026` fetches from Ergast API, maps to DB models
- **Fixed**: `team: null` bug — SyncService now sets `driver.setTeam(mappedTeam.getName())`
- **No RBAC** — just `ROLE_USER` and `ROLE_ADMIN` via DB enum

### ML Service (Running — Flask, port 5000)
- Two models: `f1_winner_model.pkl` (XGBoost classifier, 10 classes) and `ensemble_model.pkl` (RF + XGBoost, 4-class podium)
- Confidence = inter-model agreement (both models predict same winner → High; one predicts winner, other predicts top-3 but not winner → Medium; disagree → Low)
- Models trained on 1,951 historical races with features: grid position, constructor, driver, round, season, average grid, previous season points, championship pressure, wet race flag
- No caching — each /predict call re-runs inference

---

## 3. Target Users

| Persona | Need | Emotional Goal |
|---------|------|---------------|
| **Die-hard F1 fan** | Deep race stats, driver comparisons, historical context for water-cooler debates | Feel informed, authoritative on F1 knowledge |
| **Fantasy F1 / betting player** | Win probability, confidence scoring, what-if scenarios for lineup decisions | Make data-driven picks, reduce uncertainty |
| **Portfolio evaluator (hiring manager)** | Assess code quality, UX polish, system design, deployment realism | Be impressed by production thinking |
| **Casual F1 viewer** | Quick standings check, race calendar, simple predictions without jargon | Understand quickly, feel included |
| **Student / learner** | Understand ML in sports, explore feature impact on predictions | Learn without being overwhelmed |

### Primary User Journey
1. Land on Dashboard — sees live standings, countdown to next race, key stats
2. Browse Drivers — sortable table with team, points, nationality
3. Browse Races — calendar with COMPLETED/SCHEDULED status, click for details
4. AI Prediction — select a driver + circuit, see win probability with confidence bar
5. What-If Simulator (future) — tweak parameters, re-run predictions
6. Race Engineer — ask F1 questions conversationally

---

## 4. UX Goals

| Goal | Definition |
|------|-----------|
| **Clarity** | Information is digestible at a glance — F1 fans scan, they don't read |
| **Data Density** | Present rich stats without clutter; use visual hierarchy, not text walls |
| **Confidence** | Predictions must communicate certainty honestly; never fake precision |
| **Speed** | Sub-second perceived load; skeleton states, no jarring layout shifts |
| **Immersion** | Dark atmospheric backdrop that evokes race-day tension, not gimmicks |
| **Professionalism** | Portfolio must demonstrate production-level fit and finish |

---

## 5. Design Direction

> Full specification lives in `design_system.txt` (highest-priority design document). This section summarizes key decisions.

### Aesthetic
Linear/Vercel dark minimalism + Mercedes AMG telemetry dashboard. Glassmorphism as a **supporting style** (subtle backdrop blur on data cards), never as primary aesthetic. Obsidian base, sharp typography, data-forward layouts. No white/light backgrounds anywhere.

### Color
- **Base (layered dark system)**: `#0a0a0f` (page base), `#0f0f17` (primary surface), `#16161f` (elevated surface/cards), `#1e1e2a` (raised surface/modals)
- **Accent**: `#e31e1e` (F1 red, primary actions, highlights), `#cc1e1e` (dark accent), `#ff2d2d` (hover)
- **Data colors**: `#3b82f6` (blue, reserved for data viz), `#10b981` (green), `#f59e0b` (amber), `#ef4444` (red), `#6b7280` (gray)
- **Text**: `#f8f8ff` (primary), `#a0a0b8` (secondary), `#606078` (tertiary/disabled)
- **Glass**: `rgba(255,255,255,0.03)` bg, `rgba(255,255,255,0.08)` border

### Typography
- **UI**: Inter (clean, sharp, modern — replaces Barlow Condensed)
- **Data/Monospace**: JetBrains Mono (for numbers, telemetry values, prediction percentages)
- **Headings**: Inter SemiBold 800–900 weight range
- **Scale**: 12 / 14 / 16 / 18 / 20 / 24 / 30 / 36 / 48 / 60

### Spacing & Layout
- **Base unit**: 4px / `0.25rem`
- **Page max width**: 1280px, centered
- **Sidebar**: 240px (expanded) → 64px (collapsed), dark glass surface
- **Content padding**: 24–32px
- **Card padding**: 20–24px
- **Gap scale**: 8 / 12 / 16 / 20 / 24 / 32 / 48

### Animation
- **Level 3** (expressive with restraint): meaningful motion only
- Page transitions: 300–400ms, `power3.out` easing
- Micro-interactions: 150–200ms, subtle (scale on hover, fade on appear)
- No animations >800ms on UI chrome
- No parallax, no particle systems, no confetti

### Glassmorphism Rules
- Only on data cards, stat panels, and sidebar
- `bg-black/40 backdrop-blur-xl border border-white/[0.06–0.10]`
- Never on interactive elements (buttons, inputs)
- Never combine glass with heavy text — use solid bg under text blocks

### Component Rules
- **Buttons**: Filled (red accent for primary, white/10 for secondary), Ghost (hover: white/10), no rounded-full, 8px radius
- **Cards**: Rounded-2xl (12px), subtle border, optional glass effect
- **Inputs**: Dark surface (`#1A1A1D`), border white/10, focus ring accent-red, 8px radius
- **Tables**: Row hover white/5, header white/60, sticky header
- **Badges**: Solid bg with 10% opacity accent, text accent, 6px radius
- **Modals**: Glass, centered, backdrop blur, scale-up entrance (300ms)

---

## 6. Frontend Rebuild Scope

### What stays (logic, not visuals)
- All component logic and state management patterns
- All API calls (`src/services/api.js`)
- Routing structure (`App.jsx`)
- Framer Motion (with refined timings)
- Recharts (with restyled tooltips/axes)
- Axios interceptor and auth flow
- Skeleton/loader components (redesigned visually)

### What gets replaced
- **Color palette** — current `#07080A`+`#E8002D` vars → design_system.txt tokens
- **Font**: Barlow Condensed → Inter (UI), DM Mono → JetBrains Mono (data)
- **Glass cards** — applied consistently per design_system rules (not everywhere)
- **Sidebar** — polished, premium, with subtle glass and refined icons
- **Dashboard** — redesigned with telemetry dashboard aesthetic; area chart refined
- **AI Prediction page** — confidence bar redesigned, forecast layout improved
- **Race Engineer** — chat bubble restyling, typing indicator refinement
- **Race Details page** (/races/:id) — build from scratch: race name, circuit, date, status, podium results if COMPLETED, countdown if SCHEDULED. Backend: GET /api/races/{raceId}, GET /api/races/{raceId}/results, GET /api/races/{raceId}/podium
- **What-If Simulator** — implement as a tab/section within the /ai page, not a separate route. Backend: POST /api/ai/simulate already working
- **Buttons/inputs/forms** — all replaced with design_system-compliant versions
- **Recharts theme** — dark background, white text, accent-red line, grid opacity reduced
- **Mobile responsive** — fully tested sidebar collapse, card grid reflow, font scaling

### What might be added
- **Empty/error states** — systematic coverage per design_system rules

---

## 7. Design Consistency Rules

1. **Token-first**: Every color, spacing, radius, shadow comes from design_system.txt. No hardcoded values. If it's not in the system, add it with rationale.
2. **design_system.txt prevails**: On any conflict between design_system.txt and any other document (README, PROJECT_CONTEXT, inline comments, or existing code), design_system.txt wins.
3. **No white backgrounds**: Ever. `#FFFFFF` only appears in text (`#f8f8ff` for primary). Surfaces use `#0a0a0f` or `#0f0f17`.
4. **Blue is for data only**: `#3b82f6` appears exclusively in charts, telemetry values, and data badges. Never in buttons, links, or UI chrome.
5. **F1 red is singular**: `#e31e1e` is the only accent color. It marks primary actions, active states, highlights, and the brand identity. Do not introduce secondary accents.
6. **Glass with purpose**: Glassmorphism (`backdrop-blur-xl`, `bg-black/40`, `border-white/[0.06–0.10]`) is a supporting style for data cards and stat panels only. Never on buttons, inputs, modals, or the page background.
7. **Typography hierarchy**: Inter for everything except inline numbers/telemetry (JetBrains Mono). Heading scale: 800–900 weight. Body: 400–500 weight. No mixing.
8. **Animation restraint**: Page transitions ≤400ms, micro-interactions ≤200ms, no UI chrome animation >800ms. No parallax, particles, or decorative animation.
9. **Data honesty**: Confidence scores communicate uncertainty directly. Never show a number without a label. Never truncate without indicator.
10. **Mobile-first** in implementation order: build responsive from the start, not as an afterthought. Sidebar collapses to 64px then hidden. Card grids reflow.

---

## 8. Current Implementation Status

| Page | Route | Status | Notes |
|------|-------|--------|-------|
| Dashboard | / | ✅ Live | Recharts area chart, stat cards, live clock, skeleton loaders |
| Drivers | /drivers | ✅ Live | Table with team/points/nationality, search |
| Races | /races | ✅ Live | Calendar grid, COMPLETED/SCHEDULED status |
| Race Details | /races/:id | 🔧 In rebuild scope | Route exists, page shows placeholder — build with podium, countdown, circuit info |
| Constructors | /constructors | ✅ Live | Team standings card grid |
| AI Prediction | /ai | ✅ Live | Model selection, prediction output, confidence bar |
| Race Engineer | /race-engineer | ✅ Live | Chat UI, Groq API integration |
| Profile | /profile | 🔒 Auth | User info display |
| Login | /login | ✅ Live | JWT auth form |
| Register | /register | ✅ Live | Registration form |

---

## 9. Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-12 | Full visual overhaul (not incremental) | Faster iteration, cleaner result, avoids debt accumulation |
| 2026-07-12 | design_system.txt as highest-priority design doc | Single source of truth prevents drift |
| 2026-07-12 | Linear/Vercel dark aesthetic + Mercedes telemetry feel | Differentiates from generic dark UIs; aligns with portfolio goals |
| 2026-07-12 | Inter replaces Barlow Condensed | Cleaner at all weights, better readability in data-dense layouts |
| 2026-07-12 | Glassmorphism supporting only | Prevents visual fatigue while retaining premium feel |
| 2026-07-12 | Keep React 19 + existing deps | Avoids migration risk; build already under 15.5s |
| 2026-07-12 | Confidence = inter-model agreement | More honest than variance-based; user can trust the signal |
| 2026-07-12 | team: null fix in SyncService | Root cause: Driver.java has String team, not JPA relationship; SyncService only set teamId |

---

## 10. Next Stages (from Master Prompt)

### Stage 1B — Frontend Architecture & Blueprint
Produces three documents:
- **FRONTEND_BLUEPRINT.md** — Component tree, data flow, page-by-page layout specifications, responsive breakpoints, route transitions
- **DESIGN_DECISIONS.md** — Rationale for every visual design choice (color assignments, typography shifts, animation levels, glass placement)
- **IMPLEMENTATION_SEQUENCE.md** — Ordered list of every component to build/modify, grouped by dependency, with estimated effort per item

### Stage 2 — Implementation & Iterative Development
Build each component per the implementation sequence. One page at a time. Rebuild, review, commit, repeat.

### Stage 3 — Production Readiness Audit
Final pass: accessibility, performance budget, responsive verification, animation polish, state coverage (loading, empty, error, edge cases)
