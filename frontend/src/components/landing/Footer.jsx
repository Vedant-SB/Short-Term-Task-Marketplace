import { Logo } from "./Logo";

const links = [
  ["About", "#"],
  ["Contact", "#"],
  ["Privacy", "#"],
  ["Terms", "#"],
  ["GitHub", "https://github.com"],
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-sm text-muted-foreground max-w-sm">
            The marketplace for short-term, high-trust project work.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {links.map(([label, href]) => (
            <a key={label} href={href} className="hover:text-ink transition-colors">{label}</a>
          ))}
        </nav>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 py-4 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-2">
          <p>© {new Date().getFullYear()} TaskHub Labs, Inc.</p>
          <p>Made for the work that matters.</p>
        </div>
      </div>
    </footer>
  );
}