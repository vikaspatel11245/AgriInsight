'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, ChevronDown, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
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
import { PriceForecastData } from '@/lib/api';

interface PriceForecastCardProps {
  cropName?: string;
  priceData?: PriceForecastData | null;
  isLoading?: boolean;
}

const DEFAULT_CROP_PRICES: Record<string, { base: number; change: number; risk: string }> = {
  Onion: { base: 2320, change: 12, risk: 'Medium' },
  Soybean: { base: 4650, change: 8, risk: 'Low' },
  Cotton: { base: 7200, change: 15, risk: 'High' },
  Tur: { base: 9400, change: -4, risk: 'Medium' },
  Wheat: { base: 2600, change: 5, risk: 'Low' },
  Rice: { base: 2850, change: 6, risk: 'Low' },
};

export const PriceForecastCard: React.FC<PriceForecastCardProps> = ({
  cropName = 'Onion',
  priceData,
  isLoading = false,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const cropMeta = DEFAULT_CROP_PRICES[cropName] || { base: 2500, change: 10, risk: 'Medium' };

  // Use API time series if available, otherwise generate dynamic curve based on selected crop
  const chartData = priceData?.timeSeries?.map((pt) => ({
    date: pt.date.slice(5).replace('-', '/'),
    historical: pt.actualPrice ?? undefined,
    predicted: pt.forecastPrice,
  })) || [
    { date: 'Aug 1', historical: Math.round(cropMeta.base * 0.82) },
    { date: 'Aug 4', historical: Math.round(cropMeta.base * 0.9) },
    { date: 'Aug 8', historical: Math.round(cropMeta.base * 0.95) },
    { date: 'Aug 11', historical: Math.round(cropMeta.base * 0.85) },
    { date: 'Aug 15', historical: Math.round(cropMeta.base * 0.72) },
    { date: 'Aug 18', historical: Math.round(cropMeta.base * 0.82) },
    { date: 'Aug 22', historical: Math.round(cropMeta.base * 0.86), predicted: Math.round(cropMeta.base * 0.86) },
    { date: 'Aug 25', predicted: Math.round(cropMeta.base * 0.92) },
    { date: 'Aug 29', predicted: cropMeta.base },
  ];

  const predictedPrice = priceData?.predictedAvgPrice ?? cropMeta.base;
  const changePct = priceData?.expectedChangePct ?? cropMeta.change;
  const isPositive = changePct >= 0;
  const riskLevel = priceData?.volatilityIndex || cropMeta.risk;
  const lastPoint = chartData[chartData.length - 1];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full relative">
      {/* Loading Spinner overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xs rounded-2xl flex items-center justify-center z-20">
          <Loader2 className="w-6 h-6 text-[#0F7A4C] animate-spin" />
        </div>
      )}

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
          Predicted mandi price for <span className="font-bold text-slate-700">{cropName}</span> (₹/quintal)
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
                data={chartData}
                margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                  tick={{ fontSize: 10, fill: '#64748B' }}
                />
                <YAxis
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
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke="#0F7A4C"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#0F7A4C"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: '#0F7A4C' }}
                  connectNulls
                />
                {lastPoint && (
                  <ReferenceDot
                    x={lastPoint.date}
                    y={lastPoint.predicted || lastPoint.historical || predictedPrice}
                    r={5}
                    fill="#0F7A4C"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg" />
          )}

          {/* Callout Overlay */}
          <div className="absolute top-2 right-4 bg-white border border-slate-200 shadow-md rounded-lg p-1.5 px-2 text-[10px] text-center z-10">
            <p className="text-slate-400 font-medium leading-none mb-0.5">Aug 29, 2025</p>
            <p className="font-extrabold text-slate-900 text-xs leading-none">
              ₹ {predictedPrice.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stat Sub-Cards Row */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100">
        {/* Sub-card 1: Predicted Price */}
        <div className="bg-slate-50/70 rounded-xl p-2.5 border border-slate-100">
          <p className="text-[10px] font-medium text-slate-500 mb-0.5">
            Predicted Price <span className="text-[9px] text-slate-400">(30 days)</span>
          </p>
          <p className="text-sm font-extrabold text-slate-900">
            ₹ {predictedPrice.toLocaleString()}{' '}
            <span className="text-[10px] font-normal text-slate-500">/qtl</span>
          </p>
          <div
            className={`flex items-center gap-1 mt-1 font-bold text-[10px] ${
              isPositive ? 'text-[#0F7A4C]' : 'text-red-500'
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span>{Math.abs(changePct)}%</span>
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
            <span
              className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                riskLevel === 'HIGH' || riskLevel === 'High'
                  ? 'bg-red-100 text-red-800'
                  : riskLevel === 'LOW' || riskLevel === 'Low'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {riskLevel}
            </span>
          </div>
          <p className="text-[9px] text-slate-400 font-medium leading-tight mt-1">
            Market volatility assessment
          </p>
        </div>
      </div>
    </div>
  );
};
