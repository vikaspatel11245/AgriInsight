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

const MANDI_PRICES: MandiPrice[] = [
  { id: 'lasalgaon', name: 'Lasalgaon', price: 2100, changePercent: 5, isUp: true },
  { id: 'pune', name: 'Pune', price: 1980, changePercent: 3, isUp: true },
  { id: 'solapur', name: 'Solapur', price: 2050, changePercent: 4, isUp: true },
  { id: 'nagpur', name: 'Nagpur', price: 1950, changePercent: 2, isUp: false },
];

interface MandiPricesRowProps {
  cropName?: string;
  onViewAll?: () => void;
}

export const MandiPricesRow: React.FC<MandiPricesRowProps> = ({
  cropName = 'Onion',
  onViewAll,
}) => {
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
        {MANDI_PRICES.map((mandi) => (
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
