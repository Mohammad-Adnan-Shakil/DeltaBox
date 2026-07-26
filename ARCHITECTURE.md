# Architecture

## Component Breakdown

### React Frontend
- **Role:** SPA with dashboard, race analysis, AI predictions, Race Engineer chat, telemetry comparison
- **Tech:** React 19 + Vite 8 + Tailwind CSS 3 + Framer Motion + Recharts + Lucide React
- **Location:** frontend/src/

### Spring Boot Backend
- **Role:** REST API server with JWT auth, race/standings/telemetry endpoints, ML client
- **Tech:** Spring Boot 3.2.5 + Java 21 + JPA + Flyway
- **Location:** backend/

### Flask ML Microservice
- **Role:** XGBoost + Random Forest ensemble for race outcome prediction
- **Tech:** Flask 3.0 + Gunicorn + scikit-learn + XGBoost
- **Location:** ml-service/

### PostgreSQL Database
- **Role:** Persistent storage for users, races, drivers, predictions, activity history
- **Tech:** PostgreSQL (Neon) + H2 (dev) + Flyway migrations
- **Location:** db/ + backend resources

## Key Architectural Decisions

### Decision 1: Decoupled ML Microservice (HTTP) over Subprocess
**What:** ML runs as a separate Flask HTTP service, reached via RestTemplate from Spring Boot
**Why:** Decouples Python ML environment from Java backend. Each can scale independently. Eliminates ProcessBuilder complexity and JVM-Python interop issues.
**Tradeoff:** Network latency for each ML call. Requires service discovery and health checking.

### Decision 2: Custom JWT + RBAC over Spring Security Defaults
**What:** JWT authentication implemented from scratch with access (24h) + refresh (7d) tokens
**Why:** Full control over token lifecycle, stateless session, silent refresh via axios interceptor
**Tradeoff:** More code to maintain. No OAuth2 social login without manual implementation.

### Decision 3: Custom Database URL EnvironmentPostProcessor
**What:** Converts postgresql:// protocol URLs to jdbc:postgresql:// at boot time
**Why:** Render and other PaaS provide DATABASE_URL in postgresql:// format, not jdbc. Spring expects jdbc://. This runs at highest precedence to normalize before datasource init.
**Tradeoff:** Additional complexity. Must be registered via spring.factories.

### Decision 4: Blended Ensemble (XGBoost + RF) over Single Model
**What:** Predictions average RF and XGBoost outputs with confidence based on inter-model agreement
**Why:** Ensemble reduces overfitting risk. Confidence scoring (HIGH/MEDIUM/LOW/VERY LOW) based on disagreement tells users how much to trust the prediction.
**Tradeoff:** Double inference cost. Two models to maintain and deploy.

## Data Flow
1. User opens DeltaBox → React loads standings/races from Spring Boot REST API
2. For predictions: User selects race + drivers → frontend calls /ai/predict → Spring Boot calls Flask /predict
3. Flask loads XGBoost + RF .pkl models → computes 12 feature embeddings → blended ensemble → returns prediction with confidence
4. For Race Engineer: User chats → Spring Boot calls Groq API (llama-3.1-8b-instant) with live OpenF1 data context
5. For comparisons: User selects drivers → Spring Boot fetches OpenF1 telemetry → returns to frontend for Recharts visualization

## Known Limitations
- Frontend AIPage calls /ai/intelligence (dead endpoint) instead of /ai/predict
- API contract mismatch between frontend and backend for prediction requests
- Deprecated FastAPI ML service still in backend/ml/ directory
- Flyway migrations disabled in production (seeds run manually)
- No TypeScript in frontend
- Google OAuth endpoint dead (removed from Register page but backend endpoint may still exist)

## Future Considerations
- Resolve frontend-backend API contract for predictions
- Clean up deprecated ML code
- Enable Flyway in production for automated migrations
- Add TypeScript to frontend
