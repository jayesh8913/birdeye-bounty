import { NextRequest, NextResponse } from "next/server";
import { searchTokens } from "../../../lib/birdeye";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchTokens(query);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
