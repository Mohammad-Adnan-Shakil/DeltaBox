# PROJECT_CONTEXT.md — DeltaBox

## What This Project Is
A production-grade, AI-powered Formula 1 intelligence platform that predicts race outcomes using a blended XGBoost + Random Forest ensemble. Full-stack with React frontend, Spring Boot Java backend, and a standalone Python Flask ML microservice communicating over HTTP. Features live standings, race calendar, what-if simulation, confidence scoring, historical archive back to 1950, and a Race Engineer AI chat (DeepSeek R1 via Groq).

## Current Status
- [x] ML prediction engine: 79.6% Top-3 accuracy, R² 0.623, MAE 2.272
- [x] Decoupled ML as HTTP microservice (replaced old ProcessBuilder/subprocess)
- [x] JWT + RBAC auth from scratch (no Spring Security defaults)
- [x] Feature engineering pipeline (rolling averages, consistency, trend, grid-to-finish delta)
- [x] Database URL normalization layer (custom EnvironmentPostProcessor)
- [x] Historical data resilience (Ergast API with DB fallback)
- [x] Flyway migrations (11), seed scripts for 2026 season
- [x] React frontend with Recharts dashboards, Framer Motion, dark F1 theme
- [x] Race Engineer AI Chat (Groq/DeepSeek)
- [x] Animated podium result modals
- [x] Google OAuth integration
- [x] Multi-model conflict detection in ensemble predictions
- [ ] Testing coverage still growing (some controller/service tests exist)

## Architecture Overview
- Backend: Java 21, Spring Boot 3.2.5, Maven, port 8080, deployed on Render via Docker
- Frontend: React 19, Vite 8, Tailwind CSS 3.4, Recharts, Framer Motion, deployed on Vercel
- Database: Neon PostgreSQL 14, Flyway migrations
- ML/AI layer: Python 3.11, Flask 3.0, XGBoost, scikit-learn, deployed on Render (standalone microservice)
- Deployment: Backend + ML service on Render (Docker), Frontend on Vercel

## Key Files & Entry Points
- `backend/src/main/java/com/deltabox/backend/BackendApplication.java` — Spring Boot entry point
- `backend/pom.xml` — Maven build (Spring Boot 3.2.5, Java 21)
- `backend/src/main/resources/application.properties` — Base config
- `backend/src/main/resources/application-production.properties` — Production config (PostgreSQL)
- `backend/Dockerfile` — Multi-stage Docker build for Render
- `frontend/src/App.jsx` — React routes setup
- `frontend/src/main.jsx` — React entry with GoogleOAuthProvider
- `frontend/vite.config.js` — Vite 8 config with chunk splitting
- `ml-service/app.py` — Flask REST API (predict, simulate, compare, insights)
- `ml-service/requirements.txt` — Python deps (Flask, xgboost, scikit-learn, fastf1)
- `render.yaml` — Render multi-service deployment config

## Environment & Setup
- Backend: `cd backend && ./mvnw.cmd spring-boot:run -Dspring.profiles.active=local`
- Or `start-backend.ps1` for interactive DB selection (Docker/local PG/Render)
- Frontend: `cd frontend && npm install && npm run dev`
- ML service: `cd ml-service && pip install -r requirements.txt && python app.py`
- Key env vars: `DATABASE_URL`, `JWT_SECRET`, `ML_SERVICE_URL`, `GROQ_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `FRONTEND_URL`
- **Gotcha**: Flyway is disabled in production — seed scripts were run manually during Neon migration

## Where I Left Off
- Last thing: Retrained v2 ML models on 1,951 real F1 races (1950-2026). RF MAE 2.19 / R² 0.66, XGB MAE 2.24 / R² 0.64. Confidence now uses inter-model agreement instead of variance heuristic. Fixed `team: null` bug in Driver API response. Verified local frontend + backend + 14/14 tests passing. (ad2a7db)
- Next: Full frontend UI rebuild approved — see ## Frontend Rebuild below
- Known: Old `backend/ml/` directory still has the deprecated FastAPI version of the ML service (the active one is now `ml-service/`)

## Git & Deployment
- Remote: `https://github.com/Mohammad-Adnan-Shakil/deltabox.git`
- Branch: main
- Last commit: "fix: resolve team null in driver response and verify local environment"

## Context for AI Assistants
- ML is a decoupled HTTP microservice (Flask), NOT a subprocess. This was a deliberate refactor from the old ProcessBuilder approach — the `PythonExecutor` class was removed in commit 3df0ecc
- The `DatabaseUrlEnvPostProcessor` is a custom `EnvironmentPostProcessor` that normalizes `DATABASE_URL` (e.g. from Render) into the individual Spring datasource properties — registered via `META-INF/spring.factories`
- JWT and RBAC are implemented from scratch (no Spring Security auto-config), in `backend/security/`
- Race Engineer AI uses Groq API with DeepSeek R1, not OpenAI — configured in `GroqApiService.java`
- The frontend uses `@react-oauth/google` for Google OAuth — the flow is in `main.jsx` with `GoogleOAuthProvider`
- `application-local.properties` uses H2 in-memory for local dev; `application-production.properties` uses PostgreSQL
- The `db/` directory contains SQL seed scripts that were run manually; the Flyway migrations serve as documentation
- Project was recently renamed from `com.f1pulse.backend` to `com.deltabox.backend` (commit d3828d0)
- 33 markdown docs in `documentation/` — useful for understanding historical decisions

## Frontend Rebuild

### Decision
Full frontend UI rebuild approved. Not a patch — a complete visual overhaul while keeping all existing React component logic, API integrations, and routing intact. The goal is to transform the UI from a basic dashboard into a premium, portfolio-quality interface.

### Design Direction
- Primary design language: Linear/Vercel dark aesthetic (obsidian backgrounds, sharp typography, data-forward layouts)
- Supporting style: Glassmorphism for cards and panels only — not the whole UI
- Primary emotion: Confidence
- Secondary emotion: Speed
- Animation level: 3 (Interactive) — purposeful motion, not decoration
- Color: Near-black base, F1 red accent, white for data, subtle grid lines
- Typography: Inter or Geist, tight letter-spacing on headings, tabular numbers for all statistics
- Reference feel: "Mercedes AMG telemetry dashboard" — not generic SaaS

### What to keep
- All React component logic
- All API service calls and axios config
- All routing (React Router, protected routes, auth flow)
- All existing Framer Motion instances (upgrade, don't replace)
- All Recharts integrations (restyle, don't rebuild)

### What to rebuild
- Every page's visual layout
- Color system (new dark theme replacing current)
- Typography scale
- Card designs
- Background treatments
- Navigation/sidebar styling
- Loading states and skeletons
- Empty states
- All Tailwind classes (full replacement)

### Stack constraints
- React 19, Vite 8, Tailwind CSS 3.4.3
- Framer Motion 12.38 already installed — use it
- Recharts 3.8 already installed — restyle, don't replace
- No new heavy dependencies without a clear reason
- Keep bundle size in check — current build is 15.47s, don't regress significantly

### Master prompt
A 3-stage frontend master prompt has been written covering:
Stage 1A: Product discovery and design intelligence
Stage 1B: Frontend architecture and blueprint
Stage 2: Implementation and iterative development
Stage 3: Production readiness audit
The IDE should follow this sequence without skipping stages.
