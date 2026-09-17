import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = PROJECT_ROOT / "data" / "AgriInsight_Yield_Training_Dataset_CLEAN.csv"
MODELS_DIR = PROJECT_ROOT / "models"


def main():
    print("=" * 70)
    print(" AGRIINSIGHT AI - CROP YIELD MODEL BENCHMARKING (RF vs XGBOOST)")
    print("=" * 70)

    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found at '{DATA_PATH}'.")

    df = pd.read_csv(DATA_PATH)
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")

    # --- Target leakage audit ---
    if "Production" in df.columns:
        df = df.drop(columns=["Production"])
        print("[LEAKAGE CHECK] Dropped 'Production' column to prevent target leakage.")

    missing_prev_by_year = df.groupby("Start_Year")["Previous_Yield"].apply(
        lambda s: f"{s.isna().sum()}/{len(s)} ({s.isna().mean() * 100:.1f}%)"
    )
    print("\nMissing values in 'Previous_Yield' by year:")
    for yr, val in missing_prev_by_year.items():
        print(f"  - Year {yr}: {val} missing")

    # --- Time-aware split ---
    train_df = df[df["Start_Year"] < 2022].copy()
    test_df = df[df["Start_Year"] == 2022].copy()

    if len(test_df) == 0:
        raise ValueError("No rows found for Start_Year == 2022 hold-out split.")

    y_train = train_df["Yield"]
    y_test = test_df["Yield"]

    print(f"\nTrain set (< 2022): {train_df.shape[0]} samples")
    print(f"Test set  (2022)  : {test_df.shape[0]} samples")

    # --- Feature definitions ---
    categorical_features = ["District", "Crop", "Season"]

    base_numerical_features = [
        "Start_Year", "Area_Hectare",
        "NDVI_Mean", "NDVI_Max", "NDVI_Min",
        "Weather_Months_Available",
        "Temperature_C", "TMin_C", "TMax_C",
        "Precipitation_mm_day", "WindSpeed_m_s", "Humidity_pct",
        "RootSoilWetness", "SurfaceSoilWetness", "Irradiance_kWh_m2_day",
        "NDVI_Mean_was_imputed", "NDVI_Max_was_imputed", "NDVI_Min_was_imputed",
    ]

    flag_cols = ["NDVI_Mean_was_imputed", "NDVI_Max_was_imputed", "NDVI_Min_was_imputed"]
    for col in flag_cols:
        if col in df.columns:
            df[col] = df[col].astype(int)
            train_df[col] = train_df[col].astype(int)
            test_df[col] = test_df[col].astype(int)

    feature_sets = {
        "With Previous_Yield": base_numerical_features + ["Previous_Yield"],
        "Without Previous_Yield": base_numerical_features,
    }

    models = {
        "Random Forest": RandomForestRegressor(
            n_estimators=300, max_depth=None, random_state=42, n_jobs=-1,
        ),
        "XGBoost": XGBRegressor(
            n_estimators=300, learning_rate=0.05, max_depth=6,
            subsample=0.8, colsample_bytree=0.8, random_state=42, n_jobs=-1,
        ),
    }

    # --- Benchmarking ---
    results = []
    trained_pipelines = {}

    for feat_name, num_cols in feature_sets.items():
        numeric_transformer = Pipeline(steps=[("imputer", SimpleImputer(strategy="median"))])
        categorical_transformer = Pipeline(steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore")),
        ])
        preprocessor = ColumnTransformer(transformers=[
            ("num", numeric_transformer, num_cols),
            ("cat", categorical_transformer, categorical_features),
        ])

        all_input_cols = num_cols + categorical_features
        X_train_sub = train_df[all_input_cols]
        X_test_sub = test_df[all_input_cols]

        for model_name, model_inst in models.items():
            exp_name = f"{model_name} ({feat_name})"
            print(f"\nTraining {exp_name}...")

            pipeline = Pipeline(steps=[("preprocessor", preprocessor), ("model", model_inst)])
            pipeline.fit(X_train_sub, y_train)
            y_pred = pipeline.predict(X_test_sub)

            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)

            results.append({
                "Experiment": exp_name, "Model": model_name, "Feature Set": feat_name,
                "MAE": mae, "RMSE": rmse, "R2_Score": r2,
            })
            trained_pipelines[exp_name] = (pipeline, all_input_cols, y_pred)

    # --- Results table ---
    results_df = pd.DataFrame(results).sort_values("MAE")
    print("\n" + "=" * 75)
    print(" BENCHMARK RESULTS ON 2022 HOLD-OUT TEST SET")
    print("=" * 75)
    print(f"{'Model & Configuration':<38} | {'MAE (t/ha)':<10} | {'RMSE (t/ha)':<11} | {'R2 Score':<9}")
    print("-" * 75)
    for _, row in results_df.iterrows():
        print(f"{row['Experiment']:<38} | {row['MAE']:<10.4f} | {row['RMSE']:<11.4f} | {row['R2_Score']:<9.4f}")

    # --- Best model subgroup analysis ---
    best_exp_name = results_df.iloc[0]["Experiment"]
    best_pipeline, best_features, best_preds = trained_pipelines[best_exp_name]

    print(f"\n{'=' * 75}\n CROP SUBGROUP PERFORMANCE ANALYSIS ({best_exp_name})\n{'=' * 75}")

    eval_df = test_df.copy()
    eval_df["Predicted_Yield"] = best_preds

    is_sugar = eval_df["Crop"] == "Sugarcane"
    sugar_df = eval_df[is_sugar]
    non_sugar_df = eval_df[~is_sugar]

    if len(non_sugar_df) > 0:
        print(f"Standard Crops (Non-Sugarcane, n={len(non_sugar_df)}):")
        print(f"  - MAE : {mean_absolute_error(non_sugar_df['Yield'], non_sugar_df['Predicted_Yield']):.4f} t/ha")
        print(f"  - R2  : {r2_score(non_sugar_df['Yield'], non_sugar_df['Predicted_Yield']):.4f}")

    if len(sugar_df) > 0:
        print(f"\nSugarcane Only (n={len(sugar_df)}):")
        print(f"  - MAE : {mean_absolute_error(sugar_df['Yield'], sugar_df['Predicted_Yield']):.4f} t/ha")
        print(f"  - R2  : {r2_score(sugar_df['Yield'], sugar_df['Predicted_Yield']):.4f}")

    # --- Feature importances ---
    print(f"\n{'=' * 75}\n TOP FEATURE IMPORTANCES ({best_exp_name})\n{'=' * 75}")
    model_obj = best_pipeline.named_steps["model"]
    preproc_obj = best_pipeline.named_steps["preprocessor"]
    cat_ohe = preproc_obj.named_transformers_["cat"].named_steps["encoder"]
    encoded_cat_names = list(cat_ohe.get_feature_names_out(categorical_features))
    num_names = [col for col in best_features if col not in categorical_features]
    all_feature_names = num_names + encoded_cat_names

    if hasattr(model_obj, "feature_importances_"):
        fi_df = pd.DataFrame(
            {"Feature": all_feature_names, "Importance": model_obj.feature_importances_}
        ).sort_values("Importance", ascending=False)
        for rank, (_, r) in enumerate(fi_df.head(12).iterrows(), start=1):
            print(f"  {rank:2d}. {r['Feature']:<30}: {r['Importance'] * 100:6.2f}%")

    # --- Save best pipeline ---
    MODELS_DIR.mkdir(exist_ok=True, parents=True)
    saved_model_path = MODELS_DIR / "crop_yield_pipeline.joblib"

    final_mae = mean_absolute_error(y_test, best_preds)
    final_rmse = np.sqrt(mean_squared_error(y_test, best_preds))
    final_r2 = r2_score(y_test, best_preds)

    yield_bundle = {
        "pipeline": best_pipeline,
        "feature_cols": best_features,
        "metrics": {
            "mae": final_mae, "rmse": final_rmse, "r2": final_r2,
            "test_year": 2022, "train_years": "2020-2021",
        },
    }
    joblib.dump(yield_bundle, saved_model_path)
    print(f"\nSaved best pipeline ({best_exp_name}) to '{saved_model_path}'.")
    print(f"  MAE: {final_mae:.4f} t/ha | RMSE: {final_rmse:.4f} t/ha | R2: {final_r2:.4f}")

    print("\nSample 2022 Predictions (Actual vs Predicted):")
    sample_preview = eval_df[["District", "Crop", "Season", "Yield", "Predicted_Yield"]].head(10)
    print(sample_preview.to_string(index=False))


if __name__ == "__main__":
    main()