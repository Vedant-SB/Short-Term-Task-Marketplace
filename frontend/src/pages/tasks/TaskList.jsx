import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Layers3,
  IndianRupee,
  CalendarClock,
  Wrench,
  CircleDot,
  ArrowUpDown,
  SlidersHorizontal,
  Building2,
  Clock,
  ArrowRight,
  FolderOpen,
  SearchX,
  CalendarDays,
  Users,
} from "lucide-react";
import api from "../../api/axios";

/* ── Category accent map (same as landing page) ──────────── */
const CATEGORY_ACCENT = {
  Design: "var(--accent)",
  Development: "var(--primary)",
  Data: "var(--sky)",
  Writing: "var(--gold)",
  Research: "var(--sky)",
  Marketing: "var(--gold)",
  Other: "var(--accent)",
};

/* ── Helpers ──────────────────────────────────────────────── */
function getDaysLeft(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
}

function getUrgency(daysLeft) {
  if (daysLeft === null || daysLeft < 0) return "expired";
  if (daysLeft === 0) return "critical";
  if (daysLeft <= 2) return "critical";
  if (daysLeft <= 7) return "warning";
  return "safe";
}

function getDeadlineLabel(daysLeft) {
  if (daysLeft === null) return "No deadline";
  if (daysLeft < 0) return "Deadline Passed";
  if (daysLeft === 0) return "Ends Today";
  if (daysLeft === 1) return "Ends Tomorrow";
  return `${daysLeft} Days Left`;
}

function formatPostedDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Posted today";
  if (diffDays === 1) return "Posted 1 day ago";
  if (diffDays < 7) return `Posted ${diffDays} days ago`;
  return `Posted on ${d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`;
}

const URGENCY_STYLES = {
  safe: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    bg: "bg-emerald-50/80",
    border: "border-emerald-200/80",
    edge: "from-emerald-400/30 via-emerald-300/10",
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50/80",
    border: "border-amber-200/80",
    edge: "from-amber-400/30 via-amber-300/10",
  },
  critical: {
    dot: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50/80",
    border: "border-red-200/80",
    edge: "from-red-400/30 via-red-300/10",
  },
  expired: {
    dot: "bg-gray-400",
    text: "text-gray-500",
    bg: "bg-gray-100/70",
    border: "border-gray-200",
    edge: "from-gray-300/25 via-gray-200/8",
  },
};

const STATUS_BADGE = {
  open: { label: "Open", cls: "bg-emerald-50 text-emerald-700 border-emerald-300" },
  in_progress: { label: "In Progress", cls: "bg-sky-50 text-sky-700 border-sky-300" },
  under_review: { label: "Under Review", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  completed: { label: "Completed", cls: "bg-gray-100 text-gray-500 border-gray-300" },
  revision_requested: { label: "Revision", cls: "bg-orange-50 text-orange-700 border-orange-300" },
};

const inputCls =
  "w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 text-sm text-ink placeholder:text-muted-foreground shadow-sm transition-all duration-200 focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/20";

const compactSelectCls =
  "w-full rounded-lg border border-border bg-background/75 px-3 py-2 text-sm text-ink shadow-sm transition-all duration-200 focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/20 appearance-none";

const sectionLabelCls =
  "mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground";

function FilterControls() {
  return (
    <div className="space-y-4">
      <div>
        <label className={sectionLabelCls}>
          <Search className="h-3.5 w-3.5" />
          Search
        </label>
        <input
          type="text"
          placeholder="Search by title, company, or skill"
          className={inputCls}
          disabled
        />
      </div>

      <div className="space-y-2.5 rounded-xl border border-border/70 bg-background/45 p-3.5">
        <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Quick Filters
        </p>

        <div className="grid grid-cols-1 gap-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex w-20 items-center gap-1.5 text-xs text-muted-foreground">
              <Layers3 className="h-3.5 w-3.5" />
              Category
            </span>
            <select className={compactSelectCls} disabled>
              <option>All categories</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex w-20 items-center gap-1.5 text-xs text-muted-foreground">
              <IndianRupee className="h-3.5 w-3.5" />
              Budget
            </span>
            <select className={compactSelectCls} disabled>
              <option>Any budget</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex w-20 items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              Duration
            </span>
            <select className={compactSelectCls} disabled>
              <option>Any duration</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex w-20 items-center gap-1.5 text-xs text-muted-foreground">
              <Wrench className="h-3.5 w-3.5" />
              Skills
            </span>
            <select className={compactSelectCls} disabled>
              <option>All skills</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex w-20 items-center gap-1.5 text-xs text-muted-foreground">
              <CircleDot className="h-3.5 w-3.5" />
              Status
            </span>
            <select className={compactSelectCls} disabled>
              <option>All statuses</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex w-20 items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort
            </span>
            <select className={compactSelectCls} disabled>
              <option>Newest first</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskList() {

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const activeFilterCount = 0;

  useEffect(() => {

    const fetchTasks = async () => {

      try {

        const response = await api.get("/tasks");

        setTasks(response.data.tasks);

      } catch (error) {

        console.log(error);

      } finally {

        setLoading(false);

      }

    };

    fetchTasks();

  }, []);

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-50" />
        <div className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
          {/* Skeleton header */}
          <div className="mb-8 animate-pulse rounded-3xl border border-border bg-card/85 px-5 py-4 shadow-elegant md:px-6 md:py-5">
            <div className="h-3 w-28 rounded bg-surface-2 mb-4" />
            <div className="h-8 w-48 rounded bg-surface-2 mb-2" />
            <div className="h-4 w-80 rounded bg-surface-2" />
          </div>

          {/* Skeleton cards */}
          <div className="mx-auto max-w-4xl space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-border bg-card p-6 shadow-elegant"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-5 w-3/5 rounded bg-surface-2 mb-2" />
                    <div className="h-3 w-32 rounded bg-surface-2" />
                  </div>
                  <div className="h-5 w-16 rounded-full bg-surface-2" />
                </div>
                <div className="h-3 w-full rounded bg-surface-2 mb-1.5" />
                <div className="h-3 w-4/5 rounded bg-surface-2 mb-4" />
                <div className="flex gap-2 mb-5">
                  <div className="h-6 w-16 rounded-full bg-surface-2" />
                  <div className="h-6 w-14 rounded-full bg-surface-2" />
                  <div className="h-6 w-18 rounded-full bg-surface-2" />
                </div>
                <div className="border-t border-border pt-4 flex items-center justify-between">
                  <div className="flex gap-6">
                    <div className="h-4 w-20 rounded bg-surface-2" />
                    <div className="h-4 w-24 rounded bg-surface-2" />
                    <div className="h-4 w-16 rounded bg-surface-2" />
                  </div>
                  <div className="h-8 w-28 rounded-xl bg-surface-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-canvas">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-55" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10%] top-[-12%] h-72 w-72 rounded-full bg-violet/10 blur-3xl" />
        <div className="absolute left-[-6%] bottom-[8%] h-64 w-64 rounded-full bg-sky/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-10 pb-14 lg:-translate-x-3 md:pt-14 md:pb-16 xl:-translate-x-5">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mb-7 rounded-3xl border border-border bg-card/85 px-5 py-4 shadow-elegant backdrop-blur-sm md:mb-8 md:px-6 md:py-5"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(253,251,246,0.9), rgba(255,255,255,0.78))",
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                TaskHub Marketplace
              </p>
              <h1 className="mt-3 font-display text-3xl text-ink md:text-4xl">Browse Tasks</h1>
              <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground md:text-base">
                Discover structured short-term opportunities from companies across different domains.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 md:col-span-4">
              <div className="rounded-2xl border border-border bg-background/80 px-3.5 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground">Total available tasks</p>
                <p className="mt-0.5 font-display text-xl text-ink md:text-2xl">{tasks.length}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/80 px-3.5 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground">Active filters</p>
                <p className="mt-0.5 font-display text-xl text-ink md:text-2xl">{activeFilterCount}</p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[22%_minmax(0,1fr)] lg:gap-10">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0"
          >
            <div className="md:hidden">
              <details className="group rounded-2xl border border-border bg-card/90 p-4 shadow-elegant backdrop-blur-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-ink">
                  <span className="inline-flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-accent" />
                    Filters & Sorting
                  </span>
                  <span className="text-xs text-muted-foreground transition group-open:rotate-180">⌄</span>
                </summary>
                <div className="mt-4 border-t border-border pt-4">
                  <FilterControls />
                </div>
              </details>
            </div>

            <div
              className="hidden rounded-2xl border border-border bg-card/90 p-4 shadow-elegant backdrop-blur-sm md:block lg:sticky lg:top-20"
              style={{
                backgroundImage:
                  "linear-gradient(155deg, rgba(131,88,255,0.05), rgba(123,172,255,0.04) 35%, rgba(255,255,255,0.84))",
              }}
            >
              <h2 className="mb-3 inline-flex items-center gap-2 font-display text-lg text-ink">
                <SlidersHorizontal className="h-4 w-4 text-accent" />
                Filters & Sorting
              </h2>
              <FilterControls />
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0"
          >
            <div className="mx-auto max-w-4xl">
              {/* Result count */}
              {tasks.length > 0 && (
                <p className="mb-4 text-sm text-muted-foreground">
                  Showing <span className="font-medium text-ink">{tasks.length}</span> of{" "}
                  <span className="font-medium text-ink">{tasks.length}</span> tasks
                </p>
              )}

              {tasks.length === 0 ? (
                /* ── Premium empty state ─────────────────── */
                <div className="rounded-2xl border border-border bg-card/90 px-8 py-16 text-center shadow-elegant backdrop-blur-sm"
                  style={{ backgroundImage: "linear-gradient(135deg, rgba(253,251,246,0.95), rgba(255,255,255,0.85))" }}
                >
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border">
                    <SearchX className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl text-ink">No Tasks Found</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                    No tasks match your current filters. Try adjusting your search terms or clearing filters.
                  </p>
                </div>
              ) : (
                /* ── Task cards ──────────────────────────── */
                <div className="space-y-5">
                  {tasks.map((task, i) => {
                    const daysLeft = getDaysLeft(task.applicationDeadline);
                    const urgency = getUrgency(daysLeft);
                    const uStyle = URGENCY_STYLES[urgency];
                    const statusInfo = STATUS_BADGE[task.status] || STATUS_BADGE.open;
                    const skills = task.skillsRequired || [];
                    const visibleSkills = skills.slice(0, 4);
                    const extraCount = skills.length - 4;
                    const postedLabel = formatPostedDate(task.createdAt);

                    return (
                      <motion.article
                        key={task._id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.45,
                          delay: Math.min(i * 0.05, 0.3),
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        whileHover={{ y: -3 }}
                        className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-elegant transition-shadow duration-300 hover:shadow-lift"
                      >
                        {/* Right edge urgency accent */}
                        <div
                          className={`pointer-events-none absolute right-0 top-0 bottom-0 w-[3px] bg-gradient-to-l ${uStyle.edge} to-transparent transition-opacity duration-300 opacity-60 group-hover:opacity-100`}
                        />

                        <div className="p-5 md:p-6">
                          {/* ── Top row: Title/Company + Status/Applicants */}
                          <div className="flex items-start justify-between gap-4 mb-3">
                            {/* Left: title + company + posted */}
                            <div className="min-w-0 flex-1">
                              <h3 className="font-display text-lg leading-snug text-ink truncate">
                                {task.title}
                              </h3>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1">
                                <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Building2 className="h-3 w-3" strokeWidth={1.8} />
                                  {task.postedBy?.companyName || "Company"}
                                </p>
                                {postedLabel && (
                                  <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
                                    <CalendarDays className="h-3 w-3" strokeWidth={1.6} />
                                    {postedLabel}
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Right: status + applicants */}
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${statusInfo.cls}`}
                              >
                                {statusInfo.label}
                              </span>
                              {task.applicationCount != null && task.applicationCount > 0 && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/70">
                                  <Users className="h-3 w-3" strokeWidth={1.6} />
                                  {task.applicationCount} Applicant{task.applicationCount !== 1 ? "s" : ""}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* ── Description (clamped) ────────── */}
                          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                            {task.description}
                          </p>

                          {/* ── Skill chips ──────────────────── */}
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-5">
                              {visibleSkills.map((s) => (
                                <span
                                  key={s}
                                  className="inline-flex items-center rounded-full bg-surface border border-border/60 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                                >
                                  {s}
                                </span>
                              ))}
                              {extraCount > 0 && (
                                <span className="inline-flex items-center rounded-full bg-surface-2 border border-border/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                                  +{extraCount}
                                </span>
                              )}
                            </div>
                          )}

                          {/* ── Bottom: Metadata + Deadline + CTA */}
                          <div className="border-t border-border/60 pt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
                            {/* Budget */}
                            <div className="flex items-center gap-1.5">
                              <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.6} />
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground leading-none">Budget</p>
                                <p className="font-display text-base text-ink leading-tight">
                                  ₹{task.budget?.toLocaleString("en-IN") ?? 0}
                                </p>
                              </div>
                            </div>

                            {/* Category */}
                            <div className="flex items-center gap-1.5">
                              <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.6} />
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground leading-none">Category</p>
                                <p className="text-sm text-ink leading-tight">{task.category || "—"}</p>
                              </div>
                            </div>

                            {/* Duration */}
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.6} />
                              <div>
                                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground leading-none">Duration</p>
                                <p className="text-sm text-ink leading-tight">{task.duration} Days</p>
                              </div>
                            </div>

                            {/* Spacer */}
                            <div className="flex-1" />

                            {/* Deadline urgency badge */}
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-300 group-hover:shadow-md ${uStyle.bg} ${uStyle.text} ${uStyle.border}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${uStyle.dot}`} />
                              {getDeadlineLabel(daysLeft)}
                            </span>

                            {/* View Details button */}
                            <Link
                              to={`/tasks/${task._id}`}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elegant hover:brightness-110 group/btn"
                            >
                              View Details
                              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                            </Link>
                          </div>
                        </div>
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}

export default TaskList;