"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loading, Empty, ErrorState, DatabaseUnreachable } from "@/components/States";

export default function SkillGapPage() {
  const [projects, setProjects] = useState([]);
  const [selected, setSelected] = useState("");
  const [state, setState] = useState({ status: "idle" });

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []));
  }, []);

  useEffect(() => {
    if (!selected) {
      setState({ status: "idle" });
      return;
    }
    setState({ status: "loading" });
    fetch(`/api/skill-gap?project=${encodeURIComponent(selected)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setState({ status: "error", code: data.code, message: data.error });
        else setState({ status: "ready", gaps: data.gaps });
      })
      .catch((err) => setState({ status: "error", message: err.message }));
  }, [selected]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-ochre mb-2">
        NOT EXISTS pattern
      </p>
      <h1 className="font-display text-3xl text-ink">Skill Gap Analysis</h1>
      <p className="text-ink-soft mt-2 max-w-xl">
        For a project&apos;s required skills, find which ones nobody currently on the team has at
        expert level — and who elsewhere in the org could fill that gap.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink-soft overflow-x-auto">
        <pre>{`MATCH (proj:Project {name: $projectName})-[:REQUIRES_SKILL]->(skill:Skill)
WHERE NOT EXISTS {
  MATCH (proj)<-[:WORKED_ON]-(member)-[hs:HAS_SKILL]->(skill)
  WHERE hs.level = "expert"
}
RETURN skill`}</pre>
      </div>

      <div className="mt-6 max-w-sm">
        <label className="block text-sm font-medium text-ink mb-1.5">Analyze project</label>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
        >
          <option value="">Select a project…</option>
          {projects.map((p) => (
            <option key={p.name} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {state.status === "idle" && (
          <Empty title="Pick a project above" hint="Its skill gaps will appear here." />
        )}
        {state.status === "loading" && <Loading label="Checking coverage…" />}
        {state.status === "error" && state.code === "UNAVAILABLE" && <DatabaseUnreachable />}
        {state.status === "error" && state.code !== "UNAVAILABLE" && (
          <ErrorState message={state.message} />
        )}
        {state.status === "ready" && state.gaps.length === 0 && (
          <Empty
            title="No gaps found"
            hint="Every required skill has an expert-level owner on this project."
          />
        )}
        {state.status === "ready" && state.gaps.length > 0 && (
          <div className="space-y-4">
            {state.gaps.map((gap) => (
              <div key={gap.skill} className="rounded-lg border border-ochre/30 bg-ochre-tint p-4">
                <p className="font-medium text-ink">
                  No expert-level <span className="font-mono">{gap.skill}</span> on this project
                </p>
                {gap.candidates.length === 0 ? (
                  <p className="text-sm text-ink-soft mt-1">
                    No one else in the org has expert-level {gap.skill} either.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-ink-soft mt-1 mb-2">Could bring in:</p>
                    <div className="flex flex-wrap gap-2">
                      {gap.candidates.map((c) => (
                        <Link
                          key={c.name}
                          href={`/people/${encodeURIComponent(c.name)}`}
                          className="px-3 py-1.5 rounded-md bg-surface border border-border text-sm hover:border-teal/50 transition-colors"
                        >
                          {c.name} <span className="text-ink-soft">· {c.title}</span>
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
