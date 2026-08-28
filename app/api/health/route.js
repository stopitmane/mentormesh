import { NextResponse } from "next/server";
import { verifyConnectivity } from "@/lib/neo4j";

export async function GET() {
  try {
    const result = await verifyConnectivity();
    return NextResponse.json(result, { status: result.ok ? 200 : 503 });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 503 });
  }
}
