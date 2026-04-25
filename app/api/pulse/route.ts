import { NextResponse } from "next/server";
import { getSuperFeed } from "../../../lib/birdeye";
import { generatePulseSummary } from "../../../lib/groq";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tokens = await getSuperFeed();
    const pulseResponse = await generatePulseSummary(tokens);

    return NextResponse.json({ summary: pulseResponse });
  } catch (error) {
    return NextResponse.json({ error: "Pulse failed" }, { status: 500 });
  }
}
