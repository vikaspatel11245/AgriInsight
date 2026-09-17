'use client';

import React from 'react';
import { Leaf } from 'lucide-react';

export const HeaderQuote: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Good Morning!
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Get AI-powered price and yield insights for your crops.
        </p>
      </div>

      <div className="bg-[#E8F5E9]/90 border border-emerald-200/80 rounded-2xl p-3.5 px-4 flex items-center gap-3 max-w-sm shadow-2xs">
        <div className="w-8 h-8 rounded-full bg-[#0F7A4C]/15 flex items-center justify-center shrink-0">
          <Leaf className="w-4 h-4 text-[#0F7A4C] fill-current" />
        </div>
        <p className="text-xs font-semibold text-[#0F7A4C] leading-snug">
          “Better information leads to better harvests.”
        </p>
      </div>
    </div>
  );
};
