"use client";

import { useEffect, useState } from "react";
import { ScoredToken, SUPPORTED_CHAINS } from "../lib/types";
import TokenCard from "./TokenCard";
import { RefreshCcw, Sparkles, LayoutGrid, List } from "lucide-react";

export default function SuperFeed() {
  const [tokens, setTokens] = useState<ScoredToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<ScoredToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState<string | null>(null);
  const [activeChain, setActiveChain] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 60000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeChain === "all") {
      setFilteredTokens(tokens);
    } else {
      setFilteredTokens(tokens.filter(t => t.chain === activeChain));
    }
  }, [activeChain, tokens]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tokensRes, pulseRes] = await Promise.all([
        fetch("/api/tokens"),
        fetch("/api/pulse")
      ]);
      const tokensData = await tokensRes.json();
      const pulseData = await pulseRes.json();
      if (Array.isArray(tokensData)) setTokens(tokensData);
      setPulse(pulseData.summary);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Sleek Pulse Bar */}
      {pulse && (
        <div className="mb-12 p-4 rounded-lg bg-[#0c0c0c] border border-emerald-500/20 flex flex-col md:flex-row items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 px-2 py-1 bg-emerald-500/10 rounded border border-emerald-500/20 shrink-0">
            <Sparkles className="w-3 h-3 text-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Market Alpha</span>
          </div>
          <p className="text-xs md:text-sm text-gray-300 font-medium leading-relaxed">
            {pulse}
          </p>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-[#161616] pb-6">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-bold tracking-tighter text-white uppercase">Super Feed</h2>
          <div className="h-6 w-[1px] bg-[#161616]" />
          <div className="flex items-center gap-1 p-1 bg-black rounded-md border border-[#161616]">
            <button 
              onClick={() => setActiveChain("all")}
              className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${activeChain === "all" ? "bg-[#1a1a1a] text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              ALL
            </button>
            {SUPPORTED_CHAINS.map(chain => (
              <button 
                key={chain}
                onClick={() => setActiveChain(chain)}
                className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all uppercase ${activeChain === chain ? "bg-[#1a1a1a] text-white" : "text-gray-500 hover:text-gray-300"}`}
              >
                {chain}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest leading-none mb-1">Last Update</p>
            <p className="text-[10px] text-gray-400 font-mono">{lastUpdated || "--:--:--"}</p>
          </div>
          <button 
            onClick={fetchData}
            className="p-2 bg-[#0c0c0c] border border-[#161616] hover:border-[#252525] rounded-md transition-all group"
          >
            <RefreshCcw className={`w-4 h-4 text-gray-500 group-hover:text-white ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading && tokens.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-64 bg-[#0c0c0c] rounded-lg animate-pulse border border-[#161616]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTokens.map((token) => (
            <TokenCard key={`${token.chain}-${token.address}-${token.lastTradeUnixTime}`} token={token} />
          ))}
        </div>
      )}
    </div>
  );
}
