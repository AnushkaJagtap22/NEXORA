import React, { useState, useEffect } from 'react';
import { ShieldCheck, Activity, Users, AlertTriangle, Play, Terminal, Download, Power, RefreshCw, CheckCircle2, Lock } from 'lucide-react';

export default function AgentNetworkView() {
  const [adminData, setAdminData] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminOverview = async () => {
    try {
      const res = await fetch('/api/admin/overview', {
        headers: {
          'Authorization': 'Bearer nexora_tok_usr_a001_demo'
        }
      });
      const data = await res.json();
      setAdminData(data);
      if (data.merchants) setMerchants(data.merchants);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminOverview();
  }, []);

  const handleToggleMerchantStatus = async (merchantId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await fetch(`/api/admin/merchants/${merchantId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer nexora_tok_usr_a001_demo'
        },
        body: JSON.stringify({ status: nextStatus })
      });
      setMerchants(prev => prev.map(m => m.id === merchantId ? { ...m, status: nextStatus } : m));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadOpenAPI = () => {
    window.open('/api/docs/openapi.json', '_blank');
  };

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">ADMIN CONTROL CENTER</h2>
          <p className="text-xs text-[#A2A8B3] mt-0.5">Platform overview, AI agent health telemetry, safety monitors, and merchant isolation controls.</p>
        </div>

        <button
          onClick={handleDownloadOpenAPI}
          className="px-4 py-2 rounded-lg bg-[#7C8FFF] text-[#08090B] text-xs font-bold flex items-center gap-1.5 hover:bg-[#7C8FFF]/90 transition"
        >
          <Download size={14} />
          <span>OpenAPI 3.0 Spec (.json)</span>
        </button>
      </div>

      {/* PLATFORM OVERVIEW KPIS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-mono font-bold">Active Merchants</span>
          <p className="text-2xl font-extrabold text-[#F5F7FA] font-mono">10 / 12</p>
          <p className="text-[10px] text-[#45D39A]">Isolated tenant accounts</p>
        </div>

        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-mono font-bold">Platform Volume (GMV)</span>
          <p className="text-2xl font-extrabold text-[#45D39A] font-mono">₹48.24L</p>
          <p className="text-[10px] text-[#A2A8B3]">Razorpay Test Mode</p>
        </div>

        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-mono font-bold">Policy Safety Score</span>
          <p className="text-2xl font-extrabold text-[#7C8FFF] font-mono">98 / 100</p>
          <p className="text-[10px] text-[#45D39A]">Zero unauthorized discount breaches</p>
        </div>

        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-mono font-bold">Safety Blocks</span>
          <p className="text-2xl font-extrabold text-[#E7B65C] font-mono">42 Prevented</p>
          <p className="text-[10px] text-[#A2A8B3]">Retry caps & discount limits</p>
        </div>
      </div>

      {/* AGENT HEALTH & LATENCY TELEMETRY */}
      <div className="nx-panel p-6 space-y-5 border border-[#7C8FFF]/20">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-[#7C8FFF]" />
            <h3 className="font-bold text-sm text-[#F5F7FA]">AI AGENT HEALTH & LATENCY TELEMETRY</h3>
          </div>
          <span className="text-[10px] font-mono text-[#45D39A] bg-[#45D39A]/10 border border-[#45D39A]/30 px-2.5 py-1 rounded font-bold flex items-center gap-1.5">
            <CheckCircle2 size={12} /> MISTRAL OPERATIONAL
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
          <div className="bg-[#111419] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-[#6B7280] text-[10px] uppercase">LLM Provider</span>
            <p className="text-base font-bold text-[#F5F7FA]">Mistral AI</p>
            <p className="text-[10px] text-[#A2A8B3]">mistral-small-latest</p>
          </div>

          <div className="bg-[#111419] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-[#6B7280] text-[10px] uppercase">Average Latency</span>
            <p className="text-base font-bold text-[#45D39A]">1,140 ms</p>
            <p className="text-[10px] text-[#A2A8B3]">8s timeout safety wrap</p>
          </div>

          <div className="bg-[#111419] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-[#6B7280] text-[10px] uppercase">Agent Step Count</span>
            <p className="text-base font-bold text-[#7C8FFF]">4.2 Steps / Session</p>
            <p className="text-[10px] text-[#A2A8B3]">Max 8 steps bounded</p>
          </div>

          <div className="bg-[#111419] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-[#6B7280] text-[10px] uppercase">Policy Block Rate</span>
            <p className="text-base font-bold text-[#E7B65C]">4.2% Blocked</p>
            <p className="text-[10px] text-[#A2A8B3]">Enforced by policy engine</p>
          </div>
        </div>
      </div>

      {/* MERCHANT MANAGEMENT TABLE */}
      <div className="nx-panel p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-[#7C8FFF]" />
            <h3 className="font-bold text-sm text-[#F5F7FA]">MERCHANT MANAGEMENT & TENANT ISOLATION</h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111419] text-[#A2A8B3] text-[11px] uppercase border-b border-white/5 font-mono">
              <tr>
                <th className="py-3 px-4">Merchant</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Products</th>
                <th className="py-3 px-4">Volume (GMV)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {merchants.map((m) => (
                <tr key={m.id} className="hover:bg-[#171A20] transition">
                  <td className="py-3.5 px-4 font-bold text-[#F5F7FA]">{m.name}</td>
                  <td className="py-3.5 px-4 text-[#A2A8B3]">{m.owner}</td>
                  <td className="py-3.5 px-4 font-mono">{m.products} products</td>
                  <td className="py-3.5 px-4 font-mono text-[#45D39A] font-bold">₹{m.volume.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      m.status === 'ACTIVE' ? 'bg-[#45D39A]/10 text-[#45D39A] border border-[#45D39A]/20' : 'bg-[#EF6B6B]/10 text-[#EF6B6B] border border-[#EF6B6B]/20'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleMerchantStatus(m.id, m.status)}
                      className={`px-3 py-1 rounded text-xs font-bold transition flex items-center gap-1.5 ml-auto ${
                        m.status === 'ACTIVE'
                          ? 'bg-[#EF6B6B]/10 text-[#EF6B6B] border border-[#EF6B6B]/20 hover:bg-[#EF6B6B]/20'
                          : 'bg-[#45D39A]/10 text-[#45D39A] border border-[#45D39A]/20 hover:bg-[#45D39A]/20'
                      }`}
                    >
                      <Power size={12} />
                      <span>{m.status === 'ACTIVE' ? 'Suspend Merchant' : 'Reactivate'}</span>
                    </button>
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
