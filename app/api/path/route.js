import { NextResponse } from "next/server";
import { shortestPathBetween } from "@/lib/queries";
import { DatabaseConfigError, DatabaseUnavailableError } from "@/lib/neo4j";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  if (!from || !to) {
    return NextResponse.json({ error: "Missing 'from' or 'to' query parameter." }, { status: 400 });
  }

  try {
    const path = await shortestPathBetween(from, to);
    return NextResponse.json({ path });
  } catch (err) {
    if (err instanceof DatabaseConfigError) {
      return NextResponse.json({ error: err.message, code: "CONFIG" }, { status: 500 });
    }
    if (err instanceof DatabaseUnavailableError) {
      return NextResponse.json({ error: err.message, code: "UNAVAILABLE" }, { status: 503 });
    }
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
