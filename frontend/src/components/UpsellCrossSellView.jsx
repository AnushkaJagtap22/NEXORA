import React, { useState } from 'react';
import { TrendingUp, CheckCircle2, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

export default function UpsellCrossSellView() {
  const [recommendations, setRecommendations] = useState([
    {
      id: 'rec_101',
      title: 'WARRANTY PROTECTION',
      desc: 'Customers buying Wireless Earbuds often add a warranty.',
      item: '1-Year Warranty Protection',
      potentialRevenue: 12400,
      confidence: 'High (32% attachment)',
      status: 'ENABLED',
      policyResult: 'Allowed'
    },
    {
      id: 'rec_102',
      title: 'TRAVEL HARD-SHELL CASE',
      desc: 'Customers who buy these earbuds frequently purchase a travel case.',
      item: 'Protective Travel Case',
      potentialRevenue: 8200,
      confidence: 'High (45% attachment)',
      status: 'AVAILABLE',
      policyResult: 'Allowed'
    }
  ]);

  const toggleEnable = (id) => {
    setRecommendations(prev => prev.map(r => {
      if (r.id === id) {
        return { ...r, status: r.status === 'ENABLED' ? 'AVAILABLE' : 'ENABLED' };
      }
      return r;
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">RECOMMENDATIONS</h2>
          <p className="text-xs text-[#A2A8B3] mt-0.5">"Let AI find your next sale."</p>
        </div>
      </div>

      {/* METRICS RAIL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#0D0F12] border border-white/5 text-xs font-mono">
        <div>
          <span className="text-[#6B7280] text-[10px] uppercase font-medium">Potential Revenue</span>
          <p className="text-base font-bold text-[#45D39A]">₹20,600</p>
        </div>
        <div>
          <span className="text-[#6B7280] text-[10px] uppercase font-medium">Active Opportunities</span>
          <p className="text-base font-bold text-[#F5F7FA]">2 Opportunities</p>
        </div>
        <div>
          <span className="text-[#6B7280] text-[10px] uppercase font-medium">Avg Attachment</span>
          <p className="text-base font-bold text-[#7C8FFF]">38.5%</p>
        </div>
        <div>
          <span className="text-[#6B7280] text-[10px] uppercase font-medium">Safety Check</span>
          <p className="text-base font-bold text-[#45D39A]">All Passed ✓</p>
        </div>
      </div>

      {/* RECOMMENDATION CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec) => (
          <div key={rec.id} className="nx-panel p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono text-[#7C8FFF] uppercase font-bold tracking-wider">{rec.title}</span>
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  rec.status === 'ENABLED' ? 'bg-[#45D39A]/10 text-[#45D39A] border border-[#45D39A]/20' : 'bg-white/5 text-[#A2A8B3]'
                }`}>
                  {rec.status}
                </span>
              </div>
              <h3 className="font-bold text-[#F5F7FA] text-base">{rec.item}</h3>
              <p className="text-xs text-[#A2A8B3] leading-relaxed">{rec.desc}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-white/5 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-sans">Potential Revenue:</span>
                <span className="font-bold text-[#45D39A]">₹{rec.potentialRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-sans">Confidence:</span>
                <span className="text-[#F5F7FA]">{rec.confidence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6B7280] font-sans">Safety Check:</span>
                <span className="text-[#45D39A]">{rec.policyResult} ✓</span>
              </div>

              <button
                onClick={() => toggleEnable(rec.id)}
                className={`w-full py-2 rounded-lg text-xs font-bold transition font-sans ${
                  rec.status === 'ENABLED'
                    ? 'bg-[#111419] text-[#A2A8B3] border border-white/10 hover:text-white'
                    : 'bg-[#7C8FFF] text-[#08090B] hover:bg-[#7C8FFF]/90'
                }`}
              >
                {rec.status === 'ENABLED' ? 'Review & Pause' : 'Enable Recommendation'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
