export const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || "";
export const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

export const SUPPORTED_CHAINS = ["solana", "ethereum", "base"];

export interface BirdeyeToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  liquidity: number;
  v24hVolume: number;
  v24hChangePercent: number;
  uniqueWallets24h: number;
  lastTradeUnixTime: number;
  chain: string;
  logoURI?: string;
}

export interface ScoredToken extends BirdeyeToken {
  signalScore: number;
  label: "Strong Opportunity" | "Early Momentum" | "Watchlist";
}
