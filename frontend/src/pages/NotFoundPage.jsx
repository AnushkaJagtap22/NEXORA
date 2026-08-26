import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('nexora_user') || '{}');

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] font-sans flex items-center justify-center p-6 select-none text-center antialiased">
      <div className="bg-[#111419] p-10 rounded-3xl border border-white/10 max-w-md w-full space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-[#7C8FFF]/10 border border-[#7C8FFF]/30 flex items-center justify-center text-[#7C8FFF] mx-auto">
          <Compass size={36} />
        </div>
        <div>
          <span className="text-xs font-mono font-bold text-[#7C8FFF]">NEXORA / 404</span>
          <h2 className="text-2xl font-extrabold text-[#F5F7FA] mt-1">Workspace Not Found</h2>
          <p className="text-xs text-[#A2A8B3] mt-2 leading-relaxed">
            That workspace doesn't exist or may have been moved.
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 bg-[#111419] border border-white/10 text-[#A2A8B3] font-bold text-xs rounded-xl hover:text-white transition"
          >
            Go to Home
          </button>
          <button
            onClick={() => {
              if (user.role === 'MERCHANT') navigate('/merchant/overview');
              else if (user.role === 'AI_BUYER' || user.role === 'BUYER') navigate('/buyer/ai-shopping');
              else if (user.role === 'ADMIN') navigate('/admin/overview');
              else navigate('/');
            }}
            className="flex-1 py-3 bg-[#7C8FFF] text-[#08090B] font-extrabold text-xs rounded-xl hover:bg-[#7C8FFF]/90 transition"
          >
            Return to Workspace
          </button>
        </div>
      </div>
    </div>
  );
}
