'use client';

import React, { useState } from 'react';
import { Sliders, Play } from 'lucide-react';

interface WhatIfSimulatorProps {
  onRunSimulation?: (params: { rainfall: number; fertilizer: number; demand: number }) => void;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ onRunSimulation }) => {
  const [rainfall, setRainfall] = useState<number>(-20);
  const [fertilizer, setFertilizer] = useState<number>(10);
  const [demand, setDemand] = useState<number>(20);

  const formatValue = (val: number) => {
    if (val > 0) return `+${val}%`;
    return `${val}%`;
  };

  const handleRun = () => {
    onRunSimulation?.({ rainfall, fertilizer, demand });
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-6">
      {/* Card Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg bg-[#0F7A4C]/10 flex items-center justify-center">
          <Sliders className="w-3.5 h-3.5 text-[#0F7A4C]" />
        </div>
        <h3 className="font-bold text-slate-900 text-sm tracking-tight">
          What-If Simulator
        </h3>
      </div>
      <p className="text-[11px] text-slate-500 font-medium mb-4">
        Adjust conditions and see the impact
      </p>

      {/* Sliders Container */}
      <div className="space-y-4 mb-5">
        {/* Slider 1: Rainfall */}
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-semibold text-slate-700 w-28 shrink-0">
            Rainfall
          </label>
          <input
            type="range"
            min={-50}
            max={50}
            value={rainfall}
            onChange={(e) => setRainfall(Number(e.target.value))}
            className="w-full accent-[#0F7A4C] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <span className="w-12 text-right text-xs font-bold text-slate-800 bg-slate-100 py-0.5 px-1.5 rounded border border-slate-200 shrink-0">
            {formatValue(rainfall)}
          </span>
        </div>

        {/* Slider 2: Fertilizer Usage */}
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-semibold text-slate-700 w-28 shrink-0">
            Fertilizer Usage
          </label>
          <input
            type="range"
            min={-50}
            max={50}
            value={fertilizer}
            onChange={(e) => setFertilizer(Number(e.target.value))}
            className="w-full accent-[#0F7A4C] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <span className="w-12 text-right text-xs font-bold text-slate-800 bg-slate-100 py-0.5 px-1.5 rounded border border-slate-200 shrink-0">
            {formatValue(fertilizer)}
          </span>
        </div>

        {/* Slider 3: Market Demand */}
        <div className="flex items-center justify-between gap-3">
          <label className="text-xs font-semibold text-slate-700 w-28 shrink-0">
            Market Demand
          </label>
          <input
            type="range"
            min={-50}
            max={50}
            value={demand}
            onChange={(e) => setDemand(Number(e.target.value))}
            className="w-full accent-[#0F7A4C] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
          />
          <span className="w-12 text-right text-xs font-bold text-slate-800 bg-slate-100 py-0.5 px-1.5 rounded border border-slate-200 shrink-0">
            {formatValue(demand)}
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <button
        type="button"
        onClick={handleRun}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#0F7A4C] hover:bg-[#0B633D] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-[0.99]"
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span>Run Simulation</span>
      </button>
    </div>
  );
};
