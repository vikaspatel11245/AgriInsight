'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, ChevronDown, ArrowUpRight } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from 'recharts';

interface PricePoint {
  date: string;
  historical?: number;
  predicted?: number;
}

const PRICE_DATA: PricePoint[] = [
  { date: 'Aug 1', historical: 1800 },
  { date: 'Aug 4', historical: 2100 },
  { date: 'Aug 8', historical: 2200 },
  { date: 'Aug 11', historical: 1950 },
  { date: 'Aug 15', historical: 1600 },
  { date: 'Aug 18', historical: 1900 },
  { date: 'Aug 22', historical: 2000, predicted: 2000 },
  { date: 'Aug 25', predicted: 2150 },
  { date: 'Aug 29', predicted: 2320 },
];

export const PriceForecastCard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#0F7A4C]/10 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-[#0F7A4C]" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">
              Price Forecast
            </h3>
          </div>
          <button
            type="button"
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg text-[11px] font-medium transition-colors"
          >
            <span>Next 1 Month</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 font-medium mb-3">
          Predicted mandi price for Onion (₹/quintal)
        </p>

        {/* Legend */}
        <div className="flex items-center justify-end gap-4 text-[11px] font-medium text-slate-600 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 bg-[#0F7A4C] rounded-full inline-block" />
            <span>Historical Price</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-0.5 border-b-2 border-dashed border-[#0F7A4C] inline-block" />
            <span>Predicted Price</span>
          </div>
        </div>

        {/* Recharts Line Chart */}
        <div className="w-full h-44 relative text-xs">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={PRICE_DATA}
                margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                />
                <YAxis
                  domain={[0, 4000]}
                  ticks={[0, 1000, 2000, 3000, 4000]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                />
                <Tooltip
                  formatter={(value: any) => [`₹ ${Number(value || 0).toLocaleString()}`, 'Price']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '11px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                />
                {/* Historical solid line */}
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="#0F7A4C"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#0F7A4C' }}
                  connectNulls
                />
                {/* Predicted dashed line */}
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#0F7A4C"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#0F7A4C' }}
                  activeDot={{ r: 5, fill: '#0F7A4C' }}
                  connectNulls
                />
                <ReferenceDot
                  x="Aug 29"
                  y={2320}
                  r={5}
                  fill="#0F7A4C"
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg" />
          )}

          {/* Callout Overlay matching screenshot */}
          <div className="absolute top-2 right-4 bg-white border border-slate-200 shadow-md rounded-lg p-1.5 px-2 text-[10px] text-center z-10">
            <p className="text-slate-400 font-medium leading-none mb-0.5">Aug 29, 2025</p>
            <p className="font-extrabold text-slate-900 text-xs leading-none">₹ 2,320</p>
          </div>
        </div>
      </div>

      {/* Stat Sub-Cards Row */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
        {/* Sub-card 1: Predicted Price */}
        <div className="bg-slate-50/70 rounded-xl p-2.5 border border-slate-100">
          <p className="text-[10px] font-medium text-slate-500 mb-0.5">
            Predicted Price <span className="text-[9px] text-slate-400">(Next 30 days)</span>
          </p>
          <p className="text-sm font-extrabold text-slate-900">
            ₹ 2,320 <span className="text-[10px] font-normal text-slate-500">/quintal</span>
          </p>
          <div className="flex items-center gap-1 mt-1 text-[#0F7A4C] font-bold text-[10px]">
            <ArrowUpRight className="w-3 h-3" />
            <span>12%</span>
            <span className="font-normal text-slate-400 text-[9px]">vs last month</span>
          </div>
        </div>

        {/* Sub-card 2: Confidence */}
        <div className="bg-slate-50/70 rounded-xl p-2.5 border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-medium text-slate-500 mb-0.5">Confidence</p>
            <p className="text-sm font-extrabold text-slate-900">82%</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-2">
            <div className="bg-[#0F7A4C] h-1.5 rounded-full w-[82%]" />
          </div>
        </div>

        {/* Sub-card 3: Risk Level */}
        <div className="bg-slate-50/70 rounded-xl p-2.5 border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-medium text-slate-500 mb-1">Risk Level</p>
            <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-bold">
              Medium
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-medium leading-tight mt-1">
            Moderate market volatility expected
          </p>
        </div>
      </div>
    </div>
  );
};
