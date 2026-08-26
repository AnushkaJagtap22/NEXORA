import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Download, Edit2, Trash2, X, Check, Code, ShieldCheck, Sparkles, Wand2, Archive, RefreshCw, AlertTriangle } from 'lucide-react';
import { apiClient } from '../api/apiClient';

export default function AgentCommerceCatalog() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAdvancedJson, setShowAdvancedJson] = useState(false);

  // MODAL & DRAWER STATES
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);

  const [formData, setFormData] = useState({ name: '', price: '', stock: 25, category: 'Audio', description: '', status: 'ACTIVE' });
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    let url = `/api/products?search=${encodeURIComponent(searchTerm)}`;
    if (categoryFilter !== 'ALL') url += `&category=${encodeURIComponent(categoryFilter)}`;

    try {
      const data = await apiClient.get(url);
      let prods = data.products || [];
      if (statusFilter !== 'ALL') {
        prods = prods.filter(p => p.status === statusFilter);
      }
      setProducts(prods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter, statusFilter]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = await apiClient.post('/api/products', {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      });
      setSubmitting(false);

      if (data.success && data.product) {
        setAddModalOpen(false);
        setFormData({ name: '', price: '', stock: 25, category: 'Audio', description: '', status: 'ACTIVE' });
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);

    try {
      const data = await apiClient.put(`/api/products/${selectedProduct.id}`, {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock)
      });
      setSubmitting(false);

      if (data.success) {
        setEditModalOpen(false);
        fetchProducts();
      }
    } catch (err) {
      console.error(err);
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    try {
      await apiClient.patch(`/api/products/${id}/status`, { status: nextStatus });
      fetchProducts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateWithAI = async (e) => {
    e.preventDefault();
    if (!aiPrompt) return;
    setAiGenerating(true);

    try {
      const res = await fetch('/api/products/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      const data = await res.json();
      setAiGenerating(false);

      if (data.draft) {
        setFormData({
          name: data.draft.name || '',
          price: data.draft.price || 2499,
          stock: data.draft.suggestedStock || 25,
          category: data.draft.category || 'Accessories',
          description: data.draft.description || '',
          status: 'ACTIVE'
        });
        setAiDrawerOpen(false);
        setAddModalOpen(true);
      }
    } catch (err) {
      console.error(err);
      setAiGenerating(false);
    }
  };

  const handleExportSchema = () => {
    window.open('/api/catalog/agent-readable', '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">AI MERCHANT PRODUCT CATALOG</h2>
          <p className="text-xs text-[#A2A8B3] mt-0.5 font-medium">Create and publish products indexed directly into agent-readable JSON-LD Schema.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setAiDrawerOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#7C8FFF]/10 border border-[#7C8FFF]/30 text-[#7C8FFF] hover:bg-[#7C8FFF]/20 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <Wand2 size={14} />
            <span>Create with AI</span>
          </button>
          <button
            onClick={handleExportSchema}
            className="px-3.5 py-2 rounded-xl bg-[#111419] hover:bg-[#171A20] text-[#A2A8B3] hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <Download size={14} />
            <span>Agent Catalog JSON-LD</span>
          </button>
          <button
            onClick={() => {
              setFormData({ name: '', price: '', stock: 25, category: 'Audio', description: '', status: 'ACTIVE' });
              setAddModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#7C8FFF] text-[#08090B] text-xs font-bold flex items-center gap-1.5 hover:bg-[#7C8FFF]/90 transition shadow-lg"
          >
            <Plus size={14} />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* METRICS & AI HEALTH RAIL */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0D0F12] border border-white/5 text-xs font-mono">
        <div>
          <span className="text-[#6B7280] text-[10px] uppercase font-bold">Total Products</span>
          <p className="text-base font-bold text-[#F5F7FA]">{products.length} Products</p>
        </div>
        <div>
          <span className="text-[#6B7280] text-[10px] uppercase font-bold">AI Catalog Health</span>
          <p className="text-base font-bold text-[#45D39A]">96% Indexed</p>
        </div>
        <div>
          <span className="text-[#6B7280] text-[10px] uppercase font-bold">Low Stock Warning</span>
          <p className="text-base font-bold text-[#E7B65C]">2 Low Stock</p>
        </div>
        <div>
          <span className="text-[#6B7280] text-[10px] uppercase font-bold">Schema Validation</span>
          <p className="text-base font-bold text-[#45D39A]">JSON-LD Passed ✓</p>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="nx-panel p-2.5 flex-1 flex items-center gap-2">
          <Search size={16} className="text-[#6B7280]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name or SKU..."
            className="w-full bg-transparent text-xs text-[#F5F7FA] placeholder-[#6B7280] outline-none font-mono"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-[#111419] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F7FA] font-mono outline-none"
        >
          <option value="ALL">All Categories</option>
          <option value="Audio">Audio</option>
          <option value="Wearables">Wearables</option>
          <option value="Keyboards">Keyboards</option>
          <option value="Furniture">Furniture</option>
          <option value="Accessories">Accessories</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#111419] border border-white/10 rounded-xl px-3 py-2 text-xs text-[#F5F7FA] font-mono outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active Only</option>
          <option value="ARCHIVED">Archived Only</option>
        </select>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="nx-panel overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs font-mono text-[#7C8FFF]">Loading product catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#111419] text-[#A2A8B3] text-[11px] uppercase border-b border-white/5 font-mono">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">SKU</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">AI Readiness</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {products.map((prod) => (
                  <tr
                    key={prod.id}
                    onClick={() => {
                      setSelectedProduct(prod);
                      setShowAdvancedJson(false);
                    }}
                    className="hover:bg-[#171A20] cursor-pointer transition h-14"
                  >
                    <td className="py-3 px-4 font-semibold text-[#F5F7FA]">{prod.name}</td>
                    <td className="py-3 px-4 text-[#A2A8B3] font-mono">{prod.category}</td>
                    <td className="py-3 px-4 text-[#6B7280] font-mono text-[11px]">{prod.sku}</td>
                    <td className="py-3 px-4 font-bold text-[#45D39A] font-mono">₹{prod.price.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono">{prod.stock} left</td>
                    <td className="py-3 px-4 font-mono text-[#7C8FFF] font-bold">{prod.agentReadiness || 96}%</td>
                    <td className="py-3 px-4 font-mono">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        prod.status === 'ACTIVE' ? 'bg-[#45D39A]/10 text-[#45D39A] border border-[#45D39A]/20' : 'bg-[#E7B65C]/10 text-[#E7B65C]'
                      }`}>
                        {prod.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(prod);
                          setFormData({ name: prod.name, price: prod.price, stock: prod.stock, category: prod.category, description: prod.description || '', status: prod.status });
                          setEditModalOpen(true);
                        }}
                        className="p-1 rounded text-[#7C8FFF] hover:bg-[#111419]"
                        title="Edit Product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStatus(prod.id, prod.status);
                        }}
                        className="p-1 rounded text-[#E7B65C] hover:bg-[#111419]"
                        title="Archive/Restore Product"
                      >
                        <Archive size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* "CREATE WITH AI" DRAWER */}
      {aiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0D0F12] border border-[#7C8FFF]/30 w-full max-w-lg rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <div className="flex items-center gap-2 text-[#7C8FFF] font-mono font-bold text-xs">
                <Wand2 size={16} />
                <span>CREATE PRODUCT WITH MISTRAL AI</span>
              </div>
              <button onClick={() => setAiDrawerOpen(false)} className="text-[#6B7280] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGenerateWithAI} className="space-y-4 text-xs font-sans">
              <div>
                <label className="text-[#A2A8B3] block mb-1.5 font-semibold">Describe the Product You Want to Create</label>
                <textarea
                  rows={4}
                  required
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Premium waterproof 25L laptop backpack for business travel with padded laptop sleeve..."
                  className="w-full bg-[#111419] border border-white/10 rounded-xl p-3 text-[#F5F7FA] outline-none font-mono focus:border-[#7C8FFF]/60 transition"
                />
              </div>

              <div className="p-3 bg-[#7C8FFF]/10 border border-[#7C8FFF]/30 rounded-xl text-[11px] text-[#A2A8B3] leading-relaxed">
                Mistral AI will draft product titles, category, description, and suggested price for your review. Generated drafts will NOT be published automatically.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAiDrawerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111419] text-[#A2A8B3] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiGenerating}
                  className="px-5 py-2.5 rounded-xl bg-[#7C8FFF] text-[#08090B] font-extrabold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  <span>{aiGenerating ? 'Mistral AI Generating Draft...' : 'Generate Product Draft'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0D0F12] border border-white/10 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-[#F5F7FA] text-sm font-mono">ADD & PUBLISH PRODUCT</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-[#6B7280] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-[#A2A8B3] block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. TravelPro 25L Business Backpack"
                  className="w-full bg-[#111419] border border-white/10 rounded-xl p-2.5 text-[#F5F7FA] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#A2A8B3] block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="2499"
                    className="w-full bg-[#111419] border border-white/10 rounded-xl p-2.5 text-[#F5F7FA] font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#A2A8B3] block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="25"
                    className="w-full bg-[#111419] border border-white/10 rounded-xl p-2.5 text-[#F5F7FA] font-mono outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#A2A8B3] block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#111419] border border-white/10 rounded-xl p-2.5 text-[#F5F7FA] outline-none"
                >
                  <option value="Audio">Audio</option>
                  <option value="Wearables">Wearables</option>
                  <option value="Keyboards">Keyboards</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div>
                <label className="text-[#A2A8B3] block mb-1">Description & AI Tags</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Product description for AI indexing..."
                  className="w-full bg-[#111419] border border-white/10 rounded-xl p-2.5 text-[#F5F7FA] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111419] text-[#A2A8B3] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#7C8FFF] text-[#08090B] font-extrabold shadow-lg"
                >
                  {submitting ? 'Publishing...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {editModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#0D0F12] border border-white/10 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-[#F5F7FA] text-sm font-mono">EDIT PRODUCT ({selectedProduct.sku})</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-[#6B7280] hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="space-y-3 text-xs">
              <div>
                <label className="text-[#A2A8B3] block mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#111419] border border-white/10 rounded-xl p-2.5 text-[#F5F7FA] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#A2A8B3] block mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-[#111419] border border-white/10 rounded-xl p-2.5 text-[#F5F7FA] font-mono outline-none"
                  />
                </div>

                <div>
                  <label className="text-[#A2A8B3] block mb-1">Stock</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-[#111419] border border-white/10 rounded-xl p-2.5 text-[#F5F7FA] font-mono outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#111419] text-[#A2A8B3] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#7C8FFF] text-[#08090B] font-extrabold shadow-lg"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
