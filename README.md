🏎️ F1 Pulse — AI-Powered Race Intelligence Engine

F1 Pulse is a full-stack intelligent analytics platform that predicts Formula 1 race outcomes using a hybrid machine learning system.

It combines multiple ML models, real race data, and simulation logic to generate data-driven insights, predictions, and confidence scores for driver performance.

🔥 Key Highlights
⚡ Hybrid AI system combining XGBoost + Random Forest
🧠 Intelligent orchestration layer for multi-model reasoning
📊 Real-time predictions using live database inputs (PostgreSQL)
🔗 Seamless Java ↔ Python integration via subprocess pipeline
📈 Confidence scoring system for prediction reliability
🧩 Feature engineering using driver performance trends
🧪 Simulation engine to estimate race outcome impact
🧠 How It Works
1. Data Collection
Fetches real race data from PostgreSQL
Extracts:
Recent performance (last 5 & 10 races)
Position trends
Variance & consistency metrics
2. Feature Engineering

Transforms raw race data into ML-ready inputs:

Average position (last 5, last 10)
Standard deviation (consistency)
Qualifying/grid position
Track & constructor encoding
Context features (home race, season)
3. Hybrid AI Engine
🔹 XGBoost (Phase 1)
Predicts race finishing position
Uses structured race + contextual features
🔹 Random Forest (Phase 2)
Analyzes driver performance trends
Captures consistency and volatility
4. AI Orchestrator

A custom Python orchestration layer:

Executes multiple models
Merges predictions
Detects conflicts between models
Generates final insight
5. Intelligence Layer

Produces:

🧮 Prediction (RF + XGB)
📊 Confidence score (0–1)
🏁 Simulation impact (positive / negative / neutral)
💡 Final insight (AI-generated reasoning)
🔗 System Architecture
Frontend (React)
        ↓
Spring Boot Backend
        ↓
AI Service Layer
        ↓
Python Orchestrator
   ↓           ↓
XGBoost     Random Forest
        ↓
Unified Intelligence Response
⚙️ Tech Stack
Backend
Java (Spring Boot)
PostgreSQL
JWT Authentication
AI / ML
Python
XGBoost
Random Forest
NumPy / Pandas
joblib (model persistence)
Integration
Java ProcessBuilder (subprocess communication)
JSON-based data exchange via STDIN
Frontend
React (in progress)
📦 API Example
GET /api/ai/driver-intelligence/{driverId}
{
  "driverId": 47,
  "rfPrediction": 7.83,
  "xgbPrediction": 1.88,
  "confidence": 0.001,
  "confidenceLabel": "low",
  "simulationImpact": "positive",
  "finalInsight": "Model predictions are conflicting — race outcome is highly uncertain"
}
💡 What Makes This Different

This is not just a prediction model.

It is a decision-support system that:

Combines multiple ML models
Evaluates prediction reliability
Explains outcomes with contextual reasoning
🚀 Future Enhancements
🔍 True probability-based confidence using predict_proba
📊 Driver performance trend visualization
🤖 AI Explainability (feature importance insights)
🗄️ Prediction history tracking
☁️ Deployment (cloud + containerization)
🧠 Learning Outcomes
Built a multi-model AI system
Designed a cross-language architecture (Java + Python)
Implemented real-world data pipelines + feature engineering
Learned ML integration in production systems
👨‍💻 Author

Mohammad Adnan Shakil

Aspiring Full-Stack + AI Engineer
Focused on building real-world intelligent systems
