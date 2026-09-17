'use client';

import React from 'react';
import { Store, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';

export interface MandiPrice {
  id: string;
  name: string;
  price: number;
  changePercent: number;
  isUp: boolean;
}

const CROP_MANDI_PRICES: Record<string, MandiPrice[]> = {
  Onion: [
    { id: 'lasalgaon', name: 'Lasalgaon', price: 2320, changePercent: 5.2, isUp: true },
    { id: 'pune', name: 'Pune', price: 2240, changePercent: 3.1, isUp: true },
    { id: 'solapur', name: 'Solapur', price: 2180, changePercent: 4.0, isUp: true },
    { id: 'nagpur', name: 'Nagpur', price: 2100, changePercent: 1.8, isUp: false },
  ],
  Soybean: [
    { id: 'latur', name: 'Latur', price: 4650, changePercent: 2.5, isUp: true },
    { id: 'akola', name: 'Akola', price: 4580, changePercent: 1.2, isUp: true },
    { id: 'washim', name: 'Washim', price: 4620, changePercent: 0.8, isUp: false },
    { id: 'nagpur', name: 'Nagpur', price: 4700, changePercent: 3.4, isUp: true },
  ],
  Cotton: [
    { id: 'yavatmal', name: 'Yavatmal', price: 7200, changePercent: 4.8, isUp: true },
    { id: 'jalna', name: 'Jalna', price: 7150, changePercent: 2.1, isUp: true },
    { id: 'wardha', name: 'Wardha', price: 7280, changePercent: 5.2, isUp: true },
    { id: 'amravati', name: 'Amravati', price: 7050, changePercent: 1.5, isUp: false },
  ],
  Tur: [
    { id: 'latur', name: 'Latur', price: 9400, changePercent: 2.8, isUp: false },
    { id: 'hingoli', name: 'Hingoli', price: 9550, changePercent: 1.4, isUp: true },
    { id: 'solapur', name: 'Solapur', price: 9320, changePercent: 3.2, isUp: false },
    { id: 'akola', name: 'Akola', price: 9480, changePercent: 0.9, isUp: true },
  ],
  Wheat: [
    { id: 'pune', name: 'Pune', price: 2600, changePercent: 1.6, isUp: true },
    { id: 'nashik', name: 'Nashik', price: 2540, changePercent: 0.8, isUp: true },
    { id: 'solapur', name: 'Solapur', price: 2580, changePercent: 1.1, isUp: false },
    { id: 'nagpur', name: 'Nagpur', price: 2620, changePercent: 2.2, isUp: true },
  ],
  Rice: [
    { id: 'bhandara', name: 'Bhandara', price: 2850, changePercent: 2.1, isUp: true },
    { id: 'gondia', name: 'Gondia', price: 2900, changePercent: 3.5, isUp: true },
    { id: 'palghar', name: 'Palghar', price: 2800, changePercent: 1.0, isUp: false },
    { id: 'chandrapur', name: 'Chandrapur', price: 2870, changePercent: 1.9, isUp: true },
  ],
};

interface MandiPricesRowProps {
  cropName?: string;
  onViewAll?: () => void;
}

export const MandiPricesRow: React.FC<MandiPricesRowProps> = ({
  cropName = 'Onion',
  onViewAll,
}) => {
  const mandiPrices = CROP_MANDI_PRICES[cropName] || CROP_MANDI_PRICES.Onion;

  return (
    <div className="mt-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#0F7A4C]/10 flex items-center justify-center">
            <Store className="w-3.5 h-3.5 text-[#0F7A4C]" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">
            Today's Mandi Prices ({cropName})
          </h3>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#0F7A4C] transition-colors"
        >
          <span>View all mandis</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Grid of Mandi Price Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {mandiPrices.map((mandi) => (
          <div
            key={mandi.id}
            className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <p className="text-[11px] font-medium text-slate-500 mb-0.5">{mandi.name}</p>
              <p className="text-sm font-extrabold text-slate-900">
                ₹ {mandi.price.toLocaleString()}
              </p>
            </div>

            <div
              className={`flex items-center gap-0.5 text-xs font-bold ${
                mandi.isUp ? 'text-emerald-600' : 'text-red-500'
              }`}
            >
              {mandi.isUp ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              <span>{mandi.changePercent}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
