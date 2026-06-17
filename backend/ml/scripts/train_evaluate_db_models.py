#!/usr/bin/env python3
"""
Train and evaluate DeltaBox ML models from the DB-backed historical dataset.

This replaces the toy CSV-based training path for evaluation purposes. It uses
feature_engineering_v3.build_training_dataset(), a fixed 80/20 train/test split,
and saves new model filenames without overwriting the old production artifacts.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path

import joblib
import numpy as np
import xgboost as xgb
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = BASE_DIR / "models"
sys.path.insert(0, str(BASE_DIR))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from utils.feature_engineering_v3 import (  # noqa: E402
    build_training_dataset,
    get_db_connection,
    get_feature_names,
)


def position_metrics(y_true, y_pred):
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    rounded = np.clip(np.rint(y_pred), 1, 20).astype(int)
    actual = y_true.astype(int)

    exact_correct = int((rounded == actual).sum())
    top3_correct = int((np.abs(rounded - actual) <= 3).sum())
    sample_count = len(actual)

    return {
        "test_samples": sample_count,
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "r2": float(r2_score(y_true, y_pred)),
        "exact_match_accuracy": float(exact_correct / sample_count),
        "top3_accuracy": float(top3_correct / sample_count),
        "exact_correct": exact_correct,
        "top3_correct": top3_correct,
    }


def print_metrics(name, metrics):
    print(f"\n{name}")
    print("-" * len(name))
    print(f"Test samples: {metrics['test_samples']}")
    print(f"MAE:          {metrics['mae']:.3f}")
    print(f"RMSE:         {metrics['rmse']:.3f}")
    print(f"R2:           {metrics['r2']:.3f}")
    print(
        "Exact match:  "
        f"{metrics['exact_match_accuracy']:.2%} "
        f"({metrics['exact_correct']}/{metrics['test_samples']})"
    )
    print(
        "Top-3:        "
        f"{metrics['top3_accuracy']:.2%} "
        f"({metrics['top3_correct']}/{metrics['test_samples']})"
    )


def main():
    started_at = datetime.now()
    print("DeltaBox DB-backed model training/evaluation")
    print("=" * 64)
    print(f"Started: {started_at:%Y-%m-%d %H:%M:%S}")

    conn = get_db_connection()
    try:
        df = build_training_dataset(conn, min_samples_per_driver=5)
    finally:
        conn.close()

    feature_names = get_feature_names()
    if df.empty:
        raise RuntimeError("DB-backed training dataframe is empty.")
    if len(df) < 100:
        raise RuntimeError(f"Need at least 100 rows for meaningful training; got {len(df)}.")

    X = df[feature_names].fillna(0)
    y = df["target_finish_position"].fillna(df["target_finish_position"].median())

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
    )

    print(f"\nDataset rows: {len(df)}")
    print(f"Feature count: {len(feature_names)}")
    print(f"Training samples: {len(X_train)}")
    print(f"Test samples: {len(X_test)}")
    print(f"Target: target_finish_position")

    rf_model = RandomForestRegressor(
        n_estimators=300,
        max_depth=15,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    xgb_model = xgb.XGBRegressor(
        n_estimators=300,
        max_depth=7,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="reg:squarederror",
        random_state=42,
        n_jobs=-1,
    )

    print("\nTraining Random Forest...")
    rf_model.fit(X_train, y_train)

    print("Training XGBoost...")
    xgb_model.fit(X_train, y_train)

    rf_pred = rf_model.predict(X_test)
    xgb_pred = xgb_model.predict(X_test)
    blended_pred = (rf_pred + xgb_pred) / 2.0

    metrics = {
        "training_date": datetime.now().isoformat(),
        "dataset_rows": int(len(df)),
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "feature_names": feature_names,
        "target": "target_finish_position",
        "random_forest": position_metrics(y_test, rf_pred),
        "xgboost": position_metrics(y_test, xgb_pred),
        "blended": position_metrics(y_test, blended_pred),
    }

    print("\nEvaluation")
    print("=" * 64)
    print_metrics("Random Forest", metrics["random_forest"])
    print_metrics("XGBoost", metrics["xgboost"])
    print_metrics("Blended Average", metrics["blended"])

    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    rf_path = MODEL_DIR / "random_forest_model_v2.pkl"
    xgb_path = MODEL_DIR / "xgboost_model_v2.pkl"
    feature_path = MODEL_DIR / "feature_names_v2.pkl"
    metrics_path = MODEL_DIR / "model_metrics_v2.json"

    joblib.dump(rf_model, rf_path)
    joblib.dump(xgb_model, xgb_path)
    joblib.dump(feature_names, feature_path)
    metrics_path.write_text(json.dumps(metrics, indent=2), encoding="utf-8")

    print("\nSaved artifacts")
    print("=" * 64)
    print(f"Random Forest: {rf_path}")
    print(f"XGBoost:       {xgb_path}")
    print(f"Features:      {feature_path}")
    print(f"Metrics:       {metrics_path}")
    print(f"Completed:     {datetime.now():%Y-%m-%d %H:%M:%S}")


if __name__ == "__main__":
    main()
