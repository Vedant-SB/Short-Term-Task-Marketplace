import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  Search,
  Eye,
  BadgeCheck,
  FolderX,
} from "lucide-react";
import api from "../../api/axios";

const STATUS_BADGE = {
  in_progress: { label: "In Progress", cls: "bg-sky-50 text-sky-700 border-sky-300" },
  under_review: { label: "Under Review", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  revision_requested: { label: "Revision Requested", cls: "bg-amber-100 text-amber-800 border-amber-300" },
};

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

function getCompanyInitial(name) {
  if (!name) return "C";
  return name.trim()[0].toUpperCase();
}

const INITIALS_COLORS = [
  "bg-black text-white",
  "bg-indigo-900 text-white",
  "bg-purple-900 text-white",
  "bg-blue-900 text-white",
  "bg-emerald-900 text-white",
];

function getCompanyBadgeColor(name) {
  if (!name) return INITIALS_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return INITIALS_COLORS[Math.abs(hash) % INITIALS_COLORS.length];
}

const ease = [0.22, 1, 0.36, 1];

function AssignedTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAssignedTasks = async () => {
      try {
        const res = await api.get("/dashboard/individual");
        setTasks(res.data.dashboard?.continueWorking || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedTasks();
  }, []);

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = t.title?.toLowerCase().includes(q);
      const companyMatch = t.postedBy?.companyName?.toLowerCase().includes(q);
      if (!titleMatch && !companyMatch) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto w-[94%] max-w-[1400px] py-10 md:py-14">
          <div className="mb-8 animate-pulse rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="h-4 w-24 rounded bg-surface-2 mb-3" />
            <div className="h-8 w-48 rounded bg-surface-2 mb-2" />
            <div className="h-4 w-80 rounded bg-surface-2" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 w-full rounded-2xl bg-surface-2 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

      <div className="relative mx-auto w-[94%] max-w-[1400px] py-8 md:py-12">
        {/* Header */}
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
            Individual Task Management
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink md:text-3xl">
            My Assigned Tasks
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
            View and manage all active tasks currently assigned to you.
          </p>
        </motion.section>

        {/* Filter Bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assigned tasks..."
              className="w-full rounded-xl border border-border bg-card px-4 py-2.5 pl-10 text-sm text-ink placeholder:text-muted-foreground shadow-sm focus:border-accent focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Status:
            </span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-border bg-card px-3.5 py-2 text-sm text-ink shadow-sm focus:border-accent focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="revision_requested">Revision Requested</option>
              <option value="under_review">Under Review</option>
            </select>
          </div>
        </div>

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border">
              <FolderX className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="font-display text-lg font-bold text-ink">No Active Assigned Tasks</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
              You don't have any active assigned tasks matching these criteria.
            </p>
            <Link
              to="/tasks"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110"
            >
              Browse Tasks
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => {
              const companyName = task.postedBy?.companyName || "Company";
              const daysLeft = getDaysLeft(task.currentDeadline);
              const statusBadge = STATUS_BADGE[task.status] || STATUS_BADGE.in_progress;

              return (
                <div
                  key={task._id}
                  className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-elegant flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-[280px]">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-base shadow-sm ${getCompanyBadgeColor(
                        companyName
                      )}`}
                    >
                      {getCompanyInitial(companyName)}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display font-bold text-ink text-lg md:text-xl leading-snug">
                        {task.title}
                      </h3>
                      <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                        {companyName}
                        <BadgeCheck className="h-4 w-4 fill-blue-600 text-white" />
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Budget
                      </p>
                      <p className="font-display font-bold text-ink text-base md:text-lg">
                        ₹{task.budget?.toLocaleString("en-IN") ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Assigned On
                      </p>
                      <p className="text-xs md:text-sm font-medium text-muted-foreground">
                        {formatDate(task.taskStartDate || task.createdAt)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Deadline
                      </p>
                      <p className="text-xs md:text-sm font-medium text-ink">
                        {formatDate(task.currentDeadline)}
                      </p>
                      {daysLeft !== null && (
                        <p
                          className={`text-xs md:text-sm font-bold ${
                            daysLeft <= 2
                              ? "text-red-500"
                              : daysLeft <= 5
                              ? "text-amber-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {daysLeft <= 0 ? "Due today" : `${daysLeft} days left`}
                        </p>
                      )}
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </p>
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusBadge.cls}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2 md:pt-0 shrink-0">
                    <Link
                      to={`/tasks/${task._id}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4.5 py-2.5 text-sm font-semibold text-ink shadow-sm transition-all hover:bg-surface hover:shadow"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>

                    {task.status === "revision_requested" ? (
                      <Link
                        to={`/tasks/${task._id}/submit`}
                        className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-amber-700"
                      >
                        Resubmit Work
                      </Link>
                    ) : task.status === "in_progress" ? (
                      <Link
                        to={`/tasks/${task._id}/submit`}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110"
                      >
                        Submit Work
                      </Link>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AssignedTasks;
