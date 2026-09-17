'use client';

import React from 'react';
import { 
  Home, 
  TrendingUp, 
  Sprout, 
  Sliders, 
  Bookmark, 
  Bell, 
  BookOpen, 
  Leaf 
} from 'lucide-react';

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab = 'Home', 
  onTabChange 
}) => {
  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Price Forecast', icon: TrendingUp },
    { name: 'Yield Forecast', icon: Sprout },
    { name: 'What-If Simulator', icon: Sliders },
    { name: 'My Crops', icon: Bookmark },
    { name: 'Alerts', icon: Bell },
    { name: 'Learn', icon: BookOpen },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shrink-0 h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#0F7A4C] flex items-center justify-center text-white shadow-sm">
            <Leaf className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="font-bold text-xl leading-none text-slate-900 tracking-tight">
              Agri<span className="text-[#0F7A4C]">Insight AI</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">
              Better Data. Brighter Harvests.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <button
              key={item.name}
              onClick={() => onTabChange?.(item.name)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-[#E8F5E9] text-[#0F7A4C] font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? 'text-[#0F7A4C]' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Decorative Bottom Card */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100/70 border border-emerald-100 relative overflow-hidden">
        <div className="absolute -right-2 -bottom-2 opacity-15 pointer-events-none">
          <Leaf className="w-24 h-24 text-[#0F7A4C]" />
        </div>
        <div className="relative z-10 space-y-1">
          <div className="w-6 h-6 rounded-full bg-[#0F7A4C]/10 flex items-center justify-center mb-1">
            <Leaf className="w-3.5 h-3.5 text-[#0F7A4C]" />
          </div>
          <h4 className="font-bold text-xs text-[#0F7A4C] leading-snug">
            Stronger<br />
            Farmers<br />
            Greener<br />
            Maharashtra
          </h4>
        </div>
      </div>
    </aside>
  );
};
