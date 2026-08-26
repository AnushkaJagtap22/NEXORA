import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function AccessRestricted() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('nexora_user') || '{}');

  const handleReturnToWorkspace = () => {
    if (user.role === 'MERCHANT') navigate('/merchant/overview');
    else if (user.role === 'AI_BUYER' || user.role === 'BUYER') navigate('/buyer/ai-shopping');
    else if (user.role === 'ADMIN') navigate('/admin/overview');
    else navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] font-sans flex items-center justify-center p-6 select-none text-center antialiased">
      <div className="bg-[#111419] p-10 rounded-3xl border border-[#EF6B6B]/30 max-w-md w-full space-y-5 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-[#EF6B6B]/10 border border-[#EF6B6B]/30 flex items-center justify-center text-[#EF6B6B] mx-auto">
          <ShieldAlert size={36} />
        </div>
        <div>
          <span className="text-xs font-mono font-bold text-[#EF6B6B] uppercase">ACCESS RESTRICTED (403)</span>
          <h2 className="text-2xl font-extrabold text-[#F5F7FA] mt-1">Permission Denied</h2>
          <p className="text-xs text-[#A2A8B3] mt-2 leading-relaxed">
            You don't have permission to access this workspace. Your account role ({user.role || 'UNAUTHENTICATED'}) is restricted from this section.
          </p>
        </div>
        <button
          onClick={handleReturnToWorkspace}
          className="w-full py-3 bg-[#7C8FFF] text-[#08090B] font-extrabold text-xs rounded-xl shadow-lg hover:bg-[#7C8FFF]/90 transition flex items-center justify-center gap-1.5"
        >
          <ArrowLeft size={15} />
          <span>Return to My Workspace</span>
        </button>
      </div>
    </div>
  );
}
