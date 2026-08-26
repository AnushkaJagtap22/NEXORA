import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  ShoppingBag,
  ShoppingCart,
  MessageSquare,
  TrendingUp,
  Megaphone,
  Shield,
  Activity,
  BarChart2,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';

export default function Sidebar({ onResetDemo }) {
  const getNavClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
      isActive
        ? 'bg-[#171A20] text-[#F5F7FA] border border-white/10 font-semibold shadow-sm'
        : 'text-[#A2A8B3] hover:text-[#F5F7FA] hover:bg-[#111419]'
    }`;

  return (
    <aside className="w-[224px] border-r border-white/5 bg-[#08090B] flex flex-col justify-between h-screen sticky top-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-[60px] border-b border-white/5 flex items-center px-6 gap-2">
          <div className="w-6 h-6 rounded-md bg-[#7C8FFF]/20 border border-[#7C8FFF]/40 flex items-center justify-center font-black text-xs text-[#7C8FFF]">
            N
          </div>
          <span className="font-bold text-[#F5F7FA] tracking-tight text-sm">NEXORA</span>
          <span className="text-[10px] font-mono text-[#6B7280] ml-auto">V3.0</span>
        </div>

        {/* MERCHANT NAVIGATION LINKS */}
        <nav className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {/* HOME */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider font-bold px-3">HOME</span>
            <NavLink to="/merchant/dashboard" className={getNavClass}>
              <Home size={15} className="text-[#7C8FFF]" />
              <span>Home</span>
            </NavLink>
          </div>

          {/* SELL */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider font-bold px-3">SELL</span>
            <NavLink to="/merchant/products" className={getNavClass}>
              <ShoppingBag size={15} />
              <span>Products</span>
            </NavLink>
            <NavLink to="/merchant/orders" className={getNavClass}>
              <ShoppingCart size={15} />
              <span>Orders</span>
            </NavLink>
            <NavLink to="/merchant/ai-shopping" className={getNavClass}>
              <MessageSquare size={15} />
              <span>AI Shopping</span>
            </NavLink>
          </div>

          {/* GROW */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider font-bold px-3">GROW</span>
            <NavLink to="/merchant/recommendations" className={getNavClass}>
              <TrendingUp size={15} />
              <span>Recommendations</span>
            </NavLink>
            <NavLink to="/merchant/campaigns" className={getNavClass}>
              <Megaphone size={15} />
              <span>Campaigns</span>
            </NavLink>
          </div>

          {/* PROTECT */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider font-bold px-3">PROTECT</span>
            <NavLink to="/merchant/guardrails" className={getNavClass}>
              <Shield size={15} />
              <span>AI Guardrails</span>
            </NavLink>
            <NavLink to="/merchant/activity" className={getNavClass}>
              <Activity size={15} />
              <span>Activity</span>
            </NavLink>
          </div>

          {/* INSIGHTS */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider font-bold px-3">INSIGHTS</span>
            <NavLink to="/merchant/revenue" className={getNavClass}>
              <BarChart2 size={15} />
              <span>Revenue</span>
            </NavLink>
          </div>

          {/* TEST */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider font-bold px-3">TEST</span>
            <NavLink to="/merchant/test-sales" className={getNavClass}>
              <Play size={15} />
              <span>Test AI Sales</span>
            </NavLink>
          </div>
        </nav>
      </div>

      {/* Footer Reset Action */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <button
          onClick={onResetDemo}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#111419] hover:bg-[#171A20] border border-white/5 text-xs text-[#A2A8B3] transition"
        >
          <div className="flex items-center gap-2">
            <RotateCcw size={13} className="text-[#E7B65C]" />
            <span>Reset Demo DB</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
