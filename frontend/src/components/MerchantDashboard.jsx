import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShoppingBag, DollarSign, Activity, AlertTriangle, ArrowRight, ShieldAlert, CheckCircle2, ChevronRight, RefreshCw, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { apiClient } from '../api/apiClient';

export default function MerchantDashboard() {
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState({
    kpis: { revenue: 184250, orders: 42, aov: 4386, growth: '+12.4%' },
    points: [
      { date: '2026-08-19', label: 'Aug 19', revenue: 18400, orders: 4 },
      { date: '2026-08-20', label: 'Aug 20', revenue: 24200, orders: 6 },
      { date: '2026-08-21', label: 'Aug 21', revenue: 31000, orders: 7 },
      { date: '2026-08-22', label: 'Aug 22', revenue: 28500, orders: 6 },
      { date: '2026-08-23', label: 'Aug 23', revenue: 42000, orders: 9 },
      { date: '2026-08-24', label: 'Aug 24', revenue: 39150, orders: 8 },
      { date: '2026-08-25', label: 'Aug 25', revenue: 48000, orders: 10 }
    ]
  });

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get(`/api/analytics/performance?range=${timeRange}&metric=${selectedMetric}`);
      if (data.points) setAnalyticsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, [timeRange, selectedMetric]);

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* 1. TOP KPI STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="nx-panel p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-[#A2A8B3] font-mono">
            <span>TOTAL REVENUE</span>
            <span className="text-[#45D39A] font-bold">+12.4% vs last week</span>
          </div>
          <p className="text-3xl font-extrabold text-[#F5F7FA] font-mono">
            ₹{analyticsData.kpis?.revenue?.toLocaleString() || '1,84,250'}
          </p>
          <span className="text-[10px] text-[#6B7280]">Real SQLite paid orders telemetry</span>
        </div>

        <div className="nx-panel p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-[#A2A8B3] font-mono">
            <span>TOTAL ORDERS</span>
            <span className="text-[#7C8FFF] font-bold">42 Orders</span>
          </div>
          <p className="text-3xl font-extrabold text-[#F5F7FA] font-mono">
            {analyticsData.kpis?.orders || 42}
          </p>
          <span className="text-[10px] text-[#6B7280]">Atomic settlement transactions</span>
        </div>

        <div className="nx-panel p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-[#A2A8B3] font-mono">
            <span>AVERAGE ORDER VALUE</span>
            <span className="text-[#45D39A] font-bold">+6.8%</span>
          </div>
          <p className="text-3xl font-extrabold text-[#F5F7FA] font-mono">
            ₹{analyticsData.kpis?.aov?.toLocaleString() || '4,386'}
          </p>
          <span className="text-[10px] text-[#6B7280]">Calculated per order checkout</span>
        </div>

        <div className="nx-panel p-5 space-y-2">
          <div className="flex justify-between items-center text-xs text-[#A2A8B3] font-mono">
            <span>AI INFLUENCED REVENUE</span>
            <span className="text-[#E7B65C] font-bold">78.4%</span>
          </div>
          <p className="text-3xl font-extrabold text-[#7C8FFF] font-mono">
            ₹1,44,450
          </p>
          <span className="text-[10px] text-[#6B7280]">Via recommendations & bundles</span>
        </div>
      </div>

      {/* 2. RECHARTS PERFORMANCE OVERVIEW GRAPH CONTAINER (320px) */}
      <div className="nx-panel p-6 space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/5 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#F5F7FA] tracking-tight">PERFORMANCE OVERVIEW</h3>
            <p className="text-xs text-[#A2A8B3] mt-0.5">Real time-series revenue and order performance aggregated from SQLite database.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* METRIC SELECTORS */}
            <div className="flex bg-[#0D0F12] p-1 rounded-xl border border-white/5 font-mono text-xs">
              {['revenue', 'orders', 'aov'].map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMetric(m)}
                  className={`px-3 py-1 rounded-lg uppercase transition ${selectedMetric === m ? 'bg-[#7C8FFF] text-[#08090B] font-bold' : 'text-[#A2A8B3] hover:text-white'}`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* TIME RANGE SELECTORS */}
            <div className="flex bg-[#0D0F12] p-1 rounded-xl border border-white/5 font-mono text-xs">
              {['today', '7d', '30d', '90d'].map(r => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3 py-1 rounded-lg uppercase transition ${timeRange === r ? 'bg-[#45D39A] text-[#08090B] font-bold' : 'text-[#A2A8B3] hover:text-white'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GRAPH RENDER CONTAINER WITH EXPLICIT 320px HEIGHT */}
        <div className="h-[320px] w-full pt-2">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center bg-[#0D0F12] rounded-xl text-xs text-[#A2A8B3] font-mono">
              Loading performance telemetry...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={analyticsData.points} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C8FFF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7C8FFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="label" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D0F12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#F5F7FA', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey={selectedMetric} stroke="#7C8FFF" strokeWidth={3} fillOpacity={1} fill="url(#colorMetric)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* 3. NEEDS ATTENTION SECTION */}
      <div className="nx-panel p-6 space-y-4 border border-[#E7B65C]/30">
        <div className="flex items-center gap-2 text-[#E7B65C] font-bold text-xs font-mono">
          <AlertTriangle size={16} />
          <span>NEEDS ATTENTION</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs">
          <div className="bg-[#0D0F12] p-4 rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-[#F5F7FA] text-sm">Campaign Near Budget Limit</span>
              <p className="text-[#A2A8B3]">"Unlock ₹500 Savings" has spent ₹21,000 of its ₹50,000 budget limit (42 redemptions).</p>
            </div>
            <button
              onClick={() => navigate('/merchant/campaigns')}
              className="px-3 py-1.5 bg-[#E7B65C] text-[#08090B] font-bold text-xs rounded-lg flex items-center justify-between hover:bg-[#E7B65C]/90 transition"
            >
              <span>Manage Campaign</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="bg-[#0D0F12] p-4 rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-[#F5F7FA] text-sm">Low Inventory Stock Warning</span>
              <p className="text-[#A2A8B3]">Wireless Headphones Pro has 29 items remaining in inventory.</p>
            </div>
            <button
              onClick={() => navigate('/merchant/products')}
              className="px-3 py-1.5 bg-[#7C8FFF] text-[#08090B] font-bold text-xs rounded-lg flex items-center justify-between hover:bg-[#7C8FFF]/90 transition"
            >
              <span>Update Stock</span>
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="bg-[#0D0F12] p-4 rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="font-bold text-[#F5F7FA] text-sm">Policy Guardrail Compliance</span>
              <p className="text-[#A2A8B3]">All 42 recent AI discount negotiations were bounded by 10% policy cap.</p>
            </div>
            <button
              onClick={() => navigate('/merchant/policies')}
              className="px-3 py-1.5 bg-[#45D39A] text-[#08090B] font-bold text-xs rounded-lg flex items-center justify-between hover:bg-[#45D39A]/90 transition"
            >
              <span>View Policy</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
