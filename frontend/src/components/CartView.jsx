import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Tag, ShieldCheck, ArrowLeft } from 'lucide-react';
import { getApiUrl } from '../config/apiConfig';

export default function CartView() {
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

  const [campaignNudge, setCampaignNudge] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatCurrency = (val) => (typeof val === 'number' && !isNaN(val) ? val : 0).toLocaleString();

  const fetchCart = async () => {
    try {
      const res = await fetch(getApiUrl('/api/cart'));
      const data = await res.json();
      if (data.cart) {
        setCartState(data.cart);
        if (data.cart.items && data.cart.items.length > 0) {
          fetchRecommendations(data.cart.subtotal, data.cart.items);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (subtotal, items) => {
    try {
      const res = await fetch(getApiUrl('/api/recommendations/contextual'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: items[0]?.id || 'prod_002', cartItems: items, cartSubtotal: subtotal })
      });
      const data = await res.json();
      if (data.campaignNudge) setCampaignNudge(data.campaignNudge);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQuantity = async (prodId, newQty) => {
    try {
      await fetch(getApiUrl('/api/cart/item'), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: prodId, quantity: newQty })
      });
      await fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSmartBundle = async () => {
    try {
      await fetch(getApiUrl('/api/cart/update'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warrantyAdded: !cartState.warrantyAdded })
      });
      await fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-[#A2A8B3] font-mono animate-fade-in">
        Loading persistent cart from backend...
      </div>
    );
  }

  const grandTotal = cartState.finalTotal || cartState.subtotal || cartState.total || 0;

  return (
    <div className="space-y-8 animate-fade-in select-none pb-16 max-w-4xl mx-auto">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">YOUR SHOPPING CART</h2>
          <p className="text-xs text-[#A2A8B3] mt-0.5">Calculated server-side directly from SQLite database records.</p>
        </div>
        <button onClick={() => navigate('/buyer/ai-shopping')} className="flex items-center gap-1.5 text-xs text-[#A2A8B3] hover:text-white font-semibold">
          <ArrowLeft size={14} /> Continue Shopping
        </button>
      </div>

      {cartState.items.length === 0 ? (
        <div className="nx-panel p-12 text-center space-y-4">
          <p className="text-sm font-bold text-[#F5F7FA]">Your cart is waiting.</p>
          <p className="text-xs text-[#A2A8B3]">Start with a product or ask the AI assistant to find something for you.</p>
          <button onClick={() => navigate('/buyer/ai-shopping')} className="px-6 py-2.5 bg-[#7C8FFF] text-[#08090B] font-bold text-xs rounded-xl">
            Explore Catalog Products →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CART ITEMS (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {campaignNudge && (
              <div className="bg-[#E7B65C]/10 border border-[#E7B65C]/30 p-4 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-[#E7B65C] font-bold font-mono text-xs">
                  <Tag size={14} /> <span>{campaignNudge.campaignTitle}</span>
                </div>
                <p className="text-[#F5F7FA] text-xs">{campaignNudge.reason}</p>
                {campaignNudge.recommendedProduct && (
                  <button
                    onClick={async () => {
                      await fetch(getApiUrl('/api/cart/add'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: campaignNudge.recommendedProduct.id, quantity: 1 }) });
                      await fetchCart();
                    }}
                    className="w-full py-2 bg-[#45D39A] text-[#08090B] font-bold text-xs rounded-xl"
                  >
                    + Add {campaignNudge.recommendedProduct.name} & Unlock Offer
                  </button>
                )}
              </div>
            )}

            <div className="space-y-3">
              {cartState.items.map(item => (
                <div key={item.id} className="bg-[#111419] p-4 rounded-2xl border border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-[#F5F7FA]">{item.name}</h4>
                      <p className="text-[10px] text-[#A2A8B3] font-mono">Category: {item.category}</p>
                    </div>
                    <button onClick={() => handleUpdateQuantity(item.id, 0)} className="text-[#6B7280] hover:text-[#EF6B6B] transition">
                      <Trash2 size={15} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center font-mono pt-2 border-t border-white/5">
                    <div className="flex items-center gap-3 bg-[#0D0F12] px-3 py-1 rounded-lg border border-white/5">
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="text-[#A2A8B3] hover:text-white">
                        <Minus size={13} />
                      </button>
                      <span className="font-bold text-[#F5F7FA] text-xs">{item.quantity}</span>
                      <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="text-[#A2A8B3] hover:text-white">
                        <Plus size={13} />
                      </button>
                    </div>
                    <span className="font-extrabold text-base text-[#45D39A]">₹{formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* SMART BUNDLE */}
            <div className="bg-[#111419] p-4 rounded-2xl border border-white/5 text-xs space-y-2">
              <span className="text-[10px] text-[#7C8FFF] font-mono font-bold uppercase">SMART BUNDLE SAVINGS</span>
              <div className="flex justify-between items-center text-[#F5F7FA]">
                <span>Travel Hard-Shell Protective Case (+₹499)</span>
                <button onClick={toggleSmartBundle} className="px-3 py-1 rounded-lg bg-[#45D39A] text-[#08090B] font-bold text-xs">
                  {cartState.warrantyAdded ? 'Bundle Applied ✓' : '+ Add Bundle'}
                </button>
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-[#111419] p-6 rounded-2xl border border-white/5 space-y-4 font-mono text-xs">
              <h3 className="font-bold text-sm text-[#F5F7FA] font-sans border-b border-white/5 pb-3">ORDER SUMMARY</h3>
              <div className="flex justify-between text-[#A2A8B3]">
                <span>Subtotal</span>
                <span>₹{formatCurrency(cartState.subtotal)}</span>
              </div>
              {cartState.discountPercent > 0 && (
                <div className="flex justify-between text-[#45D39A]">
                  <span>{cartState.discountPercent}% Merchant Discount</span>
                  <span>−₹{formatCurrency(cartState.discountAmount)}</span>
                </div>
              )}
              {cartState.warrantyAdded && (
                <div className="flex justify-between text-[#7C8FFF]">
                  <span>Travel Protective Case</span>
                  <span>+₹{formatCurrency(cartState.warrantyPrice || cartState.warrantyAmount || 499)}</span>
                </div>
              )}
              <div className="pt-3 border-t border-white/5 flex justify-between font-extrabold text-[#F5F7FA] text-lg">
                <span>TOTAL</span>
                <span className="text-[#45D39A]">₹{formatCurrency(grandTotal)}</span>
              </div>
              <button
                onClick={() => navigate('/buyer/checkout')}
                className="w-full h-12 rounded-xl bg-[#45D39A] hover:bg-[#45D39A]/90 text-[#08090B] font-extrabold text-xs flex items-center justify-center gap-2 transition"
              >
                <span>Proceed to Checkout (₹{formatCurrency(grandTotal)})</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
