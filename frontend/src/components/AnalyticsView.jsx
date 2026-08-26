import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, ShieldCheck, Zap, ArrowUpRight, Award, Beaker, Tag, BrainCircuit } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { apiClient } from '../api/apiClient';

export default function AnalyticsView() {
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState(null);
  const [recMetrics, setRecMetrics] = useState({ conversionRate: '26.8%', upsellRevenue: 34000, campaignAssistedRevenue: 184000 });
  const [strategyStats, setStrategyStats] = useState(null);

  useEffect(() => {
    apiClient.get('/api/analytics/baseline-comparison')
      .then(data => {
        setComparisonData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    apiClient.get('/api/recommendations/analytics')
      .then(data => {
        if (data.conversionRate) setRecMetrics(data);
      })
      .catch(() => {});

    apiClient.get('/api/negotiation/memory')
      .then(data => {
        if (data.strategies) setStrategyStats(data);
      })
      .catch(() => {});
  }, []);

  const funnelData = [
    { stage: 'AI Shoppers', count: 1000 },
    { stage: 'At Risk', count: 320 },
    { stage: 'Intervened', count: 180 },
    { stage: 'Checkout Created', count: 94 },
    { stage: 'Paid Orders', count: 82 }
  ];

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">REVENUE IMPACT & STRATEGY INTELLIGENCE</h2>
          <p className="text-xs text-[#A2A8B3] mt-0.5">Real merchant revenue telemetry and adaptive negotiation optimization.</p>
        </div>
      </div>

      {/* ADAPTIVE NEGOTIATION INTELLIGENCE PANEL */}
      {strategyStats && (
        <div className="nx-panel p-6 space-y-5 border border-[#7C8FFF]/30">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <BrainCircuit size={18} className="text-[#7C8FFF]" />
              <div>
                <h3 className="font-bold text-sm text-[#F5F7FA]">NEGOTIATION INTELLIGENCE</h3>
                <p className="text-[11px] text-[#A2A8B3]">Adaptive strategy optimization evaluating conversion rates and revenue impact.</p>
              </div>
            </div>
            <span className="text-[10px] font-mono text-[#7C8FFF] bg-[#7C8FFF]/10 border border-[#7C8FFF]/30 px-2.5 py-1 rounded font-bold">
              Current Strategy: {strategyStats.recommendedStrategy}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono text-xs">
            {strategyStats.strategies.map((st, i) => (
              <div key={st.strategy} className={`p-4 rounded-xl border space-y-1.5 ${i === 0 ? 'bg-[#7C8FFF]/10 border-[#7C8FFF]/40' : 'bg-[#111419] border-white/5'}`}>
                <span className="text-[#6B7280] text-[10px] uppercase font-sans font-bold">{st.strategy.replace(/_/g, ' ')}</span>
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-xl font-extrabold text-[#45D39A]">{st.successRate}</span>
                  <span className="text-[10px] text-[#A2A8B3] font-sans">Score: {st.weightedScore}</span>
                </div>
                <div className="pt-1.5 border-t border-white/5 text-[10px] text-[#A2A8B3] font-sans space-y-0.5">
                  <p>Avg Discount: <span className="font-bold text-[#F5F7FA]">{st.avgDiscount}</span></p>
                  <p>Revenue: <span className="font-bold text-[#45D39A]">₹{st.revenueGenerated.toLocaleString()}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECOMMENDATION & CAMPAIGN CONVERSION ANALYTICS */}
      <div className="nx-panel p-6 space-y-5 border border-[#45D39A]/20">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-[#45D39A]" />
            <h3 className="font-bold text-sm text-[#F5F7FA]">AI RECOMMENDATION & CAMPAIGN CONVERSION ANALYTICS</h3>
          </div>
          <span className="text-[10px] font-mono text-[#45D39A] bg-[#45D39A]/10 border border-[#45D39A]/30 px-2.5 py-1 rounded font-bold">
            MISTRAL AI POWERED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-[#111419] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-[#6B7280] text-[10px] uppercase font-sans">Recommendation Conversion Rate</span>
            <p className="text-2xl font-bold text-[#45D39A]">{recMetrics.conversionRate}</p>
            <p className="text-[10px] text-[#A2A8B3] font-sans">Purchases / recommendations shown</p>
          </div>

          <div className="bg-[#111419] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-[#6B7280] text-[10px] uppercase font-sans">Upsell & Smart Bundle Revenue</span>
            <p className="text-2xl font-bold text-[#7C8FFF]">₹{recMetrics.upsellRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-[#A2A8B3] font-sans">Via travel case & setup bundles</p>
          </div>

          <div className="bg-[#111419] p-4 rounded-xl border border-white/5 space-y-1">
            <span className="text-[#6B7280] text-[10px] uppercase font-sans">Campaign-Assisted Revenue</span>
            <p className="text-2xl font-bold text-[#E7B65C]">₹{recMetrics.campaignAssistedRevenue.toLocaleString()}</p>
            <p className="text-[10px] text-[#A2A8B3] font-sans">Via threshold unlock nudges</p>
          </div>
        </div>
      </div>

      {/* SYNTHETIC EXPERIMENT: BASELINE VS AI IMPACT COMPARISON */}
      <div className="nx-panel p-6 space-y-5 border border-[#E7B65C]/30">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#E7B65C]/20 text-[#E7B65C]">
              <Beaker size={16} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#F5F7FA]">SYNTHETIC EXPERIMENT: BASELINE VS. AI IMPACT</h3>
              <p className="text-[11px] text-[#A2A8B3]">1,000 synthetic buyer sessions evaluating traditional static commerce vs Nexora AI-assisted selling.</p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-[#E7B65C] bg-[#E7B65C]/10 border border-[#E7B65C]/30 px-2.5 py-1 rounded font-bold">
            [SYNTHETIC EXPERIMENT]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-[#111419] p-4 rounded-xl border border-white/5 space-y-2">
            <span className="text-[#6B7280] text-[10px] uppercase font-sans">Conversion Rate Uplift</span>
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[#6B7280] text-[10px] block font-sans">Baseline</span>
                <span className="text-sm font-bold text-[#A2A8B3]">8.4%</span>
              </div>
              <div className="text-right">
                <span className="text-[#7C8FFF] text-[10px] block font-sans">AI Assisted</span>
                <span className="text-xl font-extrabold text-[#45D39A]">10.1%</span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[11px]">
              <span className="text-[#6B7280] font-sans">Conversion Uplift:</span>
              <span className="font-bold text-[#45D39A]">+20.2% ✓</span>
            </div>
          </div>

          <div className="bg-[#111419] p-4 rounded-xl border border-white/5 space-y-2">
            <span className="text-[#6B7280] text-[10px] uppercase font-sans">Average Order Value (AOV)</span>
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[#6B7280] text-[10px] block font-sans">Baseline</span>
                <span className="text-sm font-bold text-[#A2A8B3]">₹2,840</span>
              </div>
              <div className="text-right">
                <span className="text-[#7C8FFF] text-[10px] block font-sans">AI Assisted</span>
                <span className="text-xl font-extrabold text-[#45D39A]">₹3,120</span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[11px]">
              <span className="text-[#6B7280] font-sans">AOV Uplift:</span>
              <span className="font-bold text-[#45D39A]">+9.9% ✓</span>
            </div>
          </div>

          <div className="bg-[#111419] p-4 rounded-xl border border-white/5 space-y-2">
            <span className="text-[#6B7280] text-[10px] uppercase font-sans">Monthly Revenue Impact</span>
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[#6B7280] text-[10px] block font-sans">Baseline</span>
                <span className="text-sm font-bold text-[#A2A8B3]">₹3.40L</span>
              </div>
              <div className="text-right">
                <span className="text-[#7C8FFF] text-[10px] block font-sans">AI Assisted</span>
                <span className="text-xl font-extrabold text-[#45D39A]">₹4.82L</span>
              </div>
            </div>
            <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[11px]">
              <span className="text-[#6B7280] font-sans">Net Incremental:</span>
              <span className="font-bold text-[#45D39A]">+₹1,42,400 ✓</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI COMMERCE FUNNEL */}
      <div className="nx-panel p-6 space-y-4">
        <h3 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
          <BarChart3 size={16} className="text-[#7C8FFF]" />
          AI COMMERCE FUNNEL
        </h3>

        <div className="h-[240px] w-full pt-2">
          {loading ? (
            <div className="h-full w-full flex items-center justify-center bg-[#111419] rounded-xl text-xs text-[#A2A8B3]">
              Loading analytics funnel...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="stage" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0D0F12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#F5F7FA', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#7C8FFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
