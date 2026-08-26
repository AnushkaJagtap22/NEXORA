import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Plus, CheckCircle2, ShieldCheck, Tag, Sparkles } from 'lucide-react';

export default function ProductDetailView() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then(res => res.json())
      .then(data => {
        if (data.product) {
          setProduct(data.product);
          fetchRecommendations(data.product.id);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  const fetchRecommendations = async (prodId) => {
    try {
      const res = await fetch('/api/recommendations/contextual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: prodId })
      });
      const data = await res.json();
      if (data.recommendations) setRecommendations(data.recommendations);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToCart = async () => {
    try {
      await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-[#A2A8B3] font-mono animate-fade-in">
        Loading product details from SQLite database...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center text-xs text-[#EF6B6B] font-mono space-y-4">
        <p>Product not found.</p>
        <button onClick={() => navigate('/buyer/ai-shopping')} className="px-4 py-2 bg-[#111419] text-[#F5F7FA] rounded-lg">
          ← Back to AI Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in select-none pb-16 max-w-5xl mx-auto">
      {/* Back Button */}
      <button onClick={() => navigate('/buyer/ai-shopping')} className="flex items-center gap-2 text-xs text-[#A2A8B3] hover:text-white font-semibold">
        <ArrowLeft size={16} /> Back to AI Shopping
      </button>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="h-96 rounded-2xl overflow-hidden bg-[#111419] border border-white/5 relative">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          <span className="absolute top-4 right-4 bg-[#0D0F12]/80 text-[#45D39A] font-mono font-bold text-xs px-3 py-1 rounded-lg backdrop-blur-sm">
            In Stock ({product.stock})
          </span>
        </div>

        <div className="space-y-6 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs font-mono text-[#7C8FFF] uppercase font-bold">{product.category} • SKU: {product.sku}</span>
            <h1 className="text-2xl font-extrabold text-[#F5F7FA] tracking-tight">{product.name}</h1>
            <p className="text-sm text-[#A2A8B3] leading-relaxed">{product.description}</p>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5 font-mono">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-extrabold text-[#45D39A]">₹{product.price.toLocaleString()}</span>
              <span className="text-xs text-[#7C8FFF]">JSON-LD Index Status: 96%</span>
            </div>

            <div className="flex gap-3 font-sans">
              <button
                onClick={handleAddToCart}
                className="flex-1 h-12 rounded-xl bg-[#7C8FFF] text-[#08090B] font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-[#7C8FFF]/90 transition"
              >
                <ShoppingCart size={16} /> {added ? 'Added to Cart ✓' : 'Add to Cart'}
              </button>
              <button
                onClick={() => { handleAddToCart(); navigate('/buyer/cart'); }}
                className="flex-1 h-12 rounded-xl bg-[#45D39A] text-[#08090B] font-extrabold text-xs flex items-center justify-center gap-2 hover:bg-[#45D39A]/90 transition"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contextual Recommendations ("Recommended with this") */}
      {recommendations.length > 0 && (
        <div className="nx-panel p-6 space-y-4 border border-white/5 mt-8">
          <div className="flex items-center gap-2 text-[#7C8FFF] font-bold text-xs font-mono">
            <Sparkles size={16} />
            <span>RECOMMENDED WITH THIS ITEM</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-[#0D0F12] p-4 rounded-xl border border-white/5 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[#7C8FFF] uppercase font-bold">{rec.type.replace(/_/g, ' ')}</span>
                  <h4 className="font-bold text-xs text-[#F5F7FA]">{rec.product.name}</h4>
                  <p className="text-[11px] text-[#A2A8B3] leading-relaxed font-sans">{rec.reason}</p>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/5 font-mono">
                  <span className="font-bold text-xs text-[#45D39A]">₹{rec.product.price.toLocaleString()}</span>
                  <button
                    onClick={() => { fetch('/api/cart/add', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: rec.product.id, quantity: 1 }) }); navigate('/buyer/cart'); }}
                    className="px-2.5 py-1 bg-[#7C8FFF] text-[#08090B] font-bold text-[11px] rounded"
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
  );
}
