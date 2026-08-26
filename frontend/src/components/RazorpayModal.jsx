import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, Zap, X } from 'lucide-react';

export default function RazorpayModal({ isOpen, onClose, amount, orderId, productName, onPaymentSuccess }) {
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleVerifyPayment = async () => {
    setVerifying(true);

    try {
      const mockPaymentId = `pay_${Math.random().toString(36).substring(2, 10)}_success`;
      const res = await fetch('/api/razorpay/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayPaymentId: mockPaymentId,
          razorpayOrderId: orderId || 'order_Kz82n1M901',
          amount: amount || 4749,
          productName: productName || 'Wireless Headphones Pro',
          customerName: 'Rahul Sharma (AI Buyer)'
        })
      });

      const data = await res.json();
      setVerifying(false);

      if (data.success) {
        setSuccess(true);
        const createdOrder = data.order || {
          id: orderId || 'NX-100295',
          productName: productName || 'Wireless Headphones Pro',
          amount: amount || 4749,
          paymentId: mockPaymentId,
          createdAt: new Date().toISOString()
        };

        if (onPaymentSuccess) onPaymentSuccess(createdOrder);

        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in select-none">
      <div className="bg-[#0D0F12] border border-white/10 w-full max-w-sm rounded-2xl p-6 space-y-5 shadow-2xl">
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#45D39A]" />
            <h3 className="font-bold text-[#F5F7FA] text-sm font-mono">RAZORPAY TEST MODE</h3>
          </div>
          <button onClick={onClose} className="text-[#6B7280] hover:text-white">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="py-6 text-center space-y-2 animate-fade-in">
            <CheckCircle2 size={42} className="text-[#45D39A] mx-auto" />
            <h4 className="font-bold text-[#F5F7FA] text-sm">Payment HMAC Verified!</h4>
            <p className="text-xs text-[#A2A8B3]">Order created & inventory stock decremented.</p>
          </div>
        ) : (
          <div className="space-y-4 text-xs font-mono">
            <div className="bg-[#111419] p-3.5 rounded-xl border border-white/5 space-y-1">
              <span className="text-[#6B7280] text-[10px] uppercase">PAYMENT SUMMARY</span>
              <p className="font-bold text-[#F5F7FA] text-sm">{productName || 'Wireless Headphones Pro'}</p>
              <p className="text-lg font-bold text-[#45D39A]">₹{(amount || 4749).toLocaleString()}</p>
            </div>

            <div className="p-3 bg-[#7C8FFF]/10 border border-[#7C8FFF]/20 rounded-xl space-y-1 text-[11px] font-sans">
              <p className="text-[#7C8FFF] font-bold">HMAC Signature Handshake</p>
              <p className="text-[#A2A8B3]">Simulating test-mode SHA256 signature verification on backend.</p>
            </div>

            <button
              onClick={handleVerifyPayment}
              disabled={verifying}
              className="w-full h-11 rounded-xl bg-[#45D39A] hover:bg-[#45D39A]/90 text-[#08090B] font-bold text-xs flex items-center justify-center gap-2 transition shadow-md font-sans"
            >
              <Zap size={16} />
              <span>{verifying ? 'Verifying HMAC Signature...' : 'Pay & Verify Signature'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
