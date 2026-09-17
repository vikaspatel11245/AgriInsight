'use client';

import React from 'react';
import { Lightbulb, Info } from 'lucide-react';

interface Factor {
  name: string;
  impact: number;
  color: string;
  barPercentage: number;
}

const SHAP_FACTORS: Factor[] = [
  { name: 'Supply in Maharashtra', impact: 0.38, color: 'bg-rose-400', barPercentage: 90 },
  { name: 'Rainfall (last 30 days)', impact: 0.22, color: 'bg-sky-500', barPercentage: 60 },
  { name: 'Demand from other states', impact: 0.18, color: 'bg-sky-400', barPercentage: 45 },
  { name: 'Export demand', impact: 0.12, color: 'bg-indigo-300', barPercentage: 32 },
  { name: 'Previous year\'s trend', impact: 0.08, color: 'bg-purple-300', barPercentage: 22 },
];

export const ShapExplainCard: React.FC = () => {
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
        Top factors affecting price (SHAP)
      </p>

      {/* Factor List with Bars */}
      <div className="space-y-3 mb-4">
        {SHAP_FACTORS.map((factor) => (
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
