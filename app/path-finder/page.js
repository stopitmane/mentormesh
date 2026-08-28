"use client";

import { useEffect, useState } from "react";
import { Loading, Empty, ErrorState, DatabaseUnreachable } from "@/components/States";

export default function PathFinderPage() {
  const [people, setPeople] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [state, setState] = useState({ status: "idle" });

  useEffect(() => {
    fetch("/api/people")
      .then((res) => res.json())
      .then((data) => setPeople(data.people || []));
  }, []);

  useEffect(() => {
    if (!from || !to || from === to) {
      setState({ status: "idle" });
      return;
    }
    setState({ status: "loading" });
    fetch(`/api/path?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setState({ status: "error", code: data.code, message: data.error });
        else setState({ status: "ready", path: data.path });
      })
      .catch((err) => setState({ status: "error", message: err.message }));
  }, [from, to]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <p className="font-mono text-xs uppercase tracking-widest text-teal mb-2">
        Variable-length pathfinding
      </p>
      <h1 className="font-display text-3xl text-ink">Path Finder</h1>
      <p className="text-ink-soft mt-2 max-w-xl">
        Trace the shortest chain of connections, shared projects, and shared skills between any
        two people in the org.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-surface p-4 font-mono text-xs text-ink-soft overflow-x-auto">
        <pre>{`MATCH (a:Person {name: $from}), (b:Person {name: $to}),
      path = shortestPath((a)-[:KNOWS|WORKED_ON|HAS_SKILL*..6]-(b))
RETURN nodes(path), relationships(path)`}</pre>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">From</label>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            <option value="">Select…</option>
            {people.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ink mb-1.5">To</label>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          >
            <option value="">Select…</option>
            {people.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8">
        {state.status === "idle" && (
          <Empty title="Pick two different people" hint="Their shortest path will appear here." />
        )}
        {state.status === "loading" && <Loading label="Searching for a path…" />}
        {state.status === "error" && state.code === "UNAVAILABLE" && <DatabaseUnreachable />}
        {state.status === "error" && state.code !== "UNAVAILABLE" && (
          <ErrorState message={state.message} />
        )}
        {state.status === "ready" && !state.path && (
          <Empty
            title="No path found"
            hint="These two people aren't connected within 6 hops through KNOWS, WORKED_ON, or HAS_SKILL relationships."
          />
        )}
        {state.status === "ready" && state.path && (
          <div className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm text-ink-soft mb-4 font-mono">{state.path.hops} hop(s)</p>
            <div className="flex flex-wrap items-center gap-2">
              {state.path.nodeNames.map((n, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm border ${
                      state.path.nodeLabels[i] === "Person"
                        ? "bg-teal-tint text-teal-dark border-teal/30"
                        : "bg-ochre-tint text-ochre border-ochre/30"
                    }`}
                  >
                    {n}
                  </span>
                  {i < state.path.relTypes.length && (
                    <span className="text-xs font-mono text-ink-soft">
                      —{state.path.relTypes[i]}→
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
