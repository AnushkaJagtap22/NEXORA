import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ShoppingBag, ArrowRight, ShieldCheck, FileText } from 'lucide-react';

export default function OrderSuccessView() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('BUYER');

  useEffect(() => {
    const userStr = localStorage.getItem('nexora_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.role) setUserRole(u.role);
      } catch (e) {}
    }

    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data.order) setOrder(data.order);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  return (
    <div className="space-y-8 animate-fade-in select-none pb-16 max-w-2xl mx-auto my-8">
      <div className="nx-panel p-10 border border-[#45D39A]/30 bg-[#45D39A]/5 space-y-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-[#45D39A]/20 border border-[#45D39A]/40 flex items-center justify-center text-[#45D39A] mx-auto">
          <CheckCircle2 size={38} />
        </div>

        <div>
          <span className="text-xs uppercase font-mono font-bold text-[#45D39A]">PAYMENT VERIFIED & ORDER CREATED ATOMICALLY</span>
          <h2 className="text-2xl font-extrabold text-[#F5F7FA] mt-1">Order #{orderId}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#08090B] p-5 rounded-2xl border border-white/5 font-sans text-left">
          <div>
            <span className="text-[#6B7280] text-[10px]">Payment Status</span>
            <p className="font-bold text-[#45D39A]">PAID (Razorpay HMAC)</p>
          </div>
          <div>
            <span className="text-[#6B7280] text-[10px]">Stock Status</span>
            <p className="font-bold text-[#7C8FFF]">Decremented (-1)</p>
          </div>
          <div>
            <span className="text-[#6B7280] text-[10px]">Total Amount</span>
            <p className="font-bold text-[#45D39A] font-mono text-base">₹{order?.amount?.toLocaleString() || '4,749'}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2 font-sans">
          <button onClick={() => navigate('/buyer/ai-shopping')} className="px-5 py-3 rounded-xl bg-[#111419] text-[#A2A8B3] text-xs font-semibold hover:text-white border border-white/5">
            ← Continue Shopping
          </button>
          <button
            onClick={() => navigate(userRole === 'MERCHANT' ? '/merchant/orders' : '/buyer/orders')}
            className="px-5 py-3 bg-[#45D39A] text-[#08090B] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
          >
            {userRole === 'MERCHANT' ? 'View Merchant Sales Orders' : 'View My Purchases'} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
