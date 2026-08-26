import React, { useState, useEffect } from 'react';
import { Target, Plus, Play, Pause, AlertCircle, CheckCircle2, TrendingUp, Users, DollarSign, Calendar, Tag, ShieldAlert } from 'lucide-react';

export default function CampaignOrchestratorView() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Weekend Audio Boost',
    description: 'Get 10% off selected noise-cancelling audio gear.',
    type: 'CART_THRESHOLD',
    discountType: 'FIXED',
    discountValue: 500,
    minimumCartValue: 5000,
    customerSegment: 'ALL',
    budgetLimit: 50000
  });

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/campaigns');
      const data = await res.json();
      if (data.campaigns) setCampaigns(data.campaigns);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setShowCreateModal(false);
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    try {
      await fetch(`/api/campaigns/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in select-none">
      {/* HEADER */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">CAMPAIGN ORCHESTRATOR</h2>
          <p className="text-xs text-[#A2A8B3] mt-0.5">Real-time backend campaign rules, threshold nudges, and customer segment eligibility.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[#7C8FFF] text-[#08090B] font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-[#7C8FFF]/90 transition"
        >
          <Plus size={15} /> Create Campaign
        </button>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono text-xs">
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-sans">Active Campaigns</span>
          <p className="text-2xl font-bold text-[#45D39A]">{campaigns.filter(c => c.status === 'ACTIVE').length}</p>
        </div>
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-sans">Total Redemptions</span>
          <p className="text-2xl font-bold text-[#7C8FFF]">{campaigns.reduce((sum, c) => sum + (c.usedCount || 0), 0)}</p>
        </div>
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-sans">Spent Budget</span>
          <p className="text-2xl font-bold text-[#E7B65C]">₹{campaigns.reduce((sum, c) => sum + (c.spentBudget || 0), 0).toLocaleString()}</p>
        </div>
        <div className="nx-panel p-4 space-y-1">
          <span className="text-[#6B7280] text-[10px] uppercase font-sans">Revenue Influenced</span>
          <p className="text-2xl font-bold text-[#F5F7FA]">₹1,84,000</p>
        </div>
      </div>

      {/* CAMPAIGN CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {campaigns.map(camp => (
          <div key={camp.id} className="nx-panel p-5 space-y-4 border border-white/5 hover:border-[#7C8FFF]/40 transition">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-[#F5F7FA]">{camp.name}</span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${camp.status === 'ACTIVE' ? 'bg-[#45D39A]/10 text-[#45D39A] border border-[#45D39A]/30' : 'bg-[#EF6B6B]/10 text-[#EF6B6B] border border-[#EF6B6B]/30'}`}>
                    {camp.status}
                  </span>
                </div>
                <p className="text-xs text-[#A2A8B3]">{camp.description}</p>
              </div>

              <button
                onClick={() => handleToggleStatus(camp.id, camp.status)}
                className={`p-2 rounded-lg text-xs font-bold font-mono transition ${camp.status === 'ACTIVE' ? 'bg-[#EF6B6B]/10 text-[#EF6B6B] hover:bg-[#EF6B6B]/20' : 'bg-[#45D39A]/10 text-[#45D39A] hover:bg-[#45D39A]/20'}`}
              >
                {camp.status === 'ACTIVE' ? <Pause size={15} /> : <Play size={15} />}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-[#0D0F12] p-3 rounded-xl border border-white/5 font-mono text-[11px]">
              <div>
                <span className="text-[#6B7280] text-[9px] block">Discount</span>
                <span className="font-bold text-[#45D39A]">
                  {camp.discountType === 'FIXED' ? `₹${camp.discountValue}` : `${camp.discountValue}%`}
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] text-[9px] block">Min Cart</span>
                <span className="font-bold text-[#F5F7FA]">
                  {camp.minimumCartValue > 0 ? `₹${camp.minimumCartValue.toLocaleString()}` : 'None'}
                </span>
              </div>
              <div>
                <span className="text-[#6B7280] text-[9px] block">Redemptions</span>
                <span className="font-bold text-[#7C8FFF]">{camp.usedCount || 0} / {camp.usageLimit || 500}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE CAMPAIGN MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111419] border border-white/10 p-6 rounded-2xl max-w-lg w-full space-y-5">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-sm text-[#F5F7FA]">Create New Merchant Campaign</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-[#6B7280] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[#A2A8B3] mb-1 font-semibold">Campaign Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#0D0F12] border border-white/10 p-2.5 rounded-lg text-[#F5F7FA] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#A2A8B3] mb-1 font-semibold">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#0D0F12] border border-white/10 p-2.5 rounded-lg text-[#F5F7FA] outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A2A8B3] mb-1 font-semibold">Discount Value (₹ or %)</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={e => setFormData({ ...formData, discountValue: parseInt(e.target.value) })}
                    className="w-full bg-[#0D0F12] border border-white/10 p-2.5 rounded-lg text-[#F5F7FA] outline-none font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#A2A8B3] mb-1 font-semibold">Minimum Cart Threshold (₹)</label>
                  <input
                    type="number"
                    value={formData.minimumCartValue}
                    onChange={e => setFormData({ ...formData, minimumCartValue: parseInt(e.target.value) })}
                    className="w-full bg-[#0D0F12] border border-white/10 p-2.5 rounded-lg text-[#F5F7FA] outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 font-mono">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-[#0D0F12] text-[#A2A8B3] rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#7C8FFF] text-[#08090B] font-bold rounded-lg">Create & Persist</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
