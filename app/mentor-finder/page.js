"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loading, Empty, ErrorState, DatabaseUnreachable } from "@/components/States";
import { SkillBadge } from "@/components/Badge";

export default function MentorFinderPage() {
  const [people, setPeople] = useState([]);
  const [selected, setSelected] = useState("");
  const [state, setState] = useState({ status: "idle" });

  useEffect(() => {
    fetch("/api/people")
      .then((res) => res.json())
      .then((data) => setPeople(data.people || []));
  }, []);

  useEffect(() => {
    if (!selected) {
      setState({ status: "idle" });
      return;
    }
    setState({ status: "loading" });
    fetch(`/api/people/${encodeURIComponent(selected)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setState({ status: "error", code: data.code, message: data.error });
        else setState({ status: "ready", mentors: data.mentors });
      })
      .catch((err) => setState({ status: "error", message: err.message }));
  }, [selected]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-teal mb-2">
        Two-hop traversal
      </p>
      <h1 className="font-display text-3xl text-ink">Mentor Finder</h1>
      <p className="text-ink-soft mt-2 max-w-xl">
        Pick someone, and MentorMesh traces a path through shared projects to find people open to
        mentoring who have expert-level skill in something they want to learn — excluding anyone
        already directly connected.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink-soft overflow-x-auto">
        <pre>{`MATCH (me:Person {name: $personName})-[:WORKED_ON]->(proj:Project)<-[:WORKED_ON]-(candidate:Person)
WHERE candidate <> me AND candidate.openToMentor = true
  AND NOT (me)-[:KNOWS]->(candidate)
MATCH (me)-[:WANTS_TO_LEARN]->(skill:Skill)<-[hs:HAS_SKILL {level: "expert"}]-(candidate)
RETURN candidate, collect(proj) AS sharedProjects, collect(skill) AS matchingSkills`}</pre>
      </div>

      <div className="mt-6 max-w-sm">
        <label className="block text-sm font-medium text-ink mb-1.5">Find mentors for</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          <option value="">Select a person…</option>
          {people.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {state.status === "idle" && (
          <Empty title="Pick someone above" hint="Their mentor matches will appear here." />
        )}
        {state.status === "loading" && <Loading label="Traversing the graph…" />}
        {state.status === "error" && state.code === "UNAVAILABLE" && <DatabaseUnreachable />}
        {state.status === "error" && state.code !== "UNAVAILABLE" && (
          <ErrorState message={state.message} />
        )}
        {state.status === "ready" && state.mentors.length === 0 && (
          <Empty
            title="No mentor matches"
            hint="No one open to mentoring shares a project with this person and has expert-level skill in something they want to learn."
          />
        )}
        {state.status === "ready" && state.mentors.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            {state.mentors.map((m) => (
              <Link
                key={m.name}
                href={`/people/${encodeURIComponent(m.name)}`}
                className="block p-4 rounded-lg border border-border bg-surface hover:border-teal/50 transition-colors"
              >
                <p className="font-medium text-ink">{m.name}</p>
                <p className="text-sm text-ink-soft">{m.title}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.matchingSkills.map((s) => (
                    <SkillBadge key={s} name={s} level="expert" />
                  ))}
                </div>
                <p className="text-xs text-ink-soft mt-2 font-mono">
                  via {m.sharedProjects.join(", ")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
