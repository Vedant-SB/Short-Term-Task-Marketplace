import { Outlet, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "../components/landing/Logo";

/**
 * Minimal authentication layout for Login / Register pages.
 * - Premium canvas background matching the landing page aesthetic.
 * - TaskHub logo linking to "/" at the top.
 * - No authenticated Navbar.
 * - Content centered horizontally with comfortable top spacing.
 */
export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-canvas">
      {/* Subtle grid texture behind */}
      <div className="fixed inset-0 bg-grid pointer-events-none" />

      <div className="relative mx-auto max-w-xl px-6 pt-10 sm:pt-14 pb-16">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex justify-center"
        >
          <Logo />
        </motion.div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-2xl border border-border bg-card/90 shadow-elegant backdrop-blur-sm p-7 sm:p-9"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(253,251,246,0.95), rgba(255,255,255,0.85))",
          }}
        >
          <Outlet />
        </motion.div>

        {/* Footer link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          <Link to="/" className="transition-colors hover:text-ink">
            &larr; Back to home
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
