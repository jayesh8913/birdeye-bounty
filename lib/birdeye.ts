import { BIRDEYE_API_KEY, BirdeyeToken, ScoredToken, SUPPORTED_CHAINS } from "./types";

export async function fetchTokensForChain(chain: string): Promise<ScoredToken[]> {
  const url = `https://public-api.birdeye.so/defi/v3/token/list?sort_by=volume_24h_usd&sort_type=desc&limit=100&min_liquidity=5000`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-KEY": BIRDEYE_API_KEY,
        "x-chain": chain,
        "accept": "application/json",
      },
      cache: "no-store"
    });

    const data = await response.json();
    if (!data.success) {
      console.error(`Birdeye API failed for ${chain}:`, data.message);
      return [];
    }

    const tokens = data.data.items || [];
    console.log(`[Birdeye] Fetched ${tokens.length} tokens for ${chain}`);
    
    const mapped = tokens
      .filter((t: any) => (t.volume_24h_usd || t.v24hVolume) > 1000) 
      .map((t: any) => {
        const token: BirdeyeToken = {
          address: t.address,
          symbol: t.symbol,
          name: t.name,
          decimals: t.decimals,
          price: t.price,
          liquidity: t.liquidity,
          v24hVolume: t.volume_24h_usd || t.v24hVolume || 0,
          v24hChangePercent: t.volume_24h_change_percent || t.price_change_24h_percent || 0,
          uniqueWallets24h: t.trade_24h_count || t.unique_wallet_24h || 0,
          lastTradeUnixTime: t.last_trade_unix_time,
          chain: chain,
          logoURI: t.logo_uri,
        };
        return calculateSignalScore(token);
      });
    
    console.log(`[Birdeye] Mapped ${mapped.length} valid tokens for ${chain}`);
    return mapped;
  } catch (error) {
    console.error(`Fetch error for ${chain}:`, error);
    return [];
  }
}

export function calculateSignalScore(token: BirdeyeToken): ScoredToken {
  let score = 0;

  // 1. Volume/Liquidity Velocity (Max 40 pts)
  const volLiqRatio = token.v24hVolume / token.liquidity;
  if (volLiqRatio > 3) score += 40;
  else if (volLiqRatio > 1.5) score += 30;
  else if (volLiqRatio > 0.8) score += 20;
  else score += 10;

  // 2. Momentum (Max 30 pts)
  if (token.v24hChangePercent > 50) score += 30;
  else if (token.v24hChangePercent > 15) score += 20;
  else if (token.v24hChangePercent > 0) score += 10;

  // 3. Trade Density (Max 30 pts)
  if (token.uniqueWallets24h > 2000) score += 30;
  else if (token.uniqueWallets24h > 500) score += 20;
  else if (token.uniqueWallets24h > 100) score += 10;

  let label: ScoredToken["label"] = "Watchlist";
  if (score >= 75) label = "Strong Opportunity";
  else if (score >= 45) label = "Early Momentum";

  return { ...token, signalScore: score, label };
}

export async function getSuperFeed(): Promise<ScoredToken[]> {
  const allTokens = await Promise.all(
    SUPPORTED_CHAINS.map((chain) => fetchTokensForChain(chain))
  );
  
  return allTokens.flat().sort((a, b) => b.signalScore - a.signalScore);
}

export async function searchTokens(keyword: string): Promise<ScoredToken[]> {
  const url = `https://public-api.birdeye.so/defi/v3/search?keyword=${encodeURIComponent(keyword)}&chain=all&target=token&search_mode=partial&sort_by=volume_24h_usd&sort_type=desc&verify_token=false&limit=20`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-API-KEY": BIRDEYE_API_KEY,
        "accept": "application/json",
      },
      cache: "no-store"
    });

    const data = await response.json();
    if (!data.success || !data.data || !data.data.items) return [];

    // Filter results that belong to our supported chains and have some liquidity
    return data.data.items
      .filter((item: any) => 
        item.result && 
        item.result.length > 0
      )
      .flatMap((item: any) => {
        return item.result.map((t: any) => {
          // Birdeye search results use 'network' instead of 'chain' inside the result objects
          const chain = t.network || item.chain;
          
          const token: BirdeyeToken = {
            address: t.address,
            symbol: t.symbol,
            name: t.name,
            decimals: t.decimals || 0,
            price: t.price || 0,
            liquidity: t.liquidity || 0,
            v24hVolume: t.volume_24h_usd || 0,
            v24hChangePercent: t.price_change_24h_percent || 0,
            uniqueWallets24h: t.unique_wallet_24h || 0,
            lastTradeUnixTime: t.last_trade_unix_time || 0,
            chain: chain,
            logoURI: t.logo_uri,
          };
          return calculateSignalScore(token);
        });
      })
      .filter((t: ScoredToken) => SUPPORTED_CHAINS.includes(t.chain))
      .slice(0, 10);
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
}
