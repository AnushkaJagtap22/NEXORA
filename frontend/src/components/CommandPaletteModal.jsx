import React, { useState, useEffect } from 'react';
import { Search, Cpu, ShoppingBag, ShieldCheck, Target, Play, Zap, ArrowRight, X } from 'lucide-react';

export default function CommandPaletteModal({ isOpen, onClose, onNavigate }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onNavigate(null);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNavigate]);

  useEffect(() => {
    if (query.trim().length > 1) {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(data => {
          if (data.results) setSearchResults(data.results);
        });
    } else {
      setSearchResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  const defaultActions = [
    { label: 'Open AI Buyer Workspace', icon: Cpu, tab: 'chat', type: 'AGENTS' },
    { label: 'View Agent Catalog', icon: ShoppingBag, tab: 'catalog', type: 'COMMERCE' },
    { label: 'Run Commerce Lab Simulation', icon: Play, tab: 'simulation', type: 'TOOLS' },
    { label: 'Configure Policy Rules', icon: ShieldCheck, tab: 'policies', type: 'CONTROL' },
    { label: 'Inspect Audit Event Ledger', icon: Zap, tab: 'audit', type: 'CONTROL' }
  ];

  const actionsToDisplay = searchResults.length > 0 ? searchResults : defaultActions.filter(a =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#0D0F12] border border-white/10 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden space-y-0">
        {/* Search Input */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <Search size={18} className="text-[#6B7280]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, orders, agents, policies..."
            className="w-full bg-transparent text-sm text-[#F5F7FA] placeholder-[#6B7280] outline-none"
          />
          <button onClick={onClose} className="text-[#6B7280] hover:text-[#F5F7FA] p-1">
            <X size={16} />
          </button>
        </div>

        {/* Results */}
        <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
          {actionsToDisplay.map((act, idx) => {
            const Icon = act.icon || Search;
            return (
              <button
                key={idx}
                onClick={() => {
                  onNavigate(act.tab);
                  onClose();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-[#171A20] text-left transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#171A20] text-[#7C8FFF] border border-white/5 group-hover:border-[#7C8FFF]/30">
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#F5F7FA]">{act.label}</p>
                    <p className="text-[10px] font-mono text-[#6B7280]">{act.type}</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-[#6B7280] group-hover:text-[#F5F7FA] transition" />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/5 bg-[#08090B] flex justify-between items-center text-[10px] text-[#6B7280] font-mono">
          <span>Categorized search across Products, Orders, Agents & Policies</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
