import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Store, ShoppingBag, ShieldCheck, Eye, EyeOff, ArrowRight, ArrowLeft, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/apiClient';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect role from URL path (/login/merchant, /login/buyer, /login/admin)
  let role = 'MERCHANT';
  if (location.pathname.includes('/buyer')) role = 'AI_BUYER';
  else if (location.pathname.includes('/admin')) role = 'ADMIN';

  const [email, setEmail] = useState(
    role === 'MERCHANT' ? 'anushka@nexora.com' : role === 'AI_BUYER' ? 'buyer@nexora.com' : 'admin@nexora.com'
  );
  const [password, setPassword] = useState(
    role === 'MERCHANT' ? 'merchant123' : role === 'AI_BUYER' ? 'buyer123' : 'admin123'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setEmail(role === 'MERCHANT' ? 'anushka@nexora.com' : role === 'AI_BUYER' ? 'buyer@nexora.com' : 'admin@nexora.com');
    setPassword(role === 'MERCHANT' ? 'merchant123' : role === 'AI_BUYER' ? 'buyer123' : 'admin123');
    setErrorMsg('');
  }, [role]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email and password are required.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const data = await apiClient.post('/api/auth/login', { email, password, role });

      if (data.token && data.user) {
        localStorage.setItem('nexora_token', data.token);
        localStorage.setItem('nexora_user', JSON.stringify(data.user));

        setSuccessMsg('Welcome back. Redirecting to workspace...');
        setTimeout(() => {
          if (role === 'MERCHANT') navigate('/merchant/overview');
          else if (role === 'AI_BUYER') navigate('/buyer/ai-shopping');
          else navigate('/admin/overview');
        }, 600);
      } else {
        setErrorMsg(data.error || 'Email or password is incorrect.');
      }
    } catch (err) {
      setErrorMsg('Nexora couldn\'t reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const roleConfigs = {
    MERCHANT: {
      badge: 'MERCHANT WORKSPACE',
      title: 'Welcome back, Merchant.',
      subtitle: 'Manage your store and let AI grow every transaction.',
      color: '#7C8FFF',
      icon: Store
    },
    AI_BUYER: {
      badge: 'BUYER CONSOLE',
      title: 'Welcome back.',
      subtitle: 'Discover products through intelligent shopping.',
      color: '#45D39A',
      icon: ShoppingBag
    },
    ADMIN: {
      badge: 'ADMIN CONSOLE',
      title: 'Admin Console',
      subtitle: 'Monitor the Nexora commerce network.',
      color: '#E7B65C',
      icon: ShieldCheck
    }
  };

  const currentConfig = roleConfigs[role] || roleConfigs.MERCHANT;
  const RoleIcon = currentConfig.icon;

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] font-sans flex items-center justify-center p-6 select-none antialiased">
      <div className="w-full max-w-md space-y-6">
        {/* BACK TO NEXORA */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs font-mono text-[#A2A8B3] hover:text-white transition"
        >
          <ArrowLeft size={14} />
          <span>Back to Nexora</span>
        </button>

        {/* AUTH CARD */}
        <div className="bg-[#111419] p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6 animate-fade-in">
          {/* ROLE INDICATOR BADGE */}
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 font-mono text-xs font-bold" style={{ color: currentConfig.color }}>
              <RoleIcon size={16} />
              <span>{currentConfig.badge}</span>
            </div>
            <span className="text-[10px] font-mono text-[#6B7280]">v2.4 SECURE AUTH</span>
          </div>

          {/* COPY HEADER */}
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-[#F5F7FA] tracking-tight">{currentConfig.title}</h2>
            <p className="text-xs text-[#A2A8B3]">{currentConfig.subtitle}</p>
          </div>

          {/* MESSAGES */}
          {errorMsg && (
            <div className="p-3 bg-[#EF6B6B]/10 border border-[#EF6B6B]/30 rounded-xl text-xs text-[#EF6B6B] flex items-center gap-2 font-mono">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-[#45D39A]/10 border border-[#45D39A]/30 rounded-xl text-xs text-[#45D39A] flex items-center gap-2 font-mono">
              <CheckCircle2 size={15} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleSignIn} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#A2A8B3] font-semibold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-[#6B7280]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[#0D0F12] border border-white/10 text-[#F5F7FA] pl-10 pr-3 py-2.5 rounded-xl outline-none focus:border-[#7C8FFF]/60 transition font-mono"
                  placeholder="name@nexora.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#A2A8B3] font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-[#6B7280]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#0D0F12] border border-white/10 text-[#F5F7FA] pl-10 pr-10 py-2.5 rounded-xl outline-none focus:border-[#7C8FFF]/60 transition font-mono"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#6B7280] hover:text-white"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#7C8FFF] text-[#08090B] font-extrabold text-xs hover:bg-[#7C8FFF]/90 transition shadow-lg flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
            >
              <span>{loading ? 'Signing you in...' : 'Sign In'}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* ROLE SWITCHER TABS */}
          <div className="pt-4 border-t border-white/5 flex justify-center gap-3 font-mono text-[11px]">
            <span
              onClick={() => navigate('/login/merchant')}
              className={`cursor-pointer hover:text-white ${role === 'MERCHANT' ? 'text-[#7C8FFF] font-bold border-b border-[#7C8FFF]' : 'text-[#6B7280]'}`}
            >
              Merchant
            </span>
            <span className="text-[#6B7280]">|</span>
            <span
              onClick={() => navigate('/login/buyer')}
              className={`cursor-pointer hover:text-white ${role === 'AI_BUYER' ? 'text-[#45D39A] font-bold border-b border-[#45D39A]' : 'text-[#6B7280]'}`}
            >
              Buyer
            </span>
            <span className="text-[#6B7280]">|</span>
            <span
              onClick={() => navigate('/login/admin')}
              className={`cursor-pointer hover:text-white ${role === 'ADMIN' ? 'text-[#E7B65C] font-bold border-b border-[#E7B65C]' : 'text-[#6B7280]'}`}
            >
              Admin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
