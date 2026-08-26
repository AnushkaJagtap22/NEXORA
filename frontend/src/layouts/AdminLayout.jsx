import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Store, ShoppingCart, DollarSign, Activity, Tag, FileText, HeartPulse, Settings, LogOut } from 'lucide-react';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', path: '/admin/overview', icon: ShieldCheck },
    { label: 'Merchants', path: '/admin/merchants', icon: Store },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Payments', path: '/admin/payments', icon: DollarSign },
    { label: 'Agents', path: '/admin/agents', icon: Activity },
    { label: 'Campaigns', path: '/admin/campaigns', icon: Tag },
    { label: 'Audit', path: '/admin/audit', icon: FileText },
    { label: 'System Health', path: '/admin/system-health', icon: HeartPulse },
    { label: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex font-sans select-none antialiased">
      {/* 1. ADMIN SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-white/5 bg-[#0D0F12] flex flex-col justify-between shrink-0 p-4">
        <div className="space-y-6">
          {/* LOGO & WORKSPACE */}
          <div className="flex items-center gap-3 px-2 py-1 cursor-pointer" onClick={() => navigate('/admin/overview')}>
            <div className="w-9 h-9 rounded-xl bg-[#E7B65C]/20 border border-[#E7B65C]/40 flex items-center justify-center text-[#E7B65C] font-black font-mono text-base shadow-lg">
              A
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-[#F5F7FA] tracking-tight">NEXORA ADMIN</h1>
              <span className="text-[10px] font-mono text-[#E7B65C]">Platform Control Center</span>
            </div>
          </div>

          {/* MENU LINKS */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${isActive ? 'bg-[#E7B65C]/15 text-[#E7B65C] border border-[#E7B65C]/30' : 'text-[#A2A8B3] hover:text-[#F5F7FA] hover:bg-[#111419]'}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM LOGOUT */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="text-[11px]">
              <p className="font-bold text-[#F5F7FA] leading-none">Platform Admin</p>
              <p className="text-[#6B7280] text-[10px] leading-none mt-1">Super Admin Role</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[#111419] text-[#6B7280] hover:text-[#EF6B6B] border border-white/5 transition"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN ADMIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between shrink-0 bg-[#08090B]">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-[#F5F7FA] tracking-tight capitalize">
              {location.pathname.replace('/admin/', '').replace('/', '') || 'Overview'}
            </h2>
            <span className="text-xs text-[#E7B65C] font-mono">● System Healthy</span>
          </div>
        </header>

        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
