export function Loading({ label = "Loading…" }) {
  return (
    <div className="flex items-center gap-3 text-ink-soft py-10 justify-center">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="var(--border)" strokeWidth="3" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="var(--teal)" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="font-mono text-xs tracking-wide">{label}</span>
    </div>
  );
}

export function Empty({ title, hint }) {
  return (
    <div className="text-center py-14 px-6 border border-dashed border-border rounded-lg bg-surface/50">
      <p className="font-display text-lg text-ink">{title}</p>
      {hint && <p className="text-sm text-ink-soft mt-1 max-w-sm mx-auto">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="rounded-lg border border-danger/30 bg-danger-tint px-5 py-4">
      <p className="font-medium text-danger text-sm">Something went wrong</p>
      <p className="text-sm text-ink-soft mt-1">{message}</p>
    </div>
  );
}

export function DatabaseUnreachable() {
  return (
    <div className="rounded-lg border border-danger/30 bg-danger-tint px-5 py-4">
      <p className="font-medium text-danger text-sm">Can&apos;t reach the database</p>
      <p className="text-sm text-ink-soft mt-1">
        CognoDB didn&apos;t respond. It may be paused or the connection details in{" "}
        <code className="font-mono text-xs bg-surface px-1 py-0.5 rounded">.env.local</code> may be
        incorrect. Check your CognoDB Cloud console and try again.
      </p>
    </div>
  );
}
