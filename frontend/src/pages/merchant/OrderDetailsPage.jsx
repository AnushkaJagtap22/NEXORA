import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    setOrder({
      id: orderId,
      customer: 'Rahul Sharma (AI Buyer)',
      product: 'Wireless Earbuds × 2',
      amount: 4749,
      status: 'Paid',
      agentSession: 'AB-291',
      created: new Date().toISOString()
    });
  }, [orderId]);

  if (!order) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Link to="/merchant/orders" className="p-2 rounded-lg bg-[#111419] text-[#A2A8B3] hover:text-white transition">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-[10px] font-mono text-[#7C8FFF] uppercase font-bold">ORDER DETAILS</span>
          <h2 className="text-2xl font-bold text-[#F5F7FA]">{order.id}</h2>
        </div>
      </div>

      <div className="nx-panel p-6 space-y-4 font-mono text-xs max-w-xl">
        <div className="flex justify-between border-b border-white/5 pb-2">
          <span className="text-[#6B7280]">Customer / AI Shopper:</span>
          <span className="text-[#F5F7FA] font-bold">{order.customer}</span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-2">
          <span className="text-[#6B7280]">Items:</span>
          <span className="text-[#F5F7FA]">{order.product}</span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-2">
          <span className="text-[#6B7280]">Total Amount:</span>
          <span className="text-[#45D39A] font-bold text-sm">₹{order.amount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between border-b border-white/5 pb-2">
          <span className="text-[#6B7280]">Payment Status:</span>
          <span className="text-[#45D39A] font-bold px-2 py-0.5 rounded bg-[#45D39A]/10 border border-[#45D39A]/20">
            {order.status} ✓
          </span>
        </div>
      </div>
    </div>
  );
}
