import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  Calendar,
  Clock,
  IndianRupee,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowLeft,
  Eye,
  Send,
  CalendarPlus,
  Star,
  Building2,
  RotateCcw,
  Edit3,
  Trash2,
  Info,
  Award,
  CalendarDays,
  Globe,
  Folder,
  Users,
  ClipboardCheck,
  ExternalLink,
  User,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/useAuth";
import { ConfirmDialog } from "../../components/ui";

const ELIGIBLE_LABELS = {
  student: "Student",
  first_year_student: "First Year Student",
  second_year_student: "Second Year Student",
  third_year_student: "Third Year Student",
  final_year_student: "Final Year Student",
  fresh_graduate: "Fresh Graduate",
  professional: "Professional",
  freelancer: "Freelancer",
};

const STATUS_CONFIG = {
  open: { label: "Open", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  in_progress: { label: "In Progress", cls: "bg-sky-50 text-sky-700 border-sky-200", dot: "bg-sky-500" },
  under_review: { label: "Under Review", cls: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" },
  revision_requested: { label: "Revision Requested", cls: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500" },
  closed: { label: "Closed", cls: "bg-zinc-50 text-zinc-600 border-zinc-200", dot: "bg-zinc-400" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
};

function SectionTitle({ icon: Icon, children }) {
  return (
    <h3 className="mb-4 flex items-center gap-3 font-display text-base md:text-lg font-bold text-slate-900">
      {Icon && (
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100/80 text-violet-600 shrink-0">
          <Icon className="h-5 w-5" />
        </span>
      )}
      <span>{children}</span>
    </h3>
  );
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getDaysLeft(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return null;
  const now = new Date();
  const diffTime = target.getTime() - now.getTime();
  if (diffTime < 0) {
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) || -1;
  }
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getUrgencyLevel(daysLeft) {
  if (daysLeft === null) return "normal";
  if (daysLeft <= 0) return "urgent";
  if (daysLeft <= 2) return "warning";
  return "normal";
}

const URGENCY_STYLES = {
  urgent: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
  warning: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  normal: { bg: "bg-zinc-50", text: "text-zinc-700", border: "border-zinc-200", dot: "bg-zinc-400" },
};

function getDeadlineLabel(daysLeft) {
  if (daysLeft === null) return "N/A";
  if (daysLeft < 0) return "Deadline Passed";
  if (daysLeft === 0) return "Due Today";
  if (daysLeft === 1) return "1 day left";
  return `${daysLeft} days left`;
}

function TaskDetailsSkeleton() {
  const shimmer = "animate-pulse bg-zinc-200/70 rounded-xl";
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/60">
      <div className="relative mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <div className={`h-48 w-full ${shimmer}`} />
            <div className={`h-36 w-full ${shimmer}`} />
          </div>
          <div className="lg:col-span-4">
            <div className={`h-80 w-full ${shimmer}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [extendingDeadline, setExtendingDeadline] = useState(false);
  const [customExtensionDays, setCustomExtensionDays] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [message, setMessage] = useState("");

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tasks/${id}`);
      const taskData = res.data.task || {};
      taskData.applicantsCount = res.data.applicationCount ?? taskData.applicantsCount ?? 0;
      taskData.hasApplied = res.data.hasApplied ?? taskData.hasApplied ?? false;
      taskData.applicationId = res.data.applicationId ?? taskData.applicationId ?? null;
      taskData.applicationStatus = res.data.applicationStatus ?? taskData.applicationStatus ?? null;
      setTask(taskData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const loadTaskDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/tasks/${id}`);
        const taskData = res.data.task || {};
        taskData.applicantsCount = res.data.applicationCount ?? taskData.applicantsCount ?? 0;
        taskData.hasApplied = res.data.hasApplied ?? taskData.hasApplied ?? false;
        taskData.applicationId = res.data.applicationId ?? taskData.applicationId ?? null;
        taskData.applicationStatus = res.data.applicationStatus ?? taskData.applicationStatus ?? null;
        setTask(taskData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTaskDetails();
  }, [id]);

  /* ─── API handlers ─── */

  const handleApply = async () => {
    setApplying(true);
    setMessage("");
    try {
      const res = await api.post("/applications", { taskId: id });
      setMessage(res.data.message || "Application submitted successfully!");
      fetchTaskDetails();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    setMessage("");
    try {
      const appId = task?.applicationId || task?.userApplication?._id || task?.userApplication?.id || (task?.applications && task?.applications[0]?._id);
      if (!appId) throw new Error("Application ID not found");
      const res = await api.put(`/applications/${appId}/withdraw`);
      setMessage(res.data.message || "Application withdrawn successfully");
      fetchTaskDetails();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to withdraw application");
    } finally {
      setWithdrawing(false);
      setShowWithdrawDialog(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/tasks/${id}`);
      navigate("/company-dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete task");
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleExtendApplicationDeadline = async (days) => {
    if (!days || days < 1) return;
    setExtendingDeadline(true);
    try {
      const res = await api.put(`/tasks/${id}/extend-application-deadline`, { days });
      setMessage(res.data.message || "Application deadline extended successfully");
      setCustomExtensionDays("");
      fetchTaskDetails();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to extend application deadline");
    } finally {
      setExtendingDeadline(false);
    }
  };

  const handleExtendSubmissionDeadline = async (days) => {
    if (!days || days < 1) return;
    setExtendingDeadline(true);
    try {
      const res = await api.put(`/tasks/${id}/extend-submission-deadline`, { days });
      setMessage(res.data.message || "Submission deadline extended successfully");
      setCustomExtensionDays("");
      fetchTaskDetails();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to extend submission deadline");
    } finally {
      setExtendingDeadline(false);
    }
  };

  if (loading) return <TaskDetailsSkeleton />;

  if (!task) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/60">
        <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-zinc-200 shadow-sm">
            <Info className="h-7 w-7 text-slate-400" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-xl md:text-2xl text-slate-900 font-bold">Task Not Found</h2>
          <p className="mt-2 text-sm text-slate-500">The task you are looking for does not exist or has been removed.</p>
          <Link to="/tasks" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 transition-colors">
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  /* ─── Derived state ─── */

  const isOwner = user?.role === "company" && user?.userId === task.postedBy?._id;
  const applicationCount = task.applicantsCount ?? (task.applications ? task.applications.length : 0);
  const hasApplied = task.userApplication != null || (user?.role === "individual" && task.hasApplied);
  const applicationStatus = task.userApplication?.status || task.applicationStatus;
  const isSelectedApplicant = task.selectedApplicant?._id === user?.userId || task.selectedApplicant === user?.userId;
  const companyReviewSubmitted = task.reviewStatus?.companyReviewSubmitted;
  const individualReviewSubmitted = task.reviewStatus?.individualReviewSubmitted;
  const isTaskOpen = task.status === "open";
  const isTaskActiveWork = task.status === "in_progress" || task.status === "revision_requested";
  const isSubmissionDeadlinePassed =
    Boolean(task.currentDeadline) && new Date() > new Date(task.currentDeadline);
  const isSubmissionOverdue =
    task.status === "in_progress" && isSubmissionDeadlinePassed && !task.submittedAt;
  const canEdit = isOwner && isTaskOpen && applicationCount === 0;
  const canDelete = isOwner && (isTaskOpen || task.status === "closed") && applicationCount === 0;
  const canExtendDeadline = isOwner && isTaskActiveWork;
  const daysLeft = isTaskOpen
    ? getDaysLeft(task.applicationDeadline)
    : isTaskActiveWork
    ? getDaysLeft(task.currentDeadline)
    : null;
  const deadlineDate = isTaskOpen
    ? (task.applicationDeadline ? formatDisplayDate(task.applicationDeadline) : null)
    : isTaskActiveWork
    ? (task.currentDeadline ? formatDisplayDate(task.currentDeadline) : null)
    : null;
  const statusInfo = STATUS_CONFIG[task.status] || STATUS_CONFIG.open;
  const urgency = getUrgencyLevel(daysLeft);
  const uStyle = URGENCY_STYLES[urgency];
  const companyName = task.postedBy?.companyName || "Company";
  const companyRating = Number(task.companyRating ?? task.postedBy?.rating ?? task.postedBy?.averageRating ?? 0);
  const companyReviewCount = Number(task.companyReviewCount ?? task.postedBy?.reviewCount ?? task.postedBy?.totalReviews ?? 0);
  const rawWebsite = task.postedBy?.website;
  const companyWebsite = typeof rawWebsite === "string" && rawWebsite.trim().length > 0 ? rawWebsite.trim() : null;
  const deliverables = task.deliverables || [];
  const eligibilityAndPreferences = task.eligibilityAndPreferences || [];

  /* ─── Master Sticky Action Section Renderer ─── */

  const renderPrimaryAction = () => {
    /* Guest: Cannot apply without logging in */
    if (!user) {
      return (
        <div className="space-y-2">
          <button
            disabled
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm opacity-50 cursor-not-allowed"
          >
            <Send className="h-4 w-4" strokeWidth={1.8} />
            Apply Now
          </button>
          <p className="text-center text-xs font-medium text-slate-500">
            Login to apply to this task.
          </p>
        </div>
      );
    }

    /* Individual: Open Task */
    if (user?.role === "individual" && task.status === "open") {
      const closed = new Date() > new Date(task.applicationDeadline);
      if (!hasApplied) {
        return (
          <div className="space-y-2">
            <button
              onClick={handleApply}
              disabled={applying || closed}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" strokeWidth={1.8} />
              {applying ? "Applying..." : closed ? "Applications Closed" : "Apply Now"}
            </button>
            {closed && (
              <p className="text-center text-xs font-semibold text-red-500">
                Applications Closed — Deadline passed
              </p>
            )}
          </div>
        );
      }
      if (applicationStatus === "pending") {
        return (
          <div className="space-y-2">
            <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Already Applied
            </span>
            <button
              onClick={() => setShowWithdrawDialog(true)}
              disabled={withdrawing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 disabled:opacity-50 cursor-pointer"
            >
              {withdrawing ? "Withdrawing..." : "Withdraw Application"}
            </button>
          </div>
        );
      }
      return (
        <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Already Applied
        </span>
      );
    }

    /* Individual: In Progress / Revision Requested (selected applicant) */
    if (
      user?.role === "individual" &&
      (task.status === "in_progress" || task.status === "revision_requested") &&
      isSelectedApplicant
    ) {
      const submissionClosed = isSubmissionDeadlinePassed && !task.submittedAt;
      return (
        <div className="space-y-2">
          {submissionClosed ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-sm font-bold text-red-700">Submission Overdue</p>
              <p className="mt-1 text-xs text-red-600">The submission deadline for this task has passed.</p>
            </div>
          ) : (
            <Link
              to={`/tasks/${task._id}/submit`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700"
            >
              <Send className="h-4 w-4" strokeWidth={1.8} />
              {task.status === "revision_requested" ? "Resubmit Work" : "Submit Work"}
            </Link>
          )}
        </div>
      );
    }

    /* Individual: Completed (selected applicant) */
    if (user?.role === "individual" && task.status === "completed" && isSelectedApplicant) {
      if (!individualReviewSubmitted) {
        return (
          <Link
            to={`/tasks/${task._id}/review`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700"
          >
            <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
            Leave Review & Rating
          </Link>
        );
      }
      return (
        <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Individual Review Submitted
        </span>
      );
    }

    /* Individual: Completed (other individuals) */
    if (user?.role === "individual" && task.status === "completed") {
      return (
        <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Task Completed
        </span>
      );
    }

    /* Individual: Closed Task */
    if (user?.role === "individual" && task.status === "closed") {
      return (
        <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-600">
          <Clock className="h-4 w-4 text-zinc-400" />
          Task Closed
        </span>
      );
    }

    /* Company Owner Actions */
    if (user?.role === "company" && isOwner) {
      return (
        <div className="space-y-3">
          {task.status === "open" && (
            <Link
              to={`/task-applicants/${task._id}`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700"
            >
              <Eye className="h-4 w-4" strokeWidth={1.8} />
              View Applicants ({applicationCount})
            </Link>
          )}

          {task.status === "under_review" && (
            <Link
              to={`/tasks/${task._id}/review`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700"
            >
              <Eye className="h-4 w-4" strokeWidth={1.8} />
              Review Submission
            </Link>
          )}

          {task.status === "completed" && !companyReviewSubmitted && (
            <Link
              to={`/tasks/${task._id}/review`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-violet-700"
            >
              <Star className="h-4 w-4 fill-amber-300 text-amber-300" />
              Leave Review
            </Link>
          )}

          {task.status === "completed" && companyReviewSubmitted && (
            <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Company Review Submitted
            </span>
          )}

          {task.status === "closed" && !canDelete && (
            <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-3 text-sm font-bold text-zinc-600">
              <Clock className="h-4 w-4 text-zinc-400" />
              Task Closed
            </span>
          )}

          {(canEdit || canDelete) && (
            <div className="flex items-center gap-2 pt-1">
              {canEdit && (
                <Link
                  to={`/tasks/${task._id}/edit`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                >
                  <Edit3 className="h-3.5 w-3.5" strokeWidth={1.8} />
                  Edit Task
                </Link>
              )}
              {canDelete && (
                <button
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={deleting}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition-all hover:bg-red-100 disabled:opacity-50 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.8} />
                  {deleting ? "Deleting..." : "Delete Task"}
                </button>
              )}
            </div>
          )}

          {task.status === "open" && (
            <div className="pt-2 border-t border-zinc-100">
              <p className="mb-2 text-xs font-semibold text-slate-600">Extend Application Deadline</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Days"
                  value={customExtensionDays}
                  onChange={(e) => setCustomExtensionDays(e.target.value)}
                  disabled={extendingDeadline}
                  className="w-20 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-violet-600 focus:outline-none"
                />
                <button
                  onClick={() => handleExtendApplicationDeadline(Number(customExtensionDays))}
                  disabled={extendingDeadline || !customExtensionDays || Number(customExtensionDays) < 1}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Extend
                </button>
              </div>
            </div>
          )}

          {canExtendDeadline && (
            <div className="pt-2 border-t border-zinc-100">
              <p className="mb-2 text-xs font-semibold text-slate-600">Extend Submission Deadline</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Days"
                  value={customExtensionDays}
                  onChange={(e) => setCustomExtensionDays(e.target.value)}
                  disabled={extendingDeadline}
                  className="w-20 rounded-lg border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-violet-600 focus:outline-none"
                />
                <button
                  onClick={() => handleExtendSubmissionDeadline(Number(customExtensionDays))}
                  disabled={extendingDeadline || !customExtensionDays || Number(customExtensionDays) < 1}
                  className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Extend
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/60 py-6 md:py-8">
      <div className="relative mx-auto w-[94%] max-w-[1280px]">
        {/* Global message notification if present */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-xl border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-medium text-violet-800 shadow-sm"
          >
            {message}
          </motion.div>
        )}

        {/* Main Grid: Left Column holds Top Hero Card + Left Cards, Right Column holds Sticky Action Panel */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* ═══════════════════════════════════════════
              LEFT COLUMN — Hero Card + Detailed Cards
              ═══════════════════════════════════════════ */}
          <div className="lg:col-span-8 space-y-5">
            {/* Top Hero Card (Reduced height & aligned with top of sticky panel) */}
            <div className="relative rounded-2xl border border-zinc-200/80 bg-white p-5 md:p-6 shadow-sm">
              {/* Top row: Back button & Status pill */}
              <div className="flex items-center justify-between gap-4 mb-3">
                <Link
                  to={user?.role === "company" ? "/company-dashboard" : "/tasks"}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:text-violet-700 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Browse Tasks
                </Link>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-bold ${statusInfo.cls}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                  {statusInfo.label.toUpperCase()}
                </span>
              </div>

              {/* Title and Budget / Deadline Block */}
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 pb-4 border-b border-zinc-100">
                <div className="flex-1 space-y-2">
                  <h1 className="font-serif text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                    {task.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-500 font-medium">
                    <span className="inline-flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Building2 className="h-4 w-4 text-violet-500" />
                      {companyName}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Posted on {task.createdAt ? formatDisplayDate(task.createdAt) : "Recently"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed max-w-3xl">
                    {task.description}
                  </p>
                </div>

                {/* Right-aligned Budget and Deadline badge inside Top Banner */}
                <div className="shrink-0 flex flex-col items-start lg:items-end gap-1.5 bg-slate-50/60 p-3 lg:bg-transparent lg:p-0 rounded-xl">
                  <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">BUDGET</span>
                  <span className="text-2xl md:text-3xl font-bold text-slate-900">
                    ₹{task.budget?.toLocaleString("en-IN") ?? 0}
                  </span>
                  {task.status === "completed" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
                    </span>
                  ) : task.status === "closed" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-bold text-zinc-600">
                      <Clock className="h-3.5 w-3.5" />
                      Closed
                    </span>
                  ) : task.status === "under_review" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                      <Clock className="h-3.5 w-3.5" />
                      Under Review
                    </span>
                  ) : isSubmissionOverdue ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-red-300 bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700">
                      <Clock className="h-3.5 w-3.5 text-red-500" />
                      Submission Overdue
                    </span>
                  ) : (
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${uStyle.bg} ${uStyle.text} ${uStyle.border}`}>
                      <Clock className="h-3.5 w-3.5" />
                      {getDeadlineLabel(daysLeft)}
                    </span>
                  )}
                  {task.status === "completed" ? (
                    task.updatedAt && (
                      <span className="text-xs text-slate-500 font-medium inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-emerald-600" />
                        Completed: {formatDisplayDate(task.updatedAt)}
                      </span>
                    )
                  ) : task.status === "closed" ? (
                    (task.applicationDeadline || task.updatedAt) && (
                      <span className="text-xs text-slate-500 font-medium inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-zinc-400" />
                        Closed: {formatDisplayDate(task.applicationDeadline || task.updatedAt)}
                      </span>
                    )
                  ) : task.status === "under_review" ? (
                    task.submittedAt && (
                      <span className="text-xs text-slate-500 font-medium inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        Submitted: {formatDisplayDate(task.submittedAt)}
                      </span>
                    )
                  ) : deadlineDate ? (
                    <span className="text-xs text-slate-500 font-medium inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                      {task.status === "open"
                        ? "Apply by: "
                        : isSubmissionOverdue
                        ? "Submission Due: "
                        : "Deadline: "}
                      {deadlineDate}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Skill Pills inside Top Banner */}
              {task.skillsRequired && task.skillsRequired.length > 0 && (
                <div className="pt-3 flex flex-wrap gap-2">
                  {task.skillsRequired.map((skill) => (
                    <span
                      key={`top-skill-${skill}`}
                      className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50/80 px-3 py-0.5 text-xs font-medium text-violet-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 1. About the Task */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 md:p-6 shadow-sm">
              <SectionTitle icon={FileText}>About the Task</SectionTitle>
              <div className="prose max-w-none text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {task.description}
              </div>
            </div>

            {/* 2. Deliverables */}
            {deliverables.length > 0 && (
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 md:p-6 shadow-sm">
                <SectionTitle icon={CheckCircle2}>Deliverables</SectionTitle>
                <ul className="space-y-2.5">
                  {(Array.isArray(deliverables) ? deliverables : [deliverables]).map((item, index) => (
                    <li key={`deliverable-${index}`} className="flex items-start gap-3 text-sm md:text-base text-slate-700 font-medium">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-600 text-white shrink-0 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 3. Information Cards (4 stat boxes grid row) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 flex items-center gap-3.5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100/80 text-violet-600 shrink-0">
                  <Folder className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Category</p>
                  <p className="text-base font-bold text-slate-900">{task.category}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 flex items-center gap-3.5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100/80 text-violet-600 shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Duration</p>
                  <p className="text-base font-bold text-slate-900">{task.duration} Days</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 flex items-center gap-3.5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100/80 text-violet-600 shrink-0">
                  {task.selectedApplicant ? <User className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-500">
                    {task.selectedApplicant ? "Assignee" : "Applicants"}
                  </p>
                  <p className="text-base font-bold text-slate-900 truncate">
                    {task.selectedApplicant ? task.selectedApplicant.name : `${applicationCount} Applicants`}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 flex items-center gap-3.5 shadow-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100/80 text-violet-600 shrink-0">
                  <IndianRupee className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500">Budget</p>
                  <p className="text-base font-bold text-slate-900">₹{task.budget?.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            {/* 4. Required Skills */}
            {task.skillsRequired && task.skillsRequired.length > 0 && (
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 md:p-6 shadow-sm">
                <SectionTitle icon={Briefcase}>Required Skills</SectionTitle>
                <div className="flex flex-wrap gap-2.5">
                  {task.skillsRequired.map((skill) => (
                    <span
                      key={`req-skill-${skill}`}
                      className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50/80 px-3.5 py-1 text-xs md:text-sm font-medium text-violet-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 5. About the Company */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 md:p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-100/70 text-violet-600 shrink-0">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display font-bold text-slate-900 text-base md:text-lg">About the Company</h3>
                    <p className="font-bold text-slate-800 text-sm md:text-base">{companyName}</p>
                    {task.postedBy?.companyDescription && (
                      <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                        {task.postedBy.companyDescription}
                      </p>
                    )}

                    {/* Metadata line: Website & Industry */}
                    <div className="flex flex-wrap items-center gap-4 text-xs md:text-sm text-slate-500 pt-2 font-medium">
                      {companyWebsite && (
                        <div className="inline-flex items-center gap-1.5">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <span>Website:</span>
                          <a
                            href={companyWebsite.startsWith("http://") || companyWebsite.startsWith("https://") ? companyWebsite : `https://${companyWebsite}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-violet-600 hover:underline font-semibold"
                          >
                            {companyWebsite}
                          </a>
                        </div>
                      )}
                      {task.postedBy?.industry && (
                        <div className="inline-flex items-center gap-1.5">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          <span>Industry:</span>
                          <span className="font-semibold text-slate-700">{task.postedBy.industry}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating Card Box */}
                <div className="shrink-0 bg-violet-50/70 border border-violet-100 rounded-2xl p-5 text-center min-w-[150px]">
                  {companyReviewCount > 0 || companyRating > 0 ? (
                    <>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                        <span className="font-display text-xl font-bold text-slate-900">{companyRating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800">Average Rating</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">Based on {companyReviewCount} review{companyReviewCount !== 1 ? "s" : ""}</p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <Star className="h-5 w-5 text-slate-300" />
                        <span className="font-display text-sm font-bold text-slate-600">N/A</span>
                      </div>
                      <p className="text-xs font-medium text-slate-500">No ratings yet</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 6. Eligibility & Preferences */}
            {(eligibilityAndPreferences.length > 0 || (task.eligibleFor && task.eligibleFor.length > 0)) && (
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 md:p-6 shadow-sm">
                <SectionTitle icon={Award}>Eligibility & Preferences</SectionTitle>
                {task.eligibleFor && task.eligibleFor.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Eligible Roles</p>
                    <div className="flex flex-wrap gap-2">
                      {task.eligibleFor.map((e) => (
                        <span key={`el-${e}`} className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs md:text-sm font-medium text-emerald-700">
                          {ELIGIBLE_LABELS[e] || e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {eligibilityAndPreferences.length > 0 && (
                  <ul className="space-y-2.5">
                    {eligibilityAndPreferences.map((item, index) => (
                      <li key={`eligibility-${index}`} className="flex items-start gap-2.5 text-sm md:text-base text-slate-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 mt-2 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* 7. Submitted Work & Deliverables (Visible for completed, under_review, revision_requested or when submission exists) */}
            {(task.status === "completed" || task.status === "under_review" || task.submissionLink || task.submissionNote) && (
              <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 md:p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between gap-4 border-b border-zinc-100 pb-3">
                  <SectionTitle icon={ClipboardCheck}>
                    {task.status === "completed" ? "Completed Work & Submission" : "Submitted Work"}
                  </SectionTitle>
                  {task.status === "completed" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Work Approved
                    </span>
                  )}
                </div>

                {/* Submitter & Timestamps */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {task.selectedApplicant && (
                    <div className="rounded-xl border border-zinc-100 bg-slate-50/60 p-3.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed By</p>
                      <p className="mt-1 text-sm font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="h-4 w-4 text-violet-600" />
                        {task.selectedApplicant.name || "Assignee"}
                      </p>
                      {task.selectedApplicant.individualType && (
                        <p className="mt-0.5 text-xs text-slate-500 capitalize">
                          {task.selectedApplicant.individualType.replace(/_/g, " ")}
                        </p>
                      )}
                    </div>
                  )}
                  {task.submittedAt && (
                    <div className="rounded-xl border border-zinc-100 bg-slate-50/60 p-3.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Submitted At</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-slate-400" />
                        {formatDisplayDate(task.submittedAt)}
                      </p>
                    </div>
                  )}
                  {task.taskStartDate && (
                    <div className="rounded-xl border border-zinc-100 bg-slate-50/60 p-3.5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Started On</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatDisplayDate(task.taskStartDate)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Submission Link */}
                {task.submissionLink && (
                  <div className="rounded-xl border border-zinc-200/80 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Submission Link</p>
                    <a
                      href={task.submissionLink.startsWith("http://") || task.submissionLink.startsWith("https://") ? task.submissionLink : `https://${task.submissionLink}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700 hover:underline break-all"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0" />
                      {task.submissionLink}
                    </a>
                  </div>
                )}

                {/* Submission Note */}
                {task.submissionNote && (
                  <div className="rounded-xl border border-zinc-200/80 bg-slate-50/60 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">Submission Note / Details</p>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {task.submissionNote}
                    </p>
                  </div>
                )}

                {/* Reviews Summary if task completed */}
                {task.status === "completed" && (companyReviewSubmitted || individualReviewSubmitted) && (
                  <div className="mt-4 pt-4 border-t border-zinc-100 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Feedback & Ratings</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {task.reviewStatus?.companyReview && (
                        <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-4 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-violet-900">Company Feedback</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-slate-800">{task.reviewStatus.companyReview.rating}/5</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed italic">
                            "{task.reviewStatus.companyReview.comment}"
                          </p>
                        </div>
                      )}
                      {task.reviewStatus?.individualReview && (
                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-xs font-bold text-emerald-900">Applicant Feedback</p>
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-slate-800">{task.reviewStatus.individualReview.rating}/5</span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed italic">
                            "{task.reviewStatus.individualReview.comment}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 8. Timeline */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 md:p-6 shadow-sm">
              <SectionTitle icon={CalendarDays}>Timeline</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-zinc-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Application Closing</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {task.applicationDeadline ? formatDisplayDate(task.applicationDeadline) : "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Task Start Date</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {task.taskStartDate ? formatDisplayDate(task.taskStartDate) : "Not started"}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-slate-50/60 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Duration</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">{task.duration ? `${task.duration} Days` : "N/A"}</p>
                </div>
                {task.status !== "open" && task.status !== "closed" && (
                  <div className="rounded-xl border border-zinc-100 bg-slate-50/60 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Submission Deadline</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {task.currentDeadline ? formatDisplayDate(task.currentDeadline) : "Not Started"}
                    </p>
                  </div>
                )}
                {task.status === "completed" && task.updatedAt && (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Completed Date</p>
                    <p className="mt-1 text-sm font-semibold text-emerald-900">{formatDisplayDate(task.updatedAt)}</p>
                  </div>
                )}
                {task.deadlineExtensions && task.deadlineExtensions.length > 0 && (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Deadline Extensions</p>
                    <p className="mt-1 text-sm font-semibold text-amber-900">{task.deadlineExtensions.length} extension(s)</p>
                  </div>
                )}
              </div>
            </div>

            {/* 9. Revision Requested Card (Conditional) */}
            {task.status === "revision_requested" && (
              <div className="bg-white rounded-2xl border border-orange-200/80 p-5 md:p-6 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-300 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                    <RotateCcw className="h-3.5 w-3.5" />
                    Revision Requested
                  </span>
                  {task.updatedAt && (
                    <span className="text-xs text-slate-400 font-medium">
                      Requested on {formatDisplayDate(task.updatedAt)}
                    </span>
                  )}
                </div>
                {task.revisionReason && (
                  <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Reason:</span> {task.revisionReason}</p>
                )}
                {task.revisionExpectedChanges && (
                  <p className="text-sm text-slate-700"><span className="font-semibold text-slate-900">Expected Changes:</span> {task.revisionExpectedChanges}</p>
                )}
                {task.currentDeadline && (
                  <p className="text-xs font-medium text-orange-800 pt-1">
                    Remaining Submission Deadline: {formatDisplayDate(task.currentDeadline)} ({getDeadlineLabel(daysLeft)})
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════
              RIGHT COLUMN — Sticky Master Action Sidebar (Aligned to top of Hero section)
              ═══════════════════════════════════════════ */}
          <div className="lg:col-span-4 lg:sticky lg:top-20 z-10 self-start space-y-4">
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm space-y-5">
              <div>
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold ${statusInfo.cls}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                  {statusInfo.label}
                </span>
              </div>

              {/* Time Remaining / Completion block */}
              {task.status === "completed" ? (
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Completion Status</p>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3.5 py-1 text-xs font-bold text-emerald-700 shadow-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Task Completed
                  </span>
                </div>
              ) : task.status === "closed" ? (
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</p>
                  <span className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-zinc-100 px-3.5 py-1 text-xs font-bold text-zinc-600">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    Task Closed
                  </span>
                </div>
              ) : task.status === "under_review" ? (
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">Work Status</p>
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 shadow-sm">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                    Under Review
                  </span>
                </div>
              ) : isSubmissionOverdue ? (
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Submission Status
                  </p>
                  <span className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-50 px-3.5 py-1 text-xs font-bold text-red-700 shadow-sm">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Submission Overdue
                  </span>
                </div>
              ) : (
                <div>
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {task.status === "open" ? "Application Closing" : "Submission Due"}
                  </p>
                  <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold ${uStyle.bg} ${uStyle.text} ${uStyle.border}`}>
                    <span className={`h-2 w-2 rounded-full ${uStyle.dot}`} />
                    {getDeadlineLabel(daysLeft)}
                  </span>
                </div>
              )}

              {/* Deadline / Completed Date block */}
              {task.status === "completed" ? (
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Completed Date</p>
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <CalendarDays className="h-4 w-4 text-emerald-600" />
                    {formatDisplayDate(task.updatedAt)}
                  </p>
                </div>
              ) : task.status === "closed" ? (
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Closed Date</p>
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <CalendarDays className="h-4 w-4 text-zinc-400" />
                    {formatDisplayDate(task.applicationDeadline || task.updatedAt)}
                  </p>
                </div>
              ) : deadlineDate ? (
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {task.status === "open"
                      ? "Application Deadline"
                      : isSubmissionOverdue
                      ? "Submission Due"
                      : "Submission Deadline"}
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <CalendarDays className="h-4 w-4 text-violet-500" />
                    {deadlineDate}
                  </p>
                </div>
              ) : null}

              {/* Total Applicants / Assignee */}
              {task.selectedApplicant ? (
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Selected Assignee</p>
                  <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-violet-600" />
                    {task.selectedApplicant.name}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Applicants</p>
                  <p className="text-base font-bold text-slate-900">{applicationCount} Applicants</p>
                </div>
              )}

              <div className="pt-3 border-t border-zinc-100">
                {renderPrimaryAction()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        icon={Trash2}
        variant="danger"
        title="Delete Task?"
        message="Are you sure you want to delete this task? This action cannot be undone."
        cancelLabel="Cancel"
        confirmLabel="Delete Task"
      />

      <ConfirmDialog
        open={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
        onConfirm={handleWithdraw}
        icon={AlertTriangle}
        variant="danger"
        title="Withdraw Application?"
        message="Are you sure you want to withdraw your application for this task?"
        cancelLabel="No"
        confirmLabel="Yes, Withdraw"
      />
    </div>
  );
}

export default TaskDetails;