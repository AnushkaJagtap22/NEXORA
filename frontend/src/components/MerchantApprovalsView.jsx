import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle, Eye, ShieldAlert, Clock, UserCheck } from 'lucide-react';

export default function MerchantApprovalsView() {
  const [approvals, setApprovals] = useState([
    {
      id: 'app_1001',
      orderId: 'NX-1049',
      customer: 'Siddharth V. (VIP Buyer)',
      type: 'TRANSACTION_LIMIT_EXCEEDED',
      requestedAmount: 14999,
      policyLimit: 10000,
      reason: 'Order amount ₹14,999 exceeds automatic transaction limit (₹10,000). Requires merchant sign-off.',
      time: '10 min ago',
      status: 'PENDING'
    },
    {
      id: 'app_1002',
      orderId: 'NX-1052',
      customer: 'Priya Mehta',
      type: 'EXCESSIVE_DISCOUNT_REQUEST',
      requestedAmount: 8500,
      policyLimit: 10,
      reason: 'AI requested 15% discount exception for custom corporate desk bundle.',
      time: '25 min ago',
      status: 'PENDING'
    }
  ]);

  const handleAction = (id, newStatus) => {
    setApprovals(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] tracking-tight uppercase">MERCHANT APPROVALS & ESCALATIONS</h2>
          <p className="text-xs text-[#A2A8B3] mt-0.5 font-medium">"Human sign-off for transactions exceeding automated policy boundaries."</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-[#E7B65C] bg-[#E7B65C]/10 border border-[#E7B65C]/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <AlertCircle size={14} /> {approvals.filter(a => a.status === 'PENDING').length} PENDING APPROVALS
          </span>
        </div>
      </div>

      {/* APPROVAL CARDS */}
      <div className="space-y-4">
        {approvals.length === 0 ? (
          <div className="nx-panel p-12 text-center text-xs text-[#A2A8B3]">No pending approvals requiring merchant review.</div>
        ) : (
          approvals.map(app => (
            <div key={app.id} className="nx-panel p-6 border border-white/10 space-y-4 flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="font-bold text-[#7C8FFF]">{app.orderId}</span>
                  <span>•</span>
                  <span className="text-[#F5F7FA] font-bold">{app.customer}</span>
                  <span>•</span>
                  <span className="text-[#6B7280]">{app.time}</span>
                </div>
                <h3 className="font-bold text-sm text-[#F5F7FA]">{app.reason}</h3>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-[#6B7280]">Requested Amount: <strong className="text-[#45D39A]">₹{app.requestedAmount.toLocaleString()}</strong></span>
                  <span className="text-[#6B7280]">Policy Cap: <strong className="text-[#E7B65C]">₹{app.policyLimit.toLocaleString()}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 sm:pt-0">
                {app.status === 'PENDING' ? (
                  <>
                    <button
                      onClick={() => handleAction(app.id, 'REJECTED')}
                      className="px-4 py-2 rounded-xl bg-[#EF6B6B]/10 border border-[#EF6B6B]/30 text-[#EF6B6B] hover:bg-[#EF6B6B]/20 text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <XCircle size={14} /> Reject
                    </button>
                    <button
                      onClick={() => handleAction(app.id, 'APPROVED')}
                      className="px-5 py-2.5 rounded-xl bg-[#45D39A] text-[#08090B] font-extrabold text-xs hover:bg-[#45D39A]/90 transition shadow-lg flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={14} /> Approve Order
                    </button>
                  </>
                ) : (
                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-xl ${
                    app.status === 'APPROVED' ? 'bg-[#45D39A]/10 text-[#45D39A] border border-[#45D39A]/20' : 'bg-[#EF6B6B]/10 text-[#EF6B6B]'
                  }`}>
                    {app.status} ✓
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
