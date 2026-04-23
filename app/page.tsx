import SuperFeed from "../components/SuperFeed";
import { Zap, Target, Search, BarChart3, Globe, Shield, Activity } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] selection:bg-emerald-500/30">
      {/* Top Utility Nav */}
      <nav className="border-b border-[#161616] bg-[#080808]/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-black fill-current" />
              </div>
              <span className="font-black text-sm tracking-tighter text-white uppercase">Birdeye<span className="text-emerald-500">AI</span></span>
            </div>
            <div className="h-4 w-[1px] bg-[#161616]" />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Network Live</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 rounded bg-[#161616] text-[9px] font-bold text-gray-500 uppercase border border-[#1a1a1a]">
              v1.0.8-PRO
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Space */}
      <div className="relative">
        {/* Subtle Header */}
        <div className="max-w-7xl mx-auto px-6 pt-12 pb-4">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Alpha Terminal</h1>
            <p className="text-xs font-medium text-gray-600 uppercase tracking-[0.2em]">Institutional Token Intelligence • Multi-Chain Aggregator</p>
          </div>
        </div>

        <SuperFeed />
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-[#161616] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-700">
          <div className="flex items-center gap-2 grayscale opacity-50">
            <Activity className="w-4 h-4" />
            <span className="font-bold text-[10px] tracking-widest uppercase">System Stats: 100% Operational</span>
          </div>
          <p className="text-[10px] uppercase tracking-widest font-medium">Birdeye AI Intelligence &copy; 2026</p>
          <div className="flex gap-4 text-[10px] uppercase font-bold tracking-tighter">
            <span className="text-gray-800">Privacy</span>
            <span className="text-gray-800">Terms</span>
            <span className="text-gray-800">API Documentation</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
