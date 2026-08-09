import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Layers3,
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
  IndianRupee,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

/* ── Category accent map ─────────────────────────────────── */
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
  if (daysLeft < 0) return "Closed";
  if (daysLeft === 0) return "Ends Today";
  if (daysLeft === 1) return "1 Day Left to Apply";
  return `${daysLeft} Days Left to Apply`;
}

function formatPostedDate(dateStr, relativeStr) {
  if (dateStr) {
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) {
      return `Posted on ${d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`;
    }
  }

  if (relativeStr) return `Posted ${relativeStr}`;
  return null;
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const URGENCY_STYLES = {
  safe: {
    dot: "bg-emerald-500",
    text: "text-emerald-800",
    bg: "bg-emerald-100/92",
    border: "border-emerald-300/90",
    wash: "from-emerald-200/46 via-emerald-100/30 to-transparent",
    washHover: "group-hover:from-emerald-200/56 group-hover:via-emerald-100/38",
    glow: "bg-emerald-400/55 group-hover:bg-emerald-400/70",
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-800",
    bg: "bg-amber-100/92",
    border: "border-amber-300/90",
    wash: "from-amber-200/46 via-amber-100/30 to-transparent",
    washHover: "group-hover:from-amber-200/58 group-hover:via-amber-100/40",
    glow: "bg-amber-400/55 group-hover:bg-amber-400/70",
  },
  critical: {
    dot: "bg-red-500",
    text: "text-red-800",
    bg: "bg-red-100/95",
    border: "border-red-300",
    wash: "from-rose-200/48 via-rose-100/32 to-transparent",
    washHover: "group-hover:from-rose-200/62 group-hover:via-rose-100/44",
    glow: "bg-rose-400/58 group-hover:bg-rose-400/74",
  },
  expired: {
    dot: "bg-gray-400",
    text: "text-gray-600",
    bg: "bg-gray-100/90",
    border: "border-gray-300/90",
    wash: "from-gray-200/44 via-gray-100/28 to-transparent",
    washHover: "group-hover:from-gray-200/58 group-hover:via-gray-100/40",
    glow: "bg-gray-400/48 group-hover:bg-gray-400/62",
  },
};

const STATUS_BADGE = {
  open: { label: "Open", cls: "bg-emerald-100 text-emerald-900 border-emerald-400" },
  in_progress: { label: "In Progress", cls: "bg-sky-50 text-sky-700 border-sky-300" },
  under_review: { label: "Under Review", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  completed: { label: "Completed", cls: "bg-gray-100 text-gray-500 border-gray-300" },
  revision_requested: { label: "Revision", cls: "bg-orange-50 text-orange-700 border-orange-300" },
  closed: { label: "Closed", cls: "bg-gray-100 text-gray-400 border-gray-300" },
};

const inputCls =
  "w-full rounded-xl border border-border bg-background/70 px-4 py-2.5 text-sm text-ink placeholder:text-muted-foreground shadow-sm transition-all duration-200 focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/20";

const compactSelectCls =
  "w-full rounded-lg border border-border bg-background/75 px-3 py-2 text-sm text-ink shadow-sm transition-all duration-200 focus:border-accent focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer";

const sectionLabelCls =
  "mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground";

function FilterControls({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedStatus,
  setSelectedStatus,
  sortBy,
  setSortBy,
  isCompany,
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className={sectionLabelCls}>
          <Search className="h-3.5 w-3.5" />
          Search
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isCompany ? "Search your tasks..." : "Search by title, company, or skill"}
          className={inputCls}
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
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={compactSelectCls}
            >
              <option value="all">All categories</option>
              <option value="Development">Development</option>
              <option value="Design">Design</option>
              <option value="Data">Data</option>
              <option value="Writing">Writing</option>
              <option value="Research">Research</option>
              <option value="Marketing">Marketing</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex w-20 items-center gap-1.5 text-xs text-muted-foreground">
              <CircleDot className="h-3.5 w-3.5" />
              Status
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className={compactSelectCls}
            >
              <option value="all">All statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="under_review">Under Review</option>
              <option value="revision_requested">Revision Requested</option>
              <option value="completed">Completed</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex w-20 items-center gap-1.5 text-xs text-muted-foreground">
              <ArrowUpDown className="h-3.5 w-3.5" />
              Sort
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={compactSelectCls}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="budget_high">Budget: High to Low</option>
              <option value="budget_low">Budget: Low to High</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskList() {
  const { user } = useAuth();
  const isCompany = user?.role === "company";

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const endpoint = isCompany ? "/tasks/my-tasks" : "/tasks";
        const response = await api.get(endpoint);
        setTasks(response.data.tasks || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [isCompany]);

  // Filtering & Sorting
  let filteredTasks = tasks.filter((t) => {
    if (selectedCategory !== "all" && t.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== "all" && t.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = t.title?.toLowerCase().includes(q);
      const categoryMatch = t.category?.toLowerCase().includes(q);
      const companyMatch = t.postedBy?.companyName?.toLowerCase().includes(q);
      const skillsMatch = t.skillsRequired?.some((s) => s.toLowerCase().includes(q));
      if (!titleMatch && !categoryMatch && !companyMatch && !skillsMatch) {
        return false;
      }
    }
    return true;
  });

  filteredTasks.sort((a, b) => {
    if (sortBy === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
    if (sortBy === "budget_high") {
      return (b.budget || 0) - (a.budget || 0);
    }
    if (sortBy === "budget_low") {
      return (a.budget || 0) - (b.budget || 0);
    }
    // newest default
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const activeFilterCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedStatus !== "all" ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-50" />
        <div className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="mb-8 animate-pulse rounded-3xl border border-border bg-card/85 px-5 py-4 shadow-elegant md:px-6 md:py-5">
            <div className="h-3 w-28 rounded bg-surface-2 mb-4" />
            <div className="h-8 w-48 rounded bg-surface-2 mb-2" />
            <div className="h-4 w-80 rounded bg-surface-2" />
          </div>

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
                {isCompany ? "Company Task Management" : "TaskHub Marketplace"}
              </p>
              <h1 className="mt-3 font-display text-3xl text-ink md:text-4xl">
                {isCompany ? "My Tasks" : "Browse Tasks"}
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground md:text-base">
                {isCompany
                  ? "Manage and track all tasks posted by your company."
                  : "Discover structured short-term opportunities from companies across different domains."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 md:col-span-4">
              <div className="rounded-2xl border border-border bg-background/80 px-3.5 py-2.5">
                <p className="text-[10px] uppercase tracking-[0.13em] text-muted-foreground">
                  {isCompany ? "Total Posted Tasks" : "Total Available Tasks"}
                </p>
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
                  <FilterControls
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                    isCompany={isCompany}
                  />
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
              <FilterControls
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedStatus={selectedStatus}
                setSelectedStatus={setSelectedStatus}
                sortBy={sortBy}
                setSortBy={setSortBy}
                isCompany={isCompany}
              />
            </div>
          </motion.aside>

          <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="min-w-0"
          >
            <div className="mx-auto max-w-4xl">

              {filteredTasks.length === 0 ? (
                <div
                  className="rounded-2xl border border-border bg-card/90 px-8 py-16 text-center shadow-elegant backdrop-blur-sm"
                  style={{ backgroundImage: "linear-gradient(135deg, rgba(253,251,246,0.95), rgba(255,255,255,0.85))" }}
                >
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border">
                    <SearchX className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl text-ink">No Tasks Found</h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                    {isCompany
                      ? "You haven't posted any tasks matching these filters yet."
                      : "No tasks match your current filters. Try adjusting your search terms or clearing filters."}
                  </p>
                  {isCompany && (
                    <Link
                      to="/tasks/create"
                      className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
                    >
                      Create Task
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredTasks.map((task, i) => {
                    const daysLeft = getDaysLeft(task.applicationDeadline);
                    const urgency = getUrgency(daysLeft);
                    const uStyle = URGENCY_STYLES[urgency];
                    const statusInfo = STATUS_BADGE[task.status] || STATUS_BADGE.open;
                    const skills = task.skillsRequired || [];
                    const visibleSkills = skills.slice(0, 4);
                    const extraCount = skills.length - 4;
                    const postedLabel = formatPostedDate(
                      task.createdAt,
                      task.postedAgo || task.postedRelativeTime
                    );
                    const deadlineDateLabel = formatDisplayDate(task.applicationDeadline);

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
                        className="group relative overflow-hidden rounded-[18px] border border-zinc-200/80 bg-white shadow-[0_10px_26px_rgba(15,23,42,0.07)] transition-all duration-300 hover:shadow-[0_18px_34px_rgba(15,23,42,0.11)]"
                      >
                        <div
                          className={`pointer-events-none absolute right-0 top-0 bottom-0 w-[11%] min-w-[78px] bg-gradient-to-l ${uStyle.wash} ${uStyle.washHover} opacity-80 transition-opacity duration-300 group-hover:opacity-100`}
                        />
                        <div
                          className={`pointer-events-none absolute right-0 top-4 bottom-4 w-[5px] rounded-full blur-[2.5px] transition-all duration-300 group-hover:w-[6px] ${uStyle.glow}`}
                        />

                        <div className="p-6 md:p-6">
                          <div className="mb-3 flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate font-display text-[1.3rem] font-bold leading-snug text-slate-900">
                                {task.title}
                              </h3>
                              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                                <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Building2 className="h-3 w-3" strokeWidth={1.8} />
                                  {task.postedBy?.companyName || "Company"}
                                </p>
                                {postedLabel && <span className="text-muted-foreground/60">•</span>}
                                {postedLabel && (
                                  <p className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground/85">
                                    <CalendarDays className="h-3 w-3" strokeWidth={1.7} />
                                    {postedLabel}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-1.5">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[13px] font-extrabold leading-none ${statusInfo.cls}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>
                          </div>

                          <p className="mb-4 line-clamp-3 text-sm leading-6 text-slate-600">
                            {task.description}
                          </p>

                          {skills.length > 0 && (
                            <div className="mb-5 flex flex-wrap gap-2">
                              {visibleSkills.map((s) => (
                                <span
                                  key={s}
                                  className="inline-flex items-center rounded-full border border-violet-200/70 bg-violet-50/85 px-3 py-1 text-[11px] font-medium text-violet-700"
                                >
                                  {s}
                                </span>
                              ))}
                              {extraCount > 0 && (
                                <span className="inline-flex items-center rounded-full border border-violet-200/70 bg-violet-50/85 px-3 py-1 text-[11px] font-semibold text-violet-700">
                                  +{extraCount}
                                </span>
                              )}
                            </div>
                          )}

                          <div className="border-t border-zinc-200/70 pt-4">
                            <div className="flex w-full flex-wrap items-stretch divide-x divide-zinc-200/70">
                              <div className="min-w-[130px] flex-1 px-4 py-1.5">
                                <div className="inline-flex items-center gap-2">
                                  <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.7} />
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Budget</p>
                                </div>
                                <p className="mt-1 font-display text-base font-bold leading-tight text-slate-900">
                                  ₹{task.budget?.toLocaleString("en-IN") ?? 0}
                                </p>
                              </div>

                              <div className="min-w-[120px] flex-1 px-4 py-1.5">
                                <div className="inline-flex items-center gap-2">
                                  <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.7} />
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Category</p>
                                </div>
                                <p className="mt-1 text-base font-semibold leading-tight text-slate-900">{task.category || "—"}</p>
                              </div>

                              <div className="min-w-[120px] flex-1 px-4 py-1.5">
                                <div className="inline-flex items-center gap-2">
                                  <Clock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.7} />
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Duration</p>
                                </div>
                                <p className="mt-1 text-base font-semibold leading-tight text-slate-900">{task.duration} Days</p>
                              </div>

                              <div className="min-w-[210px] flex-[1.25] px-4 py-1.5">
                                <span
                                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-bold shadow-sm transition-all duration-300 group-hover:brightness-105 ${uStyle.bg} ${uStyle.text} ${uStyle.border}`}
                                >
                                  <span className={`h-2 w-2 rounded-full ${uStyle.dot}`} />
                                  {getDeadlineLabel(daysLeft)}
                                </span>
                                {deadlineDateLabel && (
                                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/85">
                                    <CalendarDays className="h-3 w-3" strokeWidth={1.7} />
                                    Deadline: {deadlineDateLabel}
                                  </p>
                                )}
                              </div>

                              <div className="ml-auto flex min-w-[170px] items-center justify-end px-4 py-1.5">
                                <Link
                                  to={`/tasks/${task._id}`}
                                  className="group/btn inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elegant hover:brightness-110"
                                >
                                  View Details
                                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
                                </Link>
                              </div>
                            </div>
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