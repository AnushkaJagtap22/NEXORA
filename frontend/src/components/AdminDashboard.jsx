import React, { useState, useEffect } from 'react';
import { ShieldCheck, Building2, UserCheck, Activity, AlertTriangle, ArrowUpRight } from 'lucide-react';

export default function AdminDashboard({ user, onLogout }) {
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('nexora_token');
    fetch('/api/admin/overview', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.kpis) setAdminData(data);
      })
      .catch(err => console.error(err));
  }, []);

  const kpis = adminData?.kpis || {
    totalMerchants: 12,
    activeMerchants: 10,
    totalAiBuyers: 520,
    platformVolume: 4824000,
    safetyScore: 98
  };

  const merchants = adminData?.merchants || [
    { id: 'merch_001', name: 'Nexora Electronics', owner: 'Anushka Jagtap', products: 105, volume: 482400, status: 'ACTIVE' },
    { id: 'merch_002', name: 'AeroAudio India', owner: 'Vikram Mehta', products: 18, volume: 184000, status: 'ACTIVE' },
    { id: 'merch_003', name: 'Urban Tech Outfitters', owner: 'Priya Nair', products: 24, volume: 240000, status: 'ACTIVE' }
  ];

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] p-8 space-y-8 animate-fade-in font-sans">
      {/* Top Admin Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#E7B65C]/20 border border-[#E7B65C]/40 flex items-center justify-center font-bold text-xs text-[#E7B65C]">
            P
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">PLATFORM CONTROL CENTER</h1>
            <p className="text-xs text-[#A2A8B3]">Operate and monitor the Nexora AI Commerce Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-[#111419] px-3 py-1.5 rounded-lg border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#E7B65C]" />
            <span className="font-mono font-bold text-[#E7B65C]">ADMIN SESSION</span>
          </div>
          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-lg bg-[#111419] hover:bg-[#171A20] text-[#EF6B6B] border border-white/10 font-bold transition"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* PLATFORM METRICS RAIL */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 font-mono text-xs">
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-sans">Total Merchants</span>
          <p className="text-2xl font-bold text-[#F5F7FA]">{kpis.totalMerchants}</p>
          <p className="text-[10px] text-[#45D39A] font-sans">10 Active stores</p>
        </div>
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-sans">AI Buyers</span>
          <p className="text-2xl font-bold text-[#7C8FFF]">{kpis.totalAiBuyers}</p>
          <p className="text-[10px] text-[#6B7280] font-sans">Registered shoppers</p>
        </div>
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-sans">Platform Volume</span>
          <p className="text-2xl font-bold text-[#45D39A]">₹{(kpis.platformVolume / 100000).toFixed(2)}L</p>
          <p className="text-[10px] text-[#45D39A] font-sans">+22.4% vs last month</p>
        </div>
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-sans">AI Safety Score</span>
          <p className="text-2xl font-bold text-[#45D39A]">{kpis.safetyScore}/100</p>
          <p className="text-[10px] text-[#45D39A] font-sans">System compliant</p>
        </div>
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-sans">Violations Blocked</span>
          <p className="text-2xl font-bold text-[#E7B65C]">42</p>
          <p className="text-[10px] text-[#6B7280] font-sans">Safety bounds enforced</p>
        </div>
      </div>

      {/* MERCHANT MANAGEMENT TABLE */}
      <div className="nx-panel p-6 space-y-4">
        <div className="border-b border-white/5 pb-3 flex justify-between items-center">
          <h3 className="font-bold text-sm text-[#F5F7FA] flex items-center gap-2">
            <Building2 size={16} className="text-[#7C8FFF]" />
            MERCHANT STORES MANAGEMENT
          </h3>
          <span className="text-xs font-mono text-[#45D39A] font-bold">● 10 STORES OPERATIONAL</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111419] text-[#A2A8B3] text-[11px] uppercase font-mono border-b border-white/5">
              <tr>
                <th className="py-3 px-4">Store Name</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Catalog Products</th>
                <th className="py-3 px-4">AI Revenue Volume</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {merchants.map((m) => (
                <tr key={m.id} className="hover:bg-[#171A20] transition h-14">
                  <td className="py-3 px-4 font-bold text-[#F5F7FA]">{m.name}</td>
                  <td className="py-3 px-4 text-[#A2A8B3]">{m.owner}</td>
                  <td className="py-3 px-4 font-mono">{m.products} products</td>
                  <td className="py-3 px-4 font-bold font-mono text-[#45D39A]">₹{m.volume.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-[#45D39A]/10 text-[#45D39A] border border-[#45D39A]/20">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
