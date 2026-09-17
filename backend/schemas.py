from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class YieldPredictionRequest(BaseModel):
    district: str = Field(..., example="Nashik")
    crop: str = Field(..., example="Soyabean")
    season: str = Field(..., example="Kharif")
    areaHectare: float = Field(2.5, example=2.5)
    previousYield: Optional[float] = None
    ndviMean: Optional[float] = Field(0.65, example=0.65)
    temperatureC: Optional[float] = Field(28.5, example=28.5)
    precipitationMmDay: Optional[float] = Field(4.8, example=4.8)
    humidityPct: Optional[float] = Field(68.0, example=68.0)
    windSpeedMS: Optional[float] = Field(3.4, example=3.4)
    rootSoilWetness: Optional[float] = Field(0.65, example=0.65)
    surfaceSoilWetness: Optional[float] = Field(0.55, example=0.55)
    irradiance: Optional[float] = Field(5.2, example=5.2)


class ConfidenceInterval(BaseModel):
    lowerBound: float
    upperBound: float


class YieldPredictionResponse(BaseModel):
    predictedYieldTonnesPerHectare: float
    totalProductionEstimateTonnes: float
    historicalDistrictAverage: float
    yieldDeltaPercentage: float
    modelUsed: str
    confidenceInterval: ConfidenceInterval
    cropCategory: str
    isHighBiomassCrop: bool


class PriceForecastPoint(BaseModel):
    date: str
    actualPrice: Optional[float] = None
    forecastPrice: float
    confidenceLower: float
    confidenceUpper: float
    trend: str


class PriceForecastResponse(BaseModel):
    commodity: str
    market: str
    district: str
    currentModalPrice: float
    predictedAvgPrice: float
    expectedChangePct: float
    volatilityIndex: str
    timeSeries: List[PriceForecastPoint]


class NDVITimeSeriesPoint(BaseModel):
    month: str
    year: int
    ndvi: float
    status: str
    imageCount: int


class NDVIResponse(BaseModel):
    district: str
    currentNdvi: float
    status: str
    timeSeries: List[NDVITimeSeriesPoint]


class SHAPFeatureContribution(BaseModel):
    featureKey: str
    featureNameEn: str
    featureNameMr: str
    featureValue: Any
    shapValue: float
    impactType: str
    descriptionEn: str
    descriptionMr: str


class SHAPExplanationResponse(BaseModel):
    baseValue: float
    predictedValue: float
    unit: str
    contributions: List[SHAPFeatureContribution]
    topPositiveDrivers: List[str]
    topNegativeDrivers: List[str]
    plainSummaryEn: str
    plainSummaryMr: str


class CategoryRisk(BaseModel):
    score: int
    level: str
    summaryEn: str
    summaryMr: str


class RiskAssessmentResponse(BaseModel):
    district: str
    crop: str
    overallRiskLevel: str
    overallScore: int
    categories: Dict[str, CategoryRisk]
    mitigationAdvisoryEn: List[str]
    mitigationAdvisoryMr: List[str]
    class WhatIfYieldRequest(BaseModel):
    district: str = Field(..., example="Nashik")
    crop: str = Field(..., example="Soyabean")
    season: str = Field("Kharif", example="Kharif")
    areaHectare: float = Field(2.5, example=2.5)
    adjustments: Dict[str, float] = Field(
        ..., example={"ndviMean": 0.72, "precipitationMmDay": 6.5}
    )


class WhatIfYieldResponse(BaseModel):
    baseline: YieldPredictionResponse
    adjusted: YieldPredictionResponse
    deltaYieldTonnesPerHectare: float
    deltaPercentage: float
    adjustmentsApplied: Dict[str, float]


class WhatIfPriceRequest(BaseModel):
    commodity: str = Field(..., example="Soyabean")
    market: str = Field(..., example="Latur")
    adjustments: Dict[str, float] = Field(
        ..., example={"Precipitation_mm_day": 8.0, "NDVI": 0.70}
    )


class WhatIfPriceResponse(BaseModel):
    baselinePrice: float
    adjustedPrice: float
    deltaPrice: float
    deltaPercentage: float
    adjustmentsApplied: Dict[str, float]