import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, useScroll, useMotionTemplate, useTransform } from "framer-motion";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./landing/Logo";
import LogoutDialog from "./LogoutDialog";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  /* ── Glass-morph scroll effect (same as landing Nav) ──────── */
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 120], [8, 20]);
  const backdrop = useMotionTemplate`blur(${blur}px) saturate(1.4)`;
  const bg = useTransform(
    scrollY,
    [0, 120],
    ["rgba(253,251,246,0.55)", "rgba(253,251,246,0.85)"]
  );

  const handleLogout = () => {
    logout();
    navigate("/login");
    setShowLogoutDialog(false);
  };

  /* ── Role-aware helpers ───────────────────────────────────── */
  const dashboardPath =
    user?.role === "company" ? "/company-dashboard" : "/individual-dashboard";

  const navLinks = [
    { label: "Dashboard", to: dashboardPath },
    {
      label: user?.role === "company" ? "My Tasks" : "Browse Tasks",
      to: "/tasks",
    },
    ...(user?.role === "company"
      ? [{ label: "Applicants", to: "/company-applicants" }]
      : []),
    { label: "Profile", to: "/profile" },
  ];

  /* ── Active link class helper ─────────────────────────────── */
  const linkBase =
    "transition-colors text-sm text-muted-foreground hover:text-ink";
  const linkActive = "text-ink";

  const closeMobile = () => setMobileOpen(false);

  return (
    <motion.header
      style={{
        backdropFilter: backdrop,
        WebkitBackdropFilter: backdrop,
        backgroundColor: bg,
      }}
      className="sticky top-0 z-50 border-b border-border/60"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* ── Logo ──────────────────────────────────────────── */}
        <Logo to={dashboardPath} />

        {/* ── Desktop nav ───────────────────────────────────── */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === dashboardPath}
              className={({ isActive }) =>
                `${linkBase} ${isActive ? linkActive : ""}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* ── Desktop right actions ─────────────────────────── */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLogoutDialog(true)}
            className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-surface cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>



          {/* ── Mobile hamburger ─────────────────────────────── */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden ml-2 p-1.5 text-muted-foreground hover:text-ink bg-transparent border-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ────────────────────────────────────── */}
      {mobileOpen && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="md:hidden border-t border-border/60 bg-background/95 px-6 pb-4 pt-3 flex flex-col gap-3 text-sm text-muted-foreground"
        >
          {navLinks.map(({ label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === dashboardPath}
              onClick={closeMobile}
              className={({ isActive }) =>
                `transition-colors hover:text-ink ${isActive ? "text-ink" : ""}`
              }
            >
              {label}
            </NavLink>
          ))}

          <button
            onClick={() => {
              closeMobile();
              setShowLogoutDialog(true);
            }}
            className="text-left transition-colors hover:text-ink bg-transparent border-none cursor-pointer p-0 text-sm text-muted-foreground flex items-center gap-1.5"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>


        </motion.nav>
      )}

      {/* ── Logout confirmation dialog ────────────────────── */}
      <LogoutDialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
      />
    </motion.header>
  );
}

export default Navbar;