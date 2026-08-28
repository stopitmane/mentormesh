import { NextResponse } from "next/server";
import { runQuery } from "@/lib/neo4j";
import { DatabaseConfigError, DatabaseUnavailableError } from "@/lib/neo4j";

// A small, real slice of the graph (not fake data) used to draw the
// hero network visualization on the home page.
export async function GET() {
  try {
    const records = await runQuery(
      `MATCH (p:Person)-[:KNOWS]->(q:Person)
       RETURN p.name AS source, q.name AS target
       LIMIT 20`
    );
    const nodeNames = [...new Set(records.flatMap((r) => [r.source, r.target]))];
    return NextResponse.json({ nodes: nodeNames, edges: records });
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
