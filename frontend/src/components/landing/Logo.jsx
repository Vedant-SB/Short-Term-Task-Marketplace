import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-elegant">
        <span className="absolute inset-0 rounded-[10px] bg-gradient-to-br from-accent/40 to-transparent" />
        <svg viewBox="0 0 24 24" className="relative h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M4 12h6l2 -4l2 8l2 -4h4" />
        </svg>
      </span>
      <span className="font-display text-[19px] font-medium tracking-tight text-ink">TaskHub</span>
    </Link>
  );
}