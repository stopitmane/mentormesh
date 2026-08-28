const levelStyles = {
  expert: "bg-teal-tint text-teal-dark border-teal/30",
  intermediate: "bg-ochre-tint text-ochre border-ochre/30",
  beginner: "bg-surface text-ink-soft border-border",
};

export function SkillBadge({ name, level }) {
  const style = levelStyles[level] || levelStyles.beginner;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-mono ${style}`}
    >
      {name}
      {level && <span className="opacity-70">· {level}</span>}
    </span>
  );
}

export function Tag({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-paper border border-border text-xs text-ink-soft font-mono">
      {children}
    </span>
  );
}
