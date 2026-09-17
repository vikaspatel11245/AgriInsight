'use client';

import React from 'react';
import { MapPin, ChevronDown, Compass } from 'lucide-react';

interface LocationCardProps {
  selectedMandi?: string;
  onMandiChange?: (mandi: string) => void;
  onUseCurrentLocation?: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  selectedMandi = 'Lasalgaon Mandi, Nashik',
  onMandiChange,
  onUseCurrentLocation,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6">
      {/* Title */}
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-[#0F7A4C]" />
        <h3 className="font-bold text-slate-800 text-xs tracking-tight">Your Location</h3>
      </div>

      {/* Select Dropdown */}
      <div className="space-y-2.5">
        <div className="relative">
          <div className="flex items-center justify-between w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="text-xs font-semibold text-slate-800 truncate">
                {selectedMandi}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
        </div>

        {/* Use My Location Button */}
        <button
          type="button"
          onClick={onUseCurrentLocation}
          className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-600 hover:text-slate-800 text-[11px] font-semibold transition-colors"
        >
          <Compass className="w-3.5 h-3.5 text-[#0F7A4C]" />
          <span>Use my current location</span>
        </button>
      </div>
    </div>
  );
};
