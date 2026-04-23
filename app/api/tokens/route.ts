import { NextResponse } from "next/server";
import { getSuperFeed } from "../../../lib/birdeye";

export async function GET() {
  try {
    const tokens = await getSuperFeed();
    return NextResponse.json(tokens, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}
