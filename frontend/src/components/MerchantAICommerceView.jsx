import React, { useState, useEffect } from 'react';
import { Zap, BrainCircuit, TrendingUp, ShieldCheck, Tag, Sparkles, CheckCircle2, AlertTriangle, ArrowUpRight, BarChart3, MessageSquare } from 'lucide-react';

export default function MerchantAICommerceView() {
  const [stats, setStats] = useState({
    aiRevenue: 142400,
    interactions: 1284,
    conversions: 87,
    upsells: 43,
    negotiationsCapped: 31,
    policyBlocks: 12
  });

  const [activities, setActivities] = useState([
    { id: 1, time: '12:43 PM', type: 'SALE', text: 'AI completed transaction for Wireless Headphones Pro', amount: 4749, status: 'PAID' },
    { id: 2, time: '12:42 PM', type: 'POLICY_BLOCK', text: 'Requested 15% discount capped to 10% policy limit', amount: 449, status: 'BLOCKED' },
    { id: 3, time: '12:41 PM', type: 'UPSELL', text: 'Customer accepted Travel Protective Case smart bundle', amount: 499, status: 'ACCEPTED' },
    { id: 4, time: '12:38 PM', type: 'CAMPAIGN', text: 'Spend ₹5,000 threshold campaign triggered (₹300 off unlocked)', amount: 300, status: 'QUALIFIED' },
    { id: 5, time: '12:35 PM', type: 'APPROVAL_REQ', text: 'Order NX-1049 (₹12,500) sent for merchant human escalation', amount: 12500, status: 'PENDING' }
  ]);

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] tracking-tight uppercase">AI COMMERCE CONTROL CENTER</h2>
          <p className="text-xs text-[#A2A8B3] mt-0.5 font-medium">"How AI agents sell your products safely."</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#45D39A] bg-[#45D39A]/10 border border-[#45D39A]/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <CheckCircle2 size={14} /> MISTRAL ENGINE ONLINE
          </span>
        </div>
      </div>

      {/* METRICS RAIL */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-mono font-bold">AI-Assisted Sales</span>
          <p className="text-xl font-extrabold text-[#45D39A] font-mono">₹1.42L</p>
          <p className="text-[10px] text-[#A2A8B3]">Net incremental</p>
        </div>

        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-mono font-bold">Interactions</span>
          <p className="text-xl font-extrabold text-[#F5F7FA] font-mono">1,284</p>
          <p className="text-[10px] text-[#A2A8B3]">AI sessions</p>
        </div>

        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-mono font-bold">Conversions</span>
          <p className="text-xl font-extrabold text-[#7C8FFF] font-mono">87 Paid</p>
          <p className="text-[10px] text-[#45D39A]">26.8% Rate</p>
        </div>

        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-mono font-bold">Smart Upsells</span>
          <p className="text-xl font-extrabold text-[#7C8FFF] font-mono">43 Accepted</p>
          <p className="text-[10px] text-[#A2A8B3]">Setup bundles</p>
        </div>

        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-mono font-bold">Negotiations Capped</span>
          <p className="text-xl font-extrabold text-[#E7B65C] font-mono">31 Capped</p>
          <p className="text-[10px] text-[#A2A8B3]">10% Policy Limit</p>
        </div>

        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-mono font-bold">Policy Blocks</span>
          <p className="text-xl font-extrabold text-[#EF6B6B] font-mono">12 Prevented</p>
          <p className="text-[10px] text-[#A2A8B3]">Zero breaches</p>
        </div>
      </div>

      {/* AI COMMERCE PERFORMANCE & INFLUENCE */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* RECENT AI AGENT STREAM (7 cols) */}
        <div className="nx-panel p-6 space-y-4 md:col-span-7">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-[#7C8FFF]" />
              <h3 className="font-bold text-sm text-[#F5F7FA]">REAL-TIME AI AGENT SELLING ACTIVITY</h3>
            </div>
            <span className="text-[10px] font-mono text-[#7C8FFF]">LIVE FEED</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {activities.map(act => (
              <div key={act.id} className="bg-[#111419] p-3.5 rounded-xl border border-white/5 flex items-center justify-between font-sans">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[#6B7280]">{act.time}</span>
                    <span className="font-bold text-xs text-[#F5F7FA]">{act.text}</span>
                  </div>
                </div>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                  act.status === 'PAID' ? 'bg-[#45D39A]/10 text-[#45D39A]' :
                  act.status === 'BLOCKED' ? 'bg-[#E7B65C]/10 text-[#E7B65C]' :
                  act.status === 'ACCEPTED' ? 'bg-[#7C8FFF]/10 text-[#7C8FFF]' :
                  'bg-[#EF6B6B]/10 text-[#EF6B6B]'
                }`}>
                  {act.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI INFLUENCE SUMMARY (5 cols) */}
        <div className="nx-panel p-6 space-y-4 md:col-span-5 border border-[#7C8FFF]/20 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BrainCircuit size={18} className="text-[#7C8FFF]" />
                <h3 className="font-bold text-sm text-[#F5F7FA]">COMMERCE INTELLIGENCE SUMMARY</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-[#7C8FFF] uppercase font-bold">TOP SELLING AI CATEGORY</span>
                <p className="font-bold text-[#F5F7FA]">Audio & Travel Electronics (58% of AI Volume)</p>
              </div>

              <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-[#45D39A] uppercase font-bold">MOST ACCEPTED BUNDLE</span>
                <p className="font-bold text-[#F5F7FA]">Headphones + Travel Case Setup Bundle (+₹499)</p>
              </div>

              <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] font-mono text-[#E7B65C] uppercase font-bold">POLICY GOVERNANCE EFFICIENCY</span>
                <p className="font-bold text-[#F5F7FA]">100% of discount requests capped within 10% policy limit</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 text-right">
            <a href="/merchant/policies" className="text-xs font-bold text-[#7C8FFF] hover:underline font-mono">
              Manage Policy Rules →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
