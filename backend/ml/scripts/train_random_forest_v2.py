"""
Enhanced Random Forest Model Training
Trains on 77 years of historical F1 data (1950-2026) with rich feature engineering
"""

import pandas as pd
import numpy as np
import joblib
import os
import psycopg2
import sys
from datetime import datetime

# Add utils to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score
from utils.feature_engineering_v2 import build_training_dataset, get_feature_names

# Configuration
DB_HOST = "localhost"
DB_NAME = "f1pulse"
DB_USER = "postgres"
DB_PASS = "adnanshakil20"
DB_PORT = 5432

MODEL_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')
os.makedirs(MODEL_DIR, exist_ok=True)

print("=" * 60)
print("🏎️  ApexIQ - RANDOM FOREST MODEL TRAINING (v2)")
print("=" * 60)
print(f"📅 Training Start: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print()

try:
    # Connect to database
    print("📡 Connecting to PostgreSQL...")
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        port=DB_PORT
    )
    print("✅ Database connected")
    print()

    # Build training dataset from historical data
    print("🔨 Building training dataset from historical F1 data...")
    df = build_training_dataset(conn)
    conn.close()
    
    if df.empty or len(df) < 100:
        print("❌ Insufficient training data (need at least 100 samples)")
        sys.exit(1)
    
    print(f"📊 Dataset shape: {df.shape}")
    print(f"   Total samples: {len(df)}")
    print(f"   Features: {len(df.columns) - 1}")
    print()
    
    # Feature engineering
    print("🔧 Feature Engineering...")
    feature_names = get_feature_names()
    X = df[feature_names]
    y = df['target_finish_position']
    
    print(f"   Features: {len(feature_names)}")
    print(f"   Target variable: Finish Position (1=1st, 2=2nd, etc.)")
    print()
    
    # Handle missing values
    X = X.fillna(0)
    y = y.fillna(y.median())
    
    # Check for any remaining NaN
    if X.isnull().any().any() or y.isnull().any():
        X = X.dropna()
        y = y[X.index]
    
    print(f"✅ Cleaned dataset: {X.shape[0]} samples")
    print()
    
    # Split data
    print("✂️  Train/Test Split (80/20)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"   Training: {len(X_train)} samples")
    print(f"   Testing: {len(X_test)} samples")
    print()
    
    # Train Random Forest
    print("🌲 Training Random Forest...")
    print("   Parameters:")
    print("   - n_estimators: 200")
    print("   - max_depth: 15")
    print("   - min_samples_split: 5")
    print("   - random_state: 42")
    print()
    
    model = RandomForestRegressor(
        n_estimators=200,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,  # Use all CPU cores
        verbose=1
    )
    
    model.fit(X_train, y_train)
    print("✅ Training complete")
    print()
    
    # Evaluate
    print("📈 Model Evaluation")
    y_train_pred = model.predict(X_train)
    y_test_pred = model.predict(X_test)
    
    train_mae = mean_absolute_error(y_train, y_train_pred)
    test_mae = mean_absolute_error(y_test, y_test_pred)
    train_r2 = r2_score(y_train, y_train_pred)
    test_r2 = r2_score(y_test, y_test_pred)
    
    print(f"   Training MAE:  {train_mae:.4f}")
    print(f"   Testing MAE:   {test_mae:.4f}")
    print(f"   Training R²:   {train_r2:.4f}")
    print(f"   Testing R²:    {test_r2:.4f}")
    print()
    
    # Feature importance
    print("🔝 Top 10 Most Important Features")
    feature_importance = list(zip(feature_names, model.feature_importances_))
    feature_importance.sort(key=lambda x: x[1], reverse=True)
    
    for i, (name, importance) in enumerate(feature_importance[:10], 1):
        print(f"   {i:2d}. {name:30s} {importance:.4f}")
    print()
    
    # Save model
    print("💾 Saving model...")
    model_path = os.path.join(MODEL_DIR, "rf_model_v2.pkl")
    feature_path = os.path.join(MODEL_DIR, "rf_feature_names.pkl")
    
    joblib.dump(model, model_path)
    joblib.dump(feature_names, feature_path)
    
    print(f"   Model saved: {model_path}")
    print(f"   Features saved: {feature_path}")
    print()
    
    print("=" * 60)
    print("✅ RANDOM FOREST TRAINING COMPLETE")
    print("=" * 60)
    print(f"📅 Training End: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()

except Exception as e:
    print()
    print("=" * 60)
    print("❌ ERROR DURING TRAINING")
    print("=" * 60)
    print(f"Error: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
