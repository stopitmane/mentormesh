"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NetworkPreview from "@/components/NetworkPreview";
import { Loading, Empty, ErrorState, DatabaseUnreachable } from "@/components/States";
import { SkillBadge } from "@/components/Badge";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    const t = setTimeout(() => {
      fetch(`/api/people?search=${encodeURIComponent(search)}`)
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          if (data.error) setState({ status: "error", code: data.code, message: data.error });
          else setState({ status: "ready", people: data.people });
        })
        .catch((err) => {
          if (!cancelled) setState({ status: "error", message: err.message });
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [search]);

  return (
    <div>
      <section className="border-b border-border bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-teal mb-3">
              Skill &amp; mentorship graph
            </p>
            <h1 className="font-display text-4xl md:text-5xl leading-tight text-ink italic">
              Your next mentor is two hops away.
            </h1>
            <p className="mt-4 text-ink-soft max-w-md">
              MentorMesh maps who knows what, who&apos;s worked with whom, and who wants to learn
              what next — so you can find a mentor through a shared project, not just people you
              already know.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href="/mentor-finder"
                className="px-4 py-2.5 rounded-md bg-teal text-white text-sm font-medium hover:bg-teal-dark transition-colors"
              >
                Find a mentor
              </Link>
              <Link
                href="/path-finder"
                className="px-4 py-2.5 rounded-md border border-border text-sm font-medium text-ink hover:bg-paper transition-colors"
              >
                Trace a connection
              </Link>
            </div>
          </div>
          <div className="bg-paper rounded-xl border border-border p-4">
            <NetworkPreview />
            <p className="text-xs text-ink-soft font-mono mt-2 text-center">
              a live slice of the actual graph
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
          <h2 className="font-display text-2xl text-ink">Directory</h2>
          <input
            type="search"
            placeholder="Search people…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 rounded-md border border-border bg-surface text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-teal"
          />
        </div>

        {state.status === "loading" && <Loading label="Loading people…" />}
        {state.status === "error" && state.code === "UNAVAILABLE" && <DatabaseUnreachable />}
        {state.status === "error" && state.code !== "UNAVAILABLE" && (
          <ErrorState message={state.message} />
        )}
        {state.status === "ready" && state.people.length === 0 && (
          <Empty
            title="No one matches that search"
            hint="Try a different name, or clear the search to see everyone."
          />
        )}
        {state.status === "ready" && state.people.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.people.map((person) => (
              <Link
                key={person.name}
                href={`/people/${encodeURIComponent(person.name)}`}
                className="block p-4 rounded-lg border border-border bg-surface hover:border-teal/50 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">{person.name}</p>
                    <p className="text-sm text-ink-soft">{person.title}</p>
                  </div>
                  {person.openToMentor && (
                    <span className="shrink-0 text-xs font-mono px-2 py-0.5 rounded-full bg-teal-tint text-teal-dark border border-teal/30">
                      mentoring
                    </span>
                  )}
                </div>
                {person.topSkills?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {person.topSkills.map((s) => (
                      <SkillBadge key={s} name={s} />
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
