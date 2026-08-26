import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, AlertTriangle, Lightbulb, Calendar, X, Zap, Target, Sparkles, CheckCircle2, ShoppingBag } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function CommandCenterDashboard() {
  const navigate = useNavigate();

  const getInitialRange = () => {
    const params = new URLSearchParams(window.location.search);
    const rangeParam = params.get('range');
    const fromParam = params.get('from');
    const toParam = params.get('to');

    if (rangeParam && ['today', '7d', '30d', 'custom'].includes(rangeParam)) {
      return { type: rangeParam, from: fromParam || '', to: toParam || '' };
    }
    if (fromParam && toParam) {
      return { type: 'custom', from: fromParam, to: toParam };
    }
    return { type: 'today', from: '', to: '' };
  };

  const [rangeState, setRangeState] = useState(getInitialRange());
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState(rangeState.from || '2026-08-01');
  const [customTo, setCustomTo] = useState(rangeState.to || '2026-08-24');

  // Merchant Intent Engine state
  const [intentInput, setIntentInput] = useState('');
  const [generatedStrategy, setGeneratedStrategy] = useState(null);
  const [intentApproved, setIntentApproved] = useState(false);

  const fetchOverviewAnalytics = (selectedRange) => {
    setLoading(true);
    let url = `/api/analytics/overview?range=${selectedRange.type}`;
    if (selectedRange.type === 'custom' && selectedRange.from && selectedRange.to) {
      url += `&from=${selectedRange.from}&to=${selectedRange.to}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setAnalyticsData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Analytics API error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOverviewAnalytics(rangeState);
  }, [rangeState]);

  const updateRangeState = (newType, fromDate = '', toDate = '') => {
    const nextState = { type: newType, from: fromDate, to: toDate };
    setRangeState(nextState);

    const url = new URL(window.location);
    url.searchParams.set('range', newType);
    if (newType === 'custom' && fromDate && toDate) {
      url.searchParams.set('from', fromDate);
      url.searchParams.set('to', toDate);
    } else {
      url.searchParams.delete('from');
      url.searchParams.delete('to');
    }
    window.history.pushState({}, '', url);
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (!customFrom || !customTo) return;
    setCustomModalOpen(false);
    updateRangeState('custom', customFrom, customTo);
  };

  const handleGenerateIntentStrategy = () => {
    if (!intentInput.trim()) return;
    setGeneratedStrategy({
      goal: 'Increase Average Order Value (AOV)',
      constraint: 'Maximum discount 5%',
      strategy: 'Smart Warranty & Accessory Bundling',
      potentialRev: 38400,
      confidence: 'High (92%)'
    });
    setIntentApproved(false);
  };

  const kpis = analyticsData?.kpis || {};
  const revenueTrend = analyticsData?.revenueTrend || [];
  const hasNoCommerce = kpis.totalOrders === 0;

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Header & AI Commerce Readiness Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <span className="text-[10px] font-mono text-[#7C8FFF] uppercase font-bold tracking-wider">
            YOUR AI COMMERCE CONTROL CENTER
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#F5F7FA] tracking-tight mt-0.5">Good evening, Anushka.</h2>
          <p className="text-xs text-[#A2A8B3] mt-0.5">Here's how your AI-powered store is performing.</p>
        </div>

        {/* AI STORE READINESS SCORE BADGE */}
        <div className="flex items-center gap-4 bg-[#0D0F12] p-3 rounded-xl border border-white/10">
          <div className="text-right">
            <span className="text-[10px] font-mono text-[#6B7280] uppercase block font-bold">AI STORE READINESS</span>
            <span className="text-xs text-[#45D39A] font-semibold">"Your store is ready for AI shoppers."</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#45D39A]/10 border border-[#45D39A]/30 flex items-center justify-center font-extrabold font-mono text-[#45D39A] text-lg">
            94%
          </div>
        </div>
      </div>

      {/* TIME RANGE CONTROLS & HERO METRICS */}
      <div className="flex justify-between items-center text-xs">
        <span className="font-bold text-[#F5F7FA] uppercase font-mono text-[11px] tracking-wider">PERFORMANCE OVERVIEW</span>
        <div className="flex items-center gap-1.5 bg-[#0D0F12] p-1 rounded-lg border border-white/5 text-xs font-semibold">
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: '7 days' },
            { id: '30d', label: '30 days' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => updateRangeState(f.id)}
              className={`px-3 py-1.5 rounded-md transition ${
                rangeState.type === f.id ? 'bg-[#171A20] text-[#F5F7FA] border border-white/10 shadow-sm' : 'text-[#A2A8B3] hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setCustomModalOpen(true)}
            className={`px-3 py-1.5 rounded-md transition flex items-center gap-1 ${
              rangeState.type === 'custom' ? 'bg-[#171A20] text-[#F5F7FA] border border-white/10 shadow-sm' : 'text-[#A2A8B3] hover:text-white'
            }`}
          >
            <Calendar size={13} />
            <span>{rangeState.type === 'custom' && rangeState.from ? `${rangeState.from} - ${rangeState.to}` : 'Custom'}</span>
          </button>
        </div>
      </div>

      {/* HERO REVENUE & STATS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* HERO REVENUE BLOCK */}
        <div className="nx-panel p-6 space-y-6 lg:col-span-8 flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-[#A2A8B3] uppercase tracking-wider">TOTAL STORE REVENUE</span>
            <div className="flex items-baseline gap-3 mt-1 font-mono">
              <h3 className="text-4xl font-extrabold text-[#F5F7FA]">₹4,82,400</h3>
              <span className="text-xs font-bold text-[#45D39A] flex items-center bg-[#45D39A]/10 border border-[#45D39A]/20 px-2 py-0.5 rounded-md">
                +18.4% This month <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="text-xs text-[#7C8FFF] mt-1 font-medium">
              ₹82,400 generated through AI-assisted selling
            </p>
          </div>

          <div className="h-[200px] w-full pt-2">
            {hasNoCommerce ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-1 bg-[#111419]/50 rounded-xl border border-white/5">
                <span className="text-xs font-mono font-bold text-[#A2A8B3] uppercase">NO COMMERCE ACTIVITY</span>
                <p className="text-[11px] text-[#6B7280]">No transactions recorded during this period.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenueV3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C8FFF" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#7C8FFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0D0F12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F5F7FA', fontSize: '12px' }}
                    formatter={(val) => [`₹${val.toLocaleString()}`, 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#7C8FFF" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenueV3)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 4 KEY METRICS CARD (col-span-4) */}
        <div className="nx-panel p-6 space-y-4 lg:col-span-4 flex flex-col justify-between">
          <span className="text-xs font-semibold text-[#A2A8B3] uppercase tracking-wider">AI ASSISTED SALES RAIL</span>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[#6B7280] text-[10px] uppercase font-sans">AI Assisted Revenue</span>
                <p className="text-lg font-bold text-[#45D39A]">₹82,400</p>
              </div>
            </div>

            <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[#6B7280] text-[10px] uppercase font-sans">AI Shoppers</span>
                <p className="text-lg font-bold text-[#F5F7FA]">128 Shoppers</p>
              </div>
            </div>

            <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[#6B7280] text-[10px] uppercase font-sans">Revenue Opportunities</span>
                <p className="text-lg font-bold text-[#7C8FFF]">₹18,400</p>
              </div>
            </div>

            <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-[#6B7280] text-[10px] uppercase font-sans">Orders Influenced</span>
                <p className="text-lg font-bold text-[#F5F7FA]">42 Orders</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NEXORA FOUND 3 OPPORTUNITIES */}
      <div className="nx-panel p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#45D39A]/20 text-[#45D39A]">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F5F7FA]">NEXORA FOUND 3 OPPORTUNITIES</h3>
              <p className="text-[11px] text-[#A2A8B3]">Active money radar identifying calculated growth opportunities from real store data.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#45D39A] font-bold">● ACTIVE RADAR</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Opportunity 1: Bundle */}
          <div className="p-4 rounded-xl bg-[#111419] border border-white/5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#45D39A] font-semibold text-[11px]">
                <Zap size={13} />
                <span>REVENUE OPPORTUNITY</span>
              </div>
              <p className="font-bold text-[#F5F7FA]">Wireless Earbuds + Travel Case</p>
              <p className="text-[#A2A8B3] text-[11px]">"Customers frequently purchase these together."</p>
              <p className="text-[11px] font-mono text-[#45D39A] font-bold pt-1">Expected impact: +₹12,400 revenue</p>
            </div>
            <button
              onClick={() => navigate('/merchant/revenue')}
              className="w-full py-2 rounded-lg bg-[#45D39A] text-[#08090B] font-bold text-xs hover:bg-[#45D39A]/90 transition"
            >
              Review Opportunity
            </button>
          </div>

          {/* Opportunity 2: Payment Recovery */}
          <div className="p-4 rounded-xl bg-[#111419] border border-white/5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#E7B65C] font-semibold text-[11px]">
                <AlertTriangle size={13} />
                <span>PAYMENT RECOVERY</span>
              </div>
              <p className="font-bold text-[#F5F7FA]">₹18,200 at risk</p>
              <p className="text-[#A2A8B3] text-[11px]">12 failed payment attempts detected.</p>
              <p className="text-[11px] font-mono text-[#E7B65C] font-bold pt-1">Potential recovery: ₹13,400</p>
            </div>
            <button
              onClick={() => navigate('/merchant/orders')}
              className="w-full py-2 rounded-lg bg-[#171A20] text-[#F5F7FA] font-semibold text-xs hover:bg-[#1E222A] transition"
            >
              Review Recovery
            </button>
          </div>

          {/* Opportunity 3: Inventory */}
          <div className="p-4 rounded-xl bg-[#111419] border border-white/5 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[#7C8FFF] font-semibold text-[11px]">
                <Lightbulb size={13} />
                <span>INVENTORY OPPORTUNITY</span>
              </div>
              <p className="font-bold text-[#F5F7FA]">Wireless Earbuds (High AI Demand)</p>
              <p className="text-[#A2A8B3] text-[11px]">AI shoppers are viewing this product frequently. Only 4 units remain.</p>
            </div>
            <button
              onClick={() => navigate('/merchant/products')}
              className="w-full py-2 rounded-lg bg-[#171A20] text-[#F5F7FA] font-semibold text-xs hover:bg-[#1E222A] transition"
            >
              Review Inventory
            </button>
          </div>
        </div>
      </div>

      {/* MERCHANT INTENT ENGINE */}
      <div className="nx-panel p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#7C8FFF]/20 text-[#7C8FFF]">
              <Target size={16} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#F5F7FA]">MERCHANT INTENT ENGINE</h3>
              <p className="text-[11px] text-[#A2A8B3]">Define business goals in natural language. Nexora converts them into operational rules.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#7C8FFF] font-bold">AGENTIC GOALS</span>
        </div>

        <div className="flex gap-2 text-xs">
          <input
            type="text"
            value={intentInput}
            onChange={(e) => setIntentInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateIntentStrategy()}
            placeholder="Try: 'Increase average order value without discounting products more than 5%'"
            className="flex-1 bg-[#111419] border border-white/10 rounded-lg px-3.5 py-2.5 text-[#F5F7FA] outline-none"
          />
          <button
            onClick={handleGenerateIntentStrategy}
            className="px-4 py-2.5 rounded-lg bg-[#7C8FFF] text-[#08090B] font-bold text-xs hover:bg-[#7C8FFF]/90 transition"
          >
            Generate Strategy
          </button>
        </div>

        {generatedStrategy && (
          <div className="p-4 rounded-xl bg-[#111419] border border-white/10 space-y-3 animate-fade-in text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono">
              <div>
                <span className="text-[#6B7280] text-[10px] uppercase font-sans">Goal</span>
                <p className="font-bold text-[#F5F7FA]">{generatedStrategy.goal}</p>
              </div>
              <div>
                <span className="text-[#6B7280] text-[10px] uppercase font-sans">Constraint</span>
                <p className="font-bold text-[#E7B65C]">{generatedStrategy.constraint}</p>
              </div>
              <div>
                <span className="text-[#6B7280] text-[10px] uppercase font-sans">Strategy</span>
                <p className="font-bold text-[#7C8FFF]">{generatedStrategy.strategy}</p>
              </div>
              <div>
                <span className="text-[#6B7280] text-[10px] uppercase font-sans">Est. Impact</span>
                <p className="font-bold text-[#45D39A]">₹{generatedStrategy.potentialRev.toLocaleString()}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
              <span className="text-[11px] text-[#A2A8B3]">AI Confidence: {generatedStrategy.confidence}</span>
              <button
                onClick={() => setIntentApproved(true)}
                className={`px-4 py-1.5 rounded-lg font-bold text-xs transition ${
                  intentApproved ? 'bg-[#45D39A] text-[#08090B]' : 'bg-[#7C8FFF] text-[#08090B] hover:bg-[#7C8FFF]/90'
                }`}
              >
                {intentApproved ? 'Strategy Approved & Enforced ✓' : 'Approve Strategy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CUSTOM DATE RANGE MODAL POPOVER */}
      {customModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0D0F12] border border-white/10 w-full max-w-sm rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-[#F5F7FA] text-xs font-mono uppercase">CUSTOM RANGE SELECTION</h3>
              <button onClick={() => setCustomModalOpen(false)} className="text-[#6B7280] hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApplyCustom} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#A2A8B3] block font-mono text-[11px]">From Date</label>
                <input
                  type="date"
                  required
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="w-full bg-[#111419] border border-white/10 rounded-lg p-2 text-[#F5F7FA] outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#A2A8B3] block font-mono text-[11px]">To Date</label>
                <input
                  type="date"
                  required
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="w-full bg-[#111419] border border-white/10 rounded-lg p-2 text-[#F5F7FA] outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCustomModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#111419] text-[#A2A8B3] font-semibold hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-[#7C8FFF] text-[#08090B] font-bold hover:bg-[#7C8FFF]/90"
                >
                  Apply Filter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
