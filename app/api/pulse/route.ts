import { NextResponse } from "next/server";
import { getSuperFeed } from "../../../lib/birdeye";
import { analyzeToken } from "../../../lib/groq";

export async function GET() {
  try {
    const tokens = await getSuperFeed();
    const top5 = tokens.slice(0, 5);
    
    const summaryPrompt = `
      Look at these top 5 trending crypto tokens: ${top5.map(t => `${t.symbol} on ${t.chain}`).join(", ")}.
      Give a 1-sentence market summary and name the single best token based on high volume/liquidity ratio.
    `;

    // Reusing analyzeToken logic for the pulse
    const pulseResponse = await analyzeToken({
      name: "Market Pulse",
      symbol: "PULSE",
      chain: "Multi-Chain",
      price: 0,
      v24hVolume: 0,
      liquidity: 0,
      v24hChangePercent: 0,
      uniqueWallets24h: 0,
      lastTradeUnixTime: 0,
      signalScore: 0,
      label: "Watchlist",
      address: "",
      decimals: 0
    });

    return NextResponse.json({ summary: pulseResponse });
  } catch (error) {
    return NextResponse.json({ error: "Pulse failed" }, { status: 500 });
  }
}
