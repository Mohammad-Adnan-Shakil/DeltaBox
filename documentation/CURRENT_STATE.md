# DeltaBox Current State Audit

**Generated**: 2026-06-23  
**Purpose**: Factual audit of actual codebase state for AI assistant handoff

---

## Architecture (Actual Code State)

### Backend
- **Framework**: Spring Boot 3.2.5, Java 21
- **Database**: Neon Postgres (migrated from Render's free tier)
- **Auth**: JWT + RBAC implemented from scratch (NOT Spring Security defaults)
- **ORM**: JPA/Hibernate with Flyway migrations
- **Deployment**: Render (Docker)
- **Config**: Environment-based profiles (local, production)
- **Key Components**:
  - `DatabaseUrlEnvironmentPostProcessor` - Normalizes Neon Postgres URLs
  - `MLClientService` - HTTP calls to ML service (NOT subprocess)
  - `PythonExecutor` - Deprecated, kept for reference only

### Frontend
- **Framework**: React 19.2.4 (NOT 18 as docs claim)
- **Build**: Vite 8.0.1
- **Styling**: Tailwind CSS 3.4.3
- **State**: React Context for auth
- **Charts**: Recharts 3.8.1
- **Animations**: Framer Motion 12.38.0
- **Deployment**: Vercel
- **Auth**: Google OAuth + JWT

### ML Service
- **Framework**: Flask 3.0.3 (NOT FastAPI as docs claim)
- **Python**: 3.11
- **Deployment**: Separate service (Render/Railway - verify actual)
- **Models**: Random Forest, XGBoost, Blended ensemble
- **Communication**: HTTP REST API (called by backend)

---

## API Endpoints (Actual Implementation)

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (JWT token)

### Core Data
- `GET /api/drivers` - All drivers (2026 season)
- `GET /api/constructors` - All teams
- `GET /api/races` - Race calendar (2026 season)
- `GET /api/races/{raceId}` - Single race details
- `GET /api/races/{raceId}/results` - Race results (podium)
- `GET /api/races/{raceId}/podium` - Alias for /results

### AI/ML
- `GET /api/ai/driver-intelligence/{driverId}` - Driver insights
- `GET /api/ai/model-metrics` - Model performance metrics
- `POST /api/ai/compare` - Driver comparison
- `POST /api/ai/predict` - Race prediction
- `POST /api/ai/simulate` - What-if simulation
- `POST /api/race-engineer/ask` - Race strategy advice (DeepSeek R1)

### Admin
- `GET /api/admin/users` - User list (ADMIN only)
- `POST /api/admin/cleanup-duplicates` - Remove duplicate drivers
- `POST /api/admin/ingest/historical` - Ingest historical data (async)
- `POST /api/admin/ingest/year/{year}` - Ingest single season
- `GET /api/admin/ingest/status` - Ingestion status
- `GET /api/admin/ingest/progress/{jobId}` - Job progress

### Historical Data (Ergast API + DB fallback)
- `GET /api/historical/seasons` - All F1 seasons (1950-2026)
- `GET /api/historical/season/{year}` - Season detail with races
- `GET /api/historical/driver/{driverCode}/career` - Driver career stats
- `GET /api/historical/circuit/{circuitName}/history` - Circuit history
- `GET /api/historical/champions` - World champions
- `GET /api/historical/records` - All-time records
- `GET /api/historical/driver/{year}/{driverCode}/season` - Driver season stats

### User Profile
- `GET /api/user/me` - Current user
- `GET /api/user/profile` - User profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/profile/favorite-driver` - Set favorite driver

### System
- `GET /api/health` - Health check
- `GET /api/` - Root endpoint
- `POST /api/debug/sync-races` - Manual race sync
- `GET /api/debug/race-stats` - Race statistics

### ML Service Endpoints (Flask)
- `GET /health` - ML service health check
- `POST /predict` - Race prediction
- `POST /compare` - Driver comparison
- `GET /telemetry` - Telemetry analysis (OpenF1 API)
- `POST /simulate` - What-if simulation
- `POST /insights` - Performance insights

---

## Test Coverage

### Backend Tests (4 test files)
- `AuthIntegrationTest.java` - Auth integration tests
- `DatabaseUrlEnvironmentPostProcessorTest.java` - DB URL normalization (3 tests, all passing)
- `AuthServiceTest.java` - Auth service unit tests
- `HistoricalDataIngestionServiceTest.java` - Data ingestion tests

**Coverage Gap**: Most controllers have NO corresponding test files. Only auth and config are tested.

### Frontend Tests
- `AuthContext.test.jsx`
- `ProtectedRoute.test.jsx`
- `AIPage.test.jsx`
- `RaceEngineerPage.test.jsx`

**Coverage Gap**: Minimal test coverage, most pages untested.

---

## ML Service Status

### Models Loaded (from model_metrics_v2.json)
- **Training Date**: 2026-06-17
- **Dataset**: 1,939 rows (1,551 train, 388 test)
- **Features**: 13 features (career_avg_finish, career_wins, recent_form_5, circuit_affinity, etc.)

### Model Performance
- **Random Forest**: MAE 2.278, R² 0.618, Top-3 Accuracy 78.1%
- **XGBoost**: MAE 2.300, R² 0.616, Top-3 Accuracy 79.9%
- **Blended**: MAE 2.272, R² 0.623, Top-3 Accuracy 79.6%

### Model Files
- `random_forest_model_v2.pkl` - 14.2 MB
- `xgboost_model_v2.pkl` - 1.7 MB
- `feature_names_v2.pkl` - 230 bytes
- `model_metrics_v2.json` - Metrics

### Training Pipeline
- Falls back to synthetic data if training CSVs missing
- Uses joblib for model loading (better compatibility)
- Protocol 4 for pickle serialization

---

## Known Issues / Incomplete Features

### Code Issues
1. **RaceController.java (lines 176-199)**: Mock data generation methods that are never called
   - `generateDriverName()`, `generateDriverCode()`, `generateCountry()`, `generateTeam()`
   - Comment says "in production this would query the Driver entity"
   - Actual implementation uses DriverRepository, these are dead code

2. **Profile.jsx (line 31)**: `console.log("No saved favorite driver found")` left in production code

3. **PythonExecutor.java**: Entire class marked `@Deprecated` but still present
   - Comment says "Use MLClientService which communicates with Flask ML service via HTTP"
   - Should be removed or moved to separate legacy package

4. **DataInitializationService.java (lines 13-14)**: Component commented out
   - `@Component` and `@ConditionalOnProperty` commented
   - Unclear if this is intentional or temporary

### Test Coverage Gaps
- No tests for: RaceController, DriverController, ConstructorController, AIController, PredictionController, RaceEngineerController, TeamController, UserController, HistoricalController, AdminController, SyncDebugController
- No integration tests for ML service communication
- No end-to-end tests

---

## Dependency Drift / Version Issues

### Frontend (package.json vs actual)
- **React**: package.json says 19.2.4, README says 18 (README outdated)
- All other dependencies appear consistent

### Backend (pom.xml vs imports)
- Spring Boot 3.2.5 (correct)
- Java 21 (correct)
- All Spring imports match pom.xml dependencies
- No version drift detected

### ML Service (requirements.txt vs code)
- Flask 3.0.3 (matches code)
- All imports match requirements.txt
- No version drift detected

---

## Documentation vs Code Discrepancies

### Critical Discrepancies in README.md
1. **ML Service Framework**: README says "FastAPI", actual code is Flask
2. **React Version**: README says "React 18", actual is 19.2.4
3. **Deployment**: README says "Railway" for backend, actual is Render
4. **ML Service Deployment**: README says "Railway", needs verification
5. **Architecture Diagram**: Shows FastAPI, should show Flask

### Other Doc Issues
- Multiple markdown files in root directory (30+ docs) - many may be outdated
- Debugging reports and implementation summaries may not reflect current state
- `application-local.properties` has error message at line 1 (Groq API rate limit message)

---

## Features Status

### Fully Working
- JWT authentication (register, login, token validation)
- Driver standings (2026 season)
- Constructor standings
- Race calendar with completed/scheduled status
- Race results with podium display
- AI race prediction (Random Forest, XGBoost, Blended)
- What-if simulation
- Race engineer advice (DeepSeek R1)
- Historical data (Ergast API with DB fallback)
- User profile with favorite driver
- Admin endpoints (user management, data ingestion)

### Recently Completed (June 2026)
- Neon Postgres migration (DatabaseUrlEnvironmentPostProcessor)
- Race podium results feature
- Model retraining (v2 models with updated metrics)

### Potential Issues
- Mock data methods in RaceController (dead code)
- Console.log in Profile.jsx (debug code left in)
- Deprecated PythonExecutor class (should be removed)
- Low test coverage across controllers
- Documentation drift (README outdated)

---

## Deployment Configuration

### Backend (Render)
- Docker-based deployment
- Environment variables: DATABASE_URL, JWT_SECRET, ML_SERVICE_URL, GROQ_API_KEY
- Neon Postgres connection
- Flyway migrations (currently disabled in production: `spring.flyway.enabled=false`)

### Frontend (Vercel)
- Environment variables: VITE_API_BASE_URL
- React 19.2.4 + Vite 8.0.1
- Deployed to delta-box.vercel.app

### ML Service
- Flask app with Gunicorn
- Endpoints: /health, /predict, /compare, /telemetry, /simulate, /insights
- Models loaded on startup or trained if missing
- CORS enabled for all origins

---

## Security Notes

- JWT secret from environment variable (NOT hardcoded)
- Spring Security configured with custom JWT filter
- Role-based access control (ADMIN role for admin endpoints)
- CORS configured for specific origins (localhost + production)
- Password encoding with BCrypt
- Google OAuth integration

---

## Database State

### Migrations
- Flyway migrations exist but disabled in production
- Manual SQL seeds: `seed_2026_season.sql`, `seed_2026_race_results.sql`
- Schema managed by JPA in production (`ddl-auto=none`)

### Tables (from repository interfaces)
- users, drivers, teams, races, historical_*
- Race table has dual purpose: schedule rows (driverId=null) and result rows (driverId!=null)

---

## Performance Metrics (from code comments)
- Model load time: ~71ms (claimed in user context, not verified)
- Inference time: ~2.5-13ms (claimed in user context, not verified)
- These are resume claims - should be verified before using

---

## Recommendations for Next Assistant

1. **Remove dead code**: Delete mock data methods in RaceController
2. **Clean up debug code**: Remove console.log from Profile.jsx
3. **Remove deprecated code**: Delete or move PythonExecutor to legacy package
4. **Update documentation**: Fix README.md to reflect Flask (not FastAPI), React 19 (not 18), Render (not Railway)
5. **Increase test coverage**: Add tests for untested controllers
6. **Verify deployment**: Confirm ML service actual deployment platform
7. **Enable Flyway**: Consider re-enabling Flyway for production schema management
8. **Clean up root directory**: Archive or consolidate 30+ markdown files
