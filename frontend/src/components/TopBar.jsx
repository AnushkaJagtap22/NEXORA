import React, { useState } from 'react';
import { Search, Bell, ShieldCheck, Play, Bot, LogOut, ChevronDown, User } from 'lucide-react';

export default function TopBar({ user, activeTab, onOpenCommandPalette, onRunFullDemo, onOpenCopilot, onLogout }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const getBreadcrumb = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Home';
      case 'catalog': return 'Sell / Products';
      case 'orders': return 'Sell / Orders';
      case 'chat': return 'Sell / AI Shopping';
      case 'upsell': return 'Grow / Recommendations';
      case 'campaigns': return 'Grow / Campaigns';
      case 'policies': return 'Protect / AI Guardrails';
      case 'audit': return 'Protect / Activity';
      case 'revenue': return 'Insights / Revenue';
      case 'simulation': return 'Test / Test AI Sales';
      default: return 'Home';
    }
  };

  return (
    <header className="h-[60px] border-b border-white/5 bg-[#08090B]/90 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
      {/* Left Context Breadcrumb */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[#6B7280] font-medium">NEXORA</span>
        <span className="text-[#6B7280]">/</span>
        <span className="text-[#F5F7FA] font-semibold">{getBreadcrumb(activeTab)}</span>
      </div>

      {/* Center Search */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center justify-between w-80 px-3 py-1.5 rounded-lg bg-[#111419] border border-white/10 text-xs text-[#A2A8B3] hover:border-white/20 transition"
      >
        <div className="flex items-center gap-2">
          <Search size={14} className="text-[#6B7280]" />
          <span>Search products, commands...</span>
        </div>
        <kbd className="px-1.5 py-0.5 rounded bg-[#0D0F12] border border-white/10 text-[10px] font-mono text-[#6B7280]">
          ⌘K
        </kbd>
      </button>

      {/* Right Controls */}
      <div className="flex items-center gap-3 text-xs">
        {/* ONE-CLICK FULL COMMERCE DEMO BUTTON */}
        <button
          onClick={onRunFullDemo}
          className="px-3.5 py-1.5 rounded-lg bg-[#7C8FFF] hover:bg-[#7C8FFF]/90 text-[#08090B] font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
        >
          <Play size={13} fill="#08090B" />
          <span>Run Full Commerce Demo</span>
        </button>

        {/* AI COPILOT TRIGGER */}
        <button
          onClick={onOpenCopilot}
          className="px-3 py-1.5 rounded-lg bg-[#111419] hover:bg-[#171A20] border border-white/10 text-[#7C8FFF] font-semibold text-xs flex items-center gap-1.5 transition"
        >
          <Bot size={14} />
          <span>Copilot</span>
        </button>

        {/* PROFILE MENU */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#111419] transition"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-950 border border-[#7C8FFF]/30 flex items-center justify-center text-[#7C8FFF] font-bold text-xs font-mono">
              {user?.avatar || 'A'}
            </div>
            <ChevronDown size={14} className="text-[#6B7280]" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0D0F12] border border-white/10 rounded-xl shadow-2xl p-3 space-y-3 z-50 animate-fade-in text-xs">
              <div className="border-b border-white/5 pb-2">
                <p className="font-bold text-[#F5F7FA]">{user?.name || 'Anushka Jagtap'}</p>
                <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px]">
                  <span className="text-[#45D39A] font-bold uppercase">{user?.role || 'MERCHANT'}</span>
                  {user?.businessName && <span className="text-[#6B7280]">• {user.businessName}</span>}
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#EF6B6B] hover:bg-[#111419] font-bold transition text-left"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
