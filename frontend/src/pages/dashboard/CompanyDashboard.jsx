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
import {
  PageHeader,
  SectionHeader,
  SectionCard,
  StatCard,
  StatusBadge,
  CategoryBadge,
  EmptyState,
  DashboardSkeleton,
  PrimaryButton,
  SecondaryButton,
  Button,
  IconButton,
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "../../components/ui";

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
  return (
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) +
    "\n" +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })
  );
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

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  COMPANY DASHBOARD                                           */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function CompanyDashboard() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [allCompanyTasks, setAllCompanyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, tasksRes] = await Promise.all([
          api.get("/dashboard/company"),
          api.get("/tasks/my-tasks"),
        ]);
        setDashboard(dashRes.data.dashboard);
        setAllCompanyTasks(tasksRes.data.tasks || []);
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
    companyName,
    openTasks,
    inProgressTasks,
    completedTasks,
    activeApplications,
    averageRating,
    reviewCount,
    recentTasks,
    recentApplications,
  } = dashboard;

  const activeRecentTasks = (recentTasks || []).filter(
    (t) => t.status !== "completed" && t.status !== "closed"
  );

  const pendingActions = allCompanyTasks.filter((task) => {
    if (task.status === "under_review" || task.status === "revision_requested") return true;
    if (task.status === "completed" && !task.reviewStatus?.companyReviewSubmitted) return true;
    return false;
  });

  const getPendingActionDetails = (task) => {
    if (task.status === "under_review") {
      const isResubmission = !!task.revisionRequestedAt;
      return {
        label: isResubmission ? "Resubmission Received" : "Submission Received",
        statusKey: "under_review",
        actionText: "Review Submission",
        actionUrl: `/tasks/${task._id}/review`,
      };
    }
    if (task.status === "revision_requested") {
      return {
        label: "Waiting for Resubmission",
        statusKey: "revision_requested",
        actionText: "Review Submission",
        actionUrl: `/tasks/${task._id}/review`,
      };
    }
    if (task.status === "completed") {
      return {
        label: "Review Pending",
        statusKey: "completed",
        actionText: "Leave Review",
        actionUrl: `/tasks/${task._id}/review`,
      };
    }
    return {
      label: task.status,
      statusKey: task.status,
      actionText: "View Details",
      actionUrl: `/tasks/${task._id}`,
    };
  };

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
      title: "Active Applications",
      value: activeApplications,
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
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
        >
          <PageHeader
            title={`Welcome back, ${companyName}`}
            description="Manage your tasks, applications, and deadlines from one place."
            actions={
              <>
                <Link to="/tasks/create">
                  <PrimaryButton>
                    <Plus className="h-4 w-4" />
                    Create Task
                  </PrimaryButton>
                </Link>
                <Link to="/company-applicants">
                  <SecondaryButton>
                    <Users className="h-4 w-4" />
                    View Applicants
                  </SecondaryButton>
                </Link>
              </>
            }
          />
        </motion.div>

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
            >
              <StatCard
                title={card.title}
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
        {/*  RECENT TASKS (ACTIVE ONLY)                           */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease }}
          className="mb-8"
        >
          <SectionCard>
            <SectionHeader
              title="Recent Tasks"
              action={
                <Link
                  to="/tasks"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  View All Tasks
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />

            {activeRecentTasks.length === 0 ? (
              <EmptyState
                icon={FileText}
                description="No active tasks. Create a new task to get started."
                button={
                  <Link to="/tasks/create">
                    <PrimaryButton>
                      <Plus className="h-4 w-4" />
                      Create Task
                    </PrimaryButton>
                  </Link>
                }
              />
            ) : (
              <TableContainer>
                <Table minWidth="min-w-[800px]">
                  <TableHeader>
                    <tr className="border-b border-border/40">
                      <TableHead className="px-6 py-3 md:px-8">Task</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead align="center">Applicants</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead align="right" className="px-6 py-3 md:px-8">
                        Action
                      </TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {activeRecentTasks.map((task) => {
                      const deadline =
                        task.status === "open"
                          ? task.applicationDeadline
                          : task.currentDeadline;
                      const daysLeft = getDaysLeft(deadline);

                      return (
                        <TableRow
                          key={task._id}
                          clickable
                          onClick={() => navigate(`/tasks/${task._id}`)}
                        >
                          <TableCell className="px-6 py-4 md:px-8">
                            <p className="font-medium text-ink leading-snug">
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground max-w-[280px]">
                                {task.description}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <CategoryBadge category={task.category} />
                          </TableCell>
                          <TableCell>
                            <span className="font-medium text-ink">
                              ₹{task.budget?.toLocaleString("en-IN") ?? 0}
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={task.status} />
                          </TableCell>
                          <TableCell align="center">
                            <span className="font-medium text-ink">
                              {task.applicationCount}
                            </span>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm text-ink">{formatDate(deadline)}</p>
                            {daysLeft !== null && daysLeft >= 0 && (
                              <p
                                className={`text-xs font-medium ${
                                  daysLeft <= 2
                                    ? "text-red-500"
                                    : daysLeft <= 7
                                    ? "text-amber-600"
                                    : "text-emerald-600"
                                }`}
                              >
                                {daysLeft === 0
                                  ? "Ends today"
                                  : `${daysLeft} day${daysLeft !== 1 ? "s" : ""} left`}
                              </p>
                            )}
                          </TableCell>
                          <TableCell align="right" className="px-6 py-4 md:px-8">
                            <Link
                              to={`/tasks/${task._id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button variant="outline" size="sm">
                                View Details
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SectionCard>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  BOTTOM ROW: Applications | Pending Actions            */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3, ease }}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[55%_1fr]"
        >
          {/* ── Recent Applications ────────────────────────────── */}
          <SectionCard>
            <SectionHeader
              title="Recent Applications"
              action={
                <Link
                  to="/company-applicants"
                  className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
                >
                  View All Applications
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              }
            />

            {recentApplications.length === 0 ? (
              <EmptyState
                icon={Users}
                description="No applications received yet."
              />
            ) : (
              <TableContainer>
                <Table minWidth="min-w-[500px]">
                  <TableHeader>
                    <tr className="border-b border-border/40">
                      <TableHead className="px-6 py-3">Applicant</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Applied On</TableHead>
                      <TableHead align="center">Action</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {recentApplications.map((app) => {
                      const applicant = app.applicantId;
                      const applicantName = applicant?.name || "Unknown";
                      const profileImage = applicant?.profileImage;

                      return (
                        <TableRow key={app._id}>
                          <TableCell className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              {profileImage ? (
                                <img
                                  src={profileImage}
                                  alt={applicantName}
                                  className="h-9 w-9 rounded-full object-cover border border-border"
                                />
                              ) : (
                                <div
                                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${getInitialsColor(
                                    applicantName
                                  )}`}
                                >
                                  {getInitials(applicantName)}
                                </div>
                              )}
                              <span className="text-sm font-medium text-ink">
                                {applicantName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground line-clamp-1 max-w-[180px]">
                              {app.taskId?.title || "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="whitespace-pre-line text-xs text-muted-foreground">
                              {formatDateTime(app.appliedAt)}
                            </span>
                          </TableCell>
                          <TableCell align="center">
                            <Link to={`/portfolio/${applicant?._id}`}>
                              <IconButton>
                                <Eye className="h-4 w-4" />
                              </IconButton>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SectionCard>

          {/* ── Pending Actions ───────────────────────────────── */}
          <SectionCard>
            <SectionHeader
              title="Pending Actions"
              action={
                <span className="text-xs font-semibold text-muted-foreground">
                  {pendingActions.length} item{pendingActions.length !== 1 ? "s" : ""}
                </span>
              }
            />

            {pendingActions.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                description="No pending submissions or actions requiring review."
              />
            ) : (
              <TableContainer>
                <Table minWidth="min-w-[420px]">
                  <TableHeader>
                    <tr className="border-b border-border/40">
                      <TableHead className="px-6 py-3">Task</TableHead>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead align="right" className="px-6 py-3">Action</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                    {pendingActions.map((task) => {
                      const details = getPendingActionDetails(task);
                      const applicantName = task.selectedApplicant?.name || "Applicant";

                      return (
                        <TableRow
                          key={task._id}
                          clickable
                          onClick={() => navigate(details.actionUrl)}
                        >
                          <TableCell className="px-6 py-3.5">
                            <span className="text-sm font-medium text-ink line-clamp-1">
                              {task.title}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <span className="text-xs font-medium text-muted-foreground">
                              {applicantName}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3.5">
                            <StatusBadge status={details.statusKey} label={details.label} />
                          </TableCell>
                          <TableCell align="right" className="px-6 py-3.5">
                            <Link
                              to={details.actionUrl}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button variant="primary" size="sm">
                                {details.actionText}
                                <ChevronRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SectionCard>
        </motion.div>
      </div>
    </div>
  );
}

export default CompanyDashboard;