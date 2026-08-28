import { NextResponse } from "next/server";
import { skillGapForProject } from "@/lib/queries";
import { DatabaseConfigError, DatabaseUnavailableError } from "@/lib/neo4j";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const project = searchParams.get("project");

  if (!project) {
    return NextResponse.json({ error: "Missing 'project' query parameter." }, { status: 400 });
  }

  try {
    const gaps = await skillGapForProject(project);
    return NextResponse.json({ gaps });
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
