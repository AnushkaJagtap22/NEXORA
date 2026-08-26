import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Clock, User, LogOut, ArrowRight, Sparkles } from 'lucide-react';

export default function BuyerLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');
    navigate('/');
  };

  const navItems = [
    { label: 'AI Shopping', path: '/buyer/ai-shopping', icon: ShoppingBag },
    { label: 'Cart', path: '/buyer/cart', icon: ShoppingCart },
    { label: 'Orders', path: '/buyer/orders', icon: Clock },
    { label: 'Profile', path: '/buyer/profile', icon: User }
  ];

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] font-sans flex flex-col justify-between antialiased select-none">
      {/* 1. BUYER TOP NAVIGATION BAR */}
      <header className="h-16 border-b border-white/5 bg-[#0D0F12] px-8 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/buyer/ai-shopping')}>
            <div className="w-8 h-8 rounded-lg bg-[#45D39A]/20 border border-[#45D39A]/40 flex items-center justify-center text-[#45D39A] font-black font-mono text-sm">
              N
            </div>
            <span className="font-extrabold tracking-tight text-base text-[#F5F7FA]">NEXORA AI SHOP</span>
          </div>

          <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition ${isActive ? 'bg-[#45D39A]/15 text-[#45D39A] font-bold border border-[#45D39A]/30' : 'text-[#A2A8B3] hover:text-white'}`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 bg-[#111419] px-3 py-1.5 rounded-full border border-white/5">
            <span className="w-2 h-2 rounded-full bg-[#45D39A] animate-pulse"></span>
            <span className="text-[#F5F7FA] font-bold">Rahul Sharma</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-[#111419] text-[#6B7280] hover:text-[#EF6B6B] border border-white/5 transition"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* 2. MAIN BUYER BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-8">
        <Outlet />
      </main>

      {/* 3. FOOTER */}
      <footer className="h-14 border-t border-white/5 px-8 max-w-7xl w-full mx-auto flex items-center justify-between text-xs text-[#6B7280]">
        <span>Nexora AI Buyer Experience v2.4</span>
        <span className="font-mono">Mistral AI • Razorpay Test Mode</span>
      </footer>
    </div>
  );
}
