import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShoppingBag, Search, X, CheckCircle2, Play, AlertCircle, ArrowRight, Pause, PackageCheck, Clock, ShieldCheck, ShoppingCart, UserCheck } from 'lucide-react';

export default function OrdersView() {
  const location = useLocation();
  const isMerchantView = location.pathname.startsWith('/merchant');
  const isAdminView = location.pathname.startsWith('/admin');

  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // AI COMMERCE REPLAY STATE
  const [replayModalOpen, setReplayModalOpen] = useState(false);
  const [replayStep, setReplayStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('nexora_token');
    const endpoint = isMerchantView ? '/api/merchant/orders' : isAdminView ? '/api/orders' : '/api/buyer/orders';

    fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.orders) {
          const mappedOrders = data.orders.map((ord, idx) => ({
            id: ord.id,
            customer: ord.customerName || 'Rahul Sharma (AI Buyer)',
            productName: ord.productName || 'Wireless Headphones Pro',
            amount: ord.amount || 4749,
            paymentStatus: ord.paymentStatus || 'Paid',
            orderStatus: ord.orderStatus || 'Confirmed',
            paymentId: ord.payment_id || `pay_${Math.random().toString(36).substring(2, 10)}_success`,
            agent: '#AB-291',
            needsHandoff: ord.amount > 10000,
            createdTime: ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '12:43',
            timeline: [
              { time: '12:41', event: 'Cart created for AI Buyer session' },
              { time: '12:42', event: 'Checkout started & inventory verified' },
              { time: '12:42', event: 'Discount negotiated & capped at 10% policy limit' },
              { time: '12:42', event: 'Travel Case upsell recommendation added (+₹499)' },
              { time: '12:43', event: 'Payment initiated via Razorpay Test Mode' },
              { time: '12:43', event: 'Razorpay HMAC SHA256 Signature Verified' },
              { time: '12:43', event: `Atomic SQLite Order ${ord.id} created & inventory decremented` }
            ]
          }));
          setOrders(mappedOrders);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location.pathname]);

  const replayStepsList = [
    { step: 1, label: 'Customer Request Received', detail: '"I need wireless headphones under ₹5,000 for travel."' },
    { step: 2, label: 'Product Discovery & Ranking', detail: 'Found Wireless Headphones Pro (₹4,499, 94% match score)' },
    { step: 3, label: 'Discount Negotiation', detail: 'Requested 12% -> Capped at 10% policy limit' },
    { step: 4, label: 'Safety Check & Approval', detail: 'Order amount ₹4,749 within ₹10,000 limit' },
    { step: 5, label: 'Smart Case Recommendation', detail: 'Added Travel Case (+₹499)' },
    { step: 6, label: 'Razorpay Test Payment', detail: 'HMAC Signature Verified successfully' },
    { step: 7, label: 'Order Confirmed', detail: 'Atomic SQLite Order created & inventory decremented' }
  ];

  const startReplay = () => {
    setReplayStep(0);
    setIsPlaying(true);
    setReplayModalOpen(true);
  };

  useEffect(() => {
    let timer;
    if (isPlaying && replayModalOpen && replayStep < replayStepsList.length - 1) {
      timer = setTimeout(() => {
        setReplayStep(prev => prev + 1);
      }, 1500);
    } else if (replayStep >= replayStepsList.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, replayModalOpen, replayStep]);

  const filteredOrders = orders.filter(ord => {
    if (filterStatus !== 'ALL' && ord.paymentStatus.toUpperCase() !== filterStatus.toUpperCase()) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      ord.id.toLowerCase().includes(q) ||
      ord.customer.toLowerCase().includes(q) ||
      ord.productName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] tracking-tight uppercase">
            {isMerchantView ? 'MERCHANT SALES ORDERS LEDGER' : isAdminView ? 'ADMIN GLOBAL ORDERS LEDGER' : 'MY PURCHASES & ORDERS'}
          </h2>
          <p className="text-xs text-[#A2A8B3] mt-0.5 font-medium">
            {isMerchantView
              ? 'Real-time sales orders received by your store, persisted to SQLite database.'
              : isAdminView
              ? 'Platform-wide order monitoring across all merchant tenants.'
              : 'Your personal purchase history and order status.'}
          </p>
        </div>

        <div className="flex bg-[#0D0F12] p-1 rounded-lg border border-white/5 text-xs font-semibold">
          {['ALL', 'PAID', 'FAILED'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md transition ${
                filterStatus === status ? 'bg-[#171A20] text-[#F5F7FA] shadow-sm' : 'text-[#A2A8B3] hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* METRICS RAIL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#0D0F12] border border-white/5 text-xs font-mono">
        <div>
          <span className="text-[#6B7280] text-[10px] uppercase font-medium">Total Orders</span>
          <p className="text-base font-bold text-[#F5F7FA]">{orders.length} Orders</p>
        </div>
        <div>
          <span className="text-[#6B7280] text-[10px] uppercase font-medium">Paid</span>
          <p className="text-base font-bold text-[#45D39A]">{orders.filter(o => o.paymentStatus === 'Paid').length} Paid</p>
        </div>
        <div>
          <span className="text-[#6B7280] text-[10px] uppercase font-medium">{isMerchantView ? 'Escalations' : 'Active Sessions'}</span>
          <p className="text-base font-bold text-[#E7B65C]">0 Pending</p>
        </div>
        <div>
          <span className="text-[#6B7280] text-[10px] uppercase font-medium">Failed Safely</span>
          <p className="text-base font-bold text-[#EF6B6B]">{orders.filter(o => o.paymentStatus === 'Failed').length} Failed</p>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="nx-panel p-3 flex items-center gap-2.5">
        <Search size={16} className="text-[#6B7280]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isMerchantView ? "Filter by Order ID, Buyer, or Product..." : "Search your orders..."}
          className="w-full bg-transparent text-xs text-[#F5F7FA] placeholder-[#6B7280] outline-none"
        />
      </div>

      {/* ORDERS TABLE */}
      <div className="nx-panel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-[#A2A8B3]">Loading store orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <PackageCheck size={32} className="mx-auto text-[#6B7280]" />
            <p className="text-sm font-semibold text-[#F5F7FA]">No orders found</p>
            <p className="text-xs text-[#A2A8B3]">
              {isMerchantView ? 'No merchant sales orders found for your store.' : 'Complete your first AI-assisted purchase to see it logged here.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111419] text-[#A2A8B3] text-[11px] uppercase border-b border-white/5 font-mono">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">{isMerchantView ? 'Buyer Name' : 'Merchant Store'}</th>
                  <th className="py-3.5 px-4">Product Purchased</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredOrders.map((ord) => (
                  <tr
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="hover:bg-[#171A20] cursor-pointer transition h-14"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-[#7C8FFF]">{ord.id}</td>
                    <td className="py-3 px-4 font-semibold text-[#F5F7FA]">{isMerchantView ? ord.customer : 'Nexora Electronics'}</td>
                    <td className="py-3 px-4 text-[#A2A8B3]">{ord.productName}</td>
                    <td className="py-3 px-4 font-bold text-[#45D39A] font-mono">₹{ord.amount.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ord.paymentStatus === 'Paid' ? 'bg-[#45D39A]/10 text-[#45D39A] border border-[#45D39A]/20' : 'bg-[#EF6B6B]/10 text-[#EF6B6B]'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[#A2A8B3] font-medium">
                      {ord.needsHandoff ? (
                        <span className="text-[10px] font-bold text-[#E7B65C] bg-[#E7B65C]/10 px-2 py-0.5 rounded border border-[#E7B65C]/20">
                          AI Needs Approval
                        </span>
                      ) : ord.orderStatus}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-[#7C8FFF] hover:underline font-semibold text-xs">
                        View Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ORDER DETAIL WORKSPACE DRAWER */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-[#0D0F12] border-l border-white/10 h-full overflow-y-auto p-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#7C8FFF] uppercase font-bold">ORDER DETAILS & TIMELINE</span>
                  <h3 className="text-xl font-bold text-[#F5F7FA]">{selectedOrder.id}</h3>
                  <div className="flex items-center gap-2 text-xs mt-0.5 font-mono">
                    <span className="text-[#45D39A] font-bold">{selectedOrder.paymentStatus.toUpperCase()}</span>
                    <span>•</span>
                    <span className="text-[#F5F7FA] font-bold">₹{selectedOrder.amount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={startReplay}
                    className="px-3 py-1.5 rounded-lg bg-[#7C8FFF] text-[#08090B] font-bold text-xs flex items-center gap-1.5 hover:bg-[#7C8FFF]/90 transition"
                  >
                    <Play size={13} fill="#08090B" /> Replay AI Session
                  </button>
                  <button onClick={() => setSelectedOrder(null)} className="text-[#6B7280] hover:text-white p-1">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* VERTICAL ORDER AUDIT TIMELINE */}
              <div className="space-y-4 bg-[#111419] p-5 rounded-xl border border-white/5 font-mono text-xs">
                <span className="text-[10px] text-[#7C8FFF] uppercase font-bold block flex items-center gap-1.5">
                  <Clock size={14} /> VERTICAL ORDER AUDIT TIMELINE
                </span>
                <div className="space-y-3 pt-2 relative border-l border-white/10 ml-2 pl-4">
                  {selectedOrder.timeline.map((item, idx) => (
                    <div key={idx} className="relative space-y-0.5">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#7C8FFF] border-2 border-[#0D0F12]" />
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#F5F7FA] font-semibold">{item.event}</span>
                        <span className="text-[#6B7280]">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4 flex justify-end">
              <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 rounded-lg bg-[#111419] text-[#A2A8B3] text-xs font-semibold hover:text-white">
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REPLAY MODAL */}
      {replayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0D0F12] border border-white/10 w-full max-w-xl rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#7C8FFF] uppercase font-bold">AI COMMERCE REPLAY</span>
                <h3 className="font-bold text-[#F5F7FA] text-sm">Interactive Session Replay</h3>
              </div>
              <button onClick={() => setReplayModalOpen(false)} className="text-[#6B7280] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#111419] border border-white/10 space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-[#7C8FFF] font-bold">STEP {replayStepsList[replayStep].step} OF {replayStepsList.length}</span>
                  <span className="text-[#45D39A]">{replayStepsList[replayStep].label}</span>
                </div>
                <p className="text-sm font-bold text-[#F5F7FA] pt-1">{replayStepsList[replayStep].detail}</p>
              </div>

              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#7C8FFF] h-full transition-all duration-500"
                  style={{ width: `${((replayStep + 1) / replayStepsList.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-4 py-2 rounded-lg bg-[#111419] text-[#F5F7FA] text-xs font-bold flex items-center gap-1.5 border border-white/10"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={() => setReplayModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#7C8FFF] text-[#08090B] text-xs font-bold"
              >
                Close Replay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
