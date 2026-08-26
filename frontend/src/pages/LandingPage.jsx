import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Store, ShoppingBag, ShieldCheck, CheckCircle2, Layers, Laptop, Headphones, Plane, Gift, Gamepad, Home } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const handleMissionClick = (query) => {
    navigate(`/buyer/ai-shopping?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] font-sans select-none flex flex-col justify-between antialiased">
      {/* 1. NAVIGATION BAR */}
      <nav className="h-20 border-b border-white/5 px-8 max-w-7xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#7C8FFF]/20 border border-[#7C8FFF]/40 flex items-center justify-center text-[#7C8FFF] font-black font-mono text-base shadow-lg">
            N
          </div>
          <div>
            <span className="font-extrabold tracking-tight text-xl text-[#F5F7FA]">NEXORA</span>
            <span className="text-[10px] font-mono text-[#A2A8B3] block leading-none">Agentic Commerce Infrastructure</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/buyer/ai-shopping')}
            className="px-4 py-2 text-xs font-semibold text-[#A2A8B3] hover:text-white transition"
          >
            Guest AI Shopping
          </button>
          <button
            onClick={() => navigate('/login/merchant')}
            className="px-5 py-2.5 rounded-xl bg-[#7C8FFF] text-[#08090B] font-extrabold text-xs hover:bg-[#7C8FFF]/90 transition shadow-lg flex items-center gap-1.5"
          >
            <span>Merchant Control Plane</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 text-center space-y-10 my-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#7C8FFF]/10 border border-[#7C8FFF]/30 text-[#7C8FFF] text-xs font-mono font-bold">
          <Sparkles size={14} />
          <span>INTELLIGENCE & GOVERNANCE LAYER FOR AGENTIC COMMERCE</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#F5F7FA] tracking-tight max-w-4xl mx-auto leading-tight">
          Tell Nexora what you need. It finds the right products & completes your purchase.
        </h1>

        <p className="text-base sm:text-lg text-[#A2A8B3] max-w-3xl mx-auto leading-relaxed">
          Nexora parses your natural intent, queries live merchant database stock, generates complementary setup bundles, discovers threshold campaign savings, and negotiates within merchant boundaries.
        </p>

        <div className="flex flex-wrap justify-center gap-4 pt-2">
          <button
            onClick={() => navigate('/buyer/ai-shopping')}
            className="px-8 py-4 rounded-xl bg-[#45D39A] text-[#08090B] font-extrabold text-sm hover:bg-[#45D39A]/90 transition shadow-xl flex items-center gap-2"
          >
            <Sparkles size={18} />
            <span>Try AI Shopping</span>
          </button>
          <button
            onClick={() => navigate('/buyer/products')}
            className="px-8 py-4 rounded-xl bg-[#111419] text-[#F5F7FA] font-bold text-sm hover:bg-[#171A20] border border-white/10 transition flex items-center gap-2"
          >
            <ShoppingBag size={18} />
            <span>Explore Catalog</span>
          </button>
        </div>

        {/* 3. INTERACTIVE SHOPPING MISSIONS */}
        <div className="space-y-4 pt-6 text-left max-w-5xl mx-auto">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <span className="text-xs font-bold text-[#7C8FFF] uppercase font-mono tracking-wide">
              POPULAR SHOPPING MISSIONS
            </span>
            <span className="text-[10px] text-[#45D39A] font-mono font-bold bg-[#45D39A]/10 border border-[#45D39A]/20 px-2 py-0.5 rounded">
              Click to execute live query
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleMissionClick('Build me a coding setup under ₹50,000')}
              className="bg-[#111419] p-4 rounded-2xl border border-white/5 hover:border-[#7C8FFF]/40 transition text-left space-y-2 group"
            >
              <div className="flex items-center gap-2 text-[#7C8FFF] font-bold text-xs font-mono">
                <Laptop size={16} /> <span>Coding Setup</span>
              </div>
              <p className="text-xs text-[#A2A8B3] line-clamp-2">"Build me a coding setup under ₹50,000"</p>
            </button>

            <button
              onClick={() => handleMissionClick('Find wireless headphones under ₹5,000')}
              className="bg-[#111419] p-4 rounded-2xl border border-white/5 hover:border-[#45D39A]/40 transition text-left space-y-2 group"
            >
              <div className="flex items-center gap-2 text-[#45D39A] font-bold text-xs font-mono">
                <Headphones size={16} /> <span>Audio Deals</span>
              </div>
              <p className="text-xs text-[#A2A8B3] line-clamp-2">"Find wireless headphones under ₹5,000"</p>
            </button>

            <button
              onClick={() => handleMissionClick('Find me a travel backpack and accessories')}
              className="bg-[#111419] p-4 rounded-2xl border border-white/5 hover:border-[#E7B65C]/40 transition text-left space-y-2 group"
            >
              <div className="flex items-center gap-2 text-[#E7B65C] font-bold text-xs font-mono">
                <Plane size={16} /> <span>Travel Essentials</span>
              </div>
              <p className="text-xs text-[#A2A8B3] line-clamp-2">"Find me a travel backpack and accessories"</p>
            </button>

            <button
              onClick={() => handleMissionClick('Best gifts under ₹3,000')}
              className="bg-[#111419] p-4 rounded-2xl border border-white/5 hover:border-[#7C8FFF]/40 transition text-left space-y-2 group"
            >
              <div className="flex items-center gap-2 text-[#7C8FFF] font-bold text-xs font-mono">
                <Gift size={16} /> <span>Gift Ideas</span>
              </div>
              <p className="text-xs text-[#A2A8B3] line-clamp-2">"Best gifts under ₹3,000"</p>
            </button>

            <button
              onClick={() => handleMissionClick('Build a gaming setup with mouse and keyboard')}
              className="bg-[#111419] p-4 rounded-2xl border border-white/5 hover:border-[#45D39A]/40 transition text-left space-y-2 group"
            >
              <div className="flex items-center gap-2 text-[#45D39A] font-bold text-xs font-mono">
                <Gamepad size={16} /> <span>Gaming Suite</span>
              </div>
              <p className="text-xs text-[#A2A8B3] line-clamp-2">"Build a gaming setup with mouse and keyboard"</p>
            </button>

            <button
              onClick={() => handleMissionClick('Build me a work setup under ₹30,000')}
              className="bg-[#111419] p-4 rounded-2xl border border-white/5 hover:border-[#E7B65C]/40 transition text-left space-y-2 group"
            >
              <div className="flex items-center gap-2 text-[#E7B65C] font-bold text-xs font-mono">
                <Home size={16} /> <span>WFH Productivity</span>
              </div>
              <p className="text-xs text-[#A2A8B3] line-clamp-2">"Build me a work setup under ₹30,000"</p>
            </button>
          </div>
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="h-16 border-t border-white/5 px-8 max-w-7xl w-full mx-auto flex items-center justify-between text-xs text-[#6B7280]">
        <span>© 2026 Nexora SaaS Platform. All rights reserved.</span>
        <span className="font-mono">SQLite WAL Mode • Mistral AI • Razorpay Test Mode</span>
      </footer>
    </div>
  );
}
