import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, Code, ShieldCheck } from 'lucide-react';

export default function ProductDetailsPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const found = (data.products || []).find(p => p.id === productId || p.sku === productId);
        setProduct(found || {
          id: productId,
          name: 'Wireless Earbuds Pro',
          price: 2499,
          stock: 42,
          category: 'Audio',
          sku: 'NX-PROD-0001',
          description: 'High-fidelity spatial audio earbuds with 32h battery life and active noise cancellation.',
          agentReadiness: 96
        });
        setLoading(false);
      });
  }, [productId]);

  if (loading) {
    return <div className="text-xs font-mono text-[#7C8FFF]">Loading product details for {productId}...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <Link to="/merchant/products" className="p-2 rounded-lg bg-[#111419] text-[#A2A8B3] hover:text-white transition">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <span className="text-[10px] font-mono text-[#7C8FFF] uppercase font-bold">PRODUCT DETAILS</span>
          <h2 className="text-2xl font-bold text-[#F5F7FA]">{product.name}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="nx-panel p-6 space-y-4">
          <span className="text-xs font-bold text-[#F5F7FA]">General Information</span>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Product ID:</span>
              <span className="text-[#7C8FFF]">{product.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">SKU:</span>
              <span className="text-[#F5F7FA]">{product.sku}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Price:</span>
              <span className="text-[#45D39A] font-bold">₹{product.price?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6B7280]">Stock Level:</span>
              <span className="text-[#F5F7FA]">{product.stock} available</span>
            </div>
          </div>
          <p className="text-xs text-[#A2A8B3] pt-2 border-t border-white/5">{product.description}</p>
        </div>

        <div className="nx-panel p-6 space-y-4">
          <span className="text-xs font-bold text-[#F5F7FA]">AI Readability Index ({product.agentReadiness}%)</span>
          <pre className="bg-[#08090B] p-4 rounded-xl border border-white/10 text-[#45D39A] font-mono text-[11px] overflow-x-auto">
            {JSON.stringify({
              '@context': 'https://schema.org/',
              '@type': 'Product',
              name: product.name,
              sku: product.sku,
              offers: {
                '@type': 'Offer',
                priceCurrency: 'INR',
                price: product.price,
                availability: 'InStock'
              }
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
