import { motion, useScroll, useMotionTemplate, useTransform } from "framer-motion";
import { Logo } from "./Logo";

const links = [
  ["Open Tasks", "#tasks"],
  ["How it works", "#process"],
  ["Why TaskHub", "#why"],
];

export function Nav() {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 120], [8, 20]);
  const backdrop = useMotionTemplate`blur(${blur}px) saturate(1.4)`;
  const bg = useTransform(scrollY, [0, 120], ["rgba(253,251,246,0.55)", "rgba(253,251,246,0.85)"]);
  return (
    <motion.header
      style={{ backdropFilter: backdrop, WebkitBackdropFilter: backdrop, backgroundColor: bg }}
      className="sticky top-0 z-50 border-b border-border/60"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {links.map(([label, href]) => (
            <a key={href} href={href} className="transition-colors hover:text-ink">{label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="#" className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-ink px-3 py-2 transition-colors">Sign in</a>
          <a href="#cta" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5">
            Post a Task
          </a>
        </div>
      </div>
    </motion.header>
  );
}