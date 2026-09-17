from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from backend.schemas import SHAPExplanationResponse  # already imported above, just confirming
from backend.services import explain_yield_service
from backend.services import assess_risk
from backend.schemas import (
    YieldPredictionRequest,
    YieldPredictionResponse,
    PriceForecastResponse,
    NDVIResponse,
    SHAPExplanationResponse,
    RiskAssessmentResponse,
)
from backend.services import (
    predict_yield_service,
    forecast_price_service,
    DISTRICT_DATA,
    CROP_DATA,
)

app = FastAPI(
    title="AgriInsight AI - Multi-Modal Agricultural Decision Support System",
    description="FastAPI Backend for Crop Yield & APMC Mandi Price Forecasting in Maharashtra, India.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "system": "AgriInsight AI",
        "status": "Online",
        "version": "1.0.0",
        "coverage": "34 Districts of Maharashtra",
        "models": {
            "crop_yield": "Random Forest Regressor",
            "apmc_price": "XGBoost Regressor with 30-day Lags",
        },
    }


@app.get("/api/districts")
def get_districts():
    return [
        {"id": k, "nameEn": k, "nameMr": v["nameMr"], "division": v["division"], "avgNdvi": v["avgNdvi"]}
        for k, v in DISTRICT_DATA.items()
    ]


@app.get("/api/crops")
def get_crops():
    return [
        {"id": k, "nameEn": k, "nameMr": v["nameMr"], "category": v["category"],
         "avgYield": v["avgYield"], "defaultPrice": v["basePrice"]}
        for k, v in CROP_DATA.items()
    ]


@app.post("/api/predict/yield", response_model=YieldPredictionResponse)
def predict_yield(request: YieldPredictionRequest):
    return predict_yield_service(request.model_dump())


@app.get("/api/forecast/price", response_model=PriceForecastResponse)
def forecast_price(
    commodity: str = Query(..., description="Crop commodity name (e.g. Soyabean, Wheat, Onion, Cotton)"),
    market: str = Query(..., description="APMC Market name (e.g. Lasalgaon, Latur, Pune)"),
):
    return forecast_price_service(commodity, market)

@app.get("/api/explain/yield", response_model=SHAPExplanationResponse)
def explain_yield(
    district: str = Query("Nashik"),
    crop: str = Query("Soyabean"),
    season: str = Query("Kharif"),
    areaHectare: float = Query(2.5),
):
    req = {"district": district, "crop": crop, "season": season, "areaHectare": areaHectare}
    return explain_yield_service(req)
# NOTE: /api/explain/yield and /api/assess/risk are intentionally left out here.
# They currently exist only as hardcoded placeholder logic — we'll replace
# them with real SHAP + risk scoring in Steps 6 and 7, not before.
@app.get("/api/assess/risk", response_model=RiskAssessmentResponse)
def assess_risk_endpoint(
    district: str = Query("Nashik"),
    crop: str = Query("Soyabean"),
    season: str = Query("Kharif"),
    areaHectare: float = Query(2.5),
):
    req = {"district": district, "crop": crop, "season": season, "areaHectare": areaHectare}
    return assess_risk(req)