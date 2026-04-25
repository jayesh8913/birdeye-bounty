import { NextResponse } from "next/server";
import { getSuperFeed } from "../../../lib/birdeye";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tokens = await getSuperFeed();
    return NextResponse.json(tokens);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tokens" }, { status: 500 });
  }
}
