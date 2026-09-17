import os
import time
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Resolve project root regardless of where this script is run from
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "AgriInsight_Price_Training_Dataset_CLEAN.csv"
MODELS_DIR = PROJECT_ROOT / "models"


def main():
    print("=" * 75)
    print(" AGRIINSIGHT AI - APMC MANDI PRICE TIME-SERIES FORECASTING MODEL")
    print("=" * 75)

    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at '{DATA_PATH}'.")

    # ==========================================
    # 1. LOAD CLEAN PRE-ENGINEERED DATASET
    # ==========================================
    print("\n[1/6] Loading Clean Pre-Engineered APMC Price Dataset...")
    t0 = time.time()
    df = pd.read_csv(DATA_PATH, parse_dates=["Date"])
    print(f"Loaded {len(df):,} records in {time.time() - t0:.2f}s")
    print(f"  - Crops       : {df['Crop'].nunique()} unique ({', '.join(df['Crop'].unique()[:5])}...)")
    print(f"  - Districts   : {df['District'].nunique()} unique")
    print(f"  - Date range  : {df['Date'].min().date()} to {df['Date'].max().date()}")
    print(f"  - Price range : Rs.{df['Modal_Price'].min():.0f} - Rs.{df['Modal_Price'].max():.0f}/quintal")

    # ==========================================
    # 2. FEATURE SELECTION
    # ==========================================
    print("\n[2/6] Defining Feature Columns...")

    lag_features = [
        "Price_Lag_1", "Price_Lag_7", "Price_Lag_14", "Price_Lag_30",
        "Price_MA_7", "Price_MA_30",
    ]
    calendar_features = ["Month", "DayOfWeek", "DayOfYear", "WeekOfYear"]
    weather_features = [
        "Temperature_C", "TMin_C", "TMax_C",
        "Precipitation_mm_day", "WindSpeed_m_s", "Humidity_pct",
        "RootSoilWetness", "SurfaceSoilWetness", "Irradiance_kWh_m2_day",
        "NDVI",
    ]
    market_features = ["Market_Count", "Record_Count"]

    feature_cols = lag_features + calendar_features + weather_features + market_features

    if "NDVI_was_imputed" in df.columns:
        df["NDVI_was_imputed"] = df["NDVI_was_imputed"].astype(int)
        feature_cols.append("NDVI_was_imputed")

    # Ensure calendar columns exist (in case CLEAN csv doesn't already have them)
    if "Month" not in df.columns:
        df["Month"] = df["Date"].dt.month
    if "DayOfWeek" not in df.columns:
        df["DayOfWeek"] = df["Date"].dt.dayofweek
    if "DayOfYear" not in df.columns:
        df["DayOfYear"] = df["Date"].dt.dayofyear
    if "WeekOfYear" not in df.columns:
        df["WeekOfYear"] = df["Date"].dt.isocalendar().week.astype(int)
    if "Year" not in df.columns:
        df["Year"] = df["Date"].dt.year

    df_model = df.dropna(subset=lag_features).copy()
    print(f"  - Features selected : {len(feature_cols)}")
    print(f"  - Rows after dropna : {len(df_model):,} (dropped {len(df) - len(df_model):,} warm-up rows)")

    # ==========================================
    # 3. CHRONOLOGICAL TRAIN / TEST SPLIT
    # ==========================================
    print("\n[3/6] Splitting Chronologically (No Future Leakage)...")
    train_df = df_model[df_model["Year"] < 2025].copy()
    test_df = df_model[df_model["Year"] == 2025].copy()

    if len(test_df) == 0:
        raise ValueError("No rows found for Year == 2025 hold-out split. Check the 'Year' column / date range.")

    X_train = train_df[feature_cols]
    y_train = train_df["Modal_Price"]
    X_test = test_df[feature_cols]
    y_test = test_df["Modal_Price"]

    print(f"  - Training Set (< 2025): {len(train_df):,} samples")
    print(f"  - Hold-Out Test Set (2025): {len(test_df):,} samples")

    # ==========================================
    # 4. MODEL TRAINING (XGBOOST REGRESSOR)
    # ==========================================
    print("\n[4/6] Training XGBoost Time-Series Regressor...")
    t_train = time.time()
    model = XGBRegressor(
        n_estimators=300,
        learning_rate=0.05,
        max_depth=6,
        subsample=0.8,
        colsample_bytree=0.8,
        tree_method="hist",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    print(f"Training completed in {time.time() - t_train:.2f} seconds.")

    # ==========================================
    # 5. EVALUATION
    # ==========================================
    print("\n[5/6] Evaluating on 2025 Hold-Out Market Data...")
    y_pred = model.predict(X_test)

    overall_mae = mean_absolute_error(y_test, y_pred)
    overall_rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    overall_r2 = r2_score(y_test, y_pred)
    overall_mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

    print("\n" + "=" * 75)
    print(" OVERALL 2025 HOLD-OUT APMC FORECAST PERFORMANCE")
    print("=" * 75)
    print(f"MAE  : Rs. {overall_mae:.2f} / quintal")
    print(f"RMSE : Rs. {overall_rmse:.2f} / quintal")
    print(f"R2   : {overall_r2:.4f} ({overall_r2 * 100:.2f}% of variance explained)")
    print(f"MAPE : {overall_mape:.2f}%")
    print("-" * 75)

    test_eval = test_df.copy()
    test_eval["Predicted_Price"] = y_pred

    print("\nCrop-Wise Performance Breakdown (2025 Test Set):")
    print(f"{'Crop':<30} | {'Test Records':<12} | {'MAE (Rs/q)':<10} | {'MAPE (%)':<8} | {'R2 Score':<8}")
    print("-" * 75)
    for crop, group in test_eval.groupby("Crop"):
        if len(group) < 2:
            continue
        c_mae = mean_absolute_error(group["Modal_Price"], group["Predicted_Price"])
        c_r2 = r2_score(group["Modal_Price"], group["Predicted_Price"])
        c_mape = np.mean(np.abs((group["Modal_Price"] - group["Predicted_Price"]) / group["Modal_Price"])) * 100
        print(f"{crop:<30} | {len(group):<12,} | {c_mae:<10.2f} | {c_mape:<8.2f} | {c_r2:<8.4f}")

    print("\n" + "=" * 75)
    print(" TOP FEATURE IMPORTANCES IN APMC PRICE DISCOVERY")
    print("=" * 75)
    fi_df = pd.DataFrame(
        {"Feature": feature_cols, "Importance": model.feature_importances_}
    ).sort_values("Importance", ascending=False)
    for rank, (_, r) in enumerate(fi_df.iterrows(), start=1):
        print(f"  {rank:2d}. {r['Feature']:<25}: {r['Importance'] * 100:6.2f}%")

    # ==========================================
    # 6. SAVE PRODUCTION PIPELINE
    # ==========================================
    MODELS_DIR.mkdir(exist_ok=True, parents=True)
    saved_path = MODELS_DIR / "apmc_price_pipeline.joblib"
    joblib.dump(
        {
            "model": model,
            "feature_cols": feature_cols,
            "metrics": {
                "mae": overall_mae,
                "rmse": overall_rmse,
                "r2": overall_r2,
                "mape": overall_mape,
            },
        },
        saved_path,
    )
    print(f"\n[6/6] Saved APMC forecasting model to '{saved_path}'.")

    print("\nSample 2025 Predictions (Actual vs Predicted):")
    preview = test_eval[["Date", "Crop", "District", "Modal_Price", "Predicted_Price"]].head(10)
    print(preview.to_string(index=False))


if __name__ == "__main__":
    main()