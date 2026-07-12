# DeltaBox Frontend Blueprint

> Stage 1B — Complete architecture document. Foundation for Stage 2 implementation.

---

## 1. API Surface

### Public Endpoints (no auth required)

| Method | Route | Purpose | Request | Response | Page Consumer | Component Consumer |
|--------|-------|---------|---------|----------|--------------|--------------------|
| GET | `/api/drivers` | All 2026 drivers, sorted by points DESC | — | `List<Driver>` (id, name, code, team, nationality, points, season, driverId) | Drivers, AI Prediction, Profile, Dashboard | DriversTable, PredictionForm, StatCard, AuthContext (preload) |
| GET | `/api/races` | All 2026 races, deduplicated, sorted by round | — | `List<Race>` (id, name, circuit, date, time, round, season, status: COMPUTED/SCHEDULED) | Races, AI Prediction, Dashboard | RaceCardGrid, RaceCard, PredictionForm |
| GET | `/api/races/{raceId}` | Single race by ID | path: raceId | `Race` (id, name, circuit, date, time, round, season, status) | RaceDetails | — |
| GET | `/api/races/{raceId}/results` | Top-3 podium for a race | path: raceId | `List<PodiumDriverDTO>` (position, driverName, teamName, points, nationality, driverCode) | RaceDetails, Races | PodiumDisplay, RaceResultModal |
| GET | `/api/races/{raceId}/podium` | Alias for /results (delegates) | path: raceId | same as /results | — | — |
| GET | `/api/constructors` | All 2026 constructors/teams | — | `List<Team>` (id, name, nationality, points, season) | Constructors | ConstructorCardGrid, ConstructorCard |
| GET | `/api/historical/seasons` | All F1 seasons (Ergast + DB) | — | `List<Map>` ({year, id}) | — (unused) | — |
| GET | `/api/historical/season/{year}` | Races for a historical season | path: year | `Map` ({season, races, raceCount}) | — (unused) | — |
| GET | `/api/historical/driver/{code}/career` | Driver career stats | path: driverCode | `Map` ({driver, careerStats, results}) | — (unused) | — |
| GET | `/api/historical/circuit/{name}/history` | Circuit race history | path: circuitName | `Map` ({circuitName, races, raceCount}) | — (unused) | — |
| GET | `/api/historical/champions` | All F1 world champions | — | `List<Map>` (champion data) | — (unused) | — |
| GET | `/api/historical/records` | All-time F1 records | — | `Map` (mostWins, mostPoles, etc.) | — (unused) | — |
| GET | `/api/historical/driver/{year}/{code}/season` | Driver stats for a season | path: year, driverCode | `Map` ({year, driver, raceCount, wins, podiums, results}) | — (unused) | — |
| GET | `/api/health` | Health check | — | `Map` ({status, service, profile}) | — (unused) | — |
| POST | `/api/auth/login` | Authenticate and get JWT | `{email, password}` | `AuthResponse` (token, user) | Login | LoginForm |
| POST | `/api/auth/register` | Register new account | `{username, email, password}` | `AuthResponse` (token, user) | Register | RegisterForm |

### Authenticated Endpoints (JWT required)

| Method | Route | Purpose | Request | Response | Page Consumer | Component Consumer |
|--------|-------|---------|---------|----------|--------------|--------------------|
| GET | `/api/user/me` | Current user data | — | `ApiResponse<UserResponse>` | Profile, AuthContext | AuthProvider (on mount) |
| GET | `/api/user/profile` | Current user profile | — | `ApiResponse<UserResponse>` | Profile | ProfilePage |
| PUT | `/api/user/profile` | Update favorite driver | `{favoriteDriver}` | `ApiResponse<UserResponse>` | Profile | ProfilePage |
| POST | `/api/ai/predict` | Predict race outcome for a driver | `{driverId, raceId, simulatedPosition}` | `ApiResponse<PredictionResponseDTO>` (winProb, podiumProbs, confidence) | AI Prediction | PredictTab |
| POST | `/api/ai/simulate` | What-if simulation | `SimulationRequestDTO` | `ApiResponse<SimulationResponseDTO>` (before/after comparison) | AI Prediction | WhatIfTab |
| GET | `/api/ai/driver-intelligence/{driverId}` | AI driver intelligence report | path: driverId | `DriverIntelligenceResponse` | — (unused) | — |
| GET | `/api/ai/model-metrics` | ML model performance metrics | — | `Map` (metrics JSON) | — (unused) | — |
| POST | `/api/ai/compare` | Compare two drivers | `{driverAId, driverBId, gridA, gridB, raceId}` | `DriverComparisonResponse` | — (unused) | — |
| POST | `/api/race-engineer/ask` | Chat with AI race engineer | `{lap, totalLaps, position, gapToLeader, tyreCompound, tyreAge, fuelLoad, weather, lastLapTime, driverMessage}` | `Map` ({response}) | Race Engineer | ChatInput → MessageList |

### Admin Endpoints (ADMIN role required)

| Method | Route | Purpose | Page Consumer |
|--------|-------|---------|--------------|
| GET | `/api/admin/users` | List all users (paginated) | — (unused) |
| POST | `/api/admin/cleanup-duplicates` | Remove duplicate drivers | — (unused) |
| POST | `/api/admin/ingest/historical` | Trigger async historical ingestion | — (unused) |
| POST | `/api/admin/ingest/year/{year}` | Ingest single season | — (unused) |
| GET | `/api/admin/ingest/status` | Ingestion status | — (unused) |
| GET | `/api/admin/ingest/progress/{jobId}` | Job progress | — (unused) |

### Critical Issues Found During Audit

1. **`POST /api/ai/intelligence`** in `AIPage.jsx:98` — dead endpoint. No backend handler exists. Should be `POST /api/ai/predict`.
2. **`POST /api/auth/google`** in `Register.jsx:65` — dead endpoint. `GoogleAuthRequest` DTO exists but no controller route. Remove or implement.
3. **`/api/user/me` vs `/api/user/profile`** — duplicate. Migrate all consumers to `/me`, remove `/profile` GET.
4. **Historical + Admin endpoints**: 13 public historical + 6 admin endpoints exist with zero frontend consumers. Outside current rebuild scope but documented for future.

---

## 2. Screen Inventory

### 2.1 Dashboard (`/`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | At-a-glance overview of the 2026 F1 season key metrics |
| **User Goal** | Quickly understand current standings, next race, and prediction activity |
| **Auth** | Public (no login required) |
| **Entry Points** | Logo click, nav "Dashboard" link, redirect after login |
| **Exit Points** | Any nav link, browser back |
| **Loading State** | 4× skeleton stat cards + skeleton chart area (500ms shimmer) |
| **Empty State** | "No data loaded yet. Sync the season to get started." + sync CTA button |
| **Error State** | "Failed to load dashboard data" + retry button |
| **Success State** | 4 stat cards with animated counts, standings area chart, next race widget, recent activity |
| **Required Data** | `GET /api/drivers` (count, top points), `GET /api/races` (next race, total count) |
| **APIs Used** | `GET /api/drivers`, `GET /api/races` |
| **Edge Cases** | Off-season (no next race → "Season Complete" state); zero data after deploy |
| **Refresh** | Manual refresh button in header; auto-refresh on mount |

### 2.2 Drivers (`/drivers`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Browse and search all 2026 F1 drivers with standings |
| **User Goal** | Find driver details, compare points, filter by team |
| **Auth** | Public |
| **Entry Points** | Nav "Drivers" link |
| **Exit Points** | Any nav link |
| **Loading State** | Skeleton table rows (10 rows with shimmer) |
| **Empty State** | "No drivers loaded for the 2026 season." |
| **Error State** | "Failed to load drivers" + retry |
| **Success State** | Sortable table: Pos, Name, Code, Team, Nationality, Points. Search box. |
| **Required Data** | `GET /api/drivers` |
| **APIs Used** | `GET /api/drivers` |
| **Edge Cases** | 0 drivers returned, duplicate entries, missing nationality flags |
| **Sort/Search** | Client-side filtering by name/team; sortable columns (points, name, team) |

### 2.3 Races (`/races`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | 2026 race calendar browser |
| **User Goal** | See upcoming races, results of completed races |
| **Auth** | Public |
| **Entry Points** | Nav "Races" link |
| **Exit Points** | Click race card → `/races/:id` |
| **Loading State** | 6× skeleton race cards in 3×2 grid |
| **Empty State** | "No races scheduled for the 2026 season." |
| **Error State** | "Failed to load race calendar" + retry |
| **Success State** | Card grid: race name, circuit, date, status badge (COMPLETED green / SCHEDULED gray), click for details |
| **Required Data** | `GET /api/races` |
| **APIs Used** | `GET /api/races` |
| **Edge Cases** | Race delay/rescheduling, mid-season data sync |
| **Filter** | By status: ALL | COMPLETED | SCHEDULED |

### 2.4 Race Details (`/races/:id`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Deep-dive into a single race |
| **User Goal** | See full results, podium, circuit info, countdown |
| **Auth** | Public |
| **Entry Points** | Click race card on Races page, direct link |
| **Exit Points** | Back to Races, nav link |
| **Loading State** | Skeleton heading + skeleton podium (3 cards) + skeleton table |
| **Empty State** | "Race data not found." (only on invalid ID) |
| **Error State** | "Failed to load race details" + retry + back button |
| **Success State (COMPLETED)** | Race name + circuit + date, green COMPLETED badge, podium display (gold/silver/bronze), full results table |
| **Success State (SCHEDULED)** | Race name + circuit + date, gray SCHEDULED badge, countdown timer, "No results yet — race hasn't started" message |
| **Required Data** | `GET /api/races/{id}`, `GET /api/races/{id}/results` |
| **APIs Used** | `GET /api/races/{id}`, `GET /api/races/{id}/results` |
| **Edge Cases** | Invalid race ID, partial data (race exists but no results), race abandoned/not finished |

### 2.5 Constructors (`/constructors`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | 2026 constructor/team standings |
| **User Goal** | See team rankings, points, nationality |
| **Auth** | Public |
| **Entry Points** | Nav "Constructors" link |
| **Exit Points** | Any nav link |
| **Loading State** | 3× skeleton constructor cards |
| **Empty State** | "No constructor data for the 2026 season." |
| **Error State** | "Failed to load constructors" + retry |
| **Success State** | Card grid: team name, nationality flag, total points, ranking position |
| **Required Data** | `GET /api/constructors` |
| **APIs Used** | `GET /api/constructors` |

### 2.6 AI Prediction (`/ai`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | ML-powered race predictions and what-if simulations |
| **User Goal** | Get win probability for a driver at a circuit; simulate different conditions |
| **Auth** | Required (login to use AI features) |
| **Entry Points** | Nav "AI" link |
| **Exit Points** | Any nav link |
| **Loading State (Predict)** | Skeleton form left, skeleton result card right with pulsing confidence ring |
| **Loading State (What-If)** | Skeleton form left, skeleton comparison right |
| **Empty State** | "Login to access AI predictions" (if unauthenticated) |
| **Error State** | "Prediction failed. Check that driver and race data is loaded." + retry |
| **Success State (Predict)** | Tab "Predict" active: form (driver select, circuit select) → result (win probability %, podium breakdown bars, confidence ring with label) |
| **Success State (What-If)** | Tab "What-If" active: form (circuit, weather, tire, grid position slider) → result (before/after comparison, delta indicator) |
| **Required Data** | `GET /api/drivers` (for select), `GET /api/races` (for select), `POST /api/ai/predict`, `POST /api/ai/simulate` |
| **APIs Used** | `GET /api/drivers`, `GET /api/races`, `POST /api/ai/predict`, `POST /api/ai/simulate` |
| **Edge Cases** | ML service down (Flask not running), missing model files, driver not in model training set |
| **Bug to Fix** | Currently calls dead endpoint `POST /api/ai/intelligence` — must change to `POST /api/ai/predict` |

### 2.7 Race Engineer (`/race-engineer`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | Conversational AI assistant for F1 strategy questions |
| **User Goal** | Ask race strategy questions, get data-driven advice |
| **Auth** | Required |
| **Entry Points** | Nav "Race Engineer" link |
| **Exit Points** | Any nav link |
| **Loading State** | Chat history fade + typing indicator (animated dots) appearing |
| **Empty State** | Welcome message from bot: "I'm your race engineer. Ask me anything about F1 strategy, circuits, or the current season." |
| **Error State** | "Failed to get response. Please try again." + message bubble with error styling |
| **Success State** | Chat bubble thread: user messages right-aligned, bot messages left-aligned with avatar, scroll to latest |
| **Required Data** | User messages (state), bot responses from `POST /api/race-engineer/ask` |
| **APIs Used** | `POST /api/race-engineer/ask` |
| **Edge Cases** | Groq API down, empty message submit, very long messages, context window exceeded |

### 2.8 Profile (`/profile`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | View and edit user profile |
| **User Goal** | See account info, set favorite driver, view prediction stats |
| **Auth** | Required |
| **Entry Points** | Sidebar user menu → Profile, redirect after register |
| **Exit Points** | Any nav link |
| **Loading State** | Skeleton avatar + skeleton form fields |
| **Empty State** | "Profile data not found." (rare — user doesn't exist) |
| **Error State** | "Failed to load profile" + retry |
| **Success State** | Avatar (initials), username, email, favorite driver selector, prediction stats (count, accuracy %) |
| **Required Data** | `GET /api/user/me`, `GET /api/drivers` (for favorite driver dropdown) |
| **APIs Used** | `GET /api/user/me`, `PUT /api/user/profile`, `GET /api/drivers` |
| **Edge Cases** | No drivers loaded yet (can't select favorite), username change not supported |

### 2.9 Login (`/login`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | User authentication |
| **User Goal** | Sign in to access AI features |
| **Auth** | Public (redirect to Dashboard if already logged in) |
| **Entry Points** | Nav "Login" link, 401 redirect from any protected route |
| **Exit Points** | Successful login → redirect to previous page or `/` |
| **Loading State** | Button shows spinner, inputs disabled |
| **Empty State** | Clean form: email input, password input, login button |
| **Error State** | "Invalid credentials" inline error, "Network error" toast |
| **Success State** | Redirect to Dashboard |
| **Required Data** | `POST /api/auth/login` |
| **APIs Used** | `POST /api/auth/login` |

### 2.10 Register (`/register`)

| Aspect | Detail |
|--------|--------|
| **Purpose** | New user account creation |
| **User Goal** | Create account to access AI features |
| **Auth** | Public (redirect if already logged in) |
| **Entry Points** | Nav "Register" link, "Create account" link from Login |
| **Exit Points** | Successful registration → redirect to Dashboard |
| **Loading State** | Button shows spinner, inputs disabled |
| **Empty State** | Clean form: username, email, password, confirm password, register button |
| **Error State** | "Username already taken" inline error, "Email already registered" inline error, network error toast |
| **Success State** | Redirect to Dashboard (auto-logged in) |
| **Required Data** | `POST /api/auth/register` |
| **APIs Used** | `POST /api/auth/register` |
| **Bug to Fix** | Remove `POST /api/auth/google` call (dead endpoint) |

---

## 3. Component Architecture

### 3.1 Layout Components

| Component | Purpose | Props | Variants | States |
|-----------|---------|-------|----------|--------|
| `MainLayout` | Page shell with sidebar + content | `children` | — | — |
| `Sidebar` | Navigation sidebar | `collapsed: boolean`, `onToggle: fn` | Expanded (240px), Collapsed (64px), Mobile (hidden + overlay) | Active item highlighted |
| `MobileTopBar` | Top navigation bar on mobile | `onMenuToggle: fn` | — | — |

### 3.2 Navigation Components

| Component | Purpose | Props | Variants | States |
|-----------|---------|-------|----------|--------|
| `NavItem` | Single nav link | `to: string`, `icon: LucideIcon`, `label: string`, `active: boolean`, `collapsed: boolean` | — | Active, hover, collapsed |

### 3.3 Input Components

| Component | Purpose | Props | Variants | States |
|-----------|---------|-------|----------|--------|
| `Input` | Text input | `value`, `onChange`, `placeholder`, `type`, `error: string`, `disabled`, `label` | Default, error | Focus, disabled, error |
| `Select` | Dropdown select | `value`, `onChange`, `options: [{value, label}]`, `placeholder`, `disabled` | Default, error | Focus, disabled, error |
| `SearchInput` | Search with icon | `value`, `onChange`, `placeholder` | — | Focus, empty |

### 3.4 Button Components

| Component | Purpose | Props | Variants | States |
|-----------|---------|-------|----------|--------|
| `Button` | Action trigger | `children`, `onClick`, `type`, `disabled`, `loading`, `icon`, `size: 'sm'/'md'/'lg'` | Primary (red), Secondary (glass), Ghost, Danger | Default, hover, active, disabled, loading |

### 3.5 Card Components

| Component | Purpose | Props | Variants | States |
|-----------|---------|-------|----------|--------|
| `Card` | Generic content container | `children`, `className`, `hoverable: boolean`, `accent: boolean` | Default (glass), Accent (red border + glow) | Hover (lift) |
| `StatCard` | KPI display | `label: string`, `value: number/string`, `icon: LucideIcon`, `trend: 'up'/'down'/null`, `loading: boolean` | — | Loading (skeleton), hover |
| `RaceCard` | Race calendar card | `race: Race`, `onClick: fn` | — | Hover (lift) |
| `ConstructorCard` | Team standings card | `team: Team` | — | Hover (lift) |

### 3.6 Data Display Components

| Component | Purpose | Props | Variants | States |
|-----------|---------|-------|----------|--------|
| `Badge` | Status/tag indicator | `children`, `variant: 'completed'/'scheduled'/'p1'/'p2'/'p3'/'default'` | Per variant (color-coded) | — |
| `Table` | Data table | `columns: [{key, label, sortable}]`, `data: any[]`, `sortKey`, `sortDir`, `onSort`, `loading`, `emptyMessage` | — | Loading (skeleton rows), empty, sorted |
| `PodiumDisplay` | 1st/2nd/3rd cards | `results: PodiumDriverDTO[]` | — | Loading (skeleton), empty |
| `ResultsTable` | Full race results | `results: PodiumDriverDTO[]` | — | Loading, empty |
| `ConfidenceRing` | SVG confidence indicator | `value: number (0-100)`, `size: number`, `label: string` | High (green), Medium (amber), Low (red) | Animating (stroke reveal) |

### 3.7 Feedback Components

| Component | Purpose | Props | Variants | States |
|-----------|---------|-------|----------|--------|
| `Skeleton` | Loading placeholder | `className`, `variant: 'text'/'card'/'table-row'/'circle'` | Per variant | — |
| `Loader` | Full-area loading spinner | `size: 'sm'/'md'/'lg'`, `label: string` | — | — |
| `StateViews` | Empty/error state display | `type: 'empty'/'error'`, `message: string`, `action: {label, onClick}` | Empty, Error | — |

### 3.8 Overlay Components

| Component | Purpose | Props | Variants | States |
|-----------|---------|-------|----------|--------|
| `Modal` | Dialog overlay | `open: boolean`, `onClose: fn`, `title: string`, `children` | — | Open (scale in), closed |
| `TabBar` | Tab navigation | `tabs: [{key, label}]`, `active: string`, `onChange: fn` | — | Active tab underlined |

### 3.9 Feature Components (AI)

| Component | Purpose | Props | Variants | States |
|-----------|---------|-------|----------|--------|
| `PredictTab` | Prediction form + result | `drivers: Driver[]`, `races: Race[]` | — | Input, loading, result, error |
| `WhatIfTab` | Simulation form + comparison | `drivers: Driver[]`, `races: Race[]` | — | Input, loading, result, error |
| `ModelOutputCard` | Prediction result display | `prediction: PredictionResponse` | — | Loading (pulsing ring), result |
| `ChatBubble` | Single chat message | `message: string`, `role: 'user'/'bot'`, `timestamp: Date` | User (right), Bot (left + avatar) | — |
| `TypingIndicator` | Bot typing animation | — | — | Animated (dots) |

### 3.10 Dashboard Feature Components

| Component | Purpose | Props | Variants | States |
|-----------|---------|-------|----------|--------|
| `StandingsChart` | Recharts area chart | `drivers: Driver[]` | — | Loading (skeleton chart), data |
| `NextRaceWidget` | Upcoming race card | `race: Race` | COMPLETED (hide), SCHEDULED (show countdown) | Countdown ticking |

### 3.11 Component Sourcing Priority

1. **Existing project component** — reuse before creating
2. **Custom component** — hand-built when no source fits
3. **Framer Motion** — all animations
4. **Recharts** — all charts (restyled, not replaced)
5. **Lucide React** — all icons (already installed)
6. **Pure CSS** — shimmer, glow effects, grid patterns

No external component libraries (21st.dev, React Bits, shadcn) — this project builds from scratch for portfolio demonstration.

---

## 4. Folder Structure

```
src/
├── main.jsx
├── App.jsx
├── index.css                      ← design tokens + Tailwind
│
├── providers/
│   └── AuthProvider.jsx           ← React.Context: user, token, login, logout
│
├── layout/
│   ├── MainLayout.jsx             ← Sidebar + <AnimatePresence> <Outlet>
│   └── Sidebar.jsx                ← NavItems + UserMenu
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Drivers.jsx
│   ├── Races.jsx
│   ├── RaceDetails.jsx
│   ├── Constructors.jsx
│   ├── AIPrediction.jsx
│   ├── RaceEngineer.jsx
│   ├── Profile.jsx
│   ├── Login.jsx
│   └── Register.jsx
│
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── SearchInput.jsx
│   │   ├── Modal.jsx
│   │   ├── Badge.jsx
│   │   ├── StatCard.jsx
│   │   ├── Skeleton.jsx
│   │   ├── Loader.jsx
│   │   ├── StateViews.jsx
│   │   ├── Table.jsx
│   │   └── TabBar.jsx
│   │
│   ├── dashboard/
│   │   ├── StandingsChart.jsx
│   │   ├── NextRaceWidget.jsx
│   │   └── StatCardsRow.jsx
│   │
│   ├── races/
│   │   ├── RaceCard.jsx
│   │   ├── RaceCardGrid.jsx
│   │   ├── PodiumDisplay.jsx
│   │   ├── ResultsTable.jsx
│   │   ├── CountdownTimer.jsx
│   │   └── FilterBar.jsx
│   │
│   └── ai/
│       ├── PredictTab.jsx
│       ├── WhatIfTab.jsx
│       ├── ModelOutputCard.jsx
│       ├── ConfidenceRing.jsx
│       └── ComparisonChart.jsx
│
├── services/
│   └── api.js                     ← all API call functions
│
├── utils/
│   ├── axios.js                   ← axios instance + JWT interceptor
│   ├── helpers.js                 ← formatDate, formatPoints, etc.
│   └── constants.js               ← API_BASE_URL, confidence thresholds
│
└── hooks/
    ├── useAuth.js                 ← useContext(AuthContext) wrapper
    ├── useFetch.js                ← generic GET with loading/error/data
    ├── usePost.js                 ← generic POST with loading/error/data
    └── useCountdown.js            ← countdown timer for next race
```

---

## 5. Routing Architecture

```
<BrowserRouter>
  <Routes>
    ─── Public Routes ─────────────────────────────
    <Route element={<MainLayout />}>
      <Route path="/"           element={<Dashboard />} />
      <Route path="/drivers"    element={<Drivers />} />
      <Route path="/races"      element={<Races />} />
      <Route path="/races/:id"  element={<RaceDetails />} />
      <Route path="/constructors" element={<Constructors />} />

    ─── Auth Routes (redirect to / if logged in) ──
      <Route path="/login"      element={<Login />} />
      <Route path="/register"   element={<Register />} />

    ─── Protected Routes (redirect to /login if not auth) ─
      <Route element={<ProtectedRoute />}>
        <Route path="/ai"           element={<AIPrediction />} />
        <Route path="/race-engineer" element={<RaceEngineer />} />
        <Route path="/profile"      element={<Profile />} />
      </Route>

    ─── Catch-all ────────────────────────────────
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
</BrowserRouter>
```

### Navigation Guards
- `ProtectedRoute`: checks `AuthContext.token`. If null → `<Navigate to="/login" state={{ from: location }} />`
- Login/Register: if token exists → `<Navigate to="/" />`
- 401 interceptor in `axios.js` → `logout()` → redirect to `/login`
- No role-based routing (only USER role exists in practice)

### Route Transitions
```
Page enter: opacity 0→1, translateY(20px→0), 250ms, ease-out
Page exit:  opacity 1→0, translateY(0→-10px), 150ms, ease-in
             (AnimatePresence mode="wait" on <Outlet>)
```

---

## 6. State Management Plan

| State | Location | Rationale |
|-------|----------|-----------|
| Auth token + user | `AuthProvider` (React Context) | Needed globally for API calls and route guards |
| Page data (drivers, races, etc.) | Local component state via `useFetch` | Data is page-specific; no benefit to global cache |
| Form inputs | Local `useState` | Component-scoped, no sharing needed |
| Sidebar collapse | Local `useState` in `MainLayout` | UI-only state, no global need |
| Search/filter queries | Local `useState` | Page-scoped, no sharing |
| Sort state | Local `useState` | Table-scoped |
| Chat messages | Local `useState` in `RaceEngineer` | Session-scoped, no persistence needed |
| Prediction history | Local `useState` in `AIPrediction` | Session-scoped |

**Decision: No global state manager (Redux/Zustand/etc.)**
- Current app has modest state needs — per-page data fetching is sufficient
- Auth is the only cross-cutting concern, handled by Context
- Adding a state manager would increase complexity without clear benefit
- Re-evaluate if/when cross-page caching needs arise

---

## 7. Data Fetching Strategy

| API | Fetch Timing | Cache Strategy | Refetch | Consumer |
|-----|-------------|----------------|---------|----------|
| `GET /api/drivers` | On mount of any consumer page | None (fresh each mount) | Manual refresh | Dashboard, Drivers, AI Prediction, Profile |
| `GET /api/races` | On mount of any consumer page | None (fresh each mount) | Manual refresh | Dashboard, Races, AI Prediction |
| `GET /api/races/{id}` | On mount of RaceDetails | None | Manual refresh | RaceDetails |
| `GET /api/races/{id}/results` | On mount of RaceDetails | None | Manual refresh | RaceDetails |
| `GET /api/constructors` | On mount of Constructors page | None | Manual refresh | Constructors |
| `GET /api/user/me` | On app mount (AuthProvider) | Stored in AuthContext | Manual refresh | AuthProvider, Profile |
| `PUT /api/user/profile` | On form submit | Update local state only | — | Profile |
| `POST /api/auth/login` | On form submit | Token stored in localStorage | — | Login |
| `POST /api/auth/register` | On form submit | Token stored in localStorage | — | Register |
| `POST /api/ai/predict` | On form submit | None (fresh prediction each time) | — | AI Prediction |
| `POST /api/ai/simulate` | On form submit | None (fresh simulation each time) | — | AI Prediction |
| `GET /api/ai/model-metrics` | On mount of Dashboard + AI Prediction header | Stale-while-revalidate (optional) | Manual refresh | Dashboard (stat card: model accuracy), AI Prediction (header metrics) |
| `GET /api/ai/driver-intelligence/{driverId}` | On driver selection in AI Prediction | None (fresh per driver select) | Triggered when selectedDriver changes | AI Prediction (driver insights panel) |
| `POST /api/race-engineer/ask` | On message submit | Messages accumulated in local state | — | Race Engineer |

### useFetch Hook Pattern
```js
function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // fetch on mount, refetch on url change
  // return { data, loading, error, refetch }
}
```

### usePost Hook Pattern
```js
function usePost(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // return { data, loading, error, execute(payload) }
}
```

---

## 8. Implementation Roadmap

### Phase 1: Foundation (prerequisites)
1. **Update `index.css`** — inject all design tokens from `design_system.txt` as CSS custom properties
2. **Create `utils/constants.js`** — thresholds, labels, breakpoints
3. **Create `utils/helpers.js`** — formatDate, formatPoints, getConfidenceColor, getStatusColor

### Phase 2: Layout & Navigation
4. **Re-theme `Sidebar.jsx`** — new colors, refined glass, active state with red left border, collapsible 240→64px, mobile overlay
5. **Update `MainLayout.jsx`** — refined page transitions, responsive padding, mobile top bar
6. **Re-theme `App.jsx`** — preserve route structure, wrap with AuthProvider

### Phase 3: Core UI Components
7. **`Button.jsx`** — 4 variants (primary, secondary, ghost, danger), loading state, icon support
8. **`Card.jsx`** — default card + accent variant, hover lift
9. **`Input.jsx`** + **`Select.jsx`** — design_system-compliant, error state
10. **`Badge.jsx`** — status colors, podium badges (gold/silver/bronze)
11. **`Skeleton.jsx`** — text/card/table-row/circle variants
12. **`StateViews.jsx`** — empty + error states with CTA
13. **`Modal.jsx`** — glass backdrop, scale animation
14. **`Table.jsx`** — sortable columns, sticky header, row hover
15. **`TabBar.jsx`** — tab navigation component
16. **`StatCard.jsx`** — KPI display with count-up animation
17. **`Loader.jsx`** — centered spinner with optional label

### Phase 4: Data Layer
18. **Verify `useFetch.js`** — handle loading/error/data states
19. **Verify `usePost.js`** — handle loading/error/data states
20. **Fix `api.js`** — change `/ai/intelligence` → `/ai/predict`, remove `/auth/google`, add missing endpoints (`getRace`, `getRaceResults`, `predict`, `simulate`)
21. **Update `AuthProvider.jsx`** — use `GET /api/user/me` consistently

### Phase 5: Feature Components
22. **Dashboard feature components**: `StatCardsRow`, `StandingsChart` (restyled Recharts), `NextRaceWidget`
23. **Races feature components**: `RaceCard`, `RaceCardGrid`, `RaceCardFilterBar`, `PodiumDisplay`, `ResultsTable`, `CountdownTimer`
24. **AI feature components**: `PredictTab`, `WhatIfTab`, `ModelOutputCard`, `ConfidenceRing`, `ComparisonChart`

### Phase 6: Pages
25. **Dashboard.jsx** — compose StatCardsRow + StandingsChart + NextRaceWidget
26. **Drivers.jsx** — compose Table + SearchInput + Badge
27. **Races.jsx** — compose RaceCardGrid + FilterBar
28. **RaceDetails.jsx** — compose PodiumDisplay + ResultsTable + CountdownTimer (new build)
29. **Constructors.jsx** — compose ConstructorCard grid
30. **AIPrediction.jsx** — compose TabBar + PredictTab + WhatIfTab (new What-If section)
31. **RaceEngineer.jsx** — restyle chat bubbles, typing indicator
32. **Profile.jsx** — restyle form, favorite driver selector
33. **Login.jsx** + **Register.jsx** — restyle forms, remove google auth dead code

### Phase 7: Polish
34. **Recharts restyling** — dark theme, accent-red line, glass tooltips
35. **Animations audit** — verify every animation serves a purpose
36. **Responsive testing** — all breakpoints, sidebar collapse, card reflow
37. **Error state coverage** — ensure every page handles loading/empty/error

---

## 9. Risk Analysis

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|------------|
| **Flask ML service down on prediction** | AI page returns error, user can't predict | Medium | Graceful error message + "ML service offline. Try again later." No blocking of page rendering |
| **Missing endpoint `/ai/predict` called as `/ai/intelligence`** | 404 on prediction form submit | High (current code) | **Fix immediately** in Phase 4 — change route string in `api.js` |
| **Dead `/auth/google` call in Register** | Console error on register page load | Medium | Remove the dead code in Phase 6 |
| **H2 database resets on restart** | All data lost, empty state shown everywhere | High (dev only) | Sync button on Dashboard empty state; document that data must be synced |
| **Race data missing mid-season** | Races page incomplete | Low (Ergast API reliable) | Handle gracefully — status shows SCHEDULED with no results |
| **Recharts performance with many data points** | Chart stutters on low-end devices | Low | Limit data points; use `animationDuration={300}` |
| **JWT expires during session** | API calls return 401, user redirected to login | Medium | Axios interceptor handles this; token expiry is 24h |
| **Mobile sidebar overlay accessibility** | Focus trap not implemented | Medium | Add focus trapping in sidebar overlay component |
| **Animation on slow networks** | Page transitions stutter | Low | `prefers-reduced-motion` media query; fallback to instant |
| **Backend port conflict (8080 in use)** | Backend won't start, no data | Medium | Check process before starting; document port config |

---

## 10. Technical Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Keep React 19, Vite 8, Tailwind 3.4.3, Framer Motion 12.38 | All working; no migration risk |
| 2 | Keep Recharts 3.8 — restyle, don't replace | Already installed; full control over theming |
| 3 | No component library (shadcn, 21st.dev, React Bits) | Portfolio needs to demonstrate custom implementation skill |
| 4 | CSS custom properties for design tokens | Tailwind config + CSS vars = best DX for dark theme |
| 5 | Per-page data fetching via useFetch/usePost hooks | Simple, traceable, no global cache complexity |
| 6 | Auth via React Context + localStorage JWT | Sufficient for this scale; no need for OAuth2 flow |
| 7 | No pagination (all lists < 30 items) | 22 drivers, 22 races, 11 constructors — pagination adds complexity without benefit |
| 8 | Client-side search + sort | All datasets are small (20-30 items); server-side adds no value |
| 9 | What-If as tab in /ai, not separate route | Shares form components with Predict; reduces route bloat |
| 10 | Race Details as standalone page | Content-rich enough to justify own route; supports deep linking |
