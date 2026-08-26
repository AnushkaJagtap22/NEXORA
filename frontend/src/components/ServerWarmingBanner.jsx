import React, { useState, useEffect } from 'react';
import { Loader2, Zap } from 'lucide-react';

export default function ServerWarmingBanner() {
  const [warming, setWarming] = useState(false);
  const [attempt, setAttempt] = useState(1);

  useEffect(() => {
    const handleWarming = (e) => {
      setWarming(e.detail.warming);
      if (e.detail.attempt) setAttempt(e.detail.attempt);
    };

    window.addEventListener('nexora:server-warming', handleWarming);
    return () => window.removeEventListener('nexora:server-warming', handleWarming);
  }, []);

  if (!warming) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white px-4 py-2 text-xs font-mono border-b border-indigo-500/30 flex items-center justify-between shadow-2xl animate-fade-in">
      <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-center">
        <Zap size={14} className="text-amber-400 animate-pulse" />
        <span className="font-bold text-amber-300">NEXORA CLOUD INFRASTRUCTURE:</span>
        <span className="text-slate-200">Connecting to Render backend services... (Attempt {attempt}/3 • Standby)</span>
        <Loader2 size={13} className="animate-spin text-indigo-400 ml-1" />
      </div>
    </div>
  );
}
