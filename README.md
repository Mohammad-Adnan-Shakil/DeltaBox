# DeltaBox — AI-Powered Formula 1 Intelligence Platform

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-Ensemble-FF6600?style=flat-square)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens)
![Render](https://img.shields.io/badge/Deployed-Render-46E3B7?style=flat-square&logo=render&logoColor=white)

> DeltaBox is a production-deployed F1 intelligence platform that predicts race outcomes using a blended XGBoost + Random Forest ensemble. The Java Spring Boot backend calls the Python ML layer directly via subprocess execution (JSON over STDIN/STDOUT) — no separate microservice, no network hop for inference.

🔗 **Live Demo:** [deltabox link — Render](https://[RENDER_DEPLOY_URL]) · **GitHub:** [github.com/Mohammad-Adnan-Shakil/deltabox](https://github.com/Mohammad-Adnan-Shakil/deltabox)

---

## What It Does

DeltaBox is a complete intelligence layer over the 2026 F1 season — built for analysis, prediction, and strategic simulation.

| Feature | Description |
|---|---|
| 🤖 **AI Race Prediction** | Predict where any driver finishes at any circuit using a blended XGBoost + Random Forest ensemble |
| 🔀 **What-If Simulation** | Change grid position, see how it shifts the predicted outcome in real time |
| 📊 **Confidence Scoring** | Know exactly how reliable each prediction is — and when models disagree |
| 📡 **Live Telemetry** | Compare lap telemetry between two drivers — speed, throttle, brake, gear, delta |
| 🏆 **Live Standings** | Driver and constructor standings from PostgreSQL, synced with 2026 season data |
| 📅 **Race Calendar** | Full 2026 season with completed vs. upcoming race status |
| 📈 **Performance Insights** | Trend detection, consistency scoring, and multi-model analysis per driver |
| 💬 **Delta Analyst (AI Chat)** | Groq-powered conversational assistant for natural-language race/telemetry Q&A — **in active development** |

---

## Performance

- **79.6% Top-3 finishing-position accuracy** on a held-out test set
- **R² 0.62** for the blended ensemble
- **13.4ms blended prediction latency** (XGBoost: 2.5ms · Random Forest: 10.9ms)
- Trained and validated on historical F1 race data across multiple seasons

---

## Engineering Highlights

Non-trivial decisions that separate this from a tutorial project:

- **Direct subprocess ML integration** — the Python ML engine runs via `ProcessBuilder`, invoked directly by the Spring Boot backend with JSON over STDIN/STDOUT. No separate service to deploy, version, or keep alive — one less network hop, one less point of failure.
- **Multi-model conflict detection** — when XGBoost and Random Forest disagree beyond a threshold, the AI Orchestrator doesn't average them silently — it flags the conflict as a high-uncertainty signal. Disagreement itself is data.
- **Live telemetry via fastf1** — real lap-by-lap telemetry data (speed, throttle, brake, gear, time delta) fetched and processed via the `fastf1` library.
- **JWT + RBAC from scratch** — token generation, validation middleware, and role-based route protection implemented without relying on Spring Security's opinionated defaults.
- **Feature engineering pipeline** — models receive rolling average finish, consistency score, recent trend direction, and grid-to-finish delta — not raw position integers.

---

## Architecture

```
React Frontend
      ↓ REST + JWT
Spring Boot Backend
      ↓ ProcessBuilder (JSON over STDIN/STDOUT)
Python ML Engine
   ├── XGBoost Model (.pkl)
   ├── Random Forest Model (.pkl)
   ├── Blended Ensemble + AI Orchestrator
   └── Label Encoders (driver, constructor, track)
      ↓
Prediction + Confidence + Insight + Telemetry Response
      ↓
Spring Boot → React → User
```

---

## Tech Stack

### Backend — Java + Spring Boot
- REST API with JWT authentication and Role-Based Access Control (RBAC)
- JPA / Hibernate ORM with PostgreSQL
- `ProcessBuilder` for direct subprocess invocation of the Python ML engine
- Deployed on Render

### Frontend — React + Tailwind CSS
- Animated dashboard with live race clock
- Recharts for driver standings and performance visualization
- Framer Motion for page transitions and card animations
- Fully responsive — mobile, tablet, desktop

### Machine Learning — Python
- **XGBoost** — race outcome prediction
- **Random Forest** — performance trend analysis
- **Blended ensemble** + custom AI Orchestrator — combines model outputs, detects conflicts, generates human-readable insights
- **fastf1** — live lap telemetry data (speed, throttle, brake, gear, delta)
- Invoked as a subprocess by the Spring Boot backend, not a standalone service
- Models serialized with pickle, loaded at process start

### Infrastructure
- Single deployment on Render (backend + ML subprocess + frontend)
- Environment variables for all secrets (`JWT_SECRET`, `SPRING_DATASOURCE_*`)
- PostgreSQL with persistent storage
- Auto-deploy on push via GitHub integration

---

## AI Engine — How It Works

1. Frontend sends: `driverId` + `raceId` + `gridPosition`
2. Spring Boot fetches driver stats and race history from PostgreSQL
3. Feature vector is constructed: `(avg_finish, consistency, recent_form, grid, track, constructor)`
4. Spring Boot writes the feature vector as JSON to the Python process's STDIN
5. Python runs XGBoost + Random Forest, blends results via the AI Orchestrator
6. Orchestrator compares model outputs:
   - Models agree → **high confidence prediction**
   - Models conflict → flags uncertainty, returns `"conflicting models"` insight
7. Python writes the result as JSON to STDOUT
8. Spring Boot reads STDOUT, returns enriched JSON to frontend
9. React renders: position badge, confidence ring, simulation cards, insight text

---

## API Reference

### `POST /api/ai/intelligence`

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
| `GET` | `/api/drivers/standings` | Live driver standings |
| `GET` | `/api/races/calendar` | Full 2026 race calendar |
| `GET` | `/api/constructors/standings` | Constructor championship table |
| `GET` | `/api/telemetry/compare` | Lap telemetry comparison between two drivers |
| `POST` | `/api/auth/login` | Authenticate and receive JWT |
| `POST` | `/api/auth/register` | Register a new user |

---

## Local Setup

### Prerequisites
- Java 21+
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+

### Backend
```bash
cd backend
# Set environment variables or edit application.properties
./mvnw spring-boot:run
```

The Spring Boot app invokes the Python ML scripts directly via `ProcessBuilder` — no separate ML server needs to be started.

### ML Engine dependencies
```bash
cd backend/ml
pip install -r requirements.txt
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
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
JWT_SECRET=...
```

---

## Project Structure

```
deltabox/
├── backend/
│   ├── src/                  # Spring Boot — APIs, auth, DB, ProcessBuilder ML integration
│   └── ml/
│       ├── predict.py        # ML inference entrypoint, invoked via subprocess
│       ├── scripts/          # ai_orchestrator.py, telemetry_analysis.py
│       ├── models/           # .pkl model files
│       └── requirements.txt
├── frontend/                 # React + Tailwind — dashboard, charts, prediction UI
└── db/                       # PostgreSQL schema + 2026 season seed data
```

---

## Roadmap

- [ ] **Delta Analyst** — Groq-powered conversational AI assistant for natural-language race/telemetry analysis (in active development)

---

## Author

**Mohammad Adnan Shakil**
CSE Student · Presidency University, Bengaluru (2024–2028)
Building toward backend + full-stack roles at top-tier companies

[![GitHub](https://img.shields.io/badge/GitHub-Mohammad--Adnan--Shakil-181717?style=flat-square&logo=github)](https://github.com/Mohammad-Adnan-Shakil)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Mohammad%20Adnan%20Shakil-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/mohammadadnanshakil)
