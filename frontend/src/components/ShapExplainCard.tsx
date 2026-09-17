'use client';

import React from 'react';
import { Lightbulb, Info } from 'lucide-react';

interface Factor {
  name: string;
  impact: number;
  color: string;
  barPercentage: number;
}

const CROP_SHAP_FACTORS: Record<string, Factor[]> = {
  Onion: [
    { name: 'Supply in Maharashtra Mandis', impact: 0.38, color: 'bg-rose-400', barPercentage: 90 },
    { name: 'Rainfall (last 30 days)', impact: 0.22, color: 'bg-sky-500', barPercentage: 60 },
    { name: 'Inter-State Demand (South India)', impact: 0.18, color: 'bg-sky-400', barPercentage: 45 },
    { name: 'Export Duty & Curbs Policy', impact: 0.12, color: 'bg-indigo-300', barPercentage: 32 },
    { name: 'Storage & Harvest Trend', impact: 0.08, color: 'bg-purple-300', barPercentage: 22 },
  ],
  Soybean: [
    { name: 'Global Palm & Soy Oil Prices', impact: 0.42, color: 'bg-amber-500', barPercentage: 92 },
    { name: 'Latur & Vidarbha Mandi Arrivals', impact: 0.28, color: 'bg-rose-400', barPercentage: 70 },
    { name: 'Soil Moisture & Monsoonal Rain', impact: 0.18, color: 'bg-sky-500', barPercentage: 48 },
    { name: 'Poultry Feed Meal Demand', impact: 0.12, color: 'bg-emerald-400', barPercentage: 30 },
  ],
  Cotton: [
    { name: 'Pest Impact (Pink Bollworm)', impact: 0.35, color: 'bg-rose-500', barPercentage: 88 },
    { name: 'Yarn & Textile Mill Demand', impact: 0.25, color: 'bg-indigo-400', barPercentage: 65 },
    { name: 'International Cotton (Cotlook A)', impact: 0.20, color: 'bg-sky-500', barPercentage: 50 },
    { name: 'MSP Procurement Volume', impact: 0.10, color: 'bg-[#0F7A4C]', barPercentage: 28 },
  ],
  Tur: [
    { name: 'Buffer Stock & Import Inflow', impact: 0.39, color: 'bg-amber-500', barPercentage: 89 },
    { name: 'Unseasonal Rain during Flowering', impact: 0.26, color: 'bg-rose-400', barPercentage: 62 },
    { name: 'Festival Season Wholesale Demand', impact: 0.19, color: 'bg-sky-400', barPercentage: 45 },
  ],
  Wheat: [
    { name: 'FCI Procurement & Open Sale', impact: 0.36, color: 'bg-amber-400', barPercentage: 85 },
    { name: 'Rabi Heatwave & Temperature', impact: 0.24, color: 'bg-rose-400', barPercentage: 58 },
    { name: 'Flour Mill Wholesale Demand', impact: 0.18, color: 'bg-emerald-400', barPercentage: 42 },
  ],
  Rice: [
    { name: 'Konkan & Bhandara Rainfall', impact: 0.37, color: 'bg-sky-500', barPercentage: 87 },
    { name: 'Non-Basmati Export Quota', impact: 0.25, color: 'bg-indigo-400', barPercentage: 62 },
    { name: 'Government MSP Stocks', impact: 0.15, color: 'bg-[#0F7A4C]', barPercentage: 38 },
  ],
};

interface ShapExplainCardProps {
  cropName?: string;
}

export const ShapExplainCard: React.FC<ShapExplainCardProps> = ({ cropName = 'Onion' }) => {
  const factors = CROP_SHAP_FACTORS[cropName] || CROP_SHAP_FACTORS.Onion;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      {/* Card Header */}
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
        </div>
        <h3 className="font-bold text-slate-900 text-sm tracking-tight">
          Why this prediction?
        </h3>
      </div>
      <p className="text-[11px] text-slate-500 font-medium mb-4">
        Top factors affecting <span className="font-bold text-slate-700">{cropName}</span> price (SHAP)
      </p>

      {/* Factor List with Bars */}
      <div className="space-y-3 mb-4">
        {factors.map((factor) => (
          <div key={factor.name} className="flex items-center justify-between text-xs gap-3">
            <span className="text-[11px] font-medium text-slate-700 truncate w-44 shrink-0">
              {factor.name}
            </span>
            <div className="flex-1 flex items-center gap-2">
              <div className="flex-1 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-2.5 rounded-full ${factor.color}`}
                  style={{ width: `${factor.barPercentage}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-slate-700 w-10 text-right shrink-0">
                +{factor.impact.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Info Footnote Note */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-[#0F7A4C] shrink-0" />
        <p className="text-[10px] text-slate-600 font-medium leading-snug">
          Higher value means this factor pushed the price higher.
        </p>
      </div>
    </div>
  );
};
