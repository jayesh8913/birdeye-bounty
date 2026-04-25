"use client";

import { useEffect, useState } from "react";
import { ScoredToken, SUPPORTED_CHAINS } from "../lib/types";
import TokenCard from "./TokenCard";
import { RefreshCcw, Sparkles, LayoutGrid, List, Search, X } from "lucide-react";

export default function SuperFeed() {
  const [tokens, setTokens] = useState<ScoredToken[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<ScoredToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [pulse, setPulse] = useState<string | null>(null);
  const [activeChain, setActiveChain] = useState<string>("all");
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [isMounted, setIsMounted] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ScoredToken[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 60000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = tokens;
    if (activeChain !== "all") {
      filtered = filtered.filter(t => t.chain === activeChain);
    }
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.address.toLowerCase() === searchQuery.toLowerCase()
      );
    }
    setFilteredTokens(filtered);
  }, [activeChain, tokens, searchQuery]);

  // Handle live suggestions
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setSuggestions(data);
            setShowSuggestions(true);
          }
        } catch (err) {
          console.error("Search failed:", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showSuggestions && !(event.target as HTMLElement).closest(".relative.w-full.md\\:w-80")) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSuggestions]);

  const fetchData = async () => {
    setLoading(true);
    try {
      console.log("Fetching tokens...");
      const tokensRes = await fetch(`/api/tokens?t=${Date.now()}`);
      if (!tokensRes.ok) throw new Error(`Tokens API failed: ${tokensRes.status}`);
      const tokensData = await tokensRes.json();
      
      if (Array.isArray(tokensData)) {
        setTokens(tokensData);
      } else {
        console.error("Tokens data is not an array:", tokensData);
      }

      // Fetch pulse separately so it doesn't block tokens
      try {
        const pulseRes = await fetch(`/api/pulse?t=${Date.now()}`);
        if (pulseRes.ok) {
          const pulseData = await pulseRes.json();
          setPulse(pulseData.summary || "No market summary available.");
        }
      } catch (pulseError) {
        console.error("Pulse fetch failed:", pulseError);
        setPulse("Market summary currently unavailable.");
      }
      
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectToken = (token: ScoredToken) => {
    // Add to tokens if not present, and highlight/filter
    if (!tokens.find(t => t.address === token.address)) {
      setTokens([token, ...tokens]);
    }
    setSearchQuery(token.symbol);
    setShowSuggestions(false);
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
        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold tracking-tighter text-white uppercase">Super Feed</h2>
            <div className="h-6 w-[1px] bg-[#161616]" />
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
              <input 
                type="text"
                placeholder="Search symbol or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                className="w-full bg-black border border-[#161616] focus:border-emerald-500/50 rounded-md py-2 pl-9 pr-8 text-xs text-white placeholder:text-gray-600 outline-none transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:text-white text-gray-500"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || isSearching) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0c0c0c] border border-[#161616] rounded-md shadow-2xl z-[100] max-h-64 overflow-y-auto">
                {isSearching && suggestions.length === 0 ? (
                  <div className="p-4 text-[10px] text-gray-500 uppercase font-bold tracking-widest animate-pulse">Searching Terminal...</div>
                ) : (
                  <div className="py-2">
                    {suggestions.map((s) => (
                      <button
                        key={`${s.chain}-${s.address}`}
                        onClick={() => handleSelectToken(s)}
                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#161616] transition-colors border-b border-[#161616]/50 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <img src={s.logoURI || "https://placehold.co/32x32/black/white?text=" + s.symbol[0]} className="w-6 h-6 rounded border border-[#252525]" alt="" />
                          <div className="text-left">
                            <p className="text-[10px] font-bold text-white uppercase tracking-tight">{s.symbol}</p>
                            <p className="text-[8px] text-gray-600 uppercase font-medium">{s.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-mono font-bold text-emerald-500">${s.price < 0.01 ? s.price.toFixed(6) : s.price.toFixed(2)}</p>
                          <p className="text-[8px] text-gray-700 uppercase font-bold tracking-tighter">{s.chain}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
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
      ) : filteredTokens.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border border-dashed border-[#161616] rounded-xl bg-[#080808]/50">
          <div className="p-4 bg-[#0c0c0c] rounded-full border border-[#161616] mb-4">
            <Search className="w-8 h-8 text-gray-700" />
          </div>
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Signals Found</h3>
          <p className="text-xs text-gray-600 mt-1">Try adjusting your filters or search query.</p>
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
