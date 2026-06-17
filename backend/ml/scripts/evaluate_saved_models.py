#!/usr/bin/env python3
"""
Evaluate DeltaBox's saved local ML models against their local CSV datasets.

This does not call any LLM/API service. It recreates the same deterministic
train/test split used by the original training scripts, loads the saved models,
and reports position-regression metrics.
"""

import argparse
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split


BASE_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "models"


def position_metrics(y_true, y_pred):
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)
    rounded = np.clip(np.rint(y_pred), 1, 20).astype(int)
    y_true_int = y_true.astype(int)

    total = len(y_true_int)
    exact = int((rounded == y_true_int).sum())
    within_3 = int((np.abs(rounded - y_true_int) <= 3).sum())

    metrics = {
        "samples": total,
        "mae": float(mean_absolute_error(y_true, y_pred)),
        "rmse": float(np.sqrt(mean_squared_error(y_true, y_pred))),
        "r2": float(r2_score(y_true, y_pred)) if total > 1 else None,
        "exact_position_accuracy": float(exact / total) if total else 0.0,
        "within_3_positions_accuracy": float(within_3 / total) if total else 0.0,
        "exact_correct": exact,
        "within_3_correct": within_3,
    }
    return metrics


def evaluate_random_forest():
    data_path = DATA_DIR / "driver_performance_data.csv"
    model_path = MODEL_DIR / "rf_model.pkl"
    encoder_path = MODEL_DIR / "le_driver.pkl"

    df = pd.read_csv(data_path)
    le_driver = joblib.load(encoder_path)
    model = joblib.load(model_path)

    df["driver_id"] = le_driver.transform(df["driver_id"])

    feature_names = [
        "driver_id",
        "avg_last_5",
        "std_last_5",
        "avg_last_10",
        "std_last_10",
        "last_race_position",
    ]
    X = df[feature_names]
    y = df["target_next_race_position"]

    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    y_pred = model.predict(X_test)

    return {
        "dataset": str(data_path.relative_to(BASE_DIR)),
        "model": str(model_path.relative_to(BASE_DIR)),
        "target": "target_next_race_position",
        "features": feature_names,
        **position_metrics(y_test, y_pred),
    }


def evaluate_xgboost():
    data_path = DATA_DIR / "f1_training_data.csv"
    model_path = MODEL_DIR / "xgb_model.pkl"
    constructor_encoder_path = MODEL_DIR / "le_constructor.pkl"
    track_encoder_path = MODEL_DIR / "le_track.pkl"

    df = pd.read_csv(data_path)
    le_constructor = joblib.load(constructor_encoder_path)
    le_track = joblib.load(track_encoder_path)
    model = joblib.load(model_path)

    df["constructor_id"] = le_constructor.transform(df["constructor_id"])
    df["track_id"] = le_track.transform(df["track_id"])

    feature_names = [
        "qualifying_position",
        "constructor_id",
        "track_id",
        "season_year",
        "recent_avg_position_last_5",
        "recent_std_last_5",
        "grid_position",
        "is_home_race",
    ]
    X = df[feature_names]
    y = df["finishing_position"]

    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    y_pred = model.predict(X_test)

    return {
        "dataset": str(data_path.relative_to(BASE_DIR)),
        "model": str(model_path.relative_to(BASE_DIR)),
        "target": "finishing_position",
        "features": feature_names,
        **position_metrics(y_test, y_pred),
    }


def print_report(results):
    print("DeltaBox saved model evaluation")
    print("=" * 64)

    for name, metrics in results.items():
        print(f"\n{name}")
        print("-" * len(name))
        print(f"Dataset: {metrics['dataset']}")
        print(f"Model:   {metrics['model']}")
        print(f"Target:  {metrics['target']}")
        print(f"Samples: {metrics['samples']}")
        print(f"MAE:     {metrics['mae']:.3f} positions")
        print(f"RMSE:    {metrics['rmse']:.3f} positions")
        if metrics["r2"] is None:
            print("R2:      n/a (test set has one sample)")
        else:
            print(f"R2:      {metrics['r2']:.3f}")
        print(
            "Exact:   "
            f"{metrics['exact_position_accuracy']:.1%} "
            f"({metrics['exact_correct']}/{metrics['samples']})"
        )
        print(
            "Top-3:   "
            f"{metrics['within_3_positions_accuracy']:.1%} "
            f"({metrics['within_3_correct']}/{metrics['samples']})"
        )

    print("\nNote: blended RF+XGB accuracy is not reported because the saved")
    print("models are trained from different CSVs with different feature schemas.")


def main():
    parser = argparse.ArgumentParser(
        description="Evaluate saved DeltaBox ML models locally."
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Print machine-readable JSON instead of a text report.",
    )
    args = parser.parse_args()

    results = {
        "Random Forest": evaluate_random_forest(),
        "XGBoost": evaluate_xgboost(),
    }

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        print_report(results)


if __name__ == "__main__":
    main()
