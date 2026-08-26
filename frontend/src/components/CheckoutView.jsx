import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Zap, Tag, CheckCircle2 } from 'lucide-react';
import RazorpayModal from './RazorpayModal';
import { getApiUrl } from '../config/apiConfig';

export default function CheckoutView() {
  const navigate = useNavigate();

  const [cartState, setCartState] = useState({
    items: [],
    subtotal: 0,
    discountPercent: 0,
    discountAmount: 0,
    warrantyAdded: false,
    warrantyAmount: 0,
    finalTotal: 0
  });

  const [loading, setLoading] = useState(true);
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount: 4749, orderId: 'NX-100295', productName: 'Wireless Headphones Pro' });

  const formatCurrency = (val) => (typeof val === 'number' && !isNaN(val) ? val : 0).toLocaleString();

  const fetchCart = async () => {
    try {
      const res = await fetch(getApiUrl('/api/cart'));
      const data = await res.json();
      if (data.cart) {
        setCartState(data.cart);
        const nextOrderId = `NX-100${295 + Math.floor(Math.random() * 500)}`;
        const totalAmt = data.cart.finalTotal || data.cart.subtotal || data.cart.total || 0;
        setPaymentData({
          amount: totalAmt,
          orderId: nextOrderId,
          productName: data.cart.items[0]?.name || 'Wireless Headphones Pro'
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handlePaymentSuccess = (createdOrder) => {
    setRazorpayOpen(false);
    navigate(`/buyer/payment/success/${createdOrder?.id || paymentData.orderId}`);
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-[#A2A8B3] font-mono animate-fade-in">
        Validating checkout prices with Policy Engine...
      </div>
    );
  }

  const grandTotal = cartState.finalTotal || cartState.subtotal || cartState.total || 0;

  return (
    <div className="space-y-8 animate-fade-in select-none pb-16 max-w-3xl mx-auto">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <span className="text-[10px] font-mono text-[#7C8FFF] uppercase font-bold">SERVER-SIDE VERIFIED CHECKOUT</span>
          <h2 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">ORDER SUMMARY & PAYMENT</h2>
        </div>
        <button onClick={() => navigate('/buyer/cart')} className="flex items-center gap-1.5 text-xs text-[#A2A8B3] hover:text-white font-semibold">
          <ArrowLeft size={14} /> Back to Cart
        </button>
      </div>

      <div className="bg-[#111419] p-8 rounded-2xl border border-white/5 space-y-6">
        <div className="space-y-3">
          <span className="text-[10px] font-mono text-[#6B7280] uppercase font-bold">PURCHASED PRODUCTS</span>
          <div className="space-y-2 font-mono text-xs">
            {cartState.items.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-[#0D0F12] p-3 rounded-xl border border-white/5">
                <span className="text-[#F5F7FA] font-sans font-semibold">{item.name} × {item.quantity}</span>
                <span className="text-[#45D39A] font-bold">₹{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0D0F12] p-5 rounded-xl border border-white/5 space-y-2 font-mono text-xs">
          <div className="flex justify-between text-[#A2A8B3]">
            <span>Subtotal</span>
            <span>₹{formatCurrency(cartState.subtotal)}</span>
          </div>
          {cartState.discountPercent > 0 && (
            <div className="flex justify-between text-[#45D39A]">
              <span>{cartState.discountPercent}% Policy-Approved Discount</span>
              <span>−₹{formatCurrency(cartState.discountAmount)}</span>
            </div>
          )}
          {cartState.warrantyAdded && (
            <div className="flex justify-between text-[#7C8FFF]">
              <span>Travel Case Warranty</span>
              <span>+₹{formatCurrency(cartState.warrantyPrice || cartState.warrantyAmount || 499)}</span>
            </div>
          )}
          <div className="pt-3 border-t border-white/5 flex justify-between font-extrabold text-[#F5F7FA] text-lg">
            <span>TOTAL DUE</span>
            <span className="text-[#45D39A]">₹{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#7C8FFF]/10 border border-[#7C8FFF]/20 flex items-center gap-3 text-xs text-[#7C8FFF]">
          <ShieldCheck size={20} className="shrink-0" />
          <p className="leading-relaxed">
            Razorpay Test Mode Active • Server-side HMAC SHA-256 Signature Verification • Atomic Stock Settlement
          </p>
        </div>

        <button
          onClick={() => setRazorpayOpen(true)}
          className="w-full h-14 rounded-xl bg-[#45D39A] hover:bg-[#45D39A]/90 text-[#08090B] font-extrabold text-sm flex items-center justify-center gap-2 transition shadow-xl"
        >
          <Zap size={18} />
          <span>Pay with Razorpay Test Mode (₹{formatCurrency(grandTotal)})</span>
        </button>
      </div>

      <RazorpayModal
        isOpen={razorpayOpen}
        onClose={() => setRazorpayOpen(false)}
        onSuccess={handlePaymentSuccess}
        amount={grandTotal}
        orderId={paymentData.orderId}
        productName={paymentData.productName}
      />
    </div>
  );
}
