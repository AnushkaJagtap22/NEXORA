import React, { useState } from 'react';
import { Play, RotateCcw, ShieldCheck, Zap, AlertTriangle, CheckCircle2, TrendingUp, Cpu } from 'lucide-react';

export default function SimulationSuite() {
  const [running, setRunning] = useState(false);
  const [simResult, setSimResult] = useState({
    totalSimulated: 1000,
    interventions: 52,
    blocked: 13,
    escalations: 7,
    incrementalRevenue: 182400,
    failedSafely: 3
  });

  const [proposedDiscount, setProposedDiscount] = useState(10);
  const [policyApplied, setPolicyApplied] = useState(false);

  const handleRunSimulation = async () => {
    setRunning(true);
    try {
      const res = await fetch('/api/simulation/run', { method: 'POST' });
      const data = await res.json();
      setRunning(false);
      if (data.success && data.simulation) {
        setSimResult(data.simulation);
      }
    } catch (err) {
      console.error(err);
      setRunning(false);
    }
  };

  const handleApplyPolicy = async () => {
    try {
      const res = await fetch('/api/policies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxDiscountPercentage: proposedDiscount })
      });
      const data = await res.json();
      if (data.success) {
        setPolicyApplied(true);
        setTimeout(() => setPolicyApplied(false), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">COMMERCE SIMULATION SUITE</h2>
          <p className="text-xs text-[#A2A8B3] mt-0.5">Test strategy changes against 1,000 synthetic buyer sessions before deploying live.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRunSimulation}
            disabled={running}
            className="px-4 py-2 rounded-lg bg-[#7C8FFF] text-[#08090B] text-xs font-bold flex items-center gap-1.5 hover:bg-[#7C8FFF]/90 transition"
          >
            <Play size={14} />
            <span>{running ? 'Simulating 1,000 Sessions...' : 'Run 1,000 Session Simulation'}</span>
          </button>
        </div>
      </div>

      {/* WHAT-IF SIMULATOR CARD */}
      <div className="nx-panel p-6 space-y-5 border border-white/10">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-[#7C8FFF]" />
            <h3 className="font-bold text-sm text-[#F5F7FA]">WHAT-IF POLICY SIMULATOR</h3>
          </div>
          <span className="text-[10px] font-mono text-[#7C8FFF]">PREDICTIVE POLICY ENGINE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          <div className="space-y-3">
            <label className="text-[#A2A8B3] block">Test Max Discount Cap Policy</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="25"
                value={proposedDiscount}
                onChange={(e) => setProposedDiscount(parseInt(e.target.value))}
                className="flex-1 accent-[#7C8FFF]"
              />
              <span className="text-sm font-bold text-[#45D39A] w-12">{proposedDiscount}%</span>
            </div>
            <p className="text-[11px] text-[#6B7280] font-sans">
              Simulating impact of setting merchant discount cap to {proposedDiscount}%.
            </p>
            <button
              onClick={handleApplyPolicy}
              className="px-4 py-2 rounded-lg bg-[#45D39A] text-[#08090B] font-bold text-xs font-sans transition hover:bg-[#45D39A]/90"
            >
              {policyApplied ? 'Policy Applied to DB ✓' : `Apply Proposed ${proposedDiscount}% Policy`}
            </button>
          </div>

          <div className="bg-[#111419] p-4 rounded-xl border border-white/5 space-y-2 font-sans">
            <span className="text-[#6B7280] text-[10px] uppercase font-mono">PREDICTED 30-DAY OUTCOME</span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-[#A2A8B3]">Conversion Rate:</span>
                <span className="font-bold text-[#45D39A]">10.1% (+1.9%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A2A8B3]">Incremental Revenue:</span>
                <span className="font-bold text-[#45D39A]">+₹1,82,400</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A2A8B3]">Policy Blocked Violations:</span>
                <span className="font-bold text-[#E7B65C]">13 Attempted Overrides</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SIMULATION BATCH RESULTS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase">Synthetic Sessions</span>
          <p className="text-xl font-bold text-[#F5F7FA]">{simResult.totalSimulated.toLocaleString()}</p>
        </div>
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase">AI Interventions</span>
          <p className="text-xl font-bold text-[#7C8FFF]">{simResult.interventions}</p>
        </div>
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase">Policy Blocked</span>
          <p className="text-xl font-bold text-[#E7B65C]">{simResult.blocked}</p>
        </div>
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase">Recovered EV</span>
          <p className="text-xl font-bold text-[#45D39A]">₹{simResult.incrementalRevenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
