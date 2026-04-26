import { NextRequest, NextResponse } from "next/server";
import { analyzeToken } from "../../../lib/groq";
import { getCachedData } from "../../../lib/cache";

export async function POST(req: NextRequest) {
  try {
    const token = await req.json();
    if (!token || !token.address) {
      return NextResponse.json({ error: "Token data is required" }, { status: 400 });
    }
    
    const cacheKey = `analyze-${token.chain}-${token.address}`;
    const insight = await getCachedData(cacheKey, () => analyzeToken(token));
    
    return NextResponse.json({ insight });
  } catch (error) {
    console.error("Analyze API Error:", error);
    return NextResponse.json({ error: "Failed to analyze token" }, { status: 500 });
  }
}
