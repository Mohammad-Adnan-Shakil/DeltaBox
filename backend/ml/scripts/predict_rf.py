import sys
import json
import joblib
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "models")


def encode_safe(le, val):
    try:
        return le.transform([val])[0]
    except:
        return 0


def predict(input_data: dict, model=None, le_constructor=None, le_driver=None, le_track=None):
    """Predict using Random Forest model"""
    # Load models if not provided
    if model is None:
        model = joblib.load(os.path.join(MODEL_DIR, "random_forest_model_v2.pkl"))
    if le_driver is None:
        le_driver = joblib.load(os.path.join(MODEL_DIR, "le_driver.pkl"))
    
    features = pd.DataFrame([{
        "career_avg_finish": input_data.get("career_avg_finish", 0.0),
        "career_wins": input_data.get("career_wins", 0),
        "career_poles": input_data.get("career_poles", 0),
        "recent_5_avg": input_data.get("recent_5_avg", input_data.get("avg_last_5", 10.0)),
        "recent_10_avg": input_data.get("recent_10_avg", input_data.get("avg_last_10", 10.0)),
        "circuit_avg_finish": input_data.get("circuit_avg_finish", 10.0),
        "circuit_appearances": input_data.get("circuit_appearances", 0),
        "season_avg_finish": input_data.get("season_avg_finish", 10.0),
        "grid_position": input_data.get("grid_position", input_data.get("qualifying_position", 10)),
        "team_avg_finish": input_data.get("team_avg_finish", 10.0),
        "years_experience": input_data.get("years_experience", 1),
        "championship_position": input_data.get("championship_position", 10)
    }])
    
    prediction = model.predict(features)[0]
    
    output = {
        "predicted_next_position": round(float(prediction), 2)
    }
    
    return output


# Legacy subprocess support (for backward compatibility)
if __name__ == "__main__":
    try:
        input_json = json.loads(sys.stdin.read())
    except Exception:
        print(json.dumps({"error": "Invalid input"}))
        sys.exit(1)
    
    result = predict(input_json)
    print(json.dumps(result))