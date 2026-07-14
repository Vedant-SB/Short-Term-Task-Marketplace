import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Section, Eyebrow } from "./Section";
import api from "../../api/axios";

const CATEGORY_ACCENT = {
  Design: "var(--accent)",
  Development: "var(--primary)",
  Data: "var(--sky)",
  Writing: "var(--gold)",
  Research: "var(--sky)",
  Marketing: "var(--gold)",
  Other: "var(--accent)",
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function OpenTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/tasks")
      .then((res) => {
        // Newest first, take up to 4
        const sorted = (res.data.tasks || [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4);
        setTasks(sorted);
      })
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Section id="tasks" className="relative bg-surface py-20 border-y border-border">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex items-end justify-between flex-wrap gap-6">
          <div>
            <Eyebrow>Live on TaskHub</Eyebrow>
            <h2 className="mt-3 font-display text-3xl md:text-4xl text-ink text-balance">Open Tasks</h2>
          </div>
          <Link
            to="/tasks"
            className="text-sm font-medium text-ink border-b border-ink/20 pb-0.5 hover:border-accent hover:text-accent transition-colors"
          >
            Browse All Tasks →
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? /* Skeleton cards */
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-6 shadow-elegant animate-pulse"
                >
                  <div className="h-3 w-16 rounded bg-surface-2 mb-6" />
                  <div className="h-5 w-full rounded bg-surface-2 mb-2" />
                  <div className="h-5 w-2/3 rounded bg-surface-2 mb-4" />
                  <div className="flex gap-1.5 mb-6">
                    <div className="h-5 w-14 rounded-full bg-surface-2" />
                    <div className="h-5 w-14 rounded-full bg-surface-2" />
                  </div>
                  <div className="border-t border-border pt-5">
                    <div className="h-6 w-20 rounded bg-surface-2" />
                  </div>
                </div>
              ))
            : tasks.length === 0
            ? /* Empty state */
              <div className="col-span-full py-12 text-center">
                <p className="text-lg text-muted-foreground">No open tasks right now. Check back soon.</p>
              </div>
            : tasks.map((t, i) => (
                <motion.article
                  key={t._id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -4 }}
                  className="group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-elegant"
                >
                  {/* Category + Duration */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{ background: CATEGORY_ACCENT[t.category] || "var(--accent)" }}
                      />
                      {t.category}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{t.duration} days</span>
                  </div>

                  {/* Title */}
                  <h3 className="mt-5 font-display text-lg leading-snug text-ink text-balance">{t.title}</h3>

                  {/* Company */}
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {t.postedBy?.companyName || "Company"}
                  </p>

                  {/* Skills */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {(t.skillsRequired || []).slice(0, 4).map((s) => (
                      <span key={s} className="text-[10.5px] px-2 py-0.5 rounded-full bg-surface border border-border text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Bottom row */}
                  <div className="mt-6 pt-5 border-t border-border flex items-end justify-between">
                    <div>
                      <p className="font-display text-xl text-ink">₹{t.budget?.toLocaleString("en-IN") ?? 0}</p>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">fixed price</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Open
                      </span>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Apply by {formatDate(t.applicationDeadline)}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
        </div>

        {/* Bottom CTA */}
        {!loading && tasks.length > 0 && (
          <div className="mt-10 text-center">
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 text-sm font-medium text-ink border-b border-ink/20 pb-0.5 hover:border-accent hover:text-accent transition-colors"
            >
              Browse All Tasks →
            </Link>
          </div>
        )}
      </div>
    </Section>
  );
}