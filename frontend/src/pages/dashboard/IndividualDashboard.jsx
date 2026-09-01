import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Briefcase,
  Send,
  CheckCircle2,
  Star,
  ArrowRight,
  ChevronRight,
  Eye,
  Globe,
  Code,
  FileText,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  FolderX,
  Info,
  BadgeCheck,
} from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  SectionHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  EmptyState,
  DashboardSkeleton,
  PrimaryButton,
  SecondaryButton,
  Button,
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui";
import WithdrawDialog from "../../components/WithdrawDialog";

/* ── Category Icon Helpers ──────────────────────────────────── */
function getCategoryIcon(category) {
  switch (category) {
    case "Development":
      return Globe;
    case "Design":
      return Code;
    case "Data":
      return FileText;
    case "Writing":
      return FileText;
    default:
      return Globe;
  }
}

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
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  INDIVIDUAL DASHBOARD                                        */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function IndividualDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [withdrawTarget, setWithdrawTarget] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard/individual");

      setDashboard(res.data.dashboard);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const res = await api.get("/dashboard/individual");

        setDashboard(res.data.dashboard);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleWithdraw = (applicationId) => {
    setWithdrawTarget(applicationId);
  };

  const confirmWithdraw = async () => {
    const applicationId = withdrawTarget;
    setWithdrawTarget(null);
    if (!applicationId || withdrawingId) return;

    setWithdrawingId(applicationId);
    try {
      await api.put(`/applications/${applicationId}/withdraw`);
      await fetchDashboard();
    } catch (err) {
      console.error(err.response?.data?.message || "Failed to withdraw application");
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) return <DashboardSkeleton />;

  if (error || !dashboard) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto flex w-[94%] max-w-[1400px] flex-col items-center justify-center py-32 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-red-50">
            <AlertCircle className="h-7 w-7 text-red-400" />
          </div>
          <h2 className="font-display text-xl text-ink">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <PrimaryButton
            onClick={() => window.location.reload()}
            className="mt-6"
          >
            Try Again
          </PrimaryButton>
        </div>
      </div>
    );
  }

  const {
    studentName,
    statistics,
    continueWorking,
    recentApplications,
    recommendedTasks,
  } = dashboard;

  const {
    assignedTasks = 0,
    completedProjects = 0,
    averageRating = 0,
    activeApplications = 0,
    reviewCount = 0,
  } = statistics || {};

  /* ── Stat cards configuration ──────────────────────────────── */
  const statCards = [
    {
      title: "Active Applications",
      value: activeApplications,
      subtitle: "Currently Active",
      icon: Send,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Assigned Tasks",
      value: assignedTasks,
      subtitle: "Currently Assigned",
      icon: Briefcase,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Completed Projects",
      value: completedProjects,
      subtitle: "Projects Completed",
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "TaskHub Rating",
      value: averageRating > 0 ? averageRating.toFixed(1) : "No reviews yet",
      isRating: true,
      reviewCount: reviewCount,
      icon: Star,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
  ];

  return (
    <>
      <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

        <div className="relative mx-auto w-[94%] max-w-[1400px] py-8 md:py-12">
          {/* ═══════════════════════════════════════════════════════ */}
          {/*  HERO SECTION                                         */}
          {/* ═══════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease }}
          >
            <PageHeader
              title={`Welcome back, ${studentName}`}
              description="Track your applications, complete assigned work, and grow your verified TaskHub portfolio."
              actions={
                <>
                  <Link to="/tasks">
                    <PrimaryButton>
                      <Search className="h-4 w-4" />
                      Browse Tasks
                    </PrimaryButton>
                  </Link>
                  <Link to="/portfolio">
                    <SecondaryButton>
                      <Briefcase className="h-4 w-4" />
                      My Portfolio
                    </SecondaryButton>
                  </Link>
                </>
              }
            />
          </motion.div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/*  STATISTICS SECTION                                   */}
          {/* ═══════════════════════════════════════════════════════ */}
          <motion.section
            variants={stagger}
            initial="hidden"
            animate="show"
            className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-5"
          >
            {statCards.map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                whileHover={{ y: -3 }}
              >
                <StatCard
                  title={card.title}
                  subtitle={card.subtitle}
                  value={card.value}
                  icon={card.icon}
                  iconBg={card.iconBg}
                  iconColor={card.iconColor}
                  isRating={card.isRating}
                  reviewCount={card.reviewCount}
                />
              </motion.div>
            ))}
          </motion.section>

          {/* ═══════════════════════════════════════════════════════ */}
          {/*  CONTINUE WORKING SECTION                             */}
          {/* ═══════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease }}
            className="mb-8"
          >
            <SectionCard>
              <SectionHeader
                action={
                  <Link
                    to="/my-assigned-tasks"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    View All Assigned Tasks
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              >
                <div>
                  <h2 className="font-display text-lg text-ink font-bold">
                    Continue Working
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {continueWorking && continueWorking.length > 0
                      ? `You have ${continueWorking.length} active task${continueWorking.length !== 1 ? "s" : ""
                      } in progress.`
                      : "No active assigned tasks."}
                  </p>
                </div>
              </SectionHeader>

              {!continueWorking || continueWorking.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="You don't have any active assigned tasks."
                  description="Apply for open tasks on the marketplace to start working."
                  button={
                    <Link to="/tasks">
                      <PrimaryButton className="mt-1">
                        <Search className="h-4 w-4" />
                        Browse Tasks
                      </PrimaryButton>
                    </Link>
                  }
                />
              ) : (
                <div className="divide-y divide-border/40">
                  {continueWorking.map((task) => {
                    const companyName = task.postedBy?.companyName || "Company";
                    const daysLeft = getDaysLeft(task.currentDeadline);

                    return (
                      <div
                        key={task._id}
                        className={`flex flex-col gap-4 px-6 py-5.5 transition-colors duration-150 hover:bg-surface/40 md:flex-row md:items-center md:justify-between md:px-8 ${task.status === "revision_requested"
                          ? "border-l-4 border-amber-500 bg-amber-50/20"
                          : ""
                          }`}
                      >
                        {/* Left: Avatar + Title & Company */}
                        <div className="flex items-center gap-4 min-w-[280px] flex-1">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-bold text-base shadow-sm ${getCompanyBadgeColor(
                              companyName
                            )}`}
                          >
                            {getCompanyInitial(companyName)}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h3 className="font-display font-bold text-ink text-lg md:text-[1.15rem] leading-snug line-clamp-1">
                                {task.title}
                              </h3>
                              {task.status === "revision_requested" && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md shrink-0">
                                  <AlertTriangle className="h-3 w-3" />
                                  Action Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                              {companyName}
                              <BadgeCheck className="h-4 w-4 fill-blue-600 text-white" />
                            </p>
                          </div>
                        </div>

                        {/* Middle Metadata */}
                        <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm text-ink">
                          {/* Budget */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Budget
                            </p>
                            <p className="font-display font-bold text-ink text-base md:text-lg">
                              ₹{task.budget?.toLocaleString("en-IN") ?? 0}
                            </p>
                          </div>

                          {/* Assigned On */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Assigned On
                            </p>
                            <p className="text-xs md:text-sm font-medium text-muted-foreground">
                              {formatDate(task.taskStartDate || task.createdAt)}
                            </p>
                          </div>

                          {/* Deadline */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Deadline
                            </p>
                            <p className="text-xs md:text-sm font-semibold text-ink">
                              {formatDate(task.currentDeadline)}
                            </p>
                            {daysLeft !== null && (
                              <p
                                className={`text-xs md:text-sm font-bold ${daysLeft <= 2
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

                          {/* Status */}
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                              Status
                            </p>
                            <StatusBadge status={task.status} />
                            {task.status === "under_review" && (
                              <p className="text-[11px] font-medium text-amber-700 italic mt-0.5">
                                Waiting for Company Review
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 pt-2 md:pt-0 shrink-0">
                          <Link to={`/tasks/${task._id}`}>
                            <Button variant="secondary" size="sm">
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </Link>

                          {task.status === "revision_requested" ? (
                            <Link to={`/tasks/${task._id}/submit`}>
                              <Button
                                variant="primary"
                                size="sm"
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                              >
                                Resubmit Work
                              </Button>
                            </Link>
                          ) : task.status === "in_progress" ? (
                            <Link to={`/tasks/${task._id}/submit`}>
                              <PrimaryButton size="sm">
                                Submit Work
                              </PrimaryButton>
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/*  ACTION REQUIRED SECTION                              */}
          {/* ═══════════════════════════════════════════════════════ */}
          {(() => {
            const revisionActionItems = (continueWorking || [])
              .filter((t) => t.status === "revision_requested")
              .map((t) => ({
                _id: t._id,
                title: t.title,
                companyName: t.postedBy?.companyName || "Company",
                type: "revision_requested",
                dateLabel: `Requested on ${formatDate(t.revisionRequestedAt || t.updatedAt)}`,
                actionText: "Resubmit Work",
                actionUrl: `/tasks/${t._id}/submit`,
              }));

            const reviewPendingItems = (recentApplications || [])
              .filter((app) => {
                const t = app.taskId;
                if (!t || t.status !== "completed") return false;
                if (app.status !== "accepted" && app.status !== "selected") return false;
                const reviewStatus = t.reviewStatus || {};
                return !reviewStatus.individualReviewSubmitted;
              })
              .map((app) => ({
                _id: app.taskId._id,
                title: app.taskId.title,
                companyName: app.taskId.postedBy?.companyName || "Company",
                type: "review_pending",
                dateLabel: `Completed on ${formatDate(app.taskId.updatedAt)}`,
                actionText: "Leave Review & Rating",
                actionUrl: `/tasks/${app.taskId._id}/review`,
              }));

            const actionRequiredItems = [...revisionActionItems, ...reviewPendingItems];

            if (actionRequiredItems.length === 0) return null;

            return (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.25, ease }}
                className="mb-8"
              >
                <SectionCard>
                  <SectionHeader
                    title="Action Required"
                    action={
                      <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                        {actionRequiredItems.length} item{actionRequiredItems.length !== 1 ? "s" : ""} requiring action
                      </span>
                    }
                  />

                  <div className="divide-y divide-border/40">
                    {actionRequiredItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex flex-col gap-4 px-6 py-5 transition-colors hover:bg-surface/40 md:flex-row md:items-center md:justify-between md:px-8 border-l-4 border-amber-500 bg-amber-50/20"
                      >
                        <div className="flex items-center gap-4 min-w-[280px] flex-1">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold border border-amber-200 shadow-sm">
                            {item.type === "revision_requested" ? (
                              <RotateCcw className="h-5 w-5 text-amber-700" />
                            ) : (
                              <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
                            )}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <h3 className="font-display font-bold text-ink text-base md:text-lg leading-snug line-clamp-1">
                                {item.title}
                              </h3>
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                                <AlertTriangle className="h-3 w-3" />
                                Action Required
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">
                              {item.companyName} • {item.dateLabel}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Link to={item.actionUrl}>
                            <PrimaryButton size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                              {item.actionText}
                              <ChevronRight className="h-3.5 w-3.5" />
                            </PrimaryButton>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </motion.div>
            );
          })()}

          {/* ═══════════════════════════════════════════════════════ */}
          {/*  BOTTOM GRID: Applications | Recommendations          */}
          {/* ═══════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.3, ease }}
            className="grid grid-cols-1 gap-6 lg:grid-cols-[55%_1fr]"
          >
            {/* ── My Applications (Active Only) ────────────────── */}
            <SectionCard>
              <SectionHeader
                action={
                  <Link
                    to="/my-applications"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    View All Applications
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              >
                <h2 className="font-display text-lg text-ink font-bold">
                  My Applications
                </h2>
              </SectionHeader>

              {(() => {
                const activeApplications = (recentApplications || []).filter((app) => {
                  if (app.status === "rejected" || app.status === "withdrawn") return false;
                  if (app.taskId?.status === "completed" || app.taskId?.status === "closed") return false;
                  if (
                    app.taskId?.applicationDeadline &&
                    new Date(app.taskId.applicationDeadline) < new Date() &&
                    app.status === "pending"
                  ) {
                    return false;
                  }
                  return true;
                });

                if (activeApplications.length === 0) {
                  return (
                    <EmptyState
                      icon={Send}
                      title="No active applications."
                      description="Apply for open tasks on the marketplace to start working."
                      button={
                        <Link to="/tasks">
                          <PrimaryButton className="mt-2">
                            Browse Tasks
                          </PrimaryButton>
                        </Link>
                      }
                    />
                  );
                }

                return (
                  <TableContainer>
                    <Table minWidth="min-w-[500px]">
                      <TableHeader>
                        <tr className="border-b border-border/40">
                          <TableHead className="px-6 py-3.5 text-xs font-bold">
                            Task
                          </TableHead>
                          <TableHead className="px-4 py-3.5 text-xs font-bold">
                            Company
                          </TableHead>
                          <TableHead className="px-4 py-3.5 text-xs font-bold">
                            Applied On
                          </TableHead>
                          <TableHead className="px-4 py-3.5 text-xs font-bold">
                            Status
                          </TableHead>
                          <TableHead align="center" className="px-4 py-3.5 text-xs font-bold">
                            Action
                          </TableHead>
                        </tr>
                      </TableHeader>
                      <TableBody>
                        {activeApplications.map((app) => {
                          const task = app.taskId;
                          const companyName = task?.postedBy?.companyName || "Company";

                          return (
                            <TableRow key={app._id}>
                              <TableCell className="px-6 py-4">
                                <span className="font-display font-bold text-ink text-sm md:text-base line-clamp-1 max-w-[180px]">
                                  {task?.title || "Task"}
                                </span>
                              </TableCell>
                              <TableCell className="px-4 py-4">
                                <span className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
                                  {companyName}
                                  <BadgeCheck className="h-3.5 w-3.5 fill-blue-600 text-white" />
                                </span>
                              </TableCell>
                              <TableCell className="px-4 py-4">
                                <span className="text-xs md:text-sm font-medium text-muted-foreground">
                                  {formatDate(app.appliedAt)}
                                </span>
                              </TableCell>
                              <TableCell className="px-4 py-4">
                                <StatusBadge status={app.status} />
                              </TableCell>
                              <TableCell align="center" className="px-4 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  {app.status === "pending" && (
                                    <button
                                      onClick={() => handleWithdraw(app._id)}
                                      disabled={withdrawingId === app._id}
                                      className="inline-flex items-center rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs md:text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 cursor-pointer shadow-sm"
                                    >
                                      {withdrawingId === app._id ? "Withdrawing..." : "Withdraw"}
                                    </button>
                                  )}

                                  <Link
                                    to={`/tasks/${task?._id}`}
                                    className="inline-flex items-center rounded-xl border border-border bg-card px-4 py-2 text-xs md:text-sm font-semibold text-primary hover:bg-surface shadow-sm"
                                  >
                                    View Task
                                  </Link>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                );
              })()}
            </SectionCard>

            {/* ── Recommended Tasks ─────────────────────────────── */}
            <SectionCard>
              <SectionHeader
                action={
                  <Link
                    to="/tasks"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    View All Tasks
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
              >
                <h2 className="font-display text-lg text-ink font-bold">
                  Recommended Tasks
                </h2>
              </SectionHeader>

              {!recommendedTasks || recommendedTasks.length === 0 ? (
                <EmptyState
                  icon={FolderX}
                  title="No recommendations available yet."
                  description="Update your profile and skills to receive better recommendations."
                />
              ) : (
                <div className="divide-y divide-border/40">
                  {recommendedTasks.map((task) => {
                    const companyName = task.postedBy?.companyName || "Company";
                    const CategoryIcon = getCategoryIcon(task.category);

                    return (
                      <div key={task._id} className="p-6 transition-colors hover:bg-surface/40 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3.5 min-w-0">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                              <CategoryIcon className="h-5.5 w-5.5" />
                            </div>

                            <div className="min-w-0 space-y-1">
                              <h3 className="font-display font-bold text-ink text-base md:text-[1.05rem] leading-snug truncate">
                                {task.title}
                              </h3>
                              <p className="text-sm font-semibold text-muted-foreground flex items-center gap-1.5">
                                {companyName}
                                <BadgeCheck className="h-4 w-4 fill-blue-600 text-white" />
                              </p>
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                <span className="inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted-foreground">
                                  {task.category}
                                </span>
                                {task.duration && (
                                  <span className="text-xs font-semibold text-muted-foreground">
                                    {task.duration} days
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Budget & Deadline Info */}
                          <div className="flex shrink-0 flex-col items-end gap-2.5">
                            <div className="text-right">
                              <p className="font-display font-bold text-ink text-base md:text-lg">
                                ₹{task.budget?.toLocaleString("en-IN") ?? 0}
                              </p>
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Budget
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs md:text-sm font-semibold text-ink">
                                {formatDate(task.applicationDeadline)}
                              </p>
                              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                Deadline
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-4 flex items-center justify-end gap-3 border-t border-border/30 pt-3">
                          <Link to={`/tasks/${task._id}`}>
                            <SecondaryButton size="sm">
                              View Details
                            </SecondaryButton>
                          </Link>
                          <Link to={`/tasks/${task._id}`}>
                            <PrimaryButton size="sm">
                              Apply
                            </PrimaryButton>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </motion.div>

          {/* ═══════════════════════════════════════════════════════ */}
          {/*  BOTTOM TIP BANNER                                    */}
          {/* ═══════════════════════════════════════════════════════ */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.4, ease }}
            className="mt-8 flex items-center gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4.5 text-xs md:text-sm font-semibold text-indigo-900 shadow-sm"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Info className="h-4.5 w-4.5" />
            </div>
            <p>
              Complete tasks, earn great reviews, and build your verified portfolio to unlock more opportunities!
            </p>
          </motion.div>
        </div>
      </div>

      <WithdrawDialog
        open={!!withdrawTarget}
        onClose={() => setWithdrawTarget(null)}
        onConfirm={confirmWithdraw}
      />
    </>);
}

export default IndividualDashboard;
