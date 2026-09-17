'use client';

import React from 'react';
import { Search, MapPin, Bell, ChevronDown } from 'lucide-react';

interface TopBarProps {
  selectedState?: string;
  onStateChange?: (state: string) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  selectedState = 'Maharashtra',
  onStateChange,
  searchQuery = '',
  onSearchChange,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Search Input */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search crop, mandi or your village..."
          className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-400 text-xs pl-10 pr-4 py-2 rounded-full border border-slate-200 focus:outline-none focus:border-[#0F7A4C] focus:ring-2 focus:ring-[#0F7A4C]/15 transition-all duration-150"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* State Location Selector Pill */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 hover:bg-slate-200/60 border border-slate-200/80 text-xs font-semibold text-slate-700 transition-colors"
          >
            <MapPin className="w-3.5 h-3.5 text-[#0F7A4C]" />
            <span>{selectedState}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative p-2 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0F7A4C] font-bold text-xs flex items-center justify-center border border-emerald-200 shadow-2xs">
            HM
          </div>
          <button
            type="button"
            className="flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
          >
            <span>Hi, Farmer</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
