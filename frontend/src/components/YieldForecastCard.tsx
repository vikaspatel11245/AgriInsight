'use client';

import React, { useState, useEffect } from 'react';
import { Sprout, ArrowUpRight } from 'lucide-react';
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

interface YieldPoint {
  year: string;
  yield: number;
  isPredicted?: boolean;
}

const YIELD_DATA: YieldPoint[] = [
  { year: '2023', yield: 160 },
  { year: '2024', yield: 175 },
  { year: '2025\n(predicted)', yield: 190, isPredicted: true },
];

export const YieldForecastCard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between h-full">
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
          Predicted yield for Onion (quintal/acre)
        </p>

        {/* Recharts Bar Chart */}
        <div className="w-full h-44 relative text-xs">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={YIELD_DATA}
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
                  domain={[0, 300]}
                  ticks={[0, 100, 200, 300]}
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
                  {YIELD_DATA.map((entry, index) => (
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
            190 <span className="text-[10px] font-normal text-slate-500">quintal/acre</span>
          </p>
          <div className="flex items-center gap-1 mt-1 text-[#0F7A4C] font-bold text-[10px]">
            <ArrowUpRight className="w-3 h-3" />
            <span>9%</span>
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
