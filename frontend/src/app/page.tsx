'use client';

import React, { useState } from 'react';
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

export default function DashboardHome() {
  const [activeTab, setActiveTab] = useState('Home');
  const [selectedCrop, setSelectedCrop] = useState('onion');
  const [selectedMandi, setSelectedMandi] = useState('Lasalgaon Mandi, Nashik');
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [searchQuery, setSearchQuery] = useState('');

  // TODO: Connect to backend API endpoint `/api/forecast/price` and `/api/predict/yield` when backend integration is enabled
  const handleRunSimulation = (params: { rainfall: number; fertilizer: number; demand: number }) => {
    // TODO: Connect simulation values to POST `/api/whatif/price` and POST `/api/whatif/yield`
    console.log('Running simulation with parameters:', params);
  };

  const handleUseCurrentLocation = () => {
    // TODO: Integrate Geolocation API to auto-detect farmer's district/mandi
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
                  <PriceForecastCard />
                </div>
                <div className="md:col-span-5">
                  <YieldForecastCard />
                </div>
              </div>

              {/* Today's Mandi Prices Component */}
              <MandiPricesRow
                cropName={selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}
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
              <ShapExplainCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
