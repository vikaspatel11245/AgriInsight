import numpy as np
import shap

# English/Marathi labels for features the yield pipeline actually uses.
# Falls back to a generic label for anything not listed (e.g. one-hot
# encoded District_*/Crop_*/Season_* columns).
FEATURE_LABELS = {
    "NDVI_Mean": ("Satellite NDVI (Canopy Health)", "उपग्रह NDVI (पिकांचे आरोग्य)"),
    "NDVI_Max": ("Peak NDVI", "कमाल NDVI"),
    "NDVI_Min": ("Minimum NDVI (Stress Signal)", "किमान NDVI"),
    "Precipitation_mm_day": ("Monsoon Precipitation", "पावसाचे प्रमाण"),
    "RootSoilWetness": ("Root Zone Soil Moisture", "जमिनीतील मुळांचा ओलावा"),
    "SurfaceSoilWetness": ("Surface Soil Moisture", "जमिनीच्या पृष्ठभागावरील ओलावा"),
    "Temperature_C": ("Mean Temperature", "सरासरी तापमान"),
    "TMin_C": ("Minimum Temperature", "किमान तापमान"),
    "TMax_C": ("Maximum Temperature", "कमाल तापमान"),
    "Humidity_pct": ("Atmospheric Humidity", "हवेतील आर्द्रता"),
    "WindSpeed_m_s": ("Wind Speed", "वाऱ्याचा वेग"),
    "Irradiance_kWh_m2_day": ("Solar Irradiance", "सौर विकिरण"),
    "Area_Hectare": ("Farm Area", "शेताचे क्षेत्रफळ"),
    "Start_Year": ("Crop Year", "पीक वर्ष"),
    "Weather_Months_Available": ("Weather Data Coverage", "हवामान डेटा उपलब्धता"),
    "Previous_Yield": ("Previous Season Yield", "मागील हंगामाचे उत्पादन"),
}

_explainer_cache = {}


def _label(feature_name: str):
    if feature_name in FEATURE_LABELS:
        return FEATURE_LABELS[feature_name]
    if feature_name.endswith("_was_imputed"):
        base = feature_name.replace("_was_imputed", "")
        return (f"Data Quality Flag ({base})", "डेटा गुणवत्ता ध्वज")
    if feature_name.startswith("District_"):
        return (f"District: {feature_name.replace('District_', '')}", "जिल्हा")
    if feature_name.startswith("Crop_"):
        return (f"Crop: {feature_name.replace('Crop_', '')}", "पीक")
    if feature_name.startswith("Season_"):
        return (f"Season: {feature_name.replace('Season_', '')}", "हंगाम")
    return (feature_name, feature_name)


def explain_yield_prediction(
    yield_pipeline,
    input_df,
    categorical_features=("District", "Crop", "Season"),
    top_n: int = 8,
):
    """
    Runs TreeSHAP on the trained yield pipeline for a single input row.
    Returns a dict matching the SHAPExplanationResponse schema.

    yield_pipeline: sklearn Pipeline with steps 'preprocessor' (ColumnTransformer)
                    and 'model' (RandomForestRegressor or XGBRegressor)
    input_df: single-row DataFrame built by build_yield_input_df()
    """
    preprocessor = yield_pipeline.named_steps["preprocessor"]
    model = yield_pipeline.named_steps["model"]

    # Cache the explainer per model object id — building a TreeExplainer
    # repeatedly per-request is wasteful and unnecessary.
    cache_key = id(model)
    if cache_key not in _explainer_cache:
        _explainer_cache[cache_key] = shap.TreeExplainer(model)
    explainer = _explainer_cache[cache_key]

    # Transform the raw input through the same preprocessing the model was trained with
    X_transformed = preprocessor.transform(input_df)
    if hasattr(X_transformed, "toarray"):
        X_transformed = X_transformed.toarray()

    # Recover feature names after the ColumnTransformer (numeric cols + one-hot cat cols)
    num_cols = preprocessor.transformers_[0][2]
    cat_ohe = preprocessor.named_transformers_["cat"].named_steps["encoder"]
    cat_names = list(cat_ohe.get_feature_names_out(list(categorical_features)))
    feature_names = list(num_cols) + cat_names

    shap_values = explainer.shap_values(X_transformed)
    row_shap = shap_values[0] if np.ndim(shap_values) > 1 else shap_values

    expected_value = explainer.expected_value
    base_value = float(np.ravel(expected_value)[0]) if hasattr(expected_value, "__len__") else float(expected_value)
    predicted_value = float(base_value + row_shap.sum())

    contributions = []
    for name, raw_val, sv in zip(feature_names, X_transformed[0], row_shap):
        # Skip near-zero contributions (mostly the thousands of unused one-hot columns)
        if abs(sv) < 1e-4:
            continue
        name_en, name_mr = _label(name)
        contributions.append({
            "featureKey": name,
            "featureNameEn": name_en,
            "featureNameMr": name_mr,
            "featureValue": round(float(raw_val), 3),
            "shapValue": round(float(sv), 4),
            "impactType": "POSITIVE" if sv > 0 else "NEGATIVE",
            "descriptionEn": f"{name_en} changed the forecast by {sv:+.3f} t/ha.",
            "descriptionMr": f"{name_mr} मुळे अंदाजात {sv:+.3f} टन/हेक्टर बदल झाला.",
        })

    contributions.sort(key=lambda c: abs(c["shapValue"]), reverse=True)
    top_contributions = contributions[:top_n]

    positives = [c for c in contributions if c["impactType"] == "POSITIVE"][:3]
    negatives = [c for c in contributions if c["impactType"] == "NEGATIVE"][:3]

    top_driver_en = positives[0]["featureNameEn"] if positives else "baseline seasonal averages"

    return {
        "baseValue": round(base_value, 3),
        "predictedValue": round(predicted_value, 3),
        "unit": "tonnes/hectare",
        "contributions": top_contributions,
        "topPositiveDrivers": [f"{c['featureNameEn']} ({c['shapValue']:+.3f})" for c in positives],
        "topNegativeDrivers": [f"{c['featureNameEn']} ({c['shapValue']:+.3f})" for c in negatives],
        "plainSummaryEn": (
            f"The AI model forecast {predicted_value:.2f} t/ha, driven mainly by {top_driver_en}."
        ),
        "plainSummaryMr": f"AI मॉडेलने {predicted_value:.2f} टन/हेक्टर अंदाज व्यक्त केला आहे.",
    }