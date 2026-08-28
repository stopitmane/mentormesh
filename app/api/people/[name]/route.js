import { NextResponse } from "next/server";
import { getPerson, findMentors } from "@/lib/queries";
import { DatabaseConfigError, DatabaseUnavailableError } from "@/lib/neo4j";

export async function GET(request, { params }) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  try {
    const person = await getPerson(decodedName);
    if (!person) {
      return NextResponse.json({ error: "Person not found." }, { status: 404 });
    }
    const mentors = await findMentors(decodedName);
    return NextResponse.json({ person, mentors });
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
