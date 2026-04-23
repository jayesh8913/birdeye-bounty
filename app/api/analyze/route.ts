import { NextRequest, NextResponse } from "next/server";
import { analyzeToken } from "../../../lib/groq";

export async function POST(req: NextRequest) {
  try {
    const token = await req.json();
    if (!token) {
      return NextResponse.json({ error: "Token data is required" }, { status: 400 });
    }
    const insight = await analyzeToken(token);
    return NextResponse.json({ insight });
  } catch (error) {
    return NextResponse.json({ error: "Failed to analyze token" }, { status: 500 });
  }
}
