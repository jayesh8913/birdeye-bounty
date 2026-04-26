import { NextResponse } from "next/server";
import { getSuperFeed } from "../../../lib/birdeye";
import { getCachedData } from "../../../lib/cache";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tokens = await getCachedData("superfeed", () => getSuperFeed());
    return NextResponse.json(tokens);
  } catch (error) {
    console.error("Tokens API Error:", error);
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}
