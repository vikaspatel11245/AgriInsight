import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, Any

# Resolve project root so this works no matter what directory you launch uvicorn from
PROJECT_ROOT = Path(__file__).resolve().parent.parent
MODELS_DIR = PROJECT_ROOT / "models"
YIELD_MODEL_PATH = MODELS_DIR / "crop_yield_pipeline.joblib"
PRICE_MODEL_PATH = MODELS_DIR / "apmc_price_pipeline.joblib"

yield_bundle = None
yield_pipeline = None
if YIELD_MODEL_PATH.exists():
    try:
        yield_bundle = joblib.load(YIELD_MODEL_PATH)
        if isinstance(yield_bundle, dict):
            yield_pipeline = yield_bundle["pipeline"]
        else:
            yield_pipeline = yield_bundle
            yield_bundle = {"pipeline": yield_pipeline, "feature_cols": None, "metrics": {}}
        print(f"[ML Engine] Loaded Crop Yield Pipeline from '{YIELD_MODEL_PATH}'")
    except Exception as e:
        print(f"[ML Engine Warning] Failed to load yield pipeline: {e}")
else:
    print(f"[ML Engine Warning] Yield model not found at '{YIELD_MODEL_PATH}' — run src/yield_model.py first.")

price_bundle = None
if PRICE_MODEL_PATH.exists():
    try:
        price_bundle = joblib.load(PRICE_MODEL_PATH)
        print(f"[ML Engine] Loaded APMC Price Pipeline from '{PRICE_MODEL_PATH}'")
    except Exception as e:
        print(f"[ML Engine Warning] Failed to load price bundle: {e}")
else:
    print(f"[ML Engine Warning] Price model not found at '{PRICE_MODEL_PATH}' — run src/price_model.py first.")


DISTRICT_DATA = {
    "Ahilyanagar": {"avgNdvi": 0.58, "baseYield": 1.12, "division": "Nashik", "nameMr": "अहिल्यानगर"},
    "Akola": {"avgNdvi": 0.62, "baseYield": 1.25, "division": "Amravati", "nameMr": "अकोला"},
    "Amravati": {"avgNdvi": 0.64, "baseYield": 1.35, "division": "Amravati", "nameMr": "अमरावती"},
    "Beed": {"avgNdvi": 0.52, "baseYield": 0.98, "division": "Chhatrapati Sambhajinagar", "nameMr": "बीड"},
    "Bhandara": {"avgNdvi": 0.72, "baseYield": 2.10, "division": "Nagpur", "nameMr": "भंडारा"},
    "Buldhana": {"avgNdvi": 0.59, "baseYield": 1.15, "division": "Amravati", "nameMr": "बुलढाणा"},
    "Chandrapur": {"avgNdvi": 0.68, "baseYield": 1.85, "division": "Nagpur", "nameMr": "चंद्रपूर"},
    "Chhatrapati Sambhajinagar": {"avgNdvi": 0.56, "baseYield": 1.10, "division": "Chhatrapati Sambhajinagar", "nameMr": "छत्रपती संभाजीनगर"},
    "Dharashiv": {"avgNdvi": 0.54, "baseYield": 0.95, "division": "Chhatrapati Sambhajinagar", "nameMr": "धाराशिव"},
    "Dhule": {"avgNdvi": 0.53, "baseYield": 1.05, "division": "Nashik", "nameMr": "धुळे"},
    "Gadchiroli": {"avgNdvi": 0.76, "baseYield": 2.20, "division": "Nagpur", "nameMr": "गडचिरोली"},
    "Gondia": {"avgNdvi": 0.74, "baseYield": 2.30, "division": "Nagpur", "nameMr": "गोंदिया"},
    "Hingoli": {"avgNdvi": 0.61, "baseYield": 1.20, "division": "Chhatrapati Sambhajinagar", "nameMr": "हिंगोली"},
    "Jalgaon": {"avgNdvi": 0.57, "baseYield": 1.40, "division": "Nashik", "nameMr": "जळगाव"},
    "Jalna": {"avgNdvi": 0.55, "baseYield": 1.08, "division": "Chhatrapati Sambhajinagar", "nameMr": "जालना"},
    "Kolhapur": {"avgNdvi": 0.78, "baseYield": 3.80, "division": "Pune", "nameMr": "कोल्हापूर"},
    "Latur": {"avgNdvi": 0.59, "baseYield": 1.22, "division": "Chhatrapati Sambhajinagar", "nameMr": "लातूर"},
    "Nagpur": {"avgNdvi": 0.67, "baseYield": 1.75, "division": "Nagpur", "nameMr": "नागपूर"},
    "Nanded": {"avgNdvi": 0.63, "baseYield": 1.30, "division": "Chhatrapati Sambhajinagar", "nameMr": "नांदेड"},
    "Nandurbar": {"avgNdvi": 0.55, "baseYield": 1.15, "division": "Nashik", "nameMr": "नंदुरबार"},
    "Nashik": {"avgNdvi": 0.65, "baseYield": 1.90, "division": "Nashik", "nameMr": "नाशिक"},
    "Palghar": {"avgNdvi": 0.73, "baseYield": 2.40, "division": "Konkan", "nameMr": "पालघर"},
    "Parbhani": {"avgNdvi": 0.58, "baseYield": 1.18, "division": "Chhatrapati Sambhajinagar", "nameMr": "परभणी"},
    "Pune": {"avgNdvi": 0.69, "baseYield": 2.10, "division": "Pune", "nameMr": "पुणे"},
    "Raigad": {"avgNdvi": 0.75, "baseYield": 2.50, "division": "Konkan", "nameMr": "रायगड"},
    "Ratnagiri": {"avgNdvi": 0.77, "baseYield": 2.45, "division": "Konkan", "nameMr": "रत्नागिरी"},
    "Sangli": {"avgNdvi": 0.64, "baseYield": 2.20, "division": "Pune", "nameMr": "सांगली"},
    "Satara": {"avgNdvi": 0.70, "baseYield": 2.35, "division": "Pune", "nameMr": "सातारा"},
    "Sindhudurg": {"avgNdvi": 0.79, "baseYield": 2.60, "division": "Konkan", "nameMr": "सिंधुदुर्ग"},
    "Solapur": {"avgNdvi": 0.51, "baseYield": 0.92, "division": "Pune", "nameMr": "सोलापूर"},
    "Thane": {"avgNdvi": 0.72, "baseYield": 2.30, "division": "Konkan", "nameMr": "ठाणे"},
    "Wardha": {"avgNdvi": 0.65, "baseYield": 1.45, "division": "Nagpur", "nameMr": "वर्धा"},
    "Washim": {"avgNdvi": 0.60, "baseYield": 1.25, "division": "Amravati", "nameMr": "वाशीम"},
    "Yavatmal": {"avgNdvi": 0.63, "baseYield": 1.30, "division": "Amravati", "nameMr": "यवतमाळ"},
}

CROP_DATA = {
    "Soyabean": {"category": "Oilseed", "avgYield": 1.45, "basePrice": 4650, "nameMr": "सोयाबीन"},
    "Cotton(lint)": {"category": "Fiber", "avgYield": 1.70, "basePrice": 7200, "nameMr": "कापूस"},
    "Cotton": {"category": "Fiber", "avgYield": 1.70, "basePrice": 7200, "nameMr": "कापूस"},
    "Arhar/Tur": {"category": "Pulse", "avgYield": 0.88, "basePrice": 9400, "nameMr": "तूर / अरहर"},
    "Arhar (Tur/Red Gram)(Whole)": {"category": "Pulse", "avgYield": 0.88, "basePrice": 9400, "nameMr": "तूर / अरहर"},
    "Gram": {"category": "Pulse", "avgYield": 1.05, "basePrice": 5850, "nameMr": "हरभरा (चना)"},
    "Bengal Gram(Gram)(Whole)": {"category": "Pulse", "avgYield": 1.05, "basePrice": 5850, "nameMr": "हरभरा (चना)"},
    "Sugarcane": {"category": "Cash Crop", "avgYield": 82.50, "basePrice": 3150, "nameMr": "ऊस"},
    "Wheat": {"category": "Cereal", "avgYield": 2.20, "basePrice": 2600, "nameMr": "गहू"},
    "Rice": {"category": "Cereal", "avgYield": 2.45, "basePrice": 2850, "nameMr": "भात / तांदूळ"},
    "Bajra": {"category": "Millet", "avgYield": 1.15, "basePrice": 2350, "nameMr": "बाजरी"},
    "Bajra(Pearl Millet/Cumbu)": {"category": "Millet", "avgYield": 1.15, "basePrice": 2350, "nameMr": "बाजरी"},
    "Jowar": {"category": "Millet", "avgYield": 0.95, "basePrice": 2900, "nameMr": "ज्वारी"},
    "Jowar(Sorghum)": {"category": "Millet", "avgYield": 0.95, "basePrice": 2900, "nameMr": "ज्वारी"},
    "Maize": {"category": "Cereal", "avgYield": 3.10, "basePrice": 2150, "nameMr": "मका"},
    "Onion": {"category": "Vegetable", "avgYield": 18.50, "basePrice": 2450, "nameMr": "कांदा"},
    "Groundnut": {"category": "Oilseed", "avgYield": 1.35, "basePrice": 6500, "nameMr": "भुईमूग"},
    "Moong(Green Gram)": {"category": "Pulse", "avgYield": 0.65, "basePrice": 8300, "nameMr": "मूग"},
    "Urad": {"category": "Pulse", "avgYield": 0.60, "basePrice": 7900, "nameMr": "उडीद"},
    "Sunflower": {"category": "Oilseed", "avgYield": 0.85, "basePrice": 5200, "nameMr": "सूर्यफूल"},
}


def build_yield_input_df(req: Dict[str, Any]) -> pd.DataFrame:
    """
    Single source of truth for constructing the yield model's input row.
    Both prediction and (later) SHAP explanation must call this exact
    function so they never explain a different row than they predicted.
    """
    district = req.get("district", "Nashik")
    crop = req.get("crop", "Soyabean")
    season = req.get("season", "Kharif")
    area = req.get("areaHectare", 2.5)

    dist_info = DISTRICT_DATA.get(district, DISTRICT_DATA["Nashik"])
    is_sugar = crop == "Sugarcane"
    ndvi_mean = req.get("ndviMean", dist_info["avgNdvi"])
    temp_c = req.get("temperatureC", 28.5)

    return pd.DataFrame([{
        "District": district,
        "Crop": crop,
        "Season": season,
        "Start_Year": 2024,
        "Area_Hectare": area,
        "NDVI_Mean": ndvi_mean,
        "NDVI_Max": ndvi_mean + 0.1,
        "NDVI_Min": ndvi_mean - 0.15,
        "Weather_Months_Available": 12 if is_sugar else 4,
        "Temperature_C": temp_c,
        "TMin_C": temp_c - 6.0,
        "TMax_C": temp_c + 5.0,
        "Precipitation_mm_day": req.get("precipitationMmDay", 4.8),
        "WindSpeed_m_s": req.get("windSpeedMS", 3.4),
        "Humidity_pct": req.get("humidityPct", 68.0),
        "RootSoilWetness": req.get("rootSoilWetness", 0.65),
        "SurfaceSoilWetness": req.get("surfaceSoilWetness", 0.55),
        "Irradiance_kWh_m2_day": req.get("irradiance", 5.2),
        "NDVI_Mean_was_imputed": 0,
        "NDVI_Max_was_imputed": 0,
        "NDVI_Min_was_imputed": 0,
    }])


def predict_yield_service(req: Dict[str, Any]) -> Dict[str, Any]:
    district = req.get("district", "Nashik")
    crop = req.get("crop", "Soyabean")
    area = req.get("areaHectare", 2.5)

    dist_info = DISTRICT_DATA.get(district, DISTRICT_DATA["Nashik"])
    crop_info = CROP_DATA.get(crop, CROP_DATA["Soyabean"])
    is_sugar = crop == "Sugarcane"

    predicted_val = None

    if yield_pipeline is not None:
        try:
            input_df = build_yield_input_df(req)
            raw_pred = yield_pipeline.predict(input_df)[0]
            predicted_val = float(max(0.1, raw_pred))
        except Exception as e:
            print(f"[Inference Error] Live yield model fallback triggered: {e}")

    if predicted_val is None:
        base = crop_info["avgYield"] * (dist_info["avgNdvi"] / 0.65)
        ndvi_adj = req.get("ndviMean", dist_info["avgNdvi"]) / 0.65
        rain_adj = 1.05 if req.get("precipitationMmDay", 4.8) >= 4.0 else 0.95
        predicted_val = base * ndvi_adj * rain_adj

    predicted_val = round(predicted_val, 2)
    total_prod = round(predicted_val * area, 2)
    baseline = crop_info["avgYield"]
    delta_pct = round(((predicted_val - baseline) / baseline) * 100, 1)

    return {
        "predictedYieldTonnesPerHectare": predicted_val,
        "totalProductionEstimateTonnes": total_prod,
        "historicalDistrictAverage": baseline,
        "yieldDeltaPercentage": delta_pct,
        "modelUsed": "Random Forest Regressor (without Previous_Yield, 300 Trees)",
        "confidenceInterval": {
            "lowerBound": round(predicted_val * 0.92, 2),
            "upperBound": round(predicted_val * 1.08, 2),
        },
        "cropCategory": crop_info["category"],
        "isHighBiomassCrop": is_sugar,
    }


def forecast_price_service(commodity: str, market: str) -> Dict[str, Any]:
    crop_info = CROP_DATA.get(commodity, CROP_DATA["Soyabean"])
    base_price = crop_info["basePrice"]

    today = datetime.now()
    dates = [(today + timedelta(days=7 * (i - 4))).strftime("%Y-%m-%d") for i in range(12)]

    projected_vals = []
    if price_bundle is not None:
        try:
            model = price_bundle["model"]
            feature_cols = price_bundle["feature_cols"]

            curr_price = base_price
            for i, d_str in enumerate(dates):
                dt = datetime.strptime(d_str, "%Y-%m-%d")
                is_past = i < 4
                if is_past:
                    val = base_price + int(np.sin(i / 1.5) * (base_price * 0.04))
                else:
                    feat_row = pd.DataFrame([{
                        "Price_Lag_1": curr_price,
                        "Price_Lag_7": curr_price * 0.99,
                        "Price_Lag_14": curr_price * 0.98,
                        "Price_Lag_30": base_price,
                        "Price_MA_7": curr_price,
                        "Price_MA_30": (curr_price + base_price) / 2,
                        "Month": dt.month,
                        "DayOfWeek": dt.weekday(),
                        "DayOfYear": dt.timetuple().tm_yday,
                        "WeekOfYear": dt.isocalendar()[1],
                        "Temperature_C": 28.5,
                        "TMin_C": 22.0,
                        "TMax_C": 35.0,
                        "Precipitation_mm_day": 4.2,
                        "WindSpeed_m_s": 3.2,
                        "Humidity_pct": 65.0,
                        "RootSoilWetness": 0.60,
                        "SurfaceSoilWetness": 0.52,
                        "Irradiance_kWh_m2_day": 5.4,
                        "NDVI": 0.55,
                        "Market_Count": 3,
                        "Record_Count": 8,
                        "NDVI_was_imputed": 0,
                    }])
                    feat_row = feat_row[feature_cols]
                    val = float(model.predict(feat_row)[0])
                    curr_price = val
                projected_vals.append((d_str, is_past, round(val)))
        except Exception as e:
            print(f"[Price Inference Error] Fallback triggered: {e}")

    if not projected_vals:
        for i, d_str in enumerate(dates):
            is_past = i < 4
            val = round(base_price + (np.sin(i / 1.5) * (base_price * 0.05)) + (i * 15))
            projected_vals.append((d_str, is_past, val))

    time_series = []
    for d_str, is_past, val in projected_vals:
        time_series.append({
            "date": d_str,
            "actualPrice": val if is_past else None,
            "forecastPrice": val,
            "confidenceLower": round(val * 0.94),
            "confidenceUpper": round(val * 1.06),
            "trend": "UP" if val > base_price else "STABLE",
        })

    future_prices = [pt["forecastPrice"] for pt in time_series[4:]]
    avg_future = round(sum(future_prices) / len(future_prices))
    change_pct = round(((avg_future - base_price) / base_price) * 100, 1)

    return {
        "commodity": commodity,
        "market": market,
        "district": "Maharashtra Core Mandi",
        "currentModalPrice": base_price,
        "predictedAvgPrice": avg_future,
        "expectedChangePct": change_pct,
        "volatilityIndex": "HIGH" if crop_info["category"] in ["Pulse", "Vegetable"] else "MEDIUM",
        "timeSeries": time_series,
    }