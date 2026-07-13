#!/usr/bin/env python3
"""
DeltaBox ML Service - Flask REST API
Wraps Python ML scripts for race predictions, driver insights, and simulations.
"""

import os
import sys
import json
import math
import logging
from typing import Dict, Any, List, Optional
from flask import Flask, request, jsonify
from flask_cors import CORS
from urllib.parse import unquote

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Add script directories to path. The Render ML service runs from ml-service/,
# while the FastF1 telemetry script is shared with the backend ML folder.
SCRIPT_DIRS = [
    os.path.join(BASE_DIR, "scripts"),
    os.path.abspath(os.path.join(BASE_DIR, "..", "backend", "ml", "scripts")),
]
for script_dir in SCRIPT_DIRS:
    if os.path.isdir(script_dir) and script_dir not in sys.path:
        sys.path.insert(0, script_dir)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Global model cache
models = {}
models_loaded = False
training_in_progress = False


def check_models_exist():
    """Check if all required model files exist"""
    required_files = [
        "random_forest_model_v2.pkl",
        "xgboost_model_v2.pkl",
        "feature_names_v2.pkl",
        "le_constructor.pkl",
        "le_driver.pkl",
        "le_track.pkl"
    ]
    for fname in required_files:
        if not os.path.exists(os.path.join(MODELS_DIR, fname)):
            logger.info(f"Model file missing: {fname}")
            return False
    return True


def load_models():
    """Load all ML models on startup"""
    global models, models_loaded
    try:
        import joblib
        models["rf"] = joblib.load(os.path.join(MODELS_DIR, "random_forest_model_v2.pkl"))
        models["xgb"] = joblib.load(os.path.join(MODELS_DIR, "xgboost_model_v2.pkl"))
        models["feature_names"] = joblib.load(os.path.join(MODELS_DIR, "feature_names_v2.pkl"))
        models["le_constructor"] = joblib.load(os.path.join(MODELS_DIR, "le_constructor.pkl"))
        models["le_driver"] = joblib.load(os.path.join(MODELS_DIR, "le_driver.pkl"))
        models["le_track"] = joblib.load(os.path.join(MODELS_DIR, "le_track.pkl"))
        logger.info("All models loaded successfully")
        models_loaded = True
        return True
    except Exception as e:
        logger.error(f"❌ Error loading models: {e}")
        models_loaded = False
        return False


# Initialize models on startup
logger.info("Initializing ML models...")
os.makedirs(MODELS_DIR, exist_ok=True)
logger.info(f"Models directory: {MODELS_DIR}")

if not check_models_exist():
    raise RuntimeError(
        "V2 model files missing in ml-service/models/. "
        "Synthetic training fallback is disabled in production. "
        "Run `cp backend/ml/models/*_v2.pkl ml-service/models/` to deploy trained models."
    )

models_loaded = load_models()


def simulate_impact(predicted: float, avg_last5: float) -> str:
    """Determine if prediction is positive, negative, or neutral compared to average"""
    if predicted < avg_last5:
        return "positive"
    if predicted > avg_last5:
        return "negative"
    return "neutral"


def generate_insight(rf_pred: float, xgb_pred: float, avg_last5: float, std_last5: float) -> str:
    """Generate insight based on model predictions and performance metrics"""
    if abs(rf_pred - xgb_pred) > 5:
        return "Model predictions are conflicting; race outcome is highly uncertain"
    if rf_pred < avg_last5 and std_last5 < 2:
        return "Driver is improving with strong consistency"
    if std_last5 > 4:
        return "Driver performance is unstable and unpredictable"
    return "Driver performance is moderate with no clear trend"


def calculate_trend(recent_avg_finish: float, season_avg_finish: float) -> str:
    """Calculate trend based on recent vs season performance"""
    if recent_avg_finish < season_avg_finish - 1:
        return "IMPROVING"
    elif recent_avg_finish > season_avg_finish + 1:
        return "DECLINING"
    else:
        return "STABLE"


def get_dynamic_weights(trend: str, consistency: float) -> Dict[str, float]:
    """Calculate dynamic weights based on trend and consistency"""
    # High consistency + stable trend → trust career more
    if consistency > 90 and trend == "STABLE":
        return {"career": 0.30, "season": 0.45, "recent": 0.25}
    
    # Declining performance → recent matters more
    if trend == "DECLINING":
        return {"career": 0.15, "season": 0.40, "recent": 0.45}
    
    # Improving trend → lean into recent performance
    if trend == "IMPROVING":
        return {"career": 0.15, "season": 0.35, "recent": 0.50}
    
    # Default balanced case
    return {"career": 0.20, "season": 0.50, "recent": 0.30}


def compute_weighted_finish(career_avg: float, season_avg: float, recent_avg: float, 
                            trend: str, consistency: float) -> float:
    """Compute weighted average finish using dynamic multi-timescale model"""
    weights = get_dynamic_weights(trend, consistency)
    return (
        weights["career"] * career_avg +
        weights["season"] * season_avg +
        weights["recent"] * recent_avg
    )


def adjust_confidence_divergence(confidence: float, career_avg: float, recent_avg: float) -> float:
    """Adjust confidence based on divergence between career and recent performance"""
    diff = abs(career_avg - recent_avg)
    
    if diff > 2:
        confidence *= 0.75  # significant disagreement
    elif diff > 1:
        confidence *= 0.85
    
    return max(confidence, 0.05)  # clamp minimum 5%


def generate_advanced_insight(weights: Dict[str, float], trend: str, 
                              career_avg: float, season_avg: float, recent_avg: float) -> str:
    """Generate advanced insight with contextual reasoning"""
    parts = []
    
    max_weight = max(weights["career"], weights["season"], weights["recent"])
    
    # Dominant factor
    if max_weight == weights["season"]:
        parts.append("Current season performance is the primary driver of this prediction")
    elif max_weight == weights["recent"]:
        if trend == "DECLINING":
            parts.append("Recent performance decline is heavily influencing the prediction")
        elif trend == "IMPROVING":
            parts.append("Recent improvement is boosting expected performance")
        else:
            parts.append("Recent performance trends are shaping the prediction")
    else:
        parts.append("Strong long-term consistency is stabilizing the prediction")
    
    # Add supporting context
    if abs(career_avg - recent_avg) < 1:
        parts.append("performance across timeframes is well aligned")
    else:
        parts.append("there is variation between long-term and recent performance")
    
    return ", ".join(parts) + "."


def generate_divergence_insight(career_avg: float, recent_avg: float) -> Optional[str]:
    """Generate insight based on divergence between career and recent performance"""
    diff = abs(career_avg - recent_avg)
    
    if diff > 3:
        return "High variance between long-term and recent performance reduces prediction reliability."
    
    if diff > 1.5:
        return "Moderate variation between career and recent performance detected."
    
    return None


def generate_confidence_reason(career_avg: float, season_avg: float, 
                               recent_avg: float, confidence: float) -> str:
    """Generate dynamic confidence reason based on data differences"""
    reasons = []
    
    diff_cr = abs(career_avg - recent_avg)
    diff_sr = abs(season_avg - recent_avg)
    
    if diff_cr > 2:
        reasons.append("high variance between long-term and recent performance")
    
    if diff_sr > 1.5:
        reasons.append("recent form deviates from current season trends")
    
    if confidence < 15:
        reasons.append("overall prediction uncertainty is extremely high")
    
    return ", ".join(reasons) if reasons else "prediction uncertainty due to performance variability"


def get_divergence(career_avg: float, recent_avg: float) -> Dict[str, Any]:
    """Calculate divergence between career and recent performance"""
    diff = abs(career_avg - recent_avg)
    
    return {
        "diff": diff,
        "message": "High divergence detected" if diff > 2 else "Performance is relatively stable"
    }


def get_final_insights(weights: Dict[str, float], trend: str, 
                       career_avg: float, season_avg: float, recent_avg: float) -> List[str]:
    """Combine all insights into a list"""
    main_insight = generate_advanced_insight(weights, trend, career_avg, season_avg, recent_avg)
    divergence_insight = generate_divergence_insight(career_avg, recent_avg)
    
    insights = [main_insight]
    if divergence_insight:
        insights.append(divergence_insight)
    
    return insights


def calculate_prediction_range(avg_finish: float, confidence: float, 
                               trend: str, simulation_impact: str) -> str:
    """Calculate predicted position range"""
    # Base range from confidence (strict ranges)
    if confidence < 15:
        range_min, range_max = 5, 10
    elif confidence < 30:
        range_min, range_max = 3, 6
    elif confidence < 60:
        range_min, range_max = 2, 4
    else:
        range_min, range_max = 1, 2
    
    # Adjust using trend
    if trend == "DECLINING":
        range_min += 1
        range_max += 2
    
    # Adjust using simulation (negative impact means projectedAvg > avgFinish)
    if simulation_impact == "negative":
        range_min += 1
        range_max += 1
    
    # Clamp to valid range
    range_min = max(1, min(20, range_min))
    range_max = max(1, min(20, range_max))
    
    # Ensure min <= max
    if range_min > range_max:
        range_min, range_max = range_max, range_min
    
    return f"P{range_min}–P{range_max}"


def calculate_uncertainty_factors(confidence: float, trend: str, 
                                  std_last5: float, simulation_impact: str) -> List[str]:
    """Calculate factors contributing to low confidence"""
    factors = []
    
    if confidence < 30:
        factors.append("Low confidence due to limited data or inconsistent performance")
    
    if trend == "DECLINING":
        factors.append("Declining recent performance trend")
    
    if std_last5 > 3:
        factors.append("High performance variance (unstable results)")
    
    if simulation_impact == "negative":
        factors.append("Projected performance drop in simulation")
    
    if confidence < 15:
        factors.append("Outcome variance is very high")
    
    return factors if factors else ["Prediction based on stable performance data"]


def calculate_probability_distribution(avg_finish: float, confidence: float) -> List[Dict[str, float]]:
    """Calculate probability distribution for finish positions using gaussian distribution"""
    distribution = []
    variance = (100 - confidence) / 100 * 5
    
    for pos in range(1, 21):
        prob = math.exp(-math.pow(pos - avg_finish, 2) / (2 * variance))
        distribution.append({
            "position": pos,
            "probability": prob
        })
    
    # Normalize to sum to 1.0
    total = sum(d["probability"] for d in distribution)
    for d in distribution:
        d["probability"] = d["probability"] / total
    
    return distribution


def run_prediction(input_data: Dict[str, Any]) -> Dict[str, Any]:
    """Run ML prediction using loaded models"""
    try:
        import numpy as np

        # 12 features in exact v2 model training order
        feature_values = np.array([[
            float(input_data.get("career_avg_finish", 10.0)),
            int(input_data.get("career_wins", 0)),
            int(input_data.get("career_poles", 0)),
            float(input_data.get("recent_5_avg", 10.0)),
            float(input_data.get("recent_10_avg", 10.0)),
            float(input_data.get("circuit_avg_finish", 10.0)),
            int(input_data.get("circuit_appearances", 0)),
            float(input_data.get("season_avg_finish", 10.0)),
            int(input_data.get("grid_position", 10)),
            float(input_data.get("team_avg_finish", 10.0)),
            int(input_data.get("years_experience", 3)),
            int(input_data.get("championship_position", 10))
        ]])

        # Predict with both models using the same feature vector
        rf_pred = float(models["rf"].predict(feature_values)[0])
        xgb_pred = float(models["xgb"].predict(feature_values)[0])

        # Extract feature importances from XGBoost model
        feature_names = [
            "career_avg_finish", "career_wins", "career_poles",
            "recent_5_avg", "recent_10_avg", "circuit_avg_finish",
            "circuit_appearances", "season_avg_finish", "grid_position",
            "team_avg_finish", "years_experience", "championship_position"
        ]
        feature_importances = {}
        if hasattr(models["xgb"], 'feature_importances_'):
            importances = models["xgb"].feature_importances_
            for i, name in enumerate(feature_names):
                if i < len(importances):
                    feature_importances[name] = round(float(importances[i]), 4)

        # Get top 3 most important features with human-readable explanations
        top_features = []
        if feature_importances:
            sorted_features = sorted(feature_importances.items(), key=lambda x: x[1], reverse=True)
            for feature_name, importance in sorted_features[:3]:
                feature_value = input_data.get(feature_name)
                explanation = ""
                if feature_name == "grid_position":
                    explanation = f"Grid position: Starting from P{int(feature_value) if feature_value else 'unknown'}"
                elif feature_name == "recent_5_avg":
                    explanation = f"Recent form: Average finish of P{feature_value:.1f} in last 5 races" if feature_value else "Recent form: Insufficient data"
                elif feature_name == "recent_10_avg":
                    explanation = f"Mid-term form: Average finish of P{feature_value:.1f} in last 10 races" if feature_value else "Mid-term form: Insufficient data"
                elif feature_name == "career_avg_finish":
                    explanation = f"Career average: P{feature_value:.1f} finish position" if feature_value else "Career average: Insufficient data"
                elif feature_name == "circuit_avg_finish":
                    explanation = f"Track record: Average P{feature_value:.1f} at this circuit" if feature_value else "Track record: No history at this circuit"
                elif feature_name == "circuit_appearances":
                    explanation = f"Circuit experience: {int(feature_value)} previous races here" if feature_value else "Circuit experience: First appearance"
                elif feature_name == "season_avg_finish":
                    explanation = f"Season form: Average P{feature_value:.1f} this season" if feature_value else "Season form: Insufficient data"
                elif feature_name == "team_avg_finish":
                    explanation = f"Team performance: Average P{feature_value:.1f} across all drivers" if feature_value else "Team performance: Insufficient data"
                elif feature_name == "championship_position":
                    explanation = f"Standing: P{int(feature_value)} in championship" if feature_value else "Standing: Not classified"
                elif feature_name == "career_wins":
                    explanation = f"Race wins: {int(feature_value)} career victories" if feature_value else "Race wins: No career wins"
                elif feature_name == "years_experience":
                    explanation = f"Experience: {int(feature_value)} years in F1" if feature_value else "Experience: Rookie"
                elif feature_name == "career_poles":
                    explanation = f"Pole positions: {int(feature_value)} career poles" if feature_value else "Pole positions: No career poles"

                top_features.append({
                    "feature": feature_name,
                    "importance": importance,
                    "explanation": explanation
                })

        # Extract insight-relevant values from the 12 features
        career_avg = float(input_data.get("career_avg_finish", 10.0))
        season_avg = float(input_data.get("season_avg_finish", 10.0))
        recent_avg = float(input_data.get("recent_5_avg", 10.0))
        std_last5 = 3.0  # not in 12 features; use moderate default
        
        # Calculate trend using recent vs season performance
        trend = calculate_trend(recent_avg, season_avg)
        
        # Calculate consistency (inverse of std - higher std = lower consistency)
        consistency = max(0, 100 - (std_last5 * 10)) if std_last5 > 0 else 50
        
        # Inter-model agreement confidence (replaces variance-based heuristic)
        disagreement = abs(float(rf_pred) - float(xgb_pred))
        
        if disagreement <= 1.0:
            confidence = 0.85
            confidence_label = "HIGH"
        elif disagreement <= 3.0:
            confidence = 0.65
            confidence_label = "MEDIUM"
        elif disagreement <= 5.0:
            confidence = 0.40
            confidence_label = "LOW"
        else:
            confidence = 0.20
            confidence_label = "VERY LOW"
        
        # Calculate average prediction
        avg_prediction = (rf_pred + xgb_pred) / 2
        
        # Get dynamic weights based on trend and consistency
        weights = get_dynamic_weights(trend, consistency)
        
        # Use weighted multi-timescale model for base finish position
        avg_finish = compute_weighted_finish(career_avg, season_avg, recent_avg, trend, consistency)
        
        # Calculate simulation impact
        impact = simulate_impact(rf_pred, avg_finish)
        
        # Calculate prediction range based on confidence, trend, and simulation impact
        predicted_range = calculate_prediction_range(avg_finish, confidence * 100, trend, impact)
        
        # Validation guard: prevent invalid prediction states
        if confidence * 100 < 30 and predicted_range.startswith("P1"):
            raise ValueError("Invalid state: High outcome with low confidence")
        
        # Calculate uncertainty factors
        uncertainty_factors = calculate_uncertainty_factors(confidence * 100, trend, std_last5, impact)
        
        # Calculate probability distribution
        probability_distribution = calculate_probability_distribution(avg_finish, confidence * 100)
        
        # Generate insights using the new insight engine
        insights = get_final_insights(weights, trend, career_avg, season_avg, recent_avg)
        
        # Keep a single final_insight for backward compatibility
        final_insight = insights[0] if insights else generate_insight(rf_pred, xgb_pred, avg_finish, std_last5)
        
        # Generate confidence reason
        confidence_reason = generate_confidence_reason(career_avg, season_avg, recent_avg, confidence * 100)
        
        # Calculate divergence
        divergence = get_divergence(career_avg, recent_avg)
        
        # Build performance breakdown
        performance_breakdown = {
            "career": career_avg,
            "season": season_avg,
            "recent": recent_avg,
            "weighted": avg_finish
        }
        
        # Include applied weights in response
        applied_weights = weights
        
        response = {
            "driver_id": str(input_data.get("driver_id", "0")),
            "rf_prediction": rf_pred,
            "xgb_prediction": xgb_pred,
            "confidence": confidence,
            "confidence_label": confidence_label,
            "simulation_impact": impact,
            "final_insight": final_insight,
            "top_features": top_features,
            "predicted_range": predicted_range,
            "probability_distribution": probability_distribution,
            "trend": trend,
            "uncertainty_factors": uncertainty_factors,
            "performance_breakdown": performance_breakdown,
            "applied_weights": applied_weights,
            "insights": insights,
            "divergence": divergence,
            "confidence_reason": confidence_reason
        }
        
        return response
        
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return {"error": str(e)}


def compare_drivers(driverA_data: Dict[str, Any], driverB_data: Dict[str, Any]) -> Dict[str, Any]:
    """Compare two drivers and calculate win probabilities"""
    try:
        # Run prediction pipeline for both drivers
        resultA = run_prediction(driverA_data)
        resultB = run_prediction(driverB_data)
        
        if "error" in resultA:
            raise Exception(f"Driver A prediction failed: {resultA['error']}")
        if "error" in resultB:
            raise Exception(f"Driver B prediction failed: {resultB['error']}")
        
        # Get weighted avg finish from performance breakdown
        avg_finish_A = resultA.get("performance_breakdown", {}).get("weighted", 10.0)
        avg_finish_B = resultB.get("performance_breakdown", {}).get("weighted", 10.0)
        
        # Convert avg finish to performance score (lower is better, so invert)
        scoreA = 1 / avg_finish_A
        scoreB = 1 / avg_finish_B
        
        # Calculate win probabilities
        total = scoreA + scoreB
        win_prob_A = scoreA / total
        win_prob_B = scoreB / total
        
        # Apply confidence weighting
        confidence_A = resultA.get("confidence", 0.5) * 100
        confidence_B = resultB.get("confidence", 0.5) * 100
        
        # If both low confidence, show warning
        low_confidence_warning = None
        if confidence_A < 20 and confidence_B < 20:
            low_confidence_warning = "Comparison unreliable due to low confidence"
        
        return {
            "driverA": {
                "name": driverA_data.get("driver_name", "Driver A"),
                "range": resultA.get("predicted_range", "P5–P10"),
                "confidence": confidence_A,
                "winProbability": win_prob_A,
                "insights": resultA.get("insights", [])
            },
            "driverB": {
                "name": driverB_data.get("driver_name", "Driver B"),
                "range": resultB.get("predicted_range", "P5–P10"),
                "confidence": confidence_B,
                "winProbability": win_prob_B,
                "insights": resultB.get("insights", [])
            },
            "winner": driverA_data.get("driver_name", "Driver A") if win_prob_A > win_prob_B else driverB_data.get("driver_name", "Driver B"),
            "lowConfidenceWarning": low_confidence_warning
        }
    except Exception as e:
        logger.error(f"Comparison error: {str(e)}")
        raise


# ==================== API ENDPOINTS ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for Render deployment
    Returns ok even if models are still training, so Render doesn't kill the service during startup.
    """
    global models_loaded, training_in_progress
    
    # Always return ok for health checks - Render just needs to know the service is alive
    # The actual model status is reported but doesn't affect the health status
    status = "ok"
    
    return jsonify({
        "status": status,
        "models_loaded": models_loaded,
        "training_in_progress": training_in_progress,
        "service": "deltabox-ml-service",
        "version": "1.0.0"
    })


@app.route('/predict', methods=['POST'])
def predict():
    """Run ML prediction for race outcome"""
    try:
        input_data = request.get_json()
        
        if not input_data:
            return jsonify({"error": "No input data provided"}), 400
        
        # Convert driver_id to string for model compatibility
        input_data["driver_id"] = str(input_data.get("driver_id", "0"))
        
        # Run prediction
        result = run_prediction(input_data)
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 500
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Prediction endpoint error: {str(e)}")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


@app.route('/compare', methods=['POST'])
def compare():
    """Compare two drivers and calculate win probabilities"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        
        # Extract driver data from request
        driverA_id = data.get("driverA_id")
        driverB_id = data.get("driverB_id")
        gridA = data.get("gridA", 0)
        gridB = data.get("gridB", 0)
        race_id = data.get("race_id")
        
        if not driverA_id or not driverB_id:
            return jsonify({"error": "Both driverA_id and driverB_id are required"}), 400
        
        # Prepare data for driver A
        driverA_data = {
            "driver_id": str(driverA_id),
            "driver_name": data.get("driverA_name", f"Driver {driverA_id}"),
            "grid_position": gridA,
            "race_id": race_id,
            # Add any additional fields from request
            **{k: v for k, v in data.get("driverA_stats", {}).items()}
        }
        
        # Prepare data for driver B
        driverB_data = {
            "driver_id": str(driverB_id),
            "driver_name": data.get("driverB_name", f"Driver {driverB_id}"),
            "grid_position": gridB,
            "race_id": race_id,
            # Add any additional fields from request
            **{k: v for k, v in data.get("driverB_stats", {}).items()}
        }
        
        # Run comparison
        result = compare_drivers(driverA_data, driverB_data)
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Comparison endpoint error: {str(e)}")
        return jsonify({"error": f"Comparison failed: {str(e)}"}), 500


@app.route('/telemetry', methods=['GET'])
def telemetry():
    """Analyze telemetry for two drivers from a specific F1 session using OpenF1 API"""
    try:
        year = request.args.get('year', type=int)
        grand_prix_raw = request.args.get('grand_prix')
        session_type_raw = request.args.get('session_type')
        driver1_raw = request.args.get('driver1')
        driver2_raw = request.args.get('driver2')
        
        # ✅ DECODE URL-encoded parameters
        grand_prix = unquote(grand_prix_raw) if grand_prix_raw else None
        session_type = unquote(session_type_raw) if session_type_raw else None
        driver1 = unquote(driver1_raw) if driver1_raw else None
        driver2 = unquote(driver2_raw) if driver2_raw else None
        
        # 📨 LOG INCOMING REQUEST
        logger.info(f"🎯 TELEMETRY ENDPOINT: Incoming OpenF1 telemetry request")
        logger.info(f"  📊 Raw params: year={year}, grand_prix={grand_prix_raw}, session_type={session_type_raw}, driver1={driver1_raw}, driver2={driver2_raw}")
        logger.info(f"  ✅ Decoded params: year={year}, grand_prix={grand_prix}, session_type={session_type}, driver1={driver1}, driver2={driver2}")
        
        if not all([year, grand_prix, session_type, driver1, driver2]):
            logger.error(f"❌ Missing required parameters")
            return jsonify({
                "error": "Missing required parameters. Need: year, grand_prix, session_type, driver1, driver2"
            }), 400
        
        # Import and run OpenF1 telemetry analysis
        from telemetry_openf1 import analyze
        logger.info(f"🚀 Calling OpenF1 analyze() with: year={year}, grand_prix={grand_prix}, session_type={session_type}, driver1={driver1}, driver2={driver2}")
        
        result = analyze(year, grand_prix, session_type, driver1, driver2)
        
        if "error" in result:
            logger.error(f"❌ Telemetry analysis error: {result['error']}")
            return jsonify({"error": result["error"]}), 500
        
        logger.info(f"✅ Telemetry analysis successful - returning data with {len(result.get('distance', []))} distance points")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ Telemetry endpoint error: {str(e)}", exc_info=True)
        return jsonify({"error": f"Telemetry analysis failed: {str(e)}"}), 500


@app.route('/simulate', methods=['POST'])
def simulate():
    """Run what-if simulation with modified parameters"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        
        # Get base prediction
        input_data = data.get("base_data", {})
        
        # Apply simulation modifiers
        modifiers = data.get("modifiers", {})
        
        # Modify input based on scenario
        if "weather_change" in modifiers:
            # Adjust for weather impact
            input_data["weather_factor"] = modifiers["weather_change"]
        
        if "pit_strategy" in modifiers:
            # Adjust for pit strategy
            input_data["pit_strategy"] = modifiers["pit_strategy"]
        
        if "tire_compound" in modifiers:
            # Adjust for tire compound
            input_data["tire_compound"] = modifiers["tire_compound"]
        
        # Run prediction with modified parameters
        result = run_prediction(input_data)
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 500
        
        # Add simulation metadata
        result["simulation"] = {
            "modifiers_applied": modifiers,
            "base_driver_id": input_data.get("driver_id"),
            "scenario_type": data.get("scenario_type", "custom")
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Simulation endpoint error: {str(e)}")
        return jsonify({"error": f"Simulation failed: {str(e)}"}), 500


@app.route('/insights', methods=['POST'])
def insights():
    """Get performance insights for a driver"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No input data provided"}), 400
        
        driver_id = data.get("driver_id")
        
        if not driver_id:
            return jsonify({"error": "driver_id is required"}), 400
        
        # Prepare input data with defaults if not provided
        input_data = {
            "driver_id": str(driver_id),
            "avg_last_5": data.get("avg_last_5", 0.0),
            "std_last_5": data.get("std_last_5", 0.0),
            "avg_last_10": data.get("avg_last_10", 0.0),
            "std_last_10": data.get("std_last_10", 0.0),
            "last_race_position": data.get("last_race_position", 0.0),
            "qualifying_position": data.get("qualifying_position", 0),
            "constructor_id": data.get("constructor_id", "unknown"),
            "track_id": data.get("track_id", "unknown"),
            "season_year": data.get("season_year", 2026),
            "career_avg_finish": data.get("career_avg_finish", 0.0),
            "season_avg_finish": data.get("season_avg_finish", 0.0),
            "recent_avg_finish": data.get("recent_avg_finish", 0.0),
            **data  # Include any additional fields
        }
        
        # Run prediction to generate insights
        result = run_prediction(input_data)
        
        if "error" in result:
            return jsonify({"error": result["error"]}), 500
        
        # Extract insights-specific data
        insights_response = {
            "driver_id": driver_id,
            "trend": result.get("trend"),
            "confidence": result.get("confidence"),
            "confidence_label": result.get("confidence_label"),
            "predicted_range": result.get("predicted_range"),
            "performance_breakdown": result.get("performance_breakdown"),
            "insights": result.get("insights", []),
            "uncertainty_factors": result.get("uncertainty_factors", []),
            "top_features": result.get("top_features", []),
            "divergence": result.get("divergence"),
            "confidence_reason": result.get("confidence_reason")
        }
        
        return jsonify(insights_response)
        
    except Exception as e:
        logger.error(f"Insights endpoint error: {str(e)}")
        return jsonify({"error": f"Insights generation failed: {str(e)}"}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
