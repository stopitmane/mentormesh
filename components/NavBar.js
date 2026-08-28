import Link from "next/link";

const links = [
  { href: "/", label: "Directory" },
  { href: "/mentor-finder", label: "Mentor Finder" },
  { href: "/skill-gap", label: "Skill Gap" },
  { href: "/path-finder", label: "Path Finder" },
];

export default function NavBar() {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <circle cx="5" cy="6" r="2.5" fill="var(--teal)" />
            <circle cx="19" cy="6" r="2.5" fill="var(--ochre)" />
            <circle cx="12" cy="18" r="2.5" fill="var(--teal)" />
            <line x1="5" y1="6" x2="12" y2="18" stroke="var(--ink-soft)" strokeWidth="1.2" />
            <line x1="19" y1="6" x2="12" y2="18" stroke="var(--ink-soft)" strokeWidth="1.2" />
          </svg>
          <span className="font-display text-lg tracking-tight text-ink">MentorMesh</span>
        </Link>
        <nav className="flex gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-md text-ink-soft hover:text-ink hover:bg-teal-tint transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
