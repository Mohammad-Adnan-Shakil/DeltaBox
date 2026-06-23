# DeltaBox — AI-Powered Formula 1 Intelligence Platform

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Neon%20Postgres-14-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-Ensemble-FF6600?style=flat-square)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)
![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat-square&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

> DeltaBox is a full-stack F1 intelligence platform that predicts race outcomes using a blended XGBoost + Random Forest ensemble. The Java Spring Boot backend communicates with a standalone Python ML microservice over HTTP — a deliberate move away from an earlier subprocess-based integration, made to decouple ML inference from the API server's lifecycle.

🔗 **Live Demo:** [delta-box.vercel.app](https://delta-box.vercel.app) · **GitHub:** [github.com/Mohammad-Adnan-Shakil/deltabox](https://github.com/Mohammad-Adnan-Shakil/deltabox)

---

## What It Does

DeltaBox is a complete intelligence layer over the 2026 F1 season — built for analysis, prediction, and strategic simulation.

| Feature | Description |
|---|---|
| 🤖 **AI Race Prediction** | Predict where any driver finishes at any circuit using a blended XGBoost + Random Forest ensemble |
| 🔀 **What-If Simulation** | Change grid position, see how it shifts the predicted outcome in real time |
| 📊 **Confidence Scoring** | Know exactly how reliable each prediction is — and when models disagree |
| 🏆 **Live Standings** | Driver and constructor standings synced with 2026 season data |
| 📅 **Race Calendar** | Full 2026 season with completed vs. upcoming race status, podium results |
| 📈 **Performance Insights** | Trend detection, consistency scoring, and multi-model analysis per driver |
| 🗂️ **Historical Archive** | Season-by-season data back to 1950 via Ergast API, with DB fallback |
| 🛠️ **Race Engineer (AI Chat)** | DeepSeek R1-powered assistant for natural-language race strategy Q&A |

---

## Performance

- **79.6% Top-3 finishing-position accuracy** on a held-out test set (blended ensemble)
- **R² 0.623**, **MAE 2.272** for the blended ensemble (XGBoost: R² 0.616, MAE 2.300 · Random Forest: R² 0.618, MAE 2.278)
- Trained on ~1,900 rows of real F1 race data sourced from the Jolpica API
- **~71ms model load, ~2.5–13ms inference** — measured locally; reproduce via the ML service's own benchmark script before quoting in an interview

---

## Engineering Highlights

Non-trivial decisions that separate this from a tutorial project:

- **ML as a decoupled HTTP microservice** — the Python ML engine runs as a standalone Flask service, called by the Spring Boot backend over REST. This replaced an earlier `ProcessBuilder`/subprocess integration: the old approach tied ML availability to the JVM process and made the ML layer hard to scale, redeploy, or version independently. Splitting it out removed that coupling.
- **Multi-model conflict detection** — when XGBoost and Random Forest disagree beyond a threshold, the system doesn't average them silently — it flags the conflict as a high-uncertainty signal. Disagreement itself is data.
- **JWT + RBAC from scratch** — token generation, validation middleware, and role-based route protection implemented without relying on Spring Security's opinionated defaults.
- **Feature engineering pipeline** — models receive rolling average finish, consistency score, recent trend direction, and grid-to-finish delta — not raw position integers.
- **Database URL normalization layer** — a custom Spring `EnvironmentPostProcessor` normalizes Postgres connection strings (`postgres://`, `postgresql://`, `jdbc:postgresql://`) across hosting providers, written to support a clean migration from Render's free Postgres tier to Neon without touching application code.
- **Historical data resilience** — historical season/driver/circuit data is served from the Ergast API with a database fallback, so the feature degrades gracefully instead of failing outright.

---

## Architecture

```
React Frontend (Vercel)
      ↓ REST + JWT
Spring Boot Backend (Render, Docker)
      ↓ HTTP REST
Python ML Microservice (Flask)
   ├── XGBoost Model (.pkl)
   ├── Random Forest Model (.pkl)
   ├── Blended Ensemble + Conflict Detection
   └── Feature Pipeline (rolling form, consistency, grid delta)
      ↓
Prediction + Confidence + Insight Response
      ↓
Spring Boot → React → User

Backend ←→ Neon Postgres (managed, serverless Postgres)
```

---

## Tech Stack

### Backend — Java + Spring Boot
- REST API with JWT authentication and Role-Based Access Control (RBAC), built from scratch
- JPA / Hibernate ORM with Neon Postgres
- HTTP client (`MLClientService`) calling the Flask ML microservice — no subprocess, no shared process lifecycle
- Deployed on Render via Docker

### Frontend — React + Tailwind CSS
- Animated dashboard with live standings and race calendar
- Recharts for driver standings and performance visualization
- Framer Motion for page transitions and card animations
- Fully responsive — mobile, tablet, desktop
- Deployed on Vercel

### Machine Learning — Python + Flask
- **XGBoost** — race outcome prediction
- **Random Forest** — performance trend analysis
- **Blended ensemble** — combines model outputs, detects conflicts, generates human-readable insights
- Served as a standalone Flask REST microservice, called by the Spring Boot backend over HTTP
- Models serialized with pickle (protocol 4), loaded via joblib at service startup

### Infrastructure
- Backend: Render (Docker)
- Frontend: Vercel
- Database: Neon Postgres (serverless, managed)
- Environment variables for all secrets (`JWT_SECRET`, `DATABASE_URL`, `ML_SERVICE_URL`, `GROQ_API_KEY`)
- Auto-deploy on push via GitHub integration

---

## AI Engine — How It Works

1. Frontend sends: `driverId` + `raceId` + `gridPosition`
2. Spring Boot fetches driver stats and race history from Neon Postgres
3. Feature vector is constructed: `(avg_finish, consistency, recent_form, grid, track, constructor)`
4. Spring Boot calls the Flask ML service over HTTP with the feature vector as JSON
5. Flask service runs XGBoost + Random Forest, blends results
6. Blend logic compares model outputs:
   - Models agree → **high confidence prediction**
   - Models conflict → flags uncertainty, returns a "conflicting models" insight
7. Flask service returns the result as a JSON HTTP response
8. Spring Boot relays the enriched JSON to the frontend
9. React renders: position prediction, confidence indicator, simulation cards, insight text

---

## API Reference

### `POST /api/ai/predict`

```json
// Request
{
  "driverId": 1,
  "raceId": 10,
  "gridPosition": 5
}

// Response
{
  "predictedFinish": 2,
  "confidence": 80,
  "confidenceLabel": "HIGH",
  "rfPrediction": 2,
  "xgbPrediction": 3,
  "simulationImpact": "SLIGHT_IMPROVEMENT",
  "finalInsight": "Driver shows strong consistency with an improving trend",
  "topFeatures": ["grid_position", "avg_last_5", "track_id"]
}
```

### Other Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/drivers` | All drivers (2026 season) |
| `GET` | `/api/constructors` | Constructor standings |
| `GET` | `/api/races` | Full 2026 race calendar |
| `GET` | `/api/races/{raceId}/results` | Race results (podium) |
| `GET` | `/api/ai/model-metrics` | Live model performance metrics |
| `POST` | `/api/ai/simulate` | What-if grid position simulation |
| `POST` | `/api/race-engineer/ask` | AI race strategy advice (DeepSeek R1) |
| `GET` | `/api/historical/seasons` | F1 seasons archive (1950–2026) |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `POST` | `/api/auth/register` | Register a new user |

---

## Local Setup

### Prerequisites
- Java 21+
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+ (or a Neon connection string)

### Backend
```bash
cd backend
# Set environment variables or edit application.properties
./mvnw spring-boot:run
```

### ML Microservice
```bash
cd backend/ml
pip install -r requirements.txt
python app.py
# Runs as a standalone Flask service — must be running for AI features to work
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on localhost:5173
```

### Environment Variables
```env
DATABASE_URL=postgresql://...        # Neon Postgres connection string
JWT_SECRET=...
ML_SERVICE_URL=http://localhost:5000
GROQ_API_KEY=...                     # Required for Race Engineer AI chat
```

> Note: reported latency figures (model load / inference time) were measured during development and should be re-benchmarked locally before quoting them as current numbers.

---

## Project Structure

```
deltabox/
├── backend/
│   ├── src/                  # Spring Boot — APIs, auth, DB, ML HTTP client
│   └── ml/
│       ├── app.py            # Flask app entrypoint
│       ├── predict.py        # ML inference logic
│       ├── models/           # .pkl model files (XGBoost, Random Forest)
│       └── requirements.txt
├── frontend/                 # React + Tailwind — dashboard, charts, prediction UI
└── db/                       # Neon Postgres schema + 2026 season seed data
```

---

## Roadmap

- [ ] **F1 RAG capstone integration** — connecting DeltaBox's prediction layer with a retrieval-augmented Q&A system over historical F1 data, to present both projects as a cohesive ML systems portfolio

---

## Author

**Mohammad Adnan Shakil**
CSE Student · Presidency University, Bengaluru (2024–2028)
Building toward backend + full-stack roles at top-tier companies

[![GitHub](https://img.shields.io/badge/GitHub-Mohammad--Adnan--Shakil-181717?style=flat-square&logo=github)](https://github.com/Mohammad-Adnan-Shakil)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Mohammad%20Adnan%20Shakil-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/mohammadadnanshakil)
