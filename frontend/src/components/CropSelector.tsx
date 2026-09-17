'use client';

import React from 'react';
import { Leaf, MoreHorizontal } from 'lucide-react';

export interface Crop {
  id: string;
  name: string;
  subLabel?: string;
  icon: string; // Emoji or SVG path identifier
  color?: string;
}

interface CropSelectorProps {
  selectedCropId?: string;
  onSelectCrop?: (cropId: string) => void;
}

const CROPS: Crop[] = [
  { id: 'onion', name: 'Onion', icon: '🧅' },
  { id: 'soybean', name: 'Soybean', icon: '🫘' },
  { id: 'cotton', name: 'Cotton', icon: '☁️' },
  { id: 'tur', name: 'Tur (Pigeon Pea)', icon: '🟡' },
  { id: 'wheat', name: 'Wheat', icon: '🌾' },
  { id: 'rice', name: 'Rice', icon: '🍚' },
];

export const CropSelector: React.FC<CropSelectorProps> = ({
  selectedCropId = 'onion',
  onSelectCrop,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs mb-6">
      {/* Card Header */}
      <div className="flex items-center gap-2 mb-3">
        <Leaf className="w-4 h-4 text-[#0F7A4C]" />
        <h3 className="font-bold text-slate-800 text-xs tracking-tight">Select Crop</h3>
      </div>

      {/* Crop Tiles Grid / Scroll Container */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
        {CROPS.map((crop) => {
          const isSelected = selectedCropId === crop.id;
          return (
            <button
              key={crop.id}
              onClick={() => onSelectCrop?.(crop.id)}
              className={`flex flex-col items-center justify-between p-2.5 min-w-[96px] h-[92px] rounded-xl border transition-all duration-150 shrink-0 ${
                isSelected
                  ? 'bg-[#E8F5E9] border-[#0F7A4C] ring-1 ring-[#0F7A4C] shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              {/* Crop Visual Avatar */}
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-2xl bg-amber-50/50">
                {crop.id === 'onion' && (
                  <span className="transform hover:scale-110 transition-transform">🧅</span>
                )}
                {crop.id === 'soybean' && (
                  <span className="transform hover:scale-110 transition-transform">🫘</span>
                )}
                {crop.id === 'cotton' && (
                  <span className="transform hover:scale-110 transition-transform">🌱</span>
                )}
                {crop.id === 'tur' && (
                  <span className="transform hover:scale-110 transition-transform">🟡</span>
                )}
                {crop.id === 'wheat' && (
                  <span className="transform hover:scale-110 transition-transform">🌾</span>
                )}
                {crop.id === 'rice' && (
                  <span className="transform hover:scale-110 transition-transform">🍚</span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[11px] font-semibold text-center truncate w-full ${
                isSelected ? 'text-[#0F7A4C]' : 'text-slate-700'
              }`}>
                {crop.name}
              </span>
            </button>
          );
        })}

        {/* More Tile */}
        <button
          type="button"
          className="flex flex-col items-center justify-center p-2.5 min-w-[96px] h-[92px] rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shrink-0 text-slate-400 hover:text-slate-600"
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50">
            <MoreHorizontal className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-semibold text-slate-600 mt-1">More</span>
        </button>
      </div>
    </div>
  );
};
