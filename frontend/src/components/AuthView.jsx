import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Cpu, Building2 } from 'lucide-react';

export default function AuthView({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        setLoading(false);
        setErrorMsg(`Server error (${res.status}). Could not parse server response.`);
        return;
      }

      setLoading(false);

      if (res.status === 401) {
        setErrorMsg(data.error || 'Invalid email or password.');
      } else if (!res.ok) {
        setErrorMsg(data.error || `Server error (${res.status}). Please try again.`);
      } else if (data.success && data.token) {
        localStorage.setItem('nexora_token', data.token);
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Cannot reach backend server. Please verify API server is running on port 5000.');
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        setLoading(false);
        setErrorMsg(`Server error (${res.status}). Could not parse server response.`);
        return;
      }

      setLoading(false);

      if (res.ok && data.success && data.token) {
        localStorage.setItem('nexora_token', data.token);
        onLoginSuccess(data.user);
      } else {
        setErrorMsg(data.error || 'Demo authentication failed.');
      }
    } catch (err) {
      setLoading(false);
      setErrorMsg('Cannot reach backend server. Please verify API server is running on port 5000.');
    }
  };

  return (
    <div className="min-h-screen bg-[#08090B] flex items-center justify-center p-4 select-none animate-fade-in">
      <div className="w-full max-w-md bg-[#0D0F12] border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#7C8FFF]/20 border border-[#7C8FFF]/40 text-[#7C8FFF] font-black text-xl mb-1">
            N
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">NEXORA</h1>
          <p className="text-xs text-[#A2A8B3]">Commerce built for the age of AI buyers.</p>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3 bg-[#EF6B6B]/10 border border-[#EF6B6B]/30 rounded-xl text-xs text-[#EF6B6B] font-mono text-center">
            {errorMsg}
          </div>
        )}

        {/* Standard Login Form */}
        <form onSubmit={handleStandardLogin} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-[#A2A8B3] block font-mono text-[11px]">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-3 text-[#6B7280]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="merchant@nexora.com"
                className="w-full bg-[#111419] border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-[#F5F7FA] outline-none focus:border-[#7C8FFF] transition font-mono"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[#A2A8B3] block font-mono text-[11px]">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-3 text-[#6B7280]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111419] border border-white/10 rounded-lg py-2.5 pl-9 pr-3 text-[#F5F7FA] outline-none focus:border-[#7C8FFF] transition font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[#7C8FFF] hover:bg-[#7C8FFF]/90 text-[#08090B] font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-3 text-[10px] text-[#6B7280] font-mono uppercase font-bold">OR DEMO ACCOUNTS</span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* 1-Click Demo Buttons */}
        <div className="space-y-2 text-xs font-mono">
          <button
            type="button"
            onClick={() => handleDemoLogin('MERCHANT')}
            disabled={loading}
            className="w-full p-3 rounded-xl bg-[#111419] hover:bg-[#171A20] border border-white/10 text-left flex items-center justify-between text-[#F5F7FA] transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#7C8FFF]/10 text-[#7C8FFF]">
                <Building2 size={16} />
              </div>
              <div>
                <p className="font-bold">Enter as Merchant</p>
                <p className="text-[10px] text-[#6B7280] font-sans">Nexora Electronics (anushka@nexora.com)</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-[#6B7280] group-hover:text-[#7C8FFF] transition" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('AI_BUYER')}
            disabled={loading}
            className="w-full p-3 rounded-xl bg-[#111419] hover:bg-[#171A20] border border-white/10 text-left flex items-center justify-between text-[#F5F7FA] transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#45D39A]/10 text-[#45D39A]">
                <UserCheck size={16} />
              </div>
              <div>
                <p className="font-bold">Enter as AI Buyer</p>
                <p className="text-[10px] text-[#6B7280] font-sans">Rahul Sharma (buyer@nexora.com)</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-[#6B7280] group-hover:text-[#45D39A] transition" />
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin('ADMIN')}
            disabled={loading}
            className="w-full p-3 rounded-xl bg-[#111419] hover:bg-[#171A20] border border-white/10 text-left flex items-center justify-between text-[#F5F7FA] transition group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#E7B65C]/10 text-[#E7B65C]">
                <ShieldCheck size={16} />
              </div>
              <div>
                <p className="font-bold">Enter as Admin</p>
                <p className="text-[10px] text-[#6B7280] font-sans">Platform Control Center (admin@nexora.com)</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-[#6B7280] group-hover:text-[#E7B65C] transition" />
          </button>
        </div>
      </div>
    </div>
  );
}
