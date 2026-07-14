import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useMotionTemplate, useTransform } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const scrollLinks = [
  ["Why TaskHub", "why"],
  ["How It Works", "how-it-works"],
];

export function Nav() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 120], [8, 20]);
  const backdrop = useMotionTemplate`blur(${blur}px) saturate(1.4)`;
  const bg = useTransform(scrollY, [0, 120], ["rgba(253,251,246,0.55)", "rgba(253,251,246,0.85)"]);

  const [activeSection, setActiveSection] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  // Track which section is currently in view
  useEffect(() => {
    const ids = ["why", "how-it-works", "footer"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileOpen(false);
  }, []);

  const handleNavClick = useCallback(
    (e, id) => {
      e.preventDefault();
      scrollTo(id);
    },
    [scrollTo]
  );

  return (
    <motion.header
      style={{ backdropFilter: backdrop, WebkitBackdropFilter: backdrop, backgroundColor: bg }}
      className="sticky top-0 z-50 border-b border-border/60"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          {scrollLinks.map(([label, id]) => (
            <button
              key={id}
              onClick={(e) => handleNavClick(e, id)}
              className={`transition-colors hover:text-ink bg-transparent border-none cursor-pointer p-0 ${
                activeSection === id ? "text-ink" : ""
              }`}
            >
              {label}
            </button>
          ))}
          <Link to="/tasks" className="transition-colors hover:text-ink">
            Open Tasks
          </Link>
          <button
            onClick={(e) => handleNavClick(e, "footer")}
            className={`transition-colors hover:text-ink bg-transparent border-none cursor-pointer p-0 ${
              activeSection === "footer" ? "text-ink" : ""
            }`}
          >
            About
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden sm:inline-flex text-sm text-muted-foreground hover:text-ink px-3 py-2 transition-colors"
          >
            Sign in
          </Link>
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
          >
            Get Started
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden ml-2 p-1.5 text-muted-foreground hover:text-ink bg-transparent border-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden border-t border-border/60 bg-background/95 px-6 pb-4 pt-3 flex flex-col gap-3 text-sm text-muted-foreground"
        >
          {scrollLinks.map(([label, id]) => (
            <button
              key={id}
              onClick={(e) => handleNavClick(e, id)}
              className={`text-left transition-colors hover:text-ink bg-transparent border-none cursor-pointer p-0 ${
                activeSection === id ? "text-ink" : ""
              }`}
            >
              {label}
            </button>
          ))}
          <Link to="/tasks" className="transition-colors hover:text-ink" onClick={() => setMobileOpen(false)}>
            Open Tasks
          </Link>
          <button
            onClick={(e) => handleNavClick(e, "footer")}
            className={`text-left transition-colors hover:text-ink bg-transparent border-none cursor-pointer p-0 ${
              activeSection === "footer" ? "text-ink" : ""
            }`}
          >
            About
          </button>
          <Link to="/login" className="transition-colors hover:text-ink sm:hidden" onClick={() => setMobileOpen(false)}>
            Sign in
          </Link>
        </motion.nav>
      )}
    </motion.header>
  );
}