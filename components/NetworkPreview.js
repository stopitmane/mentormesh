"use client";

import { useEffect, useState } from "react";
import { Loading, ErrorState } from "./States";

// Deterministic-looking layout: place nodes on a circle, sized by
// how many edges reference them, colored teal/ochre alternately.
function layout(nodes, width, height) {
  const cx = width / 2;
  const cy = height / 2;
  const r = Math.min(width, height) / 2 - 36;
  return nodes.map((name, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return {
      name,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  });
}

export default function NetworkPreview() {
  const [state, setState] = useState({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/graph-preview")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.error) setState({ status: "error", message: data.error });
        else setState({ status: "ready", nodes: data.nodes, edges: data.edges });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: "error", message: err.message });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const width = 420;
  const height = 320;

  if (state.status === "loading") {
    return (
      <div className="aspect-[4/3] w-full flex items-center justify-center">
        <Loading label="Loading network…" />
      </div>
    );
  }

  if (state.status === "error") {
    return <ErrorState message={state.message} />;
  }

  if (!state.nodes.length) {
    return (
      <div className="aspect-[4/3] w-full flex items-center justify-center text-ink-soft text-sm font-mono">
        No connections yet — run the seed script.
      </div>
    );
  }

  const points = layout(state.nodes, width, height);
  const posByName = Object.fromEntries(points.map((p) => [p.name, p]));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto"
      role="img"
      aria-label="Preview of the mentorship network graph"
    >
      {state.edges.map((e, i) => {
        const a = posByName[e.source];
        const b = posByName[e.target];
        if (!a || !b) return null;
        return (
          <line
            key={i}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="var(--border)"
            strokeWidth="1.4"
          />
        );
      })}
      {points.map((p, i) => (
        <g key={p.name}>
          <circle
            cx={p.x}
            cy={p.y}
            r={7}
            fill={i % 2 === 0 ? "var(--teal)" : "var(--ochre)"}
            stroke="var(--surface)"
            strokeWidth="2"
          />
          <text
            x={p.x}
            y={p.y - 12}
            textAnchor="middle"
            className="font-mono"
            fontSize="9"
            fill="var(--ink-soft)"
          >
            {p.name.split(" ")[0]}
          </text>
        </g>
      ))}
    </svg>
  );
}
