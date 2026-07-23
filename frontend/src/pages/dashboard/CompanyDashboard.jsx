import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  Users,
  Star,
  Plus,
  ArrowRight,
  Eye,
  ChevronRight,
} from "lucide-react";
import api from "../../api/axios";

/* ── Status badge config (same as TaskList) ────────────────── */
const STATUS_BADGE = {
  open: { label: "Open", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  in_progress: { label: "In Progress", cls: "bg-sky-50 text-sky-700 border-sky-300" },
  under_review: { label: "Under Review", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  completed: { label: "Completed", cls: "bg-gray-100 text-gray-500 border-gray-300" },
  revision_requested: { label: "Revision", cls: "bg-orange-50 text-orange-700 border-orange-300" },
  closed: { label: "Closed", cls: "bg-gray-100 text-gray-400 border-gray-300" },
};

/* ── Category badge colors ─────────────────────────────────── */
const CATEGORY_BADGE = {
  Development: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Design: "bg-violet-50 text-violet-700 border-violet-200",
  Data: "bg-sky-50 text-sky-700 border-sky-200",
  Writing: "bg-amber-50 text-amber-700 border-amber-200",
  Research: "bg-teal-50 text-teal-700 border-teal-200",
  Marketing: "bg-rose-50 text-rose-700 border-rose-200",
  Other: "bg-gray-50 text-gray-600 border-gray-200",
};

/* ── Helpers ───────────────────────────────────────────────── */
function getDaysLeft(deadline) {
  if (!deadline) return null;
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
    "\n" +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const INITIALS_COLORS = [
  "bg-indigo-100 text-indigo-700",
  "bg-violet-100 text-violet-700",
  "bg-sky-100 text-sky-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-emerald-100 text-emerald-700",
  "bg-teal-100 text-teal-700",
];

function getInitialsColor(name) {
  if (!name) return INITIALS_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return INITIALS_COLORS[Math.abs(hash) % INITIALS_COLORS.length];
}

/* framer-motion ease & stagger */
const ease = [0.22, 1, 0.36, 1];
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

/* ── Skeleton Loader ───────────────────────────────────────── */
function DashboardSkeleton() {
  const shimmer = "animate-pulse bg-surface-2 rounded";
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto w-[94%] max-w-[1400px] py-10 md:py-14">
        {/* Hero skeleton */}
        <div className="mb-8 rounded-2xl border border-border bg-card/85 p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1 space-y-3">
              <div className={`h-8 w-72 ${shimmer}`} />
              <div className={`h-4 w-96 max-w-full ${shimmer}`} />
            </div>
            <div className="flex gap-3">
              <div className={`h-11 w-36 rounded-xl ${shimmer}`} />
              <div className={`h-11 w-40 rounded-xl ${shimmer}`} />
            </div>
          </div>
        </div>

        {/* Stat cards skeleton */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className={`mb-3 h-10 w-10 rounded-xl ${shimmer}`} />
              <div className={`mb-2 h-8 w-16 ${shimmer}`} />
              <div className={`h-3 w-20 ${shimmer}`} />
            </div>
          ))}
        </div>

        {/* Recent tasks skeleton */}
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className={`h-6 w-32 ${shimmer}`} />
            <div className={`h-4 w-28 ${shimmer}`} />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-border/50 pb-4 last:border-0 last:pb-0">
                <div className="flex-1 space-y-2">
                  <div className={`h-4 w-48 ${shimmer}`} />
                  <div className={`h-3 w-32 ${shimmer}`} />
                </div>
                <div className={`h-6 w-20 rounded-full ${shimmer}`} />
                <div className={`h-4 w-16 ${shimmer}`} />
                <div className={`h-6 w-16 rounded-full ${shimmer}`} />
                <div className={`h-4 w-8 ${shimmer}`} />
                <div className={`h-4 w-24 ${shimmer}`} />
                <div className={`h-8 w-24 rounded-lg ${shimmer}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row skeleton */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[55%_1fr]">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className={`mb-5 h-6 w-40 ${shimmer}`} />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className={`h-9 w-9 rounded-full ${shimmer}`} />
                <div className={`h-4 w-24 ${shimmer}`} />
                <div className={`h-4 w-40 ${shimmer}`} />
                <div className={`h-4 w-20 ${shimmer}`} />
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className={`mb-5 h-6 w-40 ${shimmer}`} />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-3">
                <div className={`h-4 w-36 ${shimmer}`} />
                <div className={`h-4 w-20 ${shimmer}`} />
                <div className={`h-4 w-16 ${shimmer}`} />
                <div className={`h-6 w-16 rounded-full ${shimmer}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  COMPANY DASHBOARD                                           */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function CompanyDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/dashboard/company");
        setDashboard(res.data.dashboard);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto flex w-[94%] max-w-[1400px] flex-col items-center justify-center py-32 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-red-50">
            <FileText className="h-7 w-7 text-red-400" />
          </div>
          <h2 className="font-display text-xl text-ink">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const {
    companyName,
    openTasks,
    inProgressTasks,
    completedTasks,
    applicationsReceived,
    averageRating,
    reviewCount,
    recentTasks,
    recentApplications,
    upcomingDeadlines,
  } = dashboard;

  /* ── Stat cards config ────────────────────────────────────── */
  const statCards = [
    {
      title: "Open Tasks",
      value: openTasks,
      icon: FileText,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: Clock,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Applications",
      value: applicationsReceived,
      icon: Users,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-600",
    },
    {
      title: "TaskHub Rating",
      value: averageRating || 0,
      icon: Star,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      isRating: true,
      reviewCount: reviewCount || 0,
    },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

      <div className="relative mx-auto w-[94%] max-w-[1400px] py-8 md:py-12">

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  HERO SECTION                                         */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
          className="mb-8 rounded-2xl border border-border bg-card/90 px-6 py-6 shadow-sm backdrop-blur-sm md:px-8 md:py-8"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(253,251,246,0.92), rgba(255,255,255,0.82))",
          }}
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="font-display text-2xl text-ink md:text-3xl lg:text-[2rem]">
                Welcome back, {companyName}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
                Manage your tasks, applications, and deadlines from one place.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/tasks/create"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elegant hover:brightness-110"
              >
                <Plus className="h-4 w-4" />
                Create Task
              </Link>
              <Link
                to="/company-applicants"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-surface hover:shadow-elegant"
              >
                <Users className="h-4 w-4" />
                View Applicants
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  STATISTICS CARDS                                     */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 lg:gap-5"
        >
          {statCards.map((card) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              whileHover={{ y: -3 }}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-elegant"
            >
              <div
                className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                <card.icon className={`h-5 w-5 ${card.iconColor}`} strokeWidth={1.8} />
              </div>

              <p className="font-display text-3xl font-bold text-ink">
                {card.isRating ? card.value.toFixed(1) : card.value}
              </p>

              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {card.title}
              </p>

              {card.isRating && (
                <div className="mt-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${
                          i < Math.round(card.value)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Based on {card.reviewCount} verified review{card.reviewCount !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  RECENT TASKS                                         */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease }}
          className="mb-8 rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-6 py-4 md:px-8">
            <h2 className="font-display text-lg text-ink">Recent Tasks</h2>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              View All Tasks
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentTasks.length === 0 ? (
            <div className="px-6 py-12 text-center md:px-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border">
                <FileText className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="text-sm text-muted-foreground">No tasks yet. Create your first task to get started.</p>
              <Link
                to="/tasks/create"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                <Plus className="h-4 w-4" />
                Create Task
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:px-8">
                      Task
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Budget
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Applicants
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Deadline
                    </th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground md:px-8">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map((task) => {
                    const status = STATUS_BADGE[task.status] || STATUS_BADGE.open;
                    const catCls = CATEGORY_BADGE[task.category] || CATEGORY_BADGE.Other;
                    const deadline = task.status === "open"
                      ? task.applicationDeadline
                      : task.currentDeadline;
                    const daysLeft = getDaysLeft(deadline);

                    return (
                      <tr
                        key={task._id}
                        onClick={() => navigate(`/tasks/${task._id}`)}
                        className="cursor-pointer border-b border-border/30 transition-colors duration-150 last:border-0 hover:bg-surface/50"
                      >
                        <td className="px-6 py-4 md:px-8">
                          <p className="font-medium text-ink leading-snug">{task.title}</p>
                          {task.description && (
                            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground max-w-[280px]">
                              {task.description}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${catCls}`}
                          >
                            {task.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-medium text-ink">
                            ₹{task.budget?.toLocaleString("en-IN") ?? 0}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${status.cls}`}
                          >
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-medium text-ink">{task.applicationCount}</span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-ink">{formatDate(deadline)}</p>
                          {daysLeft !== null && daysLeft >= 0 && (
                            <p className={`text-xs font-medium ${
                              daysLeft <= 2 ? "text-red-500" : daysLeft <= 7 ? "text-amber-600" : "text-emerald-600"
                            }`}>
                              {daysLeft === 0 ? "Ends today" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                            </p>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right md:px-8">
                          <Link
                            to={`/tasks/${task._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-medium text-ink shadow-sm transition-all duration-150 hover:bg-surface hover:shadow"
                          >
                            View Details
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  BOTTOM ROW: Applications | Deadlines                 */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3, ease }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[55%_1fr]"
        >
          {/* ── Recent Applications ────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <h2 className="font-display text-lg text-ink">Recent Applications</h2>
              <Link
                to="/company-applicants"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                View All Applications
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentApplications.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border">
                  <Users className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-muted-foreground">No applications received yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Applicant
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Task
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Applied On
                      </th>
                      <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApplications.map((app) => {
                      const applicant = app.applicantId;
                      const applicantName = applicant?.name || "Unknown";
                      const profileImage = applicant?.profileImage;

                      return (
                        <tr
                          key={app._id}
                          className="border-b border-border/30 transition-colors duration-150 last:border-0 hover:bg-surface/50"
                        >
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              {profileImage ? (
                                <img
                                  src={profileImage}
                                  alt={applicantName}
                                  className="h-9 w-9 rounded-full object-cover border border-border"
                                />
                              ) : (
                                <div
                                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${getInitialsColor(applicantName)}`}
                                >
                                  {getInitials(applicantName)}
                                </div>
                              )}
                              <span className="text-sm font-medium text-ink">{applicantName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-sm text-muted-foreground line-clamp-1 max-w-[180px]">
                              {app.taskId?.title || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="whitespace-pre-line text-xs text-muted-foreground">
                              {formatDateTime(app.appliedAt)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Link
                              to={`/portfolio/${applicant?._id}`}
                              className="inline-flex items-center justify-center rounded-lg border border-border bg-card p-2 text-muted-foreground shadow-sm transition-all duration-150 hover:bg-surface hover:text-ink hover:shadow"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Upcoming Deadlines ─────────────────────────────── */}
          <div className="rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
              <h2 className="font-display text-lg text-ink">Upcoming Deadlines</h2>
              <Link
                to="/tasks"
                className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {upcomingDeadlines.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border">
                  <Clock className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[420px]">
                  <thead>
                    <tr className="border-b border-border/40">
                      <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Task
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Deadline
                      </th>
                      <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Days Left
                      </th>
                      <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingDeadlines.map((task) => {
                      const deadline = task.status === "open"
                        ? task.applicationDeadline
                        : task.currentDeadline;
                      const daysLeft = getDaysLeft(deadline);
                      const status = STATUS_BADGE[task.status] || STATUS_BADGE.open;

                      return (
                        <tr
                          key={task._id}
                          onClick={() => navigate(`/tasks/${task._id}`)}
                          className="cursor-pointer border-b border-border/30 transition-colors duration-150 last:border-0 hover:bg-surface/50"
                        >
                          <td className="px-6 py-3.5">
                            <span className="text-sm font-medium text-ink line-clamp-1">
                              {task.title}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-sm text-muted-foreground">
                              {formatDate(deadline)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-sm font-semibold ${
                              daysLeft !== null && daysLeft <= 2 ? "text-red-500" :
                              daysLeft !== null && daysLeft <= 7 ? "text-amber-600" :
                              "text-emerald-600"
                            }`}>
                              {daysLeft !== null
                                ? daysLeft === 0
                                  ? "Today"
                                  : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`
                                : "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${status.cls}`}
                            >
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}

export default CompanyDashboard;