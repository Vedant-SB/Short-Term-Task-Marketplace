import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Send,
  Search,
  BadgeCheck,
  FolderX,
} from "lucide-react";
import api from "../../api/axios";

const APPLICATION_STATUS_BADGE = {
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800 border-amber-300" },
  under_review: { label: "Under Review", cls: "bg-sky-100 text-sky-800 border-sky-300" },
  accepted: { label: "Selected", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  selected: { label: "Selected", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  rejected: { label: "Rejected", cls: "bg-rose-100 text-rose-800 border-rose-300" },
  withdrawn: { label: "Withdrawn", cls: "bg-gray-100 text-gray-500 border-gray-300" },
};

function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const ease = [0.22, 1, 0.36, 1];

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [withdrawingId, setWithdrawingId] = useState(null);

  const fetchApplications = async () => {
    try {
      const res = await api.get("/applications/my-applications");
      setApplications(res.data.applications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId) => {
    const confirmed = window.confirm("Withdraw this application?");
    if (!confirmed || withdrawingId) return;

    setWithdrawingId(applicationId);
    try {
      await api.put(`/applications/${applicationId}/withdraw`);
      await fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to withdraw application");
    } finally {
      setWithdrawingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const taskTitle = app.taskId?.title?.toLowerCase() || "";
      const companyName = app.taskId?.postedBy?.companyName?.toLowerCase() || "";
      if (!taskTitle.includes(q) && !companyName.includes(q)) return false;
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
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-full rounded-xl bg-surface-2 animate-pulse" />
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
            Application Tracking
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink md:text-3xl">
            My Applications
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
            Track and manage every application you have submitted on TaskHub.
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
              placeholder="Search by task title or company..."
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
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="accepted">Selected</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        {/* Applications Table Card */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {filteredApplications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border">
                <FolderX className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-lg font-bold text-ink">No Applications Found</h3>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
                No applications match your current filters.
              </p>
              <Link
                to="/tasks"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110"
              >
                Browse Tasks
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="border-b border-border/40 bg-surface/50">
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Task
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Company
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Applied On
                    </th>
                    <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map((app) => {
                    const task = app.taskId;
                    const companyName = task?.postedBy?.companyName || "Company";
                    const statusBadge =
                      APPLICATION_STATUS_BADGE[app.status] || APPLICATION_STATUS_BADGE.pending;

                    return (
                      <tr
                        key={app._id}
                        className="border-b border-border/30 transition-colors duration-150 last:border-0 hover:bg-surface/40"
                      >
                        <td className="px-6 py-4">
                          <span className="font-display font-bold text-ink text-base line-clamp-1 max-w-[240px]">
                            {task?.title || "Task"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                            {companyName}
                            <BadgeCheck className="h-4 w-4 fill-blue-600 text-white" />
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs md:text-sm text-muted-foreground font-medium">
                            {formatDate(app.appliedAt)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusBadge.cls}`}
                          >
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {app.status === "pending" ? (
                            <button
                              onClick={() => handleWithdraw(app._id)}
                              disabled={withdrawingId === app._id}
                              className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs md:text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 cursor-pointer shadow-sm"
                            >
                              {withdrawingId === app._id ? "Withdrawing..." : "Withdraw"}
                            </button>
                          ) : app.status === "accepted" || app.status === "selected" ? (
                            <Link
                              to={`/tasks/${task?._id}`}
                              className="inline-flex items-center rounded-xl border border-border bg-card px-4.5 py-2 text-xs md:text-sm font-semibold text-primary hover:bg-surface shadow-sm"
                            >
                              View Task
                            </Link>
                          ) : (
                            <span className="text-sm text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyApplications;
