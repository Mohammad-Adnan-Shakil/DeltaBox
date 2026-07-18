# DeltaBox — AI-Powered Formula 1 Intelligence Platform

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-Gunicorn-000000?style=flat-square&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon%20Postgres-Pooled-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost%20%2B%20RF-Ensemble-FF6600?style=flat-square)
![JWT](https://img.shields.io/badge/JWT-Auth%20%2B%20Refresh-000000?style=flat-square&logo=jsonwebtokens)
![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat-square&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

> DeltaBox is a full-stack F1 intelligence platform — live standings, telemetry comparison, live-data race strategy, and ML-driven race predictions. The Spring Boot backend, the React frontend, and the Python ML engine are three independently deployed services, a deliberate architectural choice with real operational tradeoffs documented below.

🔗 **Live:** [delta-box.vercel.app](https://delta-box.vercel.app) · **Repo:** [github.com/Mohammad-Adnan-Shakil/DeltaBox](https://github.com/Mohammad-Adnan-Shakil/DeltaBox)

---

## What It Does

| Feature | Description |
|---|---|
| 🧠 **Apex Intelligence** | AI race outcome prediction — blended XGBoost + Random Forest ensemble, with confidence scoring and explicit model-disagreement flagging. Curated preset scenarios for first-time users. |
| 🛠️ **Race Engineer** | Live-paddock strategy tool — pulls real race state from OpenF1 (Live sessions or Replay mode against any past race, with a lap scrubber), runs a 6-scenario rule-based engine (undercut, overcut, optimal pit window, threat assessment, safety car contingency, championship impact), and layers a Groq-powered chat (`llama-3.1-8b-instant`) on top for natural-language strategy Q&A. |
| 🔀 **Delta Analyst** | Lap-by-lap telemetry comparison between two drivers (speed, throttle, brake), sourced live from OpenF1 |
| 🏆 **Live Standings & Driver Pages** | Driver and constructor standings synced from Jolpica, with individual driver detail pages showing real career stats |
| 📅 **Race Calendar** | Full season with completed/upcoming status and team-colored podium results |
| 📜 **Activity History** | Persistent, per-user history (capped at 20 entries) across Apex Intelligence, Race Engineer, and Delta Analyst, surfaced on Profile |
| 🔐 **Auth** | Custom JWT + RBAC with refresh tokens, safe under concurrent requests (see below) |

---

## Model Performance

- **R² = 0.66**, **MAE = ±2.19 positions** — blended XGBoost + Random Forest ensemble
- Trained on **1,951 samples** of real F1 race data sourced from Jolpica
- These are the live numbers rendered in the app itself, not a separate marketing figure

---

## Engineering Highlights

Real problems solved during hardening, not tutorial-shaped ones:

- **A prediction pipeline that looked correct but was silently broken.** Every Apex Intelligence prediction was running on generic default feature values instead of real per-driver race history — the model still returned confident-looking numbers regardless of which driver was selected. Root cause: a boot-time database seeding guard checked total row count, which was fooled by schedule-only rows from an earlier migration, so the real results-sync step silently never fired. Found by refusing to accept a "no bug found" report that contradicted an earlier real observation, then tracing it to the actual guard condition. Fixed to be self-sustaining — no manual re-seeding required as the season progresses.
- **A third-party API bug disguised as a data-availability issue.** OpenF1's telemetry endpoint was silently returning empty results — not an error — because of invalid query parameters (`lap_number`/`limit` aren't valid OpenF1 filters). It took ruling out two more plausible explanations first before finding the real cause and fixing it with correct `date>=`/`date<=` range params.
- **A production deploy pipeline that failed for several different wrong reasons before the real one.** Chased through a health-check-status theory and a Neon database connection-pooling misconfiguration (fixed by switching to Neon's pooled endpoint with tuned HikariCP settings) before finding the actual cause: JVM cold-start time on CPU-throttled hosting exceeding the platform's port-detection window. Fixed at the source with explicit port-binding configuration.
- **JWT refresh with real concurrency handling.** Multiple simultaneous requests hitting an expired token share a single in-flight refresh call instead of each independently racing to refresh — verified by testing N concurrent requests and confirming exactly one refresh call fires.
- **A deploy-target misconfiguration that masked itself for hours.** Auto-deploy was silently pointed at a different Render service than the one actually serving production traffic, making fixes appear to succeed in logs while never reaching real users. Found by tracing actual service identifiers, not by assumption.
- **Exception-to-HTTP-status mapping done properly.** Authentication failures, authorization failures, and not-found conditions previously fell through to generic 500s; each now maps to its correct status (401/403/404) via typed exception handling.

---

## Architecture
React Frontend (Vercel)
↓ REST + JWT (access + refresh tokens)
Spring Boot Backend (Render, Docker)
↓ REST/HTTP                    ↓ REST/HTTP
Flask ML Microservice          OpenF1 / Jolpica / Groq
(Render, separate deploy)
├── XGBoost model (.pkl)
├── Random Forest model (.pkl)
└── Blended ensemble output
↓
Neon Postgres (pooled connection)

Backend, frontend, and ML service each deploy independently — a change to the ML model doesn't require redeploying the API, and vice versa. The real cost of this choice: three separate services to keep alive, three separate cold-start behaviors to manage on free-tier hosting, and one very real bug where two of them got out of sync on which one was "live."

---

## Tech Stack

**Backend** — Java 21, Spring Boot 3.2.5, custom JWT + RBAC (not Spring Security defaults), JPA/Hibernate, Neon Postgres (pooled), deployed via Docker on Render.

**Frontend** — React 19, Tailwind CSS, Framer Motion, deployed on Vercel.

**ML Service** — Python 3.11, Flask + Gunicorn, XGBoost + Random Forest ensemble, deployed as a standalone Render service.

**External APIs** — Jolpica (race/standings data), OpenF1 (telemetry + live/historical race state), Groq (AI chat).

**Infra** — Render (backend + ML, Docker), Vercel (frontend), GitHub Actions + UptimeRobot (redundant keep-alive to prevent free-tier idle spin-down).

---

## Local Setup

### Prerequisites
Java 21+, Node.js 18+, Python 3.11+, a PostgreSQL connection (Neon or local).

### Backend
```bash
cd backend
./mvnw spring-boot:run
```

### ML Service
```bash
cd ml-service
pip install -r requirements.txt --break-system-packages
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Environment Variables
```env
SPRING_DATASOURCE_URL=jdbc:postgresql://...          # Neon pooled connection string
JWT_SECRET_KEY=...
ML_SERVICE_URL=http://localhost:5000
GROQ_API_KEY=...
PORT=8080
```

---

## Author

**Mohammad Adnan Shakil**
CSE Student, Presidency University, Bengaluru

[GitHub](https://github.com/Mohammad-Adnan-Shakil) · [LinkedIn](https://linkedin.com/in/mohammadadnanshakil)
