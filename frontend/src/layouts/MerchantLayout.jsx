import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ShoppingCart, Users, Package, Tag, TrendingUp, Activity, ShieldCheck, FileText, Settings, UserCheck, Bell, Search, Sparkles, LogOut, Zap, AlertCircle } from 'lucide-react';

export default function MerchantLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    const token = localStorage.getItem('nexora_token');
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (e) {}
    }
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');
    navigate('/');
  };

  const navItems = [
    { label: 'Overview', path: '/merchant/overview', icon: LayoutDashboard },
    { label: 'AI Commerce', path: '/merchant/ai-commerce', icon: Zap, badge: 'Control' },
    { label: 'Products', path: '/merchant/products', icon: Package },
    { label: 'Orders', path: '/merchant/orders', icon: ShoppingCart },
    { label: 'Customers', path: '/merchant/customers', icon: Users },
    { label: 'Campaigns', path: '/merchant/campaigns', icon: Tag },
    { label: 'Policies', path: '/merchant/policies', icon: ShieldCheck },
    { label: 'Approvals', path: '/merchant/approvals', icon: AlertCircle },
    { label: 'Agent Activity', path: '/merchant/agent-activity', icon: Activity },
    { label: 'Revenue', path: '/merchant/revenue', icon: TrendingUp },
    { label: 'Audit', path: '/merchant/audit', icon: FileText }
  ];

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex font-sans select-none antialiased">
      {/* 1. SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-white/5 bg-[#0D0F12] flex flex-col justify-between shrink-0 p-4">
        <div className="space-y-6">
          {/* LOGO & WORKSPACE */}
          <div className="flex items-center gap-3 px-2 py-1 cursor-pointer" onClick={() => navigate('/merchant/overview')}>
            <div className="w-9 h-9 rounded-xl bg-[#7C8FFF]/20 border border-[#7C8FFF]/40 flex items-center justify-center text-[#7C8FFF] font-black font-mono text-base shadow-lg">
              N
            </div>
            <div>
              <h1 className="font-extrabold text-sm text-[#F5F7FA] tracking-tight">NEXORA</h1>
              <span className="text-[10px] font-mono text-[#A2A8B3]">Merchant Control Plane</span>
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition ${isActive ? 'bg-[#7C8FFF]/15 text-[#7C8FFF] border border-[#7C8FFF]/30' : 'text-[#A2A8B3] hover:text-[#F5F7FA] hover:bg-[#111419]'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-mono font-bold bg-[#7C8FFF] text-[#08090B] px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* BOTTOM AGENT STATUS & LOGOUT */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="bg-[#111419] p-3 rounded-xl border border-white/5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#45D39A] animate-pulse"></span>
              <span className="font-bold text-[#F5F7FA] text-[11px]">AI Selling Active</span>
            </div>
            <span className="text-[10px] text-[#45D39A]">Governance ON</span>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#45D39A]/20 border border-[#45D39A]/40 flex items-center justify-center text-[#45D39A] font-bold text-xs font-mono">
                M
              </div>
              <div className="text-[11px]">
                <p className="font-bold text-[#F5F7FA] leading-none">Anushka Jagtap</p>
                <p className="text-[#6B7280] text-[10px] leading-none mt-1">Merchant Owner</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-[#111419] text-[#A2A8B3] hover:text-[#EF6B6B] border border-white/5 transition flex items-center gap-1 font-mono text-[11px]"
              title="Sign Out of Nexora"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* TOP BAR */}
        <header className="h-16 border-b border-white/5 px-8 flex items-center justify-between shrink-0 bg-[#08090B]">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-[#F5F7FA] tracking-tight capitalize">
              {location.pathname.replace('/merchant/', '').replace('/', '') || 'Dashboard'}
            </h2>
            <span className="text-xs text-[#6B7280] font-mono">| Nexora Governance Layer v2.4</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl bg-[#111419] text-[#A2A8B3] hover:text-[#EF6B6B] border border-white/5 text-xs font-mono font-bold transition flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* PAGE BODY */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
