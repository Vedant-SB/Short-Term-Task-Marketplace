import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/useAuth";
import api from "../../api/axios";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

/* ── Abstract ecosystem illustration ───────────────────────────────── */
function EcosystemIllustration() {
  return (
    <div className="relative rounded-[28px] overflow-hidden shadow-lift bg-card border border-border p-8 md:p-10 aspect-[4/5] flex flex-col justify-between">
      {/* Decorative radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(400px 300px at 50% 30%, color-mix(in oklch, var(--accent) 12%, transparent), transparent 65%), radial-gradient(300px 250px at 80% 75%, color-mix(in oklch, var(--sky) 15%, transparent), transparent 60%)",
        }}
      />

      {/* Companies tier */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Companies</p>
        <div className="flex items-center gap-3">
          {[
            { gradient: "from-primary to-accent", icon: "M3 21h18M3 7v1a3 3 0 006 0V7m0 0v1a3 3 0 006 0V7m0 0v1a3 3 0 006 0V7M3 7h18" },
            { gradient: "from-sky to-accent", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-16 0H3m5-12h4m-4 4h4" },
            { gradient: "from-gold to-sky", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-elegant`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Connecting flow — top */}
      <div className="relative z-10 flex flex-col items-center gap-1 py-2">
        <div className="w-px h-6 bg-gradient-to-b from-border to-accent/40" />
        <svg className="h-3 w-3 text-accent/60" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0L12 6H0z" transform="rotate(180 6 6)" /></svg>
      </div>

      {/* Platform hub */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 mx-auto"
      >
        <div className="relative rounded-2xl border border-border bg-card p-5 shadow-lift max-w-[240px] mx-auto">
          <div
            className="absolute inset-0 rounded-2xl opacity-50"
            style={{ background: "linear-gradient(135deg, color-mix(in oklch, var(--primary) 8%, transparent), color-mix(in oklch, var(--accent) 6%, transparent))" }}
          />
          <div className="relative flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-elegant flex-shrink-0">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M4 12h6l2 -4l2 8l2 -4h4" />
              </svg>
            </span>
            <div>
              <p className="font-display text-base text-ink leading-tight">TaskHub</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Structured marketplace</p>
            </div>
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            {["Post", "Apply", "Review"].map((step) => (
              <span key={step} className="text-[10px] text-center py-1.5 px-1 rounded-lg bg-surface border border-border text-muted-foreground">
                {step}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Connecting flow — bottom */}
      <div className="relative z-10 flex flex-col items-center gap-1 py-2">
        <div className="w-px h-6 bg-gradient-to-b from-accent/40 to-border" />
        <svg className="h-3 w-3 text-accent/60" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0L12 6H0z" transform="rotate(180 6 6)" /></svg>
      </div>

      {/* Individuals tier */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          {[
            { label: "Students", gradient: "from-sky to-primary" },
            { label: "Freelancers", gradient: "from-accent to-primary" },
            { label: "Professionals", gradient: "from-gold to-accent" },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-2"
            >
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-elegant`}>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M20 21a8 8 0 10-16 0" />
                </svg>
              </div>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative dots */}
      <div className="absolute inset-0 bg-dots opacity-15 pointer-events-none" />
    </div>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────── */
export function Hero() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [openTaskCount, setOpenTaskCount] = useState(null);

  useEffect(() => {
    api
      .get("/tasks")
      .then((res) => {
        setOpenTaskCount(res.data.count ?? res.data.tasks?.length ?? 0);
      })
      .catch(() => setOpenTaskCount(0));
  }, []);

  const handlePostTask = () => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "company") {
      navigate("/tasks/create");
    } else {
      // Individual — cannot post tasks, redirect to their dashboard
      navigate("/individual-dashboard");
    }
  };

  return (
    <section id="top" className="relative overflow-hidden bg-canvas">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="relative mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-20 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <motion.div initial="hidden" animate="show" className="lg:col-span-6">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              The marketplace for short-term tasks
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1} className="mt-5 font-display text-[46px] md:text-[62px] leading-[1.02] text-ink text-balance">
              Short-term tasks. <em className="not-italic text-accent">Managed</em> from posting to completion.
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-5 max-w-xl text-lg text-muted-foreground">
              Whether you're posting a task or applying for one, TaskHub brings applications, candidate selection, deadlines, submissions, reviews, and portfolio building together in one structured workflow.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/tasks"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5"
              >
                Browse Tasks
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 10h11m0 0l-4-4m4 4l-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <button
                onClick={handlePostTask}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface cursor-pointer"
              >
                Post a Task
              </button>
            </motion.div>
            <motion.dl variants={fadeUp} custom={4} className="mt-10 grid grid-cols-3 gap-6 max-w-md">
              <div>
                <dt className="font-display text-2xl text-ink">
                  {openTaskCount !== null ? openTaskCount : "—"}
                </dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">open tasks</dd>
              </div>
              <div>
                <dt className="font-display text-2xl text-ink">3–7</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">day projects</dd>
              </div>
              <div>
                <dt className="font-display text-2xl text-ink">End‑to‑end</dt>
                <dd className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">structured workflow</dd>
              </div>
            </motion.dl>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 relative"
          >
            <EcosystemIllustration />
          </motion.div>
        </div>
      </div>
    </section>
  );
}