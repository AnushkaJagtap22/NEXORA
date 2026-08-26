import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Star, Check, UserCheck, Layers, TrendingUp, Zap, CheckCircle2, ArrowRight, Search, Plus, Minus, Trash2, Eye, X, Tag, ShoppingCart, ShieldCheck, Sparkles, MessageSquare, ChevronRight, PackageCheck, Gift, Award, Flame, Compass, Monitor } from 'lucide-react';
import RazorpayModal from './RazorpayModal';

export default function ConversationalCheckout({ onTriggerPayment }) {
  const navigate = useNavigate();

  const [gridTitle, setGridTitle] = useState('PRODUCT DISCOVERY');
  const [products, setProducts] = useState([]);
  const [activeBundle, setActiveBundle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeProductDetail, setActiveProductDetail] = useState(null);

  const [cartState, setCartState] = useState({
    items: [{ id: 'prod_002', name: 'Wireless Headphones Pro', price: 4499, quantity: 1, category: 'Audio' }],
    subtotal: 4499,
    discountPercent: 0,
    discountAmount: 0,
    warrantyAdded: false,
    warrantyAmount: 0,
    total: 4499
  });

  const [recommendations, setRecommendations] = useState([]);
  const [campaignNudge, setCampaignNudge] = useState(null);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);

  const [messages, setMessages] = useState([
    {
      sender: 'user',
      text: 'I need wireless headphones under ₹5,000 for travel.',
      timestamp: '12:42 PM'
    },
    {
      sender: 'bot',
      text: 'I found 4 great wireless headphones under ₹5,000 with Active Noise Cancellation.',
      timestamp: '12:42 PM',
      actionLogs: ['Searching catalog... ✓ Found 4 matches', 'Checking availability... ✓ In stock'],
      productResult: {
        id: 'prod_002',
        name: 'Wireless Headphones Pro',
        price: 4499,
        stock: 42,
        rating: 4.8,
        matchScore: 92,
        reasons: ['Within budget (₹4,499)', 'Active Noise Cancellation (ANC)', 'Currently in stock']
      }
    }
  ]);

  const [inputMsg, setInputMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingOffer, setPendingOffer] = useState(null);

  const [checkoutPreviewOpen, setCheckoutPreviewOpen] = useState(false);
  const [razorpayOpen, setRazorpayOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount: 4499, orderId: 'NX-100295', productName: 'Wireless Headphones Pro' });
  const [completedOrder, setCompletedOrder] = useState(null);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      const data = await res.json();
      if (data.cart) {
        setCartState(data.cart);
        fetchRecommendations(data.cart.subtotal, data.cart.items);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}&category=${selectedCategory}`);
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendations = async (subtotal, items) => {
    try {
      const res = await fetch('/api/recommendations/contextual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: items[0]?.id || 'prod_002', cartItems: items, cartSubtotal: subtotal })
      });
      const data = await res.json();
      if (data.recommendations) setRecommendations(data.recommendations);
      if (data.campaignNudge) setCampaignNudge(data.campaignNudge);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCart();
    fetchProducts();

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');
    if (initialQuery) {
      handleExecutePromptQuery(initialQuery);
    }
  }, [searchTerm, selectedCategory]);

  const handleExecutePromptQuery = async (promptText) => {
    setLoading(true);
    setSearchTerm(promptText);

    // CLEAN STATE RESET (CRITICAL FIX)
    setActiveBundle(null);
    setRecommendations([]);
    setProducts([]);

    try {
      const res = await fetch('/api/ai-shopping/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: promptText })
      });
      const data = await res.json();

      if (data.products && data.products.length > 0) {
        setProducts(data.products);
        setGridTitle(data.title || 'SEARCH RESULTS');
        if (data.bundle) setActiveBundle(data.bundle);
        if (data.recommendations) setRecommendations(data.recommendations);

        setMessages(prev => [
          ...prev,
          {
            sender: 'user',
            text: promptText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            sender: 'bot',
            text: data.aiExplanation || `Found ${data.products.length} matches for your query.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            actionLogs: [`Executing query: "${promptText}"`, `SQLite catalog search... ✓ ${data.products.length} matches`]
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (customText = null) => {
    const text = customText || inputMsg;
    if (!text.trim()) return;

    if (text.toLowerCase().includes('discount') || text.toLowerCase().includes('%') || text.toLowerCase().includes('off')) {
      const userMsg = { sender: 'user', text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
      setMessages(prev => [...prev, userMsg]);
      setInputMsg('');
      setLoading(true);
      setAiDrawerOpen(true);
      const match = text.match(/(\d+)%/);
      const reqDisc = match ? parseInt(match[1]) : 15;

      try {
        const res = await fetch('/api/agent/negotiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestedDiscount: reqDisc, amount: cartState.subtotal })
        });
        const data = await res.json();
        setLoading(false);

        if (data.approved) {
          await fetchCart();
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `Approved! ${reqDisc}% discount applied to your active cart.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actionLogs: ['Evaluating merchant policy... ✓ Cap: 10%', 'Updating cart discount... ✓ Applied']
            }
          ]);
        } else {
          const maxAllowed = data.maxAllowedDiscount || 10;
          setPendingOffer(maxAllowed);
          setMessages(prev => [
            ...prev,
            {
              sender: 'bot',
              text: `The maximum available discount is ${maxAllowed}%. Requested: ${reqDisc}%.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              actionLogs: ['Evaluating merchant policy... ⚠️ Exceeds 10% limit', 'Formulating counter-offer... ✓ 10% Cap']
            }
          ]);
        }
      } catch (err) {
        setLoading(false);
      }
    } else {
      return handleExecutePromptQuery(text);
    }
  };

  const handleSelectProduct = async (prodId) => {
    try {
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: prodId, quantity: 1 })
      });
      await fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEntireBundle = async () => {
    if (!activeBundle || !activeBundle.products) return;
    try {
      for (const prod of activeBundle.products) {
        await fetch('/api/cart/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: prod.id, quantity: 1 })
        });
      }
      await fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateQuantity = async (prodId, newQty) => {
    try {
      await fetch('/api/cart/item', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: prodId, quantity: newQty })
      });
      await fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const acceptPermittedDiscount = async (maxDisc) => {
    try {
      await fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountPercent: maxDisc })
      });
      setPendingOffer(null);
      await fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleSmartBundle = async () => {
    try {
      await fetch('/api/cart/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ warrantyAdded: !cartState.warrantyAdded })
      });
      await fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLaunchCheckout = () => {
    setCheckoutPreviewOpen(true);
  };

  const handleProceedToRazorpay = () => {
    setCheckoutPreviewOpen(false);
    const nextOrderId = `NX-100${295 + Math.floor(Math.random() * 500)}`;
    setPaymentData({
      amount: cartState.total,
      orderId: nextOrderId,
      productName: cartState.items[0]?.name || 'Wireless Headphones Pro'
    });
    setRazorpayOpen(true);
  };

  const handlePaymentSuccess = (createdOrder) => {
    setCompletedOrder(createdOrder || {
      id: paymentData.orderId,
      productName: paymentData.productName,
      amount: paymentData.amount,
      paymentId: `pay_${Math.random().toString(36).substring(2, 10)}_success`,
      createdAt: new Date().toISOString()
    });
    setRazorpayOpen(false);
    fetchCart();
  };

  const userJson = localStorage.getItem('nexora_user');
  let userRole = 'BUYER';
  let userName = 'Rahul Sharma';
  try {
    if (userJson) {
      const u = JSON.parse(userJson);
      if (u.role) userRole = u.role;
      if (u.name) userName = u.name;
    }
  } catch (e) {}

  return (
    <div className="space-y-8 animate-fade-in select-none pb-24">
      {/* 1. TOP NAVIGATION BAR (64-72px) */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#7C8FFF]/20 border border-[#7C8FFF]/40 flex items-center justify-center text-[#7C8FFF] font-black font-mono">
              N
            </div>
            <span className="font-extrabold tracking-tight text-lg text-[#F5F7FA]">NEXORA AI SHOP</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs font-semibold text-[#A2A8B3]">
            <span className="text-[#F5F7FA] border-b-2 border-[#7C8FFF] pb-0.5">Discover</span>
            {userRole === 'MERCHANT' ? (
              <>
                <span className="hover:text-white cursor-pointer" onClick={() => navigate('/merchant/orders')}>Merchant Sales Orders</span>
                <span className="hover:text-white cursor-pointer" onClick={() => navigate('/merchant/overview')}>Merchant Workspace</span>
              </>
            ) : userRole === 'ADMIN' ? (
              <>
                <span className="hover:text-white cursor-pointer" onClick={() => navigate('/admin/orders')}>All Orders</span>
                <span className="hover:text-white cursor-pointer" onClick={() => navigate('/admin/overview')}>Admin Console</span>
              </>
            ) : (
              <>
                <span className="hover:text-white cursor-pointer" onClick={() => navigate('/buyer/orders')}>My Purchases</span>
                <span className="hover:text-white cursor-pointer" onClick={() => navigate('/login/merchant')}>Merchant Workspace</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#111419] px-3 py-1.5 rounded-full border border-white/5 text-xs">
            <UserCheck size={14} className="text-[#45D39A]" />
            <span className="font-semibold text-[#F5F7FA]">{userName} ({userRole})</span>
          </div>
        </div>
      </div>

      {completedOrder ? (
        <div className="nx-panel p-10 border border-[#45D39A]/30 bg-[#45D39A]/5 space-y-6 animate-fade-in font-mono max-w-2xl mx-auto my-12 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#45D39A]/20 border border-[#45D39A]/40 flex items-center justify-center text-[#45D39A] mx-auto">
            <CheckCircle2 size={36} />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-[#45D39A]">PAYMENT VERIFIED & ORDER CREATED</span>
            <h3 className="text-2xl font-extrabold text-[#F5F7FA] mt-1">Order #{completedOrder.id}</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-[#08090B] p-5 rounded-2xl border border-white/5 font-sans text-left">
            <div>
              <span className="text-[#6B7280] text-[10px]">Payment Status</span>
              <p className="font-bold text-[#45D39A]">PAID (HMAC Verified)</p>
            </div>
            <div>
              <span className="text-[#6B7280] text-[10px]">Payment ID</span>
              <p className="font-bold text-[#7C8FFF] text-[11px] truncate">{completedOrder.paymentId || 'pay_success'}</p>
            </div>
            <div>
              <span className="text-[#6B7280] text-[10px]">Total Paid</span>
              <p className="font-bold text-[#45D39A] font-mono text-base">₹{completedOrder.amount?.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-2 font-sans">
            <button onClick={() => setCompletedOrder(null)} className="px-5 py-2.5 rounded-xl bg-[#111419] text-[#A2A8B3] text-xs font-semibold hover:text-white border border-white/5">
              ← Continue Shopping
            </button>
            <button onClick={() => navigate('/buyer/orders')} className="px-5 py-2.5 bg-[#45D39A] text-[#08090B] font-bold text-xs rounded-xl">
              View Order Details →
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 2. AI SHOPPING HERO WITH SPACIOUS SEARCH */}
          <div className="space-y-4 max-w-4xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#7C8FFF] font-bold">
              <Sparkles size={14} />
              <span>AI SHOPPING ASSISTANT</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F5F7FA] tracking-tight">
              Shop smarter with Nexora.
            </h1>

            <p className="text-sm text-[#A2A8B3]">
              Tell me what you're looking for and I'll help you find the right products, check availability, and negotiate allowed discounts.
            </p>

            {/* SPACIOUS CONVERSATIONAL SEARCH BOX (80px) */}
            <div className="bg-[#111419] p-3 rounded-2xl border border-white/10 flex items-center gap-3 shadow-xl focus-within:border-[#7C8FFF]/60 transition duration-300">
              <Sparkles size={20} className="text-[#7C8FFF] ml-2 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleExecutePromptQuery(searchTerm)}
                placeholder='✦ What are you looking for? (e.g. "Best headphones under ₹5,000...")'
                className="w-full bg-transparent text-sm text-[#F5F7FA] outline-none placeholder-[#6B7280]"
              />
              <button
                onClick={() => handleExecutePromptQuery(searchTerm)}
                className="px-5 py-3 rounded-xl bg-[#7C8FFF] text-[#08090B] font-bold text-xs flex items-center gap-1.5 hover:bg-[#7C8FFF]/90 transition shrink-0"
              >
                <span>Search</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* INTENT-AWARE SUGGESTED PROMPT PILLS (8 INTENTS) */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-[#6B7280] font-mono">Suggested:</span>
              {[
                { icon: '🎧', label: 'Best headphones under ₹5,000' },
                { icon: '💼', label: 'Build me a work setup' },
                { icon: '🔥', label: 'Show popular products' },
                { icon: '✈', label: 'Find something for travel' },
                { icon: '🎁', label: 'Best gifts under ₹3,000' },
                { icon: '🖥️', label: 'Upgrade my desk' },
                { icon: '⭐', label: 'Best value products' }
              ].map(item => (
                <button
                  key={item.label}
                  onClick={() => handleExecutePromptQuery(item.label)}
                  className="px-3.5 py-2 rounded-full bg-[#111419] text-[#A2A8B3] hover:text-[#F5F7FA] hover:bg-[#171A20] border border-white/5 text-xs transition font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <span>{item.icon}</span>
                  <span>"{item.label}"</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. SPACIOUS WORKSPACE LAYOUT (Main Discovery ~72%, Persistent Cart ~28%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* MAIN DISCOVERY AREA (8 cols / ~72%) */}
            <div className="lg:col-span-8 space-y-8">
              {/* CATEGORY FILTERS */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#F5F7FA]">{gridTitle}</h3>
                  <span className="text-xs font-mono text-[#45D39A] bg-[#45D39A]/10 border border-[#45D39A]/20 px-2 py-0.5 rounded font-bold">
                    {products.length} Products Found
                  </span>
                </div>

                <div className="flex gap-2 font-mono text-xs">
                  {['ALL', 'Audio', 'Wearables', 'Keyboards', 'Accessories'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg transition ${selectedCategory === cat ? 'bg-[#7C8FFF] text-[#08090B] font-bold' : 'bg-[#111419] text-[#A2A8B3] hover:text-white'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3-PER-ROW SPACIOUS PRODUCT GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {products.map(prod => (
                  <div
                    key={prod.id}
                    className="bg-[#111419] p-4 rounded-2xl border border-white/5 space-y-3 hover:border-[#7C8FFF]/40 transition duration-300 group cursor-pointer flex flex-col justify-between"
                    onClick={() => navigate(`/products/${prod.id}`)}
                  >
                    <div className="space-y-3">
                      <div className="h-44 rounded-xl overflow-hidden bg-[#0D0F12] relative">
                        <img src={prod.image} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        <span className="absolute top-2.5 right-2.5 bg-[#0D0F12]/80 text-[#45D39A] font-mono font-bold text-[10px] px-2.5 py-1 rounded-md backdrop-blur-sm">
                          In Stock ({prod.stock})
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-sm text-[#F5F7FA] line-clamp-1 group-hover:text-[#7C8FFF] transition">{prod.name}</h4>
                        <p className="text-xs text-[#A2A8B3] line-clamp-1 mt-0.5">{prod.description}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/5 font-mono">
                      <span className="font-extrabold text-base text-[#45D39A]">₹{prod.price.toLocaleString()}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSelectProduct(prod.id); }}
                        className="px-3 py-1.5 rounded-lg bg-[#7C8FFF] text-[#08090B] text-xs font-bold flex items-center gap-1 hover:bg-[#7C8FFF]/90 transition"
                      >
                        <Plus size={13} /> Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DEDICATED DYNAMIC BUNDLE PANEL (WHEN TRIGGERED) */}
              {activeBundle && (
                <div className="bg-gradient-to-r from-[#111419] to-[#171A20] p-6 rounded-2xl border border-[#7C8FFF]/30 space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2 text-[#7C8FFF] font-bold text-xs font-mono">
                      <PackageCheck size={16} />
                      <span>{activeBundle.title}</span>
                    </div>
                    <span className="text-xs text-[#45D39A] font-mono font-bold">Save ₹{activeBundle.savings.toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {activeBundle.products.map(bp => (
                      <div key={bp.id} className="bg-[#0D0F12] p-2.5 rounded-xl border border-white/5 space-y-1 text-xs">
                        <span className="font-bold text-[#F5F7FA] line-clamp-1">{bp.name}</span>
                        <span className="text-[#45D39A] font-mono text-[11px] block">₹{bp.price.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-white/5 font-mono">
                    <div>
                      <span className="text-xs text-[#6B7280] line-through mr-2">₹{activeBundle.individualPrice.toLocaleString()}</span>
                      <span className="text-xl font-extrabold text-[#45D39A]">₹{activeBundle.bundlePrice.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={handleAddEntireBundle}
                      className="px-6 py-2.5 rounded-xl bg-[#45D39A] text-[#08090B] font-extrabold text-xs hover:bg-[#45D39A]/90 transition shadow-lg"
                    >
                      + Add Entire Suite Bundle
                    </button>
                  </div>
                </div>
              )}

              {/* CONTEXTUAL RECOMMENDATIONS ("Complete Your Setup") */}
              {recommendations.length > 0 && (
                <div className="bg-[#111419] p-6 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div>
                      <span className="text-[10px] font-mono text-[#7C8FFF] uppercase font-bold">AI CONTEXTUAL RECOMMENDATIONS</span>
                      <h3 className="text-sm font-bold text-[#F5F7FA]">COMPLETE YOUR SETUP</h3>
                    </div>
                    <span className="text-[10px] font-mono text-[#45D39A] bg-[#45D39A]/10 border border-[#45D39A]/20 px-2 py-0.5 rounded font-bold">
                      Mistral Recommended
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recommendations.map((rec, idx) => (
                      <div key={idx} className="bg-[#0D0F12] p-4 rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-[#7C8FFF] uppercase font-bold">{rec.type.replace(/_/g, ' ')}</span>
                          <h4 className="font-bold text-xs text-[#F5F7FA]">{rec.product.name}</h4>
                          <p className="text-[11px] text-[#A2A8B3] leading-relaxed font-sans">{rec.reason}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5 font-mono">
                          <span className="font-bold text-xs text-[#45D39A]">₹{rec.product.price.toLocaleString()}</span>
                          <button
                            onClick={() => handleSelectProduct(rec.product.id)}
                            className="px-2.5 py-1 bg-[#7C8FFF] text-[#08090B] font-bold text-[11px] rounded hover:bg-[#7C8FFF]/90 transition"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PERSISTENT CART PANEL (4 cols / ~28%) */}
            <div className="lg:col-span-4">
              <div className="bg-[#111419] p-6 rounded-2xl border border-white/5 space-y-5 sticky top-6">
                <div className="border-b border-white/5 pb-3 flex justify-between items-center">
                  <span className="text-sm font-bold text-[#F5F7FA] flex items-center gap-2">
                    <ShoppingCart size={18} className="text-[#45D39A]" /> YOUR CART
                  </span>
                  <span className="text-xs text-[#45D39A] font-mono font-bold">{cartState.items.length} Items</span>
                </div>

                {/* CAMPAIGN PROGRESS BAR NUDGE */}
                {campaignNudge && (
                  <div className="bg-[#E7B65C]/10 border border-[#E7B65C]/30 p-3.5 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[#E7B65C] font-bold font-mono text-[11px]">
                      <span className="flex items-center gap-1.5"><Tag size={13} /> {campaignNudge.campaignTitle}</span>
                    </div>
                    <p className="text-[#F5F7FA] text-[11px]">{campaignNudge.reason}</p>
                    <button
                      onClick={() => handleSelectProduct(campaignNudge.recommendedProduct.id)}
                      className="w-full py-1.5 bg-[#45D39A] text-[#08090B] font-bold text-[11px] rounded-lg hover:bg-[#45D39A]/90 transition"
                    >
                      + Add Item & Unlock Offer
                    </button>
                  </div>
                )}

                {/* CART ITEMS WITH QUANTITY CONTROLS */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {cartState.items.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#A2A8B3]">Your cart is empty.</div>
                  ) : (
                    cartState.items.map(item => (
                      <div key={item.id} className="bg-[#0D0F12] p-3.5 rounded-xl border border-white/5 space-y-2 text-xs">
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-[#F5F7FA] line-clamp-1">{item.name}</span>
                          <button onClick={() => handleUpdateQuantity(item.id, 0)} className="text-[#6B7280] hover:text-[#EF6B6B] transition p-0.5">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center font-mono pt-1 border-t border-white/5">
                          <div className="flex items-center gap-2.5 bg-[#111419] px-2.5 py-1 rounded-lg border border-white/5">
                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)} className="text-[#A2A8B3] hover:text-white">
                              <Minus size={12} />
                            </button>
                            <span className="font-bold text-[#F5F7FA] text-xs">{item.quantity}</span>
                            <button onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)} className="text-[#A2A8B3] hover:text-white">
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="font-bold text-[#45D39A] text-sm">₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* ORDER SUMMARY TOTALS */}
                <div className="bg-[#0D0F12] p-4 rounded-xl border border-white/5 text-xs space-y-2 font-mono">
                  <div className="flex justify-between text-[#A2A8B3]">
                    <span>Subtotal</span>
                    <span>₹{cartState.subtotal.toLocaleString()}</span>
                  </div>
                  {cartState.discountPercent > 0 && (
                    <div className="flex justify-between text-[#45D39A]">
                      <span>{cartState.discountPercent}% Merchant Discount</span>
                      <span>−₹{cartState.discountAmount}</span>
                    </div>
                  )}
                  {cartState.warrantyAdded && (
                    <div className="flex justify-between text-[#7C8FFF]">
                      <span>Travel Protective Case</span>
                      <span>+₹{cartState.warrantyAmount}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-white/5 flex justify-between font-extrabold text-[#F5F7FA] text-base">
                    <span>TOTAL</span>
                    <span className="text-[#45D39A]">₹{cartState.total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/buyer/cart')}
                  disabled={cartState.items.length === 0}
                  className="w-full h-12 rounded-xl bg-[#45D39A] hover:bg-[#45D39A]/90 text-[#08090B] font-extrabold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-lg"
                >
                  <span>View Full Cart & Checkout (₹{cartState.total.toLocaleString()})</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 4. FLOATING EXPANDABLE "ASK NEXORA" AI CHAT DRAWER */}
      {!aiDrawerOpen && (
        <button
          onClick={() => setAiDrawerOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-5 py-3 rounded-full bg-[#7C8FFF] text-[#08090B] font-extrabold text-xs flex items-center gap-2 shadow-2xl hover:scale-105 transition duration-300"
        >
          <Sparkles size={16} />
          <span>✦ Ask Nexora AI</span>
        </button>
      )}

      {aiDrawerOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-[#0D0F12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in flex flex-col h-[520px]">
          <div className="bg-[#111419] px-4 py-3 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#7C8FFF]" />
              <span className="font-bold text-xs text-[#F5F7FA]">Ask Nexora AI Shopping Assistant</span>
            </div>
            <button onClick={() => setAiDrawerOpen(false)} className="text-[#6B7280] hover:text-white p-1">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-xl max-w-[88%] space-y-2 ${msg.sender === 'user' ? 'bg-[#7C8FFF] text-[#08090B] font-semibold' : 'bg-[#111419] text-[#F5F7FA] border border-white/5'}`}>
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {loading && <p className="text-xs text-[#7C8FFF] font-mono">Mistral AI executing tool loop...</p>}
          </div>

          <div className="p-3 border-t border-white/5 bg-[#111419] flex gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask for discount or recommendations..."
              className="flex-1 bg-[#0D0F12] border border-white/10 text-xs text-[#F5F7FA] px-3 py-2 rounded-lg outline-none"
            />
            <button onClick={() => handleSendMessage()} className="px-3 bg-[#7C8FFF] text-[#08090B] rounded-lg font-bold">
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
