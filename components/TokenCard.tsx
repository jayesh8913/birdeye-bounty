"use client";

import { useState } from "react";
import { ScoredToken } from "../lib/types";
import { ShieldCheck, Zap, Loader2, ArrowUpRight, ExternalLink } from "lucide-react";

interface Props {
  token: ScoredToken;
}

export default function TokenCard({ token }: Props) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(token),
      });
      const data = await response.json();
      setInsight(data.insight);
    } catch (error) {
      setInsight("Error generating insight.");
    } finally {
      setLoading(false);
    }
  };

  const tradeLink = token.chain === "solana" 
    ? `https://jup.ag/swap/SOL-${token.address}`
    : `https://app.uniswap.org/#/swap?outputCurrency=${token.address}&chain=${token.chain}`;

  return (
    <div className="glass-card rounded-lg overflow-hidden flex flex-col border border-[#161616]">
      {/* Header Info */}
      <div className="p-4 flex items-center justify-between border-b border-[#161616] bg-black/40">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={token.logoURI || "https://placehold.co/40x40/black/white?text=" + token.symbol[0]} 
              className="w-8 h-8 rounded-md object-cover border border-[#1a1a1a]" 
              alt="" 
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-black border border-[#1a1a1a] flex items-center justify-center">
              <span className="text-[6px] font-bold uppercase">{token.chain[0]}</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-white">{token.symbol}</h3>
              {token.uniqueWallets24h > 1000 && (
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
              )}
            </div>
            <p className="text-[10px] text-gray-500 uppercase tracking-tighter truncate max-w-[120px]">{token.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-mono font-bold text-white">${token.price < 0.01 ? token.price.toFixed(8) : token.price.toFixed(4)}</p>
            <p className={`text-[10px] font-mono ${token.v24hChangePercent >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
              {token.v24hChangePercent > 0 ? "+" : ""}{token.v24hChangePercent.toFixed(1)}%
            </p>
          </div>
          <a href={tradeLink} target="_blank" className="p-1.5 rounded bg-[#1a1a1a] hover:bg-white/10 transition-colors">
            <ArrowUpRight className="w-3 h-3 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 divide-x divide-y divide-[#161616] border-b border-[#161616]">
        <div className="p-3 bg-black/20">
          <p className="text-[9px] text-gray-600 uppercase font-bold mb-1 tracking-widest">Liquidity</p>
          <p className="text-xs font-mono text-gray-300 font-medium">${token.liquidity.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="p-3 bg-black/20">
          <p className="text-[9px] text-gray-600 uppercase font-bold mb-1 tracking-widest">Volume</p>
          <p className="text-xs font-mono text-gray-300 font-medium">${token.v24hVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="p-3 bg-black/20">
          <p className="text-[9px] text-gray-600 uppercase font-bold mb-1 tracking-widest">Signal</p>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${token.signalScore > 70 ? "text-emerald-500" : "text-amber-500"}`}>{token.signalScore}</span>
            <div className="flex-1 h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <div 
                className={`h-full ${token.signalScore > 70 ? "bg-emerald-500" : "bg-amber-500"}`} 
                style={{ width: `${token.signalScore}%` }} 
              />
            </div>
          </div>
        </div>
        <div className="p-3 bg-black/20">
          <p className="text-[9px] text-gray-600 uppercase font-bold mb-1 tracking-widest">Trades</p>
          <p className="text-xs font-mono text-gray-300 font-medium">{token.uniqueWallets24h.toLocaleString()}</p>
        </div>
      </div>

      {/* Action Area */}
      <div className="p-3">
        {!insight ? (
          <button
            onClick={generateInsight}
            disabled={loading}
            className="w-full h-8 bg-[#1a1a1a] hover:bg-[#252525] text-[10px] font-bold uppercase tracking-widest text-white rounded transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            Analyze Alpha
          </button>
        ) : (
          <div className="text-[10px] leading-relaxed text-gray-400 font-medium bg-[#0f0f0f] p-3 rounded border border-[#1a1a1a] relative">
            <div className="absolute top-2 right-2 flex gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
            </div>
            {insight}
          </div>
        )}
      </div>
    </div>
  );
}
