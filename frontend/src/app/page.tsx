'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TopBar } from '@/components/TopBar';
import { HeaderQuote } from '@/components/HeaderQuote';
import { CropSelector } from '@/components/CropSelector';
import { LocationCard } from '@/components/LocationCard';
import { PriceForecastCard } from '@/components/PriceForecastCard';
import { YieldForecastCard } from '@/components/YieldForecastCard';
import { WhatIfSimulator } from '@/components/WhatIfSimulator';
import { ShapExplainCard } from '@/components/ShapExplainCard';
import { MandiPricesRow } from '@/components/MandiPricesRow';
import { getPriceForecast, getYieldPrediction, PriceForecastData, YieldPredictionData } from '@/lib/api';

const CROP_NAME_MAP: Record<string, string> = {
  onion: 'Onion',
  soybean: 'Soybean',
  cotton: 'Cotton',
  tur: 'Tur',
  wheat: 'Wheat',
  rice: 'Rice',
};

// Backend crop name alias mapping for ML models
const BACKEND_COMMODITY_MAP: Record<string, string> = {
  Onion: 'Onion',
  Soybean: 'Soyabean',
  Cotton: 'Cotton',
  Tur: 'Arhar/Tur',
  Wheat: 'Wheat',
  Rice: 'Rice',
};

export default function DashboardHome() {
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedCrop, setSelectedCrop] = useState('onion');
  const [selectedMandi, setSelectedMandi] = useState('Lasalgaon Mandi, Nashik');
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [searchQuery, setSearchQuery] = useState('');

  const [priceData, setPriceData] = useState<PriceForecastData | null>(null);
  const [yieldData, setYieldData] = useState<YieldPredictionData | null>(null);
  const [isLoadingForecast, setIsLoadingForecast] = useState<boolean>(false);

  const displayCropName = CROP_NAME_MAP[selectedCrop] || 'Onion';
  const backendCommodityName = BACKEND_COMMODITY_MAP[displayCropName] || displayCropName;

  // Extract market name from full mandi string e.g. "Lasalgaon Mandi, Nashik" -> "Lasalgaon"
  const marketName = selectedMandi.split(' ')[0] || 'Lasalgaon';

  useEffect(() => {
    let isCancelled = false;
    async function fetchData() {
      setIsLoadingForecast(true);
      try {
        const [priceRes, yieldRes] = await Promise.all([
          getPriceForecast(backendCommodityName, marketName),
          getYieldPrediction(backendCommodityName, 'Nashik', 2.5),
        ]);
        if (!isCancelled) {
          setPriceData(priceRes);
          setYieldData(yieldRes);
        }
      } catch (err) {
        console.warn('Error fetching forecast data:', err);
      } finally {
        if (!isCancelled) {
          setIsLoadingForecast(false);
        }
      }
    }

    fetchData();
    return () => {
      isCancelled = true;
    };
  }, [selectedCrop, selectedMandi, backendCommodityName, marketName]);

  const handleRunSimulation = (params: { rainfall: number; fertilizer: number; demand: number }) => {
    console.log('Running simulation with parameters:', params);
  };

  const handleUseCurrentLocation = () => {
    setSelectedMandi('Lasalgaon Mandi, Nashik');
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Left Navigation Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <TopBar
          selectedState={selectedState}
          onStateChange={setSelectedState}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Page Content Dashboard Container */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {/* Header & Quote Row */}
          <HeaderQuote />

          {/* Dashboard Two-Column Grid (Main 8 cols / Side 4 cols on desktop) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left / Main Section (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Select Crop Component */}
              <CropSelector
                selectedCropId={selectedCrop}
                onSelectCrop={setSelectedCrop}
              />

              {/* Price Forecast & Yield Forecast Cards Row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7">
                  <PriceForecastCard
                    cropName={displayCropName}
                    priceData={priceData}
                    isLoading={isLoadingForecast}
                  />
                </div>
                <div className="md:col-span-5">
                  <YieldForecastCard
                    cropName={displayCropName}
                    yieldData={yieldData}
                    isLoading={isLoadingForecast}
                  />
                </div>
              </div>

              {/* Today's Mandi Prices Component */}
              <MandiPricesRow
                cropName={displayCropName}
              />
            </div>

            {/* Right Side Column Section (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Location Card */}
              <LocationCard
                selectedMandi={selectedMandi}
                onMandiChange={setSelectedMandi}
                onUseCurrentLocation={handleUseCurrentLocation}
              />

              {/* What-If Simulator Card */}
              <WhatIfSimulator onRunSimulation={handleRunSimulation} />

              {/* Why this prediction? (SHAP Explainability Card) */}
              <ShapExplainCard cropName={displayCropName} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
