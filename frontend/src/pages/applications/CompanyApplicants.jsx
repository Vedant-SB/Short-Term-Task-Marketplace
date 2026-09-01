import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  CalendarClock,
  IndianRupee,
  SearchX,
} from "lucide-react";
import api from "../../api/axios";

/* ── Status badge config ───────────────────────────────────── */
const STATUS_BADGE = {
  open: { label: "Open", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  in_progress: { label: "In Progress", cls: "bg-sky-50 text-sky-700 border-sky-300" },
  under_review: { label: "Under Review", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  completed: { label: "Completed", cls: "bg-gray-100 text-gray-500 border-gray-300" },
  revision_requested: { label: "Revision", cls: "bg-orange-50 text-orange-700 border-orange-300" },
  closed: { label: "Closed", cls: "bg-gray-100 text-gray-400 border-gray-300" },
};

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

const ease = [0.22, 1, 0.36, 1];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  COMPANY APPLICANTS PAGE                                     */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function CompanyApplicants() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks/my-tasks");
        setTasks(response.data.tasks || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  // Filter: Show ONLY tasks that are "open", have at least 1 application, and have no selected applicant
  const filteredTasks = tasks.filter(
    (task) =>
      task.status === "open" &&
      (task.applicationCount || 0) > 0 &&
      !task.selectedApplicant
  );

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto w-[94%] max-w-[1400px] py-10 md:py-14">
          {/* Header skeleton */}
          <div className="mb-8 rounded-2xl border border-border bg-card/85 p-6 shadow-sm md:p-8">
            <div className="animate-pulse space-y-3">
              <div className="h-3 w-24 rounded bg-surface-2" />
              <div className="h-8 w-48 rounded bg-surface-2" />
              <div className="h-4 w-80 rounded bg-surface-2" />
            </div>
          </div>

          {/* Task card skeletons */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 h-5 w-3/4 rounded bg-surface-2" />
                <div className="mb-2 h-3 w-1/2 rounded bg-surface-2" />
                <div className="mb-4 flex gap-2">
                  <div className="h-6 w-20 rounded-full bg-surface-2" />
                  <div className="h-6 w-16 rounded-full bg-surface-2" />
                </div>
                <div className="flex gap-2">
                  <div className="h-3 w-24 rounded bg-surface-2" />
                  <div className="h-3 w-20 rounded bg-surface-2" />
                </div>
                <div className="mt-5 flex gap-3 border-t border-border pt-4">
                  <div className="h-9 w-28 rounded-lg bg-surface-2" />
                  <div className="h-9 w-32 rounded-lg bg-surface-2" />
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
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

      <div className="relative mx-auto w-[94%] max-w-[1400px] py-8 md:py-12">
        {/* ── Page header ──────────────────────────────────────── */}
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
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            TaskHub Applicants
          </p>
          <h1 className="mt-3 font-display text-2xl text-ink md:text-3xl">
            Task Applicants
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
            Review applications for your posted tasks. Select the best candidates to get started.
          </p>
        </motion.section>

        {/* ── Task cards grid ──────────────────────────────────── */}
        {filteredTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease }}
            className="rounded-2xl border border-border bg-card/90 px-8 py-16 text-center shadow-sm backdrop-blur-sm"
            style={{ backgroundImage: "linear-gradient(135deg, rgba(253,251,246,0.95), rgba(255,255,255,0.85))" }}
          >
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border">
              <SearchX className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-xl text-ink">No Tasks Awaiting Applicant Selection</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              All your tasks either have applicants selected or are closed. Create a new task to start receiving applications.
            </p>
            <Link
              to="/tasks/create"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
            >
              Create Task
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredTasks.map((task, i) => {
              const status = STATUS_BADGE[task.status] || STATUS_BADGE.open;
              const catCls = CATEGORY_BADGE[task.category] || CATEGORY_BADGE.Other;
              const daysLeft = getDaysLeft(task.applicationDeadline);

              return (
                <motion.article
                  key={task._id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(i * 0.05, 0.3),
                    ease,
                  }}
                  whileHover={{ y: -3 }}
                  className="group rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:shadow-elegant"
                >
                  <div className="p-6">
                    {/* Title + status */}
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <h3 className="font-display text-base font-bold text-ink leading-snug line-clamp-2">
                        {task.title}
                      </h3>
                      <span className={`shrink-0 inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="mb-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${catCls}`}>
                        {task.category}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <IndianRupee className="h-3.5 w-3.5" strokeWidth={1.7} />
                        ₹{task.budget?.toLocaleString("en-IN") ?? 0}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" strokeWidth={1.7} />
                        {formatDate(task.applicationDeadline)}
                      </span>
                    </div>

                    {daysLeft !== null && daysLeft >= 0 && (
                      <p className={`mt-1.5 text-xs font-medium ${
                        daysLeft <= 2 ? "text-red-500" : daysLeft <= 7 ? "text-amber-600" : "text-emerald-600"
                      }`}>
                        {daysLeft === 0 ? "Applications close today" : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left to apply`}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 border-t border-border/60 px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      {task.applicationCount} {task.applicationCount === 1 ? "applicant" : "applicants"}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/tasks/${task._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-ink shadow-sm transition-all duration-150 hover:bg-surface hover:shadow"
                      >
                        View Details
                      </Link>
                      <Link
                        to={`/task-applicants/${task._id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-all duration-150 hover:brightness-110"
                      >
                        <Users className="h-3.5 w-3.5" />
                        View Applicants
                      </Link>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyApplicants;
