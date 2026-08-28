"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Loading, Empty, ErrorState, DatabaseUnreachable } from "@/components/States";
import { SkillBadge, Tag } from "@/components/Badge";

export default function PersonPage({ params }) {
  const { name } = use(params);
  const decodedName = decodeURIComponent(name);
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/people/${encodeURIComponent(decodedName)}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setState({ status: "error", code: data.code, message: data.error });
        else setState({ status: "ready", person: data.person, mentors: data.mentors });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", message: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, [decodedName]);

  if (state.status === "loading") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-14">
        <Loading label="Loading profile…" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="max-w-3xl mx-auto px-6 py-14">
        {state.code === "UNAVAILABLE" ? <DatabaseUnreachable /> : <ErrorState message={state.message} />}
      </div>
    );
  }

  const { person, mentors } = state;
  const skills = person.skills.filter((s) => s.skill);
  const wants = person.wantsToLearn.filter((w) => w.skill);
  const projects = person.projects.filter((p) => p.project);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/" className="text-sm text-teal hover:underline">
        ← Back to directory
      </Link>

      <div className="mt-4 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-ink">{person.name}</h1>
          <p className="text-ink-soft mt-1">{person.title}</p>
        </div>
        {person.openToMentor && (
          <span className="text-xs font-mono px-3 py-1.5 rounded-full bg-teal-tint text-teal-dark border border-teal/30">
            open to mentoring
          </span>
        )}
      </div>

      {person.bio && <p className="mt-4 text-ink-soft max-w-xl">{person.bio}</p>}

      <section className="mt-8">
        <h2 className="font-display text-lg text-ink mb-3">Skills</h2>
        {skills.length === 0 ? (
          <Empty title="No skills recorded" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <SkillBadge key={s.skill} name={s.skill} level={s.level} />
            ))}
          </div>
        )}
      </section>

      {wants.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg text-ink mb-3">Wants to learn</h2>
          <div className="flex flex-wrap gap-2">
            {wants.map((w) => (
              <Tag key={w.skill}>
                {w.skill} {w.priority && `· ${w.priority} priority`}
              </Tag>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-lg text-ink mb-3">Projects</h2>
          <ul className="space-y-1.5">
            {projects.map((p) => (
              <li key={p.project} className="text-sm text-ink-soft">
                <span className="text-ink font-medium">{p.project}</span>
                {p.role && ` — ${p.role}`}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10 border-t border-border pt-8">
        <h2 className="font-display text-lg text-ink mb-1">Suggested mentors</h2>
        <p className="text-sm text-ink-soft mb-4">
          People who share a project with {person.name.split(" ")[0]}, have expert-level skill in
          something they want to learn, and aren&apos;t already a direct connection.
        </p>
        {mentors.length === 0 ? (
          <Empty
            title="No mentor matches yet"
            hint="This usually means no one open to mentoring shares a project and has expert-level skill in something this person wants to learn."
          />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {mentors.map((m) => (
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
      </section>
    </div>
  );
}
