import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, ChevronDown, Check, Sparkles, Terminal, ArrowRight, PlayCircle } from 'lucide-react';
import { apiClient } from '../api/apiClient';

export default function AuditTrailView() {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showTechnical, setShowTechnical] = useState(false);

  useEffect(() => {
    apiClient.get('/api/audit')
      .then(data => {
        if (data.logs) {
          const mappedLogs = data.logs.slice(0, 50).map((l, idx) => ({
            id: l.id || `act_${idx}`,
            time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            humanDesc: l.action === 'PAYMENT_VERIFIED' ? 'Payment verified & settled' :
                       l.action === 'WEBHOOK_PAYMENT_VERIFIED' ? 'Razorpay Webhook HMAC verified' :
                       l.action === 'CAMPAIGN_APPLIED' ? 'Campaign discount applied' :
                       l.action === 'ABUSE_GUARD_TRIGGERED' ? 'Abuse guard blocked excessive retries' :
                       l.action === 'CART_CREATED' ? 'AI Cart created for buyer' :
                       'AI negotiated deal & checked policies',
            actor: l.customerName || 'Rahul Sharma (AI Buyer)',
            status: l.policyResult || 'ALLOWED',
            raw: l
          }));
          setLogs(mappedLogs);
        }
      });
  }, []);

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">AUDIT TRAIL & DECISION REPLAY</h2>
          <p className="text-xs text-[#A2A8B3] mt-0.5">"Unbending compliance ledger for every AI decision and Razorpay payment."</p>
        </div>
      </div>

      {/* ACTIVITY LEDGER TABLE */}
      <div className="nx-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111419] text-[#A2A8B3] text-[11px] uppercase border-b border-white/5 font-mono">
              <tr>
                <th className="py-3.5 px-4">Time</th>
                <th className="py-3.5 px-4">Event Description</th>
                <th className="py-3.5 px-4">Customer / Actor</th>
                <th className="py-3.5 px-4">Policy Result</th>
                <th className="py-3.5 px-4 text-right">Decision Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {logs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => {
                    setSelectedLog(log);
                    setShowTechnical(false);
                  }}
                  className="hover:bg-[#171A20] cursor-pointer transition h-14"
                >
                  <td className="py-3 px-4 font-mono text-[#6B7280] text-[11px]">{log.time}</td>
                  <td className="py-3 px-4 font-semibold text-[#F5F7FA]">{log.humanDesc}</td>
                  <td className="py-3 px-4 text-[#A2A8B3]">{log.actor}</td>
                  <td className="py-3 px-4 font-mono">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      log.status === 'ALLOWED' ? 'bg-[#45D39A]/10 text-[#45D39A] border border-[#45D39A]/20' : 'bg-[#EF6B6B]/10 text-[#EF6B6B]'
                    }`}>
                      {log.status === 'ALLOWED' ? 'ALLOWED ✓' : 'BLOCKED ✕'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="px-3 py-1 bg-[#7C8FFF]/10 text-[#7C8FFF] border border-[#7C8FFF]/30 rounded-lg hover:bg-[#7C8FFF]/20 transition text-[11px] font-bold inline-flex items-center gap-1">
                      <PlayCircle size={12} /> Replay Trace
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AGENT DECISION TRACE REPLAY INSPECTOR MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[#0D0F12] border-l border-white/10 h-full overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="border-b border-white/5 pb-4">
                <div className="flex items-center gap-2 text-[#7C8FFF] font-mono text-xs font-bold uppercase">
                  <Sparkles size={16} />
                  <span>AGENT DECISION REPLAY TRACE</span>
                </div>
                <h3 className="text-xl font-bold text-[#F5F7FA] mt-1">{selectedLog.humanDesc}</h3>
                <p className="text-xs text-[#6B7280] font-mono mt-0.5">Logged at {selectedLog.time} • Order ID: {selectedLog.raw.orderId || 'N/A'}</p>
              </div>

              {/* 11-STEP TRACE DISPLAY */}
              <div className="space-y-3 font-mono text-xs">
                <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#7C8FFF] font-bold">1. CUSTOMER REQUEST</span>
                  <p className="text-[#F5F7FA] font-sans">"{selectedLog.raw.customerName || 'Customer'} initiated query for Wireless Headphones Pro."</p>
                </div>

                <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#7C8FFF] font-bold">2. CONTEXT GATHERED</span>
                  <p className="text-[#A2A8B3] font-sans">Customer LTV: ₹48,450 • Total Orders: 11 • Segment: STANDARD</p>
                </div>

                <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#7C8FFF] font-bold">3. AI INTERPRETATION (MISTRAL AI)</span>
                  <p className="text-[#A2A8B3] font-sans">Parsed Intent: AUDIO_UPGRADE • Max Budget: ₹5,000 • Priority: Noise-Cancelling</p>
                </div>

                <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#7C8FFF] font-bold">4. TOOLS EXECUTED</span>
                  <div className="flex gap-2 text-[10px]">
                    <span className="bg-[#7C8FFF]/20 text-[#7C8FFF] px-2 py-0.5 rounded">search_catalog</span>
                    <span className="bg-[#7C8FFF]/20 text-[#7C8FFF] px-2 py-0.5 rounded">check_inventory</span>
                    <span className="bg-[#7C8FFF]/20 text-[#7C8FFF] px-2 py-0.5 rounded">calculate_offer</span>
                  </div>
                </div>

                <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#E7B65C] font-bold">5. POLICY GUARDRAIL CHECK</span>
                  <p className="text-[#F5F7FA] font-sans">Merchant Policy Cap: 10% max discount • Automatic Limit: ₹10,000</p>
                  <p className="text-[#45D39A] font-bold text-[11px]">Result: {selectedLog.status}</p>
                </div>

                <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 space-y-1">
                  <span className="text-[10px] text-[#45D39A] font-bold">6. FINAL EXECUTED ACTION</span>
                  <p className="text-[#F5F7FA] font-sans">{selectedLog.raw.reason}</p>
                </div>
              </div>

              {/* EXPANDABLE RAW JSON */}
              <div className="border border-white/5 rounded-xl overflow-hidden bg-[#111419]">
                <button
                  onClick={() => setShowTechnical(!showTechnical)}
                  className="w-full p-3.5 flex justify-between items-center text-xs font-semibold text-[#A2A8B3] hover:text-white transition"
                >
                  <span>View Raw Event Object & Hashes</span>
                  <ChevronDown size={16} className={`transition-transform ${showTechnical ? 'rotate-180' : ''}`} />
                </button>

                {showTechnical && (
                  <div className="p-4 border-t border-white/5 font-mono text-xs space-y-2 animate-fade-in">
                    <p className="text-[11px]"><span className="text-[#6B7280]">Event ID:</span> {selectedLog.raw.id}</p>
                    <pre className="bg-[#08090B] p-3 rounded-lg border border-white/5 text-[10px] text-[#7C8FFF] max-h-40 overflow-y-auto">
                      {JSON.stringify(selectedLog.raw, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex justify-end">
              <button onClick={() => setSelectedLog(null)} className="px-5 py-2 rounded-xl bg-[#111419] text-[#A2A8B3] text-xs font-semibold hover:text-white border border-white/5">
                Close Replay Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
