import { NextResponse } from "next/server";
import { getSuperFeed } from "../../../lib/birdeye";
import { getCachedData } from "../../../lib/cache";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Cache for 120 seconds (2 minutes)
    const tokens = await getCachedData("superfeed", () => getSuperFeed(), 120);
    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Tokens API Error:", error);
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}
