import numpy as np
import pandas as pd

# Thresholds — tune these later once you see real output distributions
NDVI_STRESS_THRESHOLD = 0.40
NDVI_HEALTHY_THRESHOLD = 0.65

TEMP_STRESS_LOW = 15.0
TEMP_STRESS_HIGH = 38.0


def _score_to_level(score: int) -> str:
    if score < 33:
        return "LOW"
    if score < 66:
        return "MEDIUM"
    return "HIGH"


def _yield_risk(yield_pipeline, input_df) -> dict:
    """
    Uses spread across individual trees in the Random Forest as a proxy
    for prediction uncertainty — trees disagreeing a lot = higher risk.
    """
    model = yield_pipeline.named_steps["model"]
    preprocessor = yield_pipeline.named_steps["preprocessor"]
    X_t = preprocessor.transform(input_df)
    if hasattr(X_t, "toarray"):
        X_t = X_t.toarray()

    if hasattr(model, "estimators_"):
        # Random Forest: ask each tree individually, look at the spread
        tree_preds = np.array([tree.predict(X_t)[0] for tree in model.estimators_])
        mean_pred = tree_preds.mean()
        std_pred = tree_preds.std()
        coeff_of_variation = std_pred / mean_pred if mean_pred > 0 else 0
        # Map coefficient of variation to a 0-100 score (tuned conservatively)
        score = int(min(100, coeff_of_variation * 300))
    else:
        # XGBoost fallback: no easy per-tree spread, use a fixed moderate score
        mean_pred = float(model.predict(X_t)[0])
        score = 30

    level = _score_to_level(score)
    delta_note = "above" if mean_pred >= 0 else "below"
    return {
        "score": score,
        "level": level,
        "summaryEn": f"Model tree predictions vary by ~{std_pred:.2f} t/ha around a mean of {mean_pred:.2f} t/ha." if 'std_pred' in dir() else f"Predicted yield: {mean_pred:.2f} t/ha.",
        "summaryMr": f"मॉडेलच्या अंदाजात सुमारे {std_pred:.2f} टन/हेक्टर फरक आढळतो." if 'std_pred' in dir() else "अंदाजित उत्पादन उपलब्ध आहे.",
    }


def _vegetation_risk(ndvi_mean: float) -> dict:
    if ndvi_mean < NDVI_STRESS_THRESHOLD:
        score, level = 75, "HIGH"
        summary_en = f"Satellite NDVI ({ndvi_mean:.2f}) indicates vegetation stress — below healthy threshold."
        summary_mr = f"उपग्रह NDVI ({ndvi_mean:.2f}) पिकांवरील ताण दर्शवते."
    elif ndvi_mean < NDVI_HEALTHY_THRESHOLD:
        score, level = 40, "MEDIUM"
        summary_en = f"Satellite NDVI ({ndvi_mean:.2f}) shows moderate canopy health."
        summary_mr = f"उपग्रह NDVI ({ndvi_mean:.2f}) मध्यम पीक आरोग्य दर्शवते."
    else:
        score, level = 15, "LOW"
        summary_en = f"Satellite NDVI ({ndvi_mean:.2f}) indicates healthy, active canopy."
        summary_mr = f"उपग्रह NDVI ({ndvi_mean:.2f}) निरोगी पीक स्थिती दर्शवते."
    return {"score": score, "level": level, "summaryEn": summary_en, "summaryMr": summary_mr}


def _weather_risk(temperature_c: float, precipitation_mm_day: float) -> dict:
    heat_stress = temperature_c > TEMP_STRESS_HIGH or temperature_c < TEMP_STRESS_LOW
    dry_stress = precipitation_mm_day < 1.0

    if heat_stress and dry_stress:
        score, level = 80, "HIGH"
        summary_en = f"Temperature ({temperature_c:.1f}°C) and low rainfall ({precipitation_mm_day:.1f}mm/day) both outside favorable range."
    elif heat_stress or dry_stress:
        score, level = 50, "MEDIUM"
        summary_en = f"Temperature ({temperature_c:.1f}°C) or rainfall ({precipitation_mm_day:.1f}mm/day) is outside the typical favorable range."
    else:
        score, level = 20, "LOW"
        summary_en = f"Temperature ({temperature_c:.1f}°C) and rainfall ({precipitation_mm_day:.1f}mm/day) are within crop tolerance."

    summary_mr = "हवामान परिस्थितीचे विश्लेषण केले गेले आहे."
    return {"score": score, "level": level, "summaryEn": summary_en, "summaryMr": summary_mr}


def _price_risk_from_history(price_df: pd.DataFrame, crop: str, district: str = None) -> dict:
    """
    Computes real price volatility from your historical CLEAN price dataset,
    using coefficient of variation (std / mean) of Modal_Price for that crop
    over the last 90 days of data available.
    """
    subset = price_df[price_df["Crop"] == crop]
    if district:
        district_subset = subset[subset["District"] == district]
        if len(district_subset) > 10:
            subset = district_subset

    if len(subset) < 5:
        return {
            "score": 40, "level": "MEDIUM",
            "summaryEn": "Insufficient historical price data for this crop/district to assess volatility.",
            "summaryMr": "या पिकासाठी पुरेसा ऐतिहासिक भाव डेटा उपलब्ध नाही.",
        }

    subset = subset.sort_values("Date").tail(90)
    prices = subset["Modal_Price"]
    cv = prices.std() / prices.mean() if prices.mean() > 0 else 0
    score = int(min(100, cv * 400))
    level = _score_to_level(score)

    return {
        "score": score,
        "level": level,
        "summaryEn": f"Price volatility (last {len(subset)} records) shows a coefficient of variation of {cv:.2%}.",
        "summaryMr": f"गेल्या {len(subset)} नोंदींमध्ये भावातील चढ-उतार {cv:.2%} आढळला आहे.",
    }


def assess_risk_service(
    yield_pipeline,
    input_df,
    ndvi_mean: float,
    temperature_c: float,
    precipitation_mm_day: float,
    price_df: pd.DataFrame,
    crop: str,
    district: str,
) -> dict:
    yield_risk = _yield_risk(yield_pipeline, input_df)
    vegetation_risk = _vegetation_risk(ndvi_mean)
    weather_risk = _weather_risk(temperature_c, precipitation_mm_day)
    price_risk = _price_risk_from_history(price_df, crop, district)

    overall_score = int(np.mean([
        yield_risk["score"], vegetation_risk["score"],
        weather_risk["score"], price_risk["score"],
    ]))
    overall_level = _score_to_level(overall_score)

    advisory_en = []
    advisory_mr = []
    if vegetation_risk["level"] != "LOW":
        advisory_en.append("Monitor canopy health via NDVI trend; consider irrigation or nutrient review.")
        advisory_mr.append("NDVI ट्रेंडद्वारे पिकांच्या आरोग्यावर लक्ष ठेवा; सिंचन किंवा खत व्यवस्थापन तपासा.")
    if weather_risk["level"] != "LOW":
        advisory_en.append("Weather conditions are outside typical favorable range — track forecasts closely.")
        advisory_mr.append("हवामान स्थिती सामान्य मर्यादेबाहेर आहे — अंदाजांवर बारकाईने लक्ष ठेवा.")
    if price_risk["level"] != "LOW":
        advisory_en.append("Price is showing volatility — consider staggered selling rather than a single bulk sale.")
        advisory_mr.append("भावात चढ-उतार दिसत आहेत — एकाच वेळी विक्री करण्याऐवजी टप्प्याटप्प्याने विक्री करा.")
    if not advisory_en:
        advisory_en.append("Conditions are currently favorable — maintain standard practices.")
        advisory_mr.append("सध्याची परिस्थिती अनुकूल आहे — नेहमीच्या पद्धती सुरू ठेवा.")

    return {
        "district": district,
        "crop": crop,
        "overallRiskLevel": overall_level,
        "overallScore": overall_score,
        "categories": {
            "yieldRisk": yield_risk,
            "priceRisk": price_risk,
            "weatherRisk": weather_risk,
            "vegetationHealthRisk": vegetation_risk,
        },
        "mitigationAdvisoryEn": advisory_en,
        "mitigationAdvisoryMr": advisory_mr,
    }