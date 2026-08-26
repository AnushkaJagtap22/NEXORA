import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] React component error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#08090B] text-[#F5F7FA] flex items-center justify-center p-6 text-center antialiased">
          <div className="max-w-md w-full bg-[#111419] p-8 rounded-2xl border border-white/10 space-y-6 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle size={28} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-[#F5F7FA]">Application Encountered an Issue</h2>
              <p className="text-xs text-[#A2A8B3] leading-relaxed">
                {this.state.error?.message || 'An unexpected rendering error occurred. You can safely reload the page.'}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-3 rounded-xl bg-[#7C8FFF] text-[#08090B] font-extrabold text-xs hover:bg-[#7C8FFF]/90 transition shadow-lg flex items-center justify-center gap-2"
              >
                <RefreshCw size={14} />
                <span>Reload Page</span>
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="py-3 px-4 rounded-xl bg-[#171A20] text-[#F5F7FA] font-bold text-xs hover:bg-white/10 border border-white/10 transition flex items-center justify-center gap-1.5"
              >
                <Home size={14} />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
