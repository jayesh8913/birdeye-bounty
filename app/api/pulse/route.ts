import { NextResponse } from "next/server";
import { getSuperFeed } from "../../../lib/birdeye";
import { generatePulseSummary } from "../../../lib/groq";
import { getCachedData } from "../../../lib/cache";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pulseResponse = await getCachedData("pulse-summary", async () => {
      // Use the cached superfeed tokens to generate the pulse summary
      const tokens = await getCachedData("superfeed", () => getSuperFeed());
      return await generatePulseSummary(tokens);
    });

    return NextResponse.json({ summary: pulseResponse });
  } catch (error) {
    console.error("Pulse API Error:", error);
    return NextResponse.json({ error: "Pulse failed" }, { status: 500 });
  }
}
