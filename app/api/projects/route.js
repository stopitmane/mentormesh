import { NextResponse } from "next/server";
import { listProjects } from "@/lib/queries";
import { DatabaseConfigError, DatabaseUnavailableError } from "@/lib/neo4j";

export async function GET() {
  try {
    const projects = await listProjects();
    return NextResponse.json({ projects });
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
