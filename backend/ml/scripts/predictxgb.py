import sys
import json
import joblib
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")


def safe_encode(encoder, value):
    try:
        return encoder.transform([value])[0]
    except:
        return 0


# Feature names matching v2 training
feature_names = [
    "career_avg_finish", "career_wins", "career_poles",
    "recent_5_avg", "recent_10_avg",
    "circuit_avg_finish", "circuit_appearances",
    "season_avg_finish", "grid_position",
    "team_avg_finish", "years_experience", "championship_position"
]


def predict(input_data: dict, model=None, le_constructor=None, le_driver=None, le_track=None):
    """Predict using XGBoost model"""
    # Load models if not provided
    if model is None:
        model = joblib.load(os.path.join(MODEL_DIR, "xgboost_model_v2.pkl"))
    
    features = np.array([[
        float(input_data.get("career_avg_finish", 0.0)),
        float(input_data.get("career_wins", 0)),
        float(input_data.get("career_poles", 0)),
        float(input_data.get("recent_5_avg", input_data.get("avg_last_5", 10.0))),
        float(input_data.get("recent_10_avg", input_data.get("avg_last_10", 10.0))),
        float(input_data.get("circuit_avg_finish", 10.0)),
        float(input_data.get("circuit_appearances", 0)),
        float(input_data.get("season_avg_finish", 10.0)),
        float(input_data.get("grid_position", input_data.get("qualifying_position", 10))),
        float(input_data.get("team_avg_finish", 10.0)),
        float(input_data.get("years_experience", 1)),
        float(input_data.get("championship_position", 10))
    ]])
    
    prediction = float(model.predict(features)[0])
    
    # Extract feature importances from XGBoost model
    feature_importances = {}
    if hasattr(model, 'feature_importances_'):
        importances = model.feature_importances_
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
            if feature_name == "career_avg_finish":
                explanation = f"Career avg: P{feature_value:.1f}" if feature_value else "Career avg: No data"
            elif feature_name == "career_wins":
                explanation = f"Career wins: {int(feature_value) if feature_value else 0}"
            elif feature_name == "recent_5_avg":
                explanation = f"Last 5 avg: P{feature_value:.1f}" if feature_value else "Last 5 avg: No data"
            elif feature_name == "recent_10_avg":
                explanation = f"Last 10 avg: P{feature_value:.1f}" if feature_value else "Last 10 avg: No data"
            elif feature_name == "grid_position":
                explanation = f"Grid: P{int(feature_value) if feature_value else 'unknown'}"
            elif feature_name == "season_avg_finish":
                explanation = f"Season avg: P{feature_value:.1f}" if feature_value else "Season avg: No data"
            elif feature_name == "team_avg_finish":
                explanation = f"Team avg finish: P{feature_value:.1f}" if feature_value else "Team avg: No data"
            elif feature_name == "circuit_avg_finish":
                explanation = f"Circuit avg: P{feature_value:.1f}" if feature_value else "Circuit avg: No data"
            elif feature_name == "years_experience":
                explanation = f"Experience: {int(feature_value) if feature_value else 0} seasons"
            elif feature_name == "championship_position":
                explanation = f"Standings: P{int(feature_value) if feature_value else 'unknown'}"
            elif feature_name == "career_poles":
                explanation = f"Career poles: {int(feature_value) if feature_value else 0}"
            elif feature_name == "circuit_appearances":
                explanation = f"Circuit appearances: {int(feature_value) if feature_value else 0}"
            
            top_features.append({
                "feature": feature_name,
                "importance": importance,
                "explanation": explanation
            })
    
    output = {
        "predicted_position": round(prediction, 2),
        "feature_importances": feature_importances,
        "top_features": top_features
    }
    
    return output


# Legacy subprocess support (for backward compatibility)
if __name__ == "__main__":
    try:
        model = joblib.load(os.path.join(MODEL_DIR, "xgboost_model_v2.pkl"))
    except Exception as e:
        print(json.dumps({"error": f"Model loading failed: {str(e)}"}))
        sys.exit(1)
    
    try:
        input_json = json.loads(sys.stdin.read())
    except Exception as e:
        print(json.dumps({"error": f"Invalid input: {str(e)}"}))
        sys.exit(1)
    
    result = predict(input_json, model)
    print(json.dumps(result))