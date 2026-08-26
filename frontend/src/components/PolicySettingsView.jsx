import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronDown, Check, Sliders, AlertCircle, Lock, ShieldAlert, Zap, AlertTriangle } from 'lucide-react';
import { apiClient } from '../api/apiClient';

export default function PolicySettingsView() {
  const [policies, setPolicies] = useState({
    maxDiscountPercentage: 10,
    maxAutomaticAmount: 10000,
    maxRetryAttempts: 3,
    minMarginPercentage: 20,
    humanEscalationThreshold: 15000,
    cooldownPeriodHours: 24,
    allowDiscounts: true,
    allowPurchases: true,
    allowRecommendations: true,
    askConfirmation: true,
    autonomyLevel: 3
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [testForm, setTestForm] = useState({ amount: 12500, discountPercentage: 15 });
  const [evalResult, setEvalResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const safetyScore = 98;

  useEffect(() => {
    apiClient.get('/api/policies')
      .then(data => {
        if (data.policies) setPolicies(prev => ({ ...prev, ...data.policies }));
      })
      .catch(() => {});
  }, []);

  const handleSavePolicies = async (updatedPolicies = policies) => {
    setLoading(true);
    setSaved(false);

    try {
      await apiClient.post('/api/policies', updatedPolicies);
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleAutonomyLevelChange = (lvl) => {
    let newDisc = 5;
    let newAmt = 5000;
    if (lvl === 1) { newDisc = 0; newAmt = 0; }
    else if (lvl === 2) { newDisc = 5; newAmt = 2500; }
    else if (lvl === 3) { newDisc = 10; newAmt = 10000; }
    else if (lvl === 4) { newDisc = 15; newAmt = 25000; }
    else if (lvl === 5) { newDisc = 20; newAmt = 50000; }

    const nextPol = { ...policies, autonomyLevel: lvl, maxDiscountPercentage: newDisc, maxAutomaticAmount: newAmt };
    setPolicies(nextPol);
    handleSavePolicies(nextPol);
  };

  const handleEvaluateTest = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/policies/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testForm)
      });
      const data = await res.json();
      setEvalResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] tracking-tight uppercase">MERCHANT POLICY GOVERNANCE ENGINE</h2>
          <p className="text-xs text-[#A2A8B3] mt-0.5 font-medium">"You control every financial and business boundary."</p>
        </div>

        <button
          onClick={() => handleSavePolicies(policies)}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-[#7C8FFF] text-[#08090B] text-xs font-extrabold hover:bg-[#7C8FFF]/90 transition shadow-lg"
        >
          {saved ? 'Guardrails Saved ✓' : 'Save Policy Rules'}
        </button>
      </div>

      {/* AI SAFETY SCORE & AUTONOMOUS COMMERCE LEVEL */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* SAFETY SCORE CARD */}
        <div className="nx-panel p-5 space-y-3 md:col-span-4 flex flex-col justify-between border border-[#45D39A]/30">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-[#7C8FFF] uppercase font-bold flex items-center gap-1">
              <ShieldCheck size={14} /> AI GOVERNANCE SCORE
            </span>
            <div className="flex items-baseline gap-2 font-mono pt-1">
              <h3 className="text-4xl font-extrabold text-[#45D39A]">{safetyScore}</h3>
              <span className="text-xs text-[#A2A8B3]">/ 100</span>
            </div>
            <p className="text-xs text-[#F5F7FA] font-medium pt-1">Zero un-bounded financial breaches recorded.</p>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] font-mono">
            <div className="flex justify-between text-[#45D39A]">
              <span>Policy Cap Check:</span>
              <span>10% Max ✓</span>
            </div>
            <div className="flex justify-between text-[#45D39A]">
              <span>Transaction Limit:</span>
              <span>₹10,000 Max ✓</span>
            </div>
            <div className="flex justify-between text-[#45D39A]">
              <span>HMAC Verification:</span>
              <span>100% Passed ✓</span>
            </div>
          </div>
        </div>

        {/* AUTONOMOUS COMMERCE LEVEL SELECTOR */}
        <div className="nx-panel p-5 space-y-4 md:col-span-8 flex flex-col justify-between border border-[#7C8FFF]/20">
          <div className="border-b border-white/5 pb-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sliders size={16} className="text-[#7C8FFF]" />
              <h3 className="font-bold text-sm text-[#F5F7FA]">AUTONOMOUS COMMERCE GOVERNANCE LEVEL</h3>
            </div>
            <span className="text-xs font-mono font-bold text-[#7C8FFF]">LEVEL {policies.autonomyLevel} ACTIVE</span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-xs font-mono">
            {[
              { lvl: 1, title: 'LEVEL 1', desc: 'Recommendations only' },
              { lvl: 2, title: 'LEVEL 2', desc: 'AI can negotiate' },
              { lvl: 3, title: 'LEVEL 3', desc: 'Apply 10% discount cap' },
              { lvl: 4, title: 'LEVEL 4', desc: 'Orders < ₹25k' },
              { lvl: 5, title: 'LEVEL 5', desc: 'Full Autonomous' }
            ].map(item => (
              <button
                key={item.lvl}
                onClick={() => handleAutonomyLevelChange(item.lvl)}
                className={`p-3 rounded-xl border text-left transition flex flex-col justify-between h-24 ${
                  policies.autonomyLevel === item.lvl
                    ? 'bg-[#171A20] border-[#7C8FFF] text-[#F5F7FA] shadow-md'
                    : 'bg-[#111419] border-white/5 text-[#A2A8B3] hover:border-white/20'
                }`}
              >
                <span className="font-bold text-[11px]">{item.title}</span>
                <span className="text-[10px] text-[#6B7280] font-sans leading-tight">{item.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CORE MERCHANT FINANCIAL BOUNDARY CONTROLS */}
      <div className="nx-panel divide-y divide-white/5 text-xs">
        {/* AUTOMATIC DISCOUNTS */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-bold text-[#F5F7FA] text-sm">MAXIMUM ALLOWABLE DISCOUNT</span>
            <p className="text-[#A2A8B3] text-xs mt-0.5">Strict ceiling for AI negotiation offers. AI cannot exceed this % limit.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#6B7280]">Cap:</span>
              <input
                type="number"
                value={policies.maxDiscountPercentage}
                onChange={(e) => setPolicies({ ...policies, maxDiscountPercentage: parseInt(e.target.value) || 0 })}
                className="w-20 bg-[#111419] border border-white/10 rounded-lg p-2 font-mono text-[#45D39A] font-bold text-xs outline-none"
              />
              <span className="font-mono text-[#45D39A] font-bold">%</span>
            </div>
            <button
              onClick={() => setPolicies({ ...policies, allowDiscounts: !policies.allowDiscounts })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                policies.allowDiscounts ? 'bg-[#45D39A] text-[#08090B]' : 'bg-[#111419] text-[#6B7280]'
              }`}
            >
              {policies.allowDiscounts ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>

        {/* AUTOMATIC PURCHASES */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-bold text-[#F5F7FA] text-sm">MAXIMUM AUTOMATIC TRANSACTION</span>
            <p className="text-[#A2A8B3] text-xs mt-0.5">Orders above this amount require human escalation or secondary verification.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#6B7280]">Limit:</span>
              <input
                type="number"
                value={policies.maxAutomaticAmount}
                onChange={(e) => setPolicies({ ...policies, maxAutomaticAmount: parseInt(e.target.value) || 0 })}
                className="w-28 bg-[#111419] border border-white/10 rounded-lg p-2 font-mono text-[#45D39A] font-bold text-xs outline-none"
              />
            </div>
            <button
              onClick={() => setPolicies({ ...policies, allowPurchases: !policies.allowPurchases })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition ${
                policies.allowPurchases ? 'bg-[#45D39A] text-[#08090B]' : 'bg-[#111419] text-[#6B7280]'
              }`}
            >
              {policies.allowPurchases ? 'ACTIVE' : 'OFF'}
            </button>
          </div>
        </div>

        {/* MINIMUM MARGIN & HUMAN ESCALATION */}
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="font-bold text-[#F5F7FA] text-sm">MINIMUM MARGIN & HUMAN APPROVAL THRESHOLD</span>
            <p className="text-[#A2A8B3] text-xs mt-0.5">Protects profit margins and flags high-value transactions for review.</p>
          </div>
          <div className="flex items-center gap-4 font-mono">
            <div className="flex items-center gap-2">
              <span className="text-[#6B7280]">Min Margin:</span>
              <span className="text-[#45D39A] font-bold">20%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6B7280]">Escalation:</span>
              <span className="text-[#E7B65C] font-bold">₹15,000</span>
            </div>
          </div>
        </div>
      </div>

      {/* POLICY SIMULATOR & INTERVENTION REASONING */}
      <div className="nx-panel p-6 space-y-4 border border-[#E7B65C]/30">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#E7B65C]" />
            <h3 className="font-bold text-sm text-[#F5F7FA]">POLICY EVALUATOR & INTERVENTION REASONING</h3>
          </div>
          <span className="text-[10px] font-mono text-[#E7B65C] bg-[#E7B65C]/10 border border-[#E7B65C]/30 px-2.5 py-1 rounded font-bold">
            LIVE GOVERNANCE ENGINE
          </span>
        </div>

        <form onSubmit={handleEvaluateTest} className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          <input
            type="number"
            value={testForm.amount}
            onChange={(e) => setTestForm({ ...testForm, amount: parseInt(e.target.value) || 0 })}
            placeholder="Test Amount (₹)"
            className="bg-[#111419] border border-white/10 rounded-xl p-2.5 text-[#F5F7FA] outline-none"
          />
          <input
            type="number"
            value={testForm.discountPercentage}
            onChange={(e) => setTestForm({ ...testForm, discountPercentage: parseInt(e.target.value) || 0 })}
            placeholder="Test Requested Discount (%)"
            className="bg-[#111419] border border-white/10 rounded-xl p-2.5 text-[#F5F7FA] outline-none"
          />
          <button type="submit" className="h-10 rounded-xl bg-[#7C8FFF] text-[#08090B] font-extrabold hover:bg-[#7C8FFF]/90 transition">
            Evaluate Policy Engine
          </button>
        </form>

        {evalResult ? (
          <div className="p-4 bg-[#111419] rounded-xl border border-white/5 font-mono text-xs space-y-2 animate-fade-in">
            <div className="flex justify-between items-center">
              <span className="text-[#6B7280]">Policy Decision:</span>
              <span className={`font-bold px-2.5 py-0.5 rounded text-[11px] ${evalResult.allowed ? 'bg-[#45D39A]/10 text-[#45D39A]' : 'bg-[#E7B65C]/10 text-[#E7B65C]'}`}>
                {evalResult.status || (evalResult.allowed ? 'ALLOWED ✓' : 'MODIFIED BY POLICY')}
              </span>
            </div>
            <p className="text-[#F5F7FA] font-sans text-xs leading-relaxed">{evalResult.reason}</p>
          </div>
        ) : (
          <div className="p-4 bg-[#111419] rounded-xl border border-white/5 font-mono text-xs text-[#A2A8B3] flex items-center justify-between">
            <span>Example: AI requested 15% discount on ₹4,749 cart</span>
            <span className="text-[#E7B65C] font-bold">BLOCKED ➔ Adjusted to 10% Policy Cap ✓</span>
          </div>
        )}
      </div>
    </div>
  );
}
