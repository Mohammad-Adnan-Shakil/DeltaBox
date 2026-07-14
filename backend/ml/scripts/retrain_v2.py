"""
Retrain v2 models using the CSV data with features matching ml-service/app.py prediction pipeline
"""
import pandas as pd
import numpy as np
import joblib
import os
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
from xgboost import XGBRegressor

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', '..', '..', 'ml-service', 'models')
os.makedirs(MODEL_DIR, exist_ok=True)
print(f"Model directory: {MODEL_DIR}")
print(f"Training start: {datetime.now().isoformat()}")
print()

# ===== Load RF data =====
rf_data = pd.read_csv(os.path.join(os.path.dirname(__file__), '..', 'data', 'driver_performance_data.csv'))
print(f"RF data: {len(rf_data)} rows, columns: {list(rf_data.columns)}")
print(f"  Unique drivers: {rf_data['driver_id'].nunique()}")

# RF features match predict_rf in ml-service/app.py
rf_feature_cols = ['driver_id', 'avg_last_5', 'std_last_5', 'avg_last_10', 'std_last_10', 'last_race_position']
X_rf = rf_data[rf_feature_cols].copy()
y_rf = rf_data['target_next_race_position']

# Encode driver_id
le_driver = LabelEncoder()
X_rf['driver_id'] = le_driver.fit_transform(X_rf['driver_id'].astype(str))

# Handle missing values
X_rf = X_rf.fillna(0)
y_rf = y_rf.fillna(y_rf.median())

print(f"  Training samples: {len(X_rf)}")
print()

# ===== Train RF =====
print("Training Random Forest...")
rf_model = RandomForestRegressor(
    n_estimators=200, max_depth=10, min_samples_split=5,
    min_samples_leaf=2, random_state=42, n_jobs=-1
)
rf_model.fit(X_rf, y_rf)

# Evaluate RF
rf_pred = rf_model.predict(X_rf)
rf_mae = mean_absolute_error(y_rf, rf_pred)
rf_r2 = r2_score(y_rf, rf_pred)
print(f"  RF MAE: {rf_mae:.4f}")
print(f"  RF R²:  {rf_r2:.4f}")
print(f"  RF features: {rf_feature_cols}")
print()

# ===== Load XGB data =====
xgb_data = pd.read_csv(os.path.join(os.path.dirname(__file__), '..', 'data', 'f1_training_data.csv'))
print(f"XGB data: {len(xgb_data)} rows, columns: {list(xgb_data.columns)}")
print(f"  Unique constructors: {xgb_data['constructor_id'].nunique()}")
print(f"  Unique tracks: {xgb_data['track_id'].nunique()}")

# XGB features match predict_xgb in ml-service/app.py
xgb_feature_cols = [
    'qualifying_position', 'constructor_id', 'track_id', 'season_year',
    'recent_avg_position_last_5', 'recent_std_last_5', 'grid_position', 'is_home_race'
]
X_xgb = xgb_data[xgb_feature_cols].copy()
y_xgb = xgb_data['finishing_position']

# Encode categoricals
le_constructor = LabelEncoder()
le_track = LabelEncoder()
X_xgb['constructor_id'] = le_constructor.fit_transform(X_xgb['constructor_id'].astype(str))
X_xgb['track_id'] = le_track.fit_transform(X_xgb['track_id'].astype(str))

# Handle missing values
X_xgb = X_xgb.fillna(0)
y_xgb = y_xgb.fillna(y_xgb.median())

print(f"  Training samples: {len(X_xgb)}")
print()

# ===== Train XGB =====
print("Training XGBoost...")
xgb_model = XGBRegressor(
    n_estimators=300, max_depth=6, learning_rate=0.05,
    subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1
)
xgb_model.fit(X_xgb, y_xgb)

# Evaluate XGB
xgb_pred = xgb_model.predict(X_xgb)
xgb_mae = mean_absolute_error(y_xgb, xgb_pred)
xgb_r2 = r2_score(y_xgb, xgb_pred)
print(f"  XGB MAE: {xgb_mae:.4f}")
print(f"  XGB R²:  {xgb_r2:.4f}")
print(f"  XGB features: {xgb_feature_cols}")
print()

# ===== Save models =====
print("Saving models...")
joblib.dump(rf_model, os.path.join(MODEL_DIR, 'random_forest_model_v2.pkl'))
joblib.dump(xgb_model, os.path.join(MODEL_DIR, 'xgboost_model_v2.pkl'))
joblib.dump(rf_feature_cols + xgb_feature_cols, os.path.join(MODEL_DIR, 'feature_names_v2.pkl'))
joblib.dump(le_driver, os.path.join(MODEL_DIR, 'le_driver.pkl'))
joblib.dump(le_constructor, os.path.join(MODEL_DIR, 'le_constructor.pkl'))
joblib.dump(le_track, os.path.join(MODEL_DIR, 'le_track.pkl'))
print(f"  Saved to: {MODEL_DIR}")
print()

print(f"Training complete: {datetime.now().isoformat()}")
print()
print("Summary:")
print(f"  RF training samples: {len(X_rf)}")
print(f"  RF MAE: {rf_mae:.4f}, R²: {rf_r2:.4f}")
print(f"  RF features: {rf_feature_cols}")
print(f"  XGB training samples: {len(X_xgb)}")
print(f"  XGB MAE: {xgb_mae:.4f}, R²: {xgb_r2:.4f}")
print(f"  XGB features: {xgb_feature_cols}")
print(f"  Combined feature_names_v2.pkl: {rf_feature_cols + xgb_feature_cols}")
