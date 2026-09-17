'use client';

import React, { useState, useEffect } from 'react';
import { Sprout, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { YieldPredictionData } from '@/lib/api';

interface YieldForecastCardProps {
  cropName?: string;
  yieldData?: YieldPredictionData | null;
  isLoading?: boolean;
}

const DEFAULT_CROP_YIELDS: Record<string, { past23: number; past24: number; pred25: number; change: number }> = {
  Onion: { past23: 160, past24: 175, pred25: 190, change: 9 },
  Soybean: { past23: 12.5, past24: 13.6, pred25: 14.5, change: 7 },
  Cotton: { past23: 14.0, past24: 15.2, pred25: 17.0, change: 11 },
  Tur: { past23: 7.5, past24: 8.2, pred25: 8.8, change: 5 },
  Wheat: { past23: 19.0, past24: 20.5, pred25: 22.0, change: 6 },
  Rice: { past23: 21.0, past24: 22.8, pred25: 24.5, change: 8 },
};

export const YieldForecastCard: React.FC<YieldForecastCardProps> = ({
  cropName = 'Onion',
  yieldData,
  isLoading = false,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const defaultMeta = DEFAULT_CROP_YIELDS[cropName] || { past23: 15, past24: 17, pred25: 19, change: 8 };

  const predictedYield = yieldData?.predictedYieldTonnesPerHectare
    ? yieldData.predictedYieldTonnesPerHectare
    : defaultMeta.pred25;

  const yieldDelta = yieldData?.yieldDeltaPercentage ?? defaultMeta.change;
  const isPositive = yieldDelta >= 0;

  const chartData = [
    { year: '2023', yield: defaultMeta.past23 },
    { year: '2024', yield: defaultMeta.past24 },
    { year: '2025\n(predicted)', yield: predictedYield, isPredicted: true },
  ];

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
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-[#0F7A4C]/10 flex items-center justify-center">
            <Sprout className="w-3.5 h-3.5 text-[#0F7A4C]" />
          </div>
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">
            Yield Forecast
          </h3>
        </div>
        <p className="text-[11px] text-slate-500 font-medium mb-4">
          Predicted yield for <span className="font-bold text-slate-700">{cropName}</span> (quintal/acre)
        </p>

        {/* Recharts Bar Chart */}
        <div className="w-full h-44 relative text-xs">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 10, left: -25, bottom: 0 }}
                barSize={42}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="year"
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
                  formatter={(value: any) => [`${value || 0} quintal/acre`, 'Yield']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#E2E8F0',
                    fontSize: '11px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                />
                <Bar dataKey="yield" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isPredicted ? '#0F7A4C' : '#86EFAC'}
                    />
                  ))}
                  <LabelList
                    dataKey="yield"
                    position="top"
                    style={{ fontSize: '10px', fontWeight: 700, fill: '#1E293B' }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full bg-slate-50 animate-pulse rounded-lg" />
          )}
        </div>
      </div>

      {/* Stat Sub-Cards Row */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
        {/* Sub-card 1: Predicted Yield */}
        <div className="bg-slate-50/70 rounded-xl p-2.5 border border-slate-100">
          <p className="text-[10px] font-medium text-slate-500 mb-0.5">Predicted Yield</p>
          <p className="text-sm font-extrabold text-slate-900">
            {predictedYield} <span className="text-[10px] font-normal text-slate-500">qtl/acre</span>
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
            <span>{Math.abs(yieldDelta)}%</span>
            <span className="font-normal text-slate-400 text-[9px]">vs last year</span>
          </div>
        </div>

        {/* Sub-card 2: Confidence */}
        <div className="bg-slate-50/70 rounded-xl p-2.5 border border-slate-100 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-medium text-slate-500 mb-0.5">Confidence</p>
            <p className="text-sm font-extrabold text-slate-900">78%</p>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mt-2">
            <div className="bg-[#0F7A4C] h-1.5 rounded-full w-[78%]" />
          </div>
        </div>
      </div>
    </div>
  );
};
