import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  ExternalLink,
  FolderOpen,
  Globe,
  IndianRupee,
  Info,
  Layers3,
  Send,
  Star,
  Users,
  Briefcase,
  ChevronRight,
  AlertTriangle,
  Edit3,
  Trash2,
  CalendarPlus,
  Eye,
  FileText,
  RotateCcw,
  Award,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { ELIGIBLE_LABELS } from "./taskFormConstants";
import WithdrawDialog from "../../components/WithdrawDialog";

/* ── Helpers ────────────────────────────────────────────── */

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item ?? "").trim())
      .filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return [value.trim()];
  }

  return [];
};

function getDaysLeft(deadline) {
  if (!deadline) return null;
  return Math.ceil(
    (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
  );
}

function getUrgency(daysLeft) {
  if (daysLeft === null || daysLeft < 0) return "expired";
  if (daysLeft <= 2) return "critical";
  if (daysLeft <= 7) return "warning";
  return "safe";
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDeadlineLabel(daysLeft) {
  if (daysLeft === null) return "No deadline";
  if (daysLeft < 0) return "Overdue";
  if (daysLeft === 0) return "Ends Today";
  if (daysLeft === 1) return "1 day left";
  return `${daysLeft} days left`;
}

const STATUS_BADGE = {
  open: {
    label: "Open",
    cls: "bg-emerald-100 text-emerald-800 border-emerald-400",
  },
  in_progress: {
    label: "In Progress",
    cls: "bg-sky-50 text-sky-700 border-sky-300",
  },
  under_review: {
    label: "Under Review",
    cls: "bg-amber-50 text-amber-700 border-amber-300",
  },
  completed: {
    label: "Completed",
    cls: "bg-gray-100 text-gray-500 border-gray-300",
  },
  revision_requested: {
    label: "Revision Requested",
    cls: "bg-orange-50 text-orange-700 border-orange-300",
  },
  closed: {
    label: "Closed",
    cls: "bg-gray-100 text-gray-500 border-gray-300",
  },
};

const URGENCY_COLORS = {
  safe: {
    dot: "bg-emerald-500",
    text: "text-emerald-800",
    bg: "bg-emerald-100/90",
    border: "border-emerald-300/90",
    wash: "from-emerald-200/40 via-emerald-100/25 to-transparent",
    glow: "bg-emerald-400/50",
  },
  warning: {
    dot: "bg-amber-500",
    text: "text-amber-800",
    bg: "bg-amber-100/90",
    border: "border-amber-300/90",
    wash: "from-amber-200/40 via-amber-100/25 to-transparent",
    glow: "bg-amber-400/50",
  },
  critical: {
    dot: "bg-red-500",
    text: "text-red-800",
    bg: "bg-red-100/92",
    border: "border-red-300",
    wash: "from-rose-200/45 via-rose-100/28 to-transparent",
    glow: "bg-rose-400/55",
  },
  expired: {
    dot: "bg-gray-400",
    text: "text-gray-600",
    bg: "bg-gray-100/90",
    border: "border-gray-300/90",
    wash: "from-gray-200/40 via-gray-100/25 to-transparent",
    glow: "bg-gray-400/45",
  },
};

/* ── Animation config ───────────────────────────────────── */

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
};

const stagger = (delay = 0) => ({
  ...fadeUp,
  transition: { ...fadeUp.transition, delay },
});

/* ── Reusable sub-components (local to this file) ───────── */

function SectionCard({ children, className = "", delay = 0 }) {
  return (
    <motion.div
      {...stagger(delay)}
      className={`rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.06)] md:p-8 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ icon: Icon, children }) {
  return (
    <h2 className="mb-5 flex items-center gap-2.5 font-display text-xl text-slate-900">
      {Icon && (
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
          <Icon className="h-4 w-4 text-violet-600" strokeWidth={2} />
        </span>
      )}
      {children}
    </h2>
  );
}

function SkillChip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-violet-200/70 bg-violet-50/85 px-3.5 py-1.5 text-xs font-medium text-violet-700">
      {children}
    </span>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-5 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
        <Icon className="h-5 w-5 text-violet-600" strokeWidth={1.8} />
      </span>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="font-display text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StarRating({ rating }) {
  const r = Number(rating) || 0;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= Math.round(r)
              ? "fill-amber-400 text-amber-400"
              : "text-zinc-300"
          }`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationId, setApplicationId] = useState(null);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [applicationCount, setApplicationCount] = useState(0);
  const [applying, setApplying] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [extendingDeadline, setExtendingDeadline] = useState(false);
  const [customExtensionDays, setCustomExtensionDays] = useState("");

  /* ── Fetch ──────────────────────────────────────────── */

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`);
        setTask(response.data.task);
        setHasApplied(response.data.hasApplied);
        setApplicationId(response.data.applicationId);
        setApplicationStatus(response.data.applicationStatus);
        setApplicationCount(response.data.applicationCount || 0);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  /* ── Handlers ────────────────────────────────────────── */

  const handleApply = async () => {
    if (applying) return;
    setApplying(true);
    setMessage("");
    try {
      const response = await api.post("/applications", { taskId: id });
      setMessage(response.data.message);
      setHasApplied(true);
      setApplicationId(response.data.application._id);
      setApplicationStatus("pending");
      setApplicationCount((prev) => prev + 1);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to apply");
    } finally {
      setApplying(false);
    }
  };

  const handleConfirmWithdraw = async () => {
    setShowWithdrawDialog(false);
    if (withdrawing) return;
    setWithdrawing(true);
    setMessage("");
    try {
      const response = await api.put(
        `/applications/${applicationId}/withdraw`
      );
      setMessage(response.data.message);
      setHasApplied(false);
      setApplicationId(null);
      setApplicationStatus(null);
      setApplicationCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to withdraw"
      );
    } finally {
      setWithdrawing(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete this task?\n\nThis action cannot be undone."
    );
    if (!confirmed || deleting) return;
    setDeleting(true);
    setMessage("");
    try {
      await api.delete(`/tasks/${id}`);
      navigate("/company-dashboard");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to delete task"
      );
      setDeleting(false);
    }
  };

  const handleExtendSubmissionDeadline = async (days) => {
    if (extendingDeadline) return;
    setExtendingDeadline(true);
    setMessage("");
    setCustomExtensionDays("");
    try {
      const response = await api.put(
        `/tasks/${id}/extend-submission-deadline`,
        { days }
      );
      setTask(response.data.task);
      setMessage(response.data.message);
      setCustomExtensionDays("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Failed to extend deadline"
      );
    } finally {
      setExtendingDeadline(false);
    }
  };

  const handleExtendApplicationDeadline = async (days) => {
    if (extendingDeadline) return;
    setExtendingDeadline(true);
    setMessage("");
    try {
      const response = await api.put(
        `/tasks/${id}/extend-application-deadline`,
        { days }
      );
      setTask(response.data.task);
      setMessage(response.data.message);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to extend application deadline"
      );
    } finally {
      setExtendingDeadline(false);
    }
  };

  /* ── Derived values ─────────────────────────────────── */

  const isOwner =
    user?.role === "company" &&
    task?.postedBy?._id === user?.userId;

  const isSelectedApplicant =
    user?.role === "individual" &&
    task?.selectedApplicant?._id === user?.userId;

  const reviewStatus = task?.reviewStatus || {};
  const companyReviewSubmitted = !!reviewStatus.companyReviewSubmitted;
  const individualReviewSubmitted = !!reviewStatus.individualReviewSubmitted;

  const canEdit =
    isOwner && task?.status === "open" && applicationCount === 0;

  const canDelete =
    isOwner && task?.status === "open" && applicationCount === 0;

  const canExtendDeadline =
    isOwner &&
    ["in_progress", "under_review", "revision_requested"].includes(
      task?.status
    );

  /* ── Loading state ──────────────────────────────────── */

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-50" />
        <div className="relative mx-auto max-w-5xl px-6 py-12">
          {/* Back link skeleton */}
          <div className="mb-6 h-4 w-40 animate-pulse rounded bg-surface-2" />

          {/* Header skeleton */}
          <div className="mb-6 animate-pulse rounded-2xl border border-border bg-card p-8 shadow-elegant">
            <div className="h-7 w-3/5 rounded bg-surface-2 mb-3" />
            <div className="h-4 w-48 rounded bg-surface-2 mb-4" />
            <div className="h-3 w-full rounded bg-surface-2 mb-2" />
            <div className="h-3 w-4/5 rounded bg-surface-2 mb-5" />
            <div className="flex gap-2">
              <div className="h-7 w-20 rounded-full bg-surface-2" />
              <div className="h-7 w-16 rounded-full bg-surface-2" />
              <div className="h-7 w-24 rounded-full bg-surface-2" />
            </div>
          </div>

          {/* Two cards skeleton */}
          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <div className="animate-pulse rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <div className="h-5 w-32 rounded bg-surface-2 mb-4" />
              <div className="h-3 w-full rounded bg-surface-2 mb-2" />
              <div className="h-3 w-full rounded bg-surface-2 mb-2" />
              <div className="h-3 w-3/4 rounded bg-surface-2" />
            </div>
            <div className="animate-pulse rounded-2xl border border-border bg-card p-6 shadow-elegant">
              <div className="h-5 w-28 rounded bg-surface-2 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-surface-2" />
                    <div className="h-3 w-3/4 rounded bg-surface-2" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info card skeleton */}
          <div className="animate-pulse rounded-2xl border border-border bg-card p-6 shadow-elegant mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-2 rounded-xl bg-zinc-50 p-5"
                >
                  <div className="h-10 w-10 rounded-xl bg-surface-2" />
                  <div className="h-3 w-16 rounded bg-surface-2" />
                  <div className="h-5 w-20 rounded bg-surface-2" />
                </div>
              ))}
            </div>
          </div>

          {/* CTA skeleton */}
          <div className="animate-pulse rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 w-48 rounded bg-surface-2 mb-2" />
                <div className="h-3 w-64 rounded bg-surface-2" />
              </div>
              <div className="h-11 w-36 rounded-xl bg-surface-2" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Not found ──────────────────────────────────────── */

  if (!task) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-50" />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-24 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-border">
            <Info className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-2xl text-ink">Task Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This task may have been removed or doesn't exist.
          </p>
          <Link
            to="/tasks"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <ArrowLeft className="h-4 w-4" />
            Browse Tasks
          </Link>
        </div>
      </div>
    );
  }

  /* ── Derived display data ───────────────────────────── */

  const deliverables = normalizeStringArray(task.deliverables);
  const eligibilityAndPreferences = normalizeStringArray(
    task.eligibilityAndPreferences
  );

  const daysLeft = getDaysLeft(
    task.status === "open"
      ? task.applicationDeadline
      : task.currentDeadline
  );
  const urgency = getUrgency(daysLeft);
  const uStyle = URGENCY_COLORS[urgency];
  const statusInfo = STATUS_BADGE[task.status] || STATUS_BADGE.open;
  const postedDate = formatDisplayDate(task.createdAt);
  const deadlineDate = formatDisplayDate(
    task.status === "open"
      ? task.applicationDeadline
      : task.currentDeadline
  );

  // Company fields — defensively accessed
  const companyName = task.postedBy?.companyName || null;
  const companyDescription = task.postedBy?.companyDescription || null;
  const companyWebsite = task.postedBy?.website || null;
  const companyIndustry = task.postedBy?.industry || null;
  const companyRating = task.postedBy?.averageRating ?? null;
  const companyReviewCount = task.postedBy?.totalReviews ?? task.postedBy?.reviewCount ?? null;

  const hasRating =
    companyRating !== null &&
    companyRating !== undefined &&
    Number(companyRating) > 0;

  /* ── Render ─────────────────────────────────────────── */

  // Primary action button content — used in sticky card
  const renderPrimaryAction = () => {
    if (user?.role === "individual" && task.status === "open") {
      if (!hasApplied) {
        const closed = new Date() > new Date(task.applicationDeadline);
        return (
          <button
            onClick={handleApply}
            disabled={applying || closed}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant disabled:opacity-50 disabled:hover:translate-y-0"
          >
            <Send className="h-4 w-4" strokeWidth={1.8} />
            {applying ? "Applying..." : closed ? "Applications Closed" : "Apply Now"}
          </button>
        );
      }
      if (applicationStatus === "pending") {
        return (
          <div className="space-y-2">
            <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Application Submitted
            </span>
            <button
              onClick={() => setShowWithdrawDialog(true)}
              disabled={withdrawing}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 disabled:opacity-50"
            >
              {withdrawing ? "Withdrawing..." : "Withdraw Application"}
            </button>
          </div>
        );
      }
      return (
        <span className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          Application Submitted
        </span>
      );
    }

    if (user?.role === "company" && isOwner) {
      if (canEdit) {
        return (
          <Link
            to={`/tasks/${task._id}/edit`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <Edit3 className="h-4 w-4" strokeWidth={1.8} />
            Edit Task
          </Link>
        );
      }
      if (task.status === "open") {
        return (
          <Link
            to={`/task-applicants/${task._id}`}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant"
          >
            <Eye className="h-4 w-4" strokeWidth={1.8} />
            View Applicants
          </Link>
        );
      }
      return null;
    }

    return null;
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-x-clip bg-canvas">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-50" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-10%] top-[-12%] h-72 w-72 rounded-full bg-violet/10 blur-3xl" />
        <div className="absolute left-[-6%] bottom-[8%] h-64 w-64 rounded-full bg-sky/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pt-8 pb-16 md:px-8 md:pt-12">
        {/* ═══════════════════════════════════════════════
            1. BACK LINK
            ═══════════════════════════════════════════════ */}
        <motion.div {...stagger(0)}>
          <Link
            to="/tasks"
            className="group mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 transition-colors hover:text-violet-800"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Back to Browse Tasks
          </Link>
        </motion.div>

        {/* ═══════════════════════════════════════════════
            TWO-COLUMN GRID LAYOUT: 75% main content / 25% sticky sidebar
            ═══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 gap-6 items-start lg:grid-cols-12">

          {/* ─────────── LEFT: main content column (75% / col-span-9) ─────────── */}
          <div className="min-w-0 lg:col-span-9">

            {/* ═══════════════════════════════════════════════
                2. HEADER CARD
                ═══════════════════════════════════════════════ */}
            <motion.div
              {...stagger(0.05)}
              className="group relative mb-5 overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.07)]"
            >
              {/* Urgency wash on far right */}
              <div
                className={`pointer-events-none absolute right-0 top-0 bottom-0 w-[8%] min-w-[50px] bg-gradient-to-l ${uStyle.wash} opacity-75`}
              />
              <div
                className={`pointer-events-none absolute right-0 top-4 bottom-4 w-[5px] rounded-full blur-[2.5px] ${uStyle.glow}`}
              />

              <div className="relative p-6 md:p-8">
                <h1 className="font-display text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                  {task.title}
                </h1>

                {/* Integrated metadata row: Company, Posted date & Budget */}
                <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
                  {companyName && (
                    <p className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                      <Building2 className="h-4 w-4 text-violet-500" strokeWidth={1.8} />
                      {companyName}
                    </p>
                  )}
                  {postedDate && (
                    <>
                      {companyName && <span className="text-slate-300">•</span>}
                      <p className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.7} />
                        Posted on {postedDate}
                      </p>
                    </>
                  )}
                  {(companyName || postedDate) && <span className="text-slate-300">•</span>}
                  <p className="inline-flex items-center gap-1 font-bold text-slate-900">
                    <IndianRupee className="h-4 w-4 text-violet-600" strokeWidth={2} />
                    ₹{task.budget?.toLocaleString("en-IN") ?? 0}
                  </p>
                </div>

                {/* Description */}
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  {task.description}
                </p>

                {/* Skill chips — all skills */}
                {task.skillsRequired && task.skillsRequired.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      Skills Required
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {task.skillsRequired.map((s) => (
                        <SkillChip key={s}>{s}</SkillChip>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* ═══════════════════════════════════════════════
                3. ABOUT THE TASK + DELIVERABLES
                ═══════════════════════════════════════════════ */}
            <div className="mb-4 grid gap-4 lg:grid-cols-2">
              <SectionCard delay={0.1}>
                <SectionTitle icon={FileText}>About the Task</SectionTitle>
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {task.description}
                </p>
              </SectionCard>

              <SectionCard delay={0.15}>
                <SectionTitle icon={CheckCircle2}>Deliverables</SectionTitle>
                {deliverables.length > 0 ? (
                  <ul className="space-y-3">
                    {deliverables.map((item, index) => (
                      <li
                        key={`deliverable-${index}`}
                        className="flex items-start gap-3 text-sm text-slate-600"
                      >
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" strokeWidth={2} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400 italic">No deliverables specified</p>
                )}
              </SectionCard>
            </div>

            {/* ═══════════════════════════════════════════════
                4. TASK INFORMATION CARD
                ═══════════════════════════════════════════════ */}
            <SectionCard delay={0.2} className="mb-4">
              <SectionTitle icon={Info}>Task Information</SectionTitle>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <InfoItem icon={FolderOpen} label="Category" value={task.category || "—"} />
                <InfoItem icon={Clock} label="Duration" value={`${task.duration} Days`} />
                <InfoItem
                  icon={Users}
                  label="Applicants"
                  value={applicationCount > 0 ? `${applicationCount}` : "0"}
                />
                <InfoItem
                  icon={CalendarDays}
                  label="Deadline"
                  value={deadlineDate || "N/A"}
                />
              </div>
            </SectionCard>

            {/* ═══════════════════════════════════════════════
                5. REQUIRED SKILLS CARD
                ═══════════════════════════════════════════════ */}
            {task.skillsRequired && task.skillsRequired.length > 0 && (
              <SectionCard delay={0.25} className="mb-4">
                <SectionTitle icon={Layers3}>Required Skills</SectionTitle>
                <div className="flex flex-wrap gap-2.5">
                  {task.skillsRequired.map((s) => (
                    <SkillChip key={s}>{s}</SkillChip>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* ═══════════════════════════════════════════════
                6. ABOUT THE COMPANY
                ═══════════════════════════════════════════════ */}
            <SectionCard delay={0.3} className="mb-4">
              <SectionTitle icon={Building2}>About the Company</SectionTitle>
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                {/* Left — company info */}
                <div className="min-w-0 flex-1 space-y-3">
                  {companyName && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Company</p>
                      <p className="mt-1 text-base font-semibold text-slate-900">{companyName}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Description</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">
                      {companyDescription || "No company description available"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Website</p>
                    {companyWebsite ? (
                      <a
                        href={companyWebsite}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors"
                      >
                        <Globe className="h-3.5 w-3.5" strokeWidth={1.8} />
                        {companyWebsite}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <p className="mt-1 text-sm text-slate-400 italic">No website provided</p>
                    )}
                  </div>
                  {companyIndustry && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Industry</p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                        <Briefcase className="h-3.5 w-3.5 text-violet-500" strokeWidth={1.8} />
                        {companyIndustry}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right — Rating card */}
                <div className="shrink-0 rounded-xl border border-zinc-200/80 bg-gradient-to-br from-violet-50/60 to-white p-5 text-center lg:min-w-[200px]">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">TaskHub Rating</p>
                  {hasRating ? (
                    <>
                      <div className="flex items-center justify-center gap-2">
                        <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                        <span className="font-display text-3xl font-bold text-slate-900">
                          {Number(companyRating).toFixed(1)}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-center">
                        <StarRating rating={companyRating} />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        Based on{" "}
                        {companyReviewCount != null
                          ? `${companyReviewCount} verified review${companyReviewCount !== 1 ? "s" : ""}`
                          : "verified reviews"}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-center gap-2">
                        <Star className="h-6 w-6 text-zinc-300" />
                        <span className="font-display text-xl text-slate-400">—</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-400">No ratings yet</p>
                    </>
                  )}
                </div>
              </div>
            </SectionCard>

            {/* ═══════════════════════════════════════════════
                7. ELIGIBILITY & PREFERENCES
                ═══════════════════════════════════════════════ */}
            {(eligibilityAndPreferences.length > 0 ||
              (task.eligibleFor && task.eligibleFor.length > 0)) && (
              <SectionCard delay={0.35} className="mb-4">
                <SectionTitle icon={Award}>Eligibility & Preferences</SectionTitle>
                {task.eligibleFor && task.eligibleFor.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Eligible For</p>
                    <div className="flex flex-wrap gap-2">
                      {task.eligibleFor.map((e) => (
                        <span
                          key={e}
                          className="inline-flex items-center rounded-full border border-emerald-200/70 bg-emerald-50/80 px-3 py-1.5 text-xs font-medium text-emerald-700"
                        >
                          {ELIGIBLE_LABELS[e] || e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {eligibilityAndPreferences.length > 0 && (
                  <ul className="space-y-2">
                    {eligibilityAndPreferences.map((item, index) => (
                      <li
                        key={`eligibility-preference-${index}`}
                        className="flex items-start gap-2.5 text-sm text-slate-600"
                      >
                        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-violet-400" strokeWidth={2} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            )}

            {/* ═══════════════════════════════════════════════
                TIMELINE
                ═══════════════════════════════════════════════ */}
            <SectionCard delay={0.38} className="mb-4">
              <SectionTitle icon={CalendarDays}>Timeline</SectionTitle>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Application Closing</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {task.applicationDeadline ? formatDisplayDate(task.applicationDeadline) : "N/A"}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Task Start Date</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {task.taskStartDate
                      ? formatDisplayDate(task.taskStartDate)
                      : task.applicationDeadline
                      ? formatDisplayDate(task.applicationDeadline)
                      : "N/A"}
                  </p>
                </div>
                {task.status !== "open" && (
                  <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Submission Deadline</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {task.currentDeadline ? formatDisplayDate(task.currentDeadline) : "N/A"}
                    </p>
                  </div>
                )}
              </div>
              {task.deadlineExtensions && task.deadlineExtensions.length > 0 && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <CalendarPlus className="h-3.5 w-3.5" strokeWidth={1.7} />
                  Deadline extended {task.deadlineExtensions.length} time
                  {task.deadlineExtensions.length !== 1 ? "s" : ""}
                </p>
              )}
            </SectionCard>

            {/* MESSAGE */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-violet-200/60 bg-violet-50/70 px-5 py-3.5 text-sm font-medium text-violet-800"
              >
                {message}
              </motion.div>
            )}

            {/* ═══════════════════════════════════════════════
                COMPANY OWNER ACTIONS
                ═══════════════════════════════════════════════ */}
            {user?.role === "company" && isOwner && (
              <SectionCard delay={0.4} className="mb-4">
                <SectionTitle icon={Briefcase}>Manage Task</SectionTitle>

                {/* Edit / Delete row */}
                {(canEdit || canDelete) && (
                  <div className="mb-5 flex flex-wrap items-center gap-3">
                    {canEdit && (
                      <Link
                        to={`/tasks/${task._id}/edit`}
                        className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5 text-sm font-semibold text-violet-700 transition-all hover:bg-violet-100 hover:shadow-sm"
                      >
                        <Edit3 className="h-4 w-4" strokeWidth={1.8} />
                        Edit Task
                      </Link>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-all hover:bg-red-100 hover:shadow-sm disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                        {deleting ? "Deleting..." : "Delete Task"}
                      </button>
                    )}
                  </div>
                )}

                {/* Extend submission deadline */}
                {canExtendDeadline && (
                  <div className="mb-5 rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4">
                    <p className="mb-3 text-sm font-semibold text-slate-700">
                      Extend Submission Deadline
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        placeholder="Days"
                        value={customExtensionDays}
                        onChange={(e) =>
                          setCustomExtensionDays(e.target.value)
                        }
                        disabled={extendingDeadline}
                        className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-50"
                      />
                      <button
                        onClick={() =>
                          handleExtendSubmissionDeadline(
                            Number(customExtensionDays)
                          )
                        }
                        disabled={
                          extendingDeadline ||
                          !customExtensionDays ||
                          Number(customExtensionDays) < 1
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant disabled:opacity-50 disabled:hover:translate-y-0"
                      >
                        <CalendarPlus className="h-4 w-4" strokeWidth={1.8} />
                        Extend
                      </button>
                    </div>
                  </div>
                )}

                {/* Open — view applicants + extend application deadline */}
                {task.status === "open" && (
                  <>
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <Link
                        to={`/task-applicants/${task._id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant"
                      >
                        <Eye className="h-4 w-4" strokeWidth={1.8} />
                        View Applicants
                      </Link>
                      <span className="text-xs text-slate-400">
                        {applicationCount} application
                        {applicationCount !== 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/60 p-4">
                      <p className="mb-3 text-sm font-semibold text-slate-700">
                        Extend Application Deadline
                      </p>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          min="1"
                          placeholder="Days"
                          value={customExtensionDays}
                          onChange={(e) =>
                            setCustomExtensionDays(e.target.value)
                          }
                          disabled={extendingDeadline}
                          className="w-24 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 disabled:opacity-50"
                        />
                        <button
                          onClick={() =>
                            handleExtendApplicationDeadline(
                              Number(customExtensionDays)
                            )
                          }
                          disabled={
                            extendingDeadline ||
                            !customExtensionDays ||
                            Number(customExtensionDays) < 1
                          }
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                          <CalendarPlus className="h-4 w-4" strokeWidth={1.8} />
                          Extend
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* In progress — selected applicant info */}
                {task.status === "in_progress" &&
                  task.selectedApplicant && (
                    <div className="rounded-xl border border-sky-200/70 bg-sky-50/50 p-5">
                      <p className="mb-3 text-sm font-bold text-sky-800">
                        Selected Applicant
                      </p>
                      <div className="space-y-1.5 text-sm text-slate-600">
                        <p>
                          <span className="font-medium text-slate-700">Name:</span>{" "}
                          {task.selectedApplicant.name}
                        </p>
                        <p>
                          <span className="font-medium text-slate-700">Email:</span>{" "}
                          {task.selectedApplicant.email}
                        </p>
                        <p>
                          <span className="font-medium text-slate-700">Type:</span>{" "}
                          {ELIGIBLE_LABELS[
                            task.selectedApplicant.individualType
                          ] || task.selectedApplicant.individualType}
                        </p>
                      </div>
                      <p className="mt-4 text-sm font-medium text-sky-700">
                        Task currently in progress.
                      </p>

                      {task.status !== "open" && (
                        <p className="mt-2 text-xs text-slate-500">
                          Submission Deadline:{" "}
                          {task.currentDeadline
                            ? formatDisplayDate(task.currentDeadline)
                            : "Not Started"}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-slate-500">
                        Days Left:{" "}
                        {(() => {
                          const deadline =
                            task.status === "open"
                              ? task.applicationDeadline
                              : task.currentDeadline;
                          const dl = getDaysLeft(deadline);
                          if (dl === null) return "Not Started";
                          if (dl < 0) return "Overdue";
                          return `${dl} days left`;
                        })()}
                      </p>
                    </div>
                  )}

                {/* Under review — submission summary */}
                {task.status === "under_review" && (
                  <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 p-5">
                    <p className="mb-3 text-sm font-bold text-amber-800">
                      Submission Summary
                    </p>
                    {task.selectedApplicant && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium text-slate-700">
                          Applicant:
                        </span>{" "}
                        {task.selectedApplicant.name}
                      </p>
                    )}
                    <p className="mt-1.5 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">
                        Submission Link:
                      </span>{" "}
                      <a
                        href={task.submissionLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-violet-600 hover:text-violet-800 underline"
                      >
                        {task.submissionLink}
                      </a>
                    </p>
                    <p className="mt-1.5 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">
                        Submission Note:
                      </span>{" "}
                      {task.submissionNote}
                    </p>
                    <p className="mt-1.5 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">
                        Submitted At:
                      </span>{" "}
                      {new Date(task.submittedAt).toLocaleString()}
                    </p>

                    {task.status !== "open" && (
                      <p className="mt-2 text-xs text-slate-500">
                        Submission Deadline:{" "}
                        {task.currentDeadline
                          ? formatDisplayDate(task.currentDeadline)
                          : "Not Started"}
                      </p>
                    )}

                    <Link
                      to={`/tasks/${task._id}/review`}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant"
                    >
                      <Eye className="h-4 w-4" strokeWidth={1.8} />
                      Review Submission
                    </Link>
                  </div>
                )}

                {/* Revision requested */}
                {task.status === "revision_requested" && (
                  <div className="rounded-xl border border-orange-200/70 bg-orange-50/50 p-5">
                    <p className="mb-3 text-sm font-bold text-orange-800">
                      Revision Requested
                    </p>
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-700">Reason:</span>{" "}
                      {task.revisionReason}
                    </p>
                    <p className="mt-1.5 text-sm text-slate-600">
                      <span className="font-medium text-slate-700">
                        Expected Changes:
                      </span>{" "}
                      {task.revisionExpectedChanges}
                    </p>
                    <p className="mt-3 text-sm text-orange-700 font-medium">
                      Waiting for resubmission.
                    </p>
                    <p className="mt-1.5 text-xs text-slate-500">
                      Submission Deadline:{" "}
                      {task.currentDeadline
                        ? formatDisplayDate(task.currentDeadline)
                        : "Not Started"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Days Left:{" "}
                      {(() => {
                        const days = getDaysLeft(task.currentDeadline);
                        if (days == null) return "Not Started";
                        if (days < 0) return "Overdue";
                        return `${days} days`;
                      })()}
                    </p>
                  </div>
                )}

                {/* Completed */}
                {task.status === "completed" && (
                  <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-5">
                    <p className="mb-3 text-sm font-bold text-emerald-800">
                      Task Completed
                    </p>
                    {task.selectedApplicant && (
                      <p className="text-sm text-slate-600">
                        <span className="font-medium text-slate-700">
                          Completed By:
                        </span>{" "}
                        {task.selectedApplicant.name}
                      </p>
                    )}
                    {task.submissionLink && (
                      <p className="mt-1.5 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">
                          Submission Link:
                        </span>{" "}
                        <a
                          href={task.submissionLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-violet-600 hover:text-violet-800 underline"
                        >
                          {task.submissionLink}
                        </a>
                      </p>
                    )}
                    {task.submissionNote && (
                      <p className="mt-1.5 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">
                          Submission Note:
                        </span>{" "}
                        {task.submissionNote}
                      </p>
                    )}
                    {task.submittedAt && (
                      <p className="mt-1.5 text-sm text-slate-600">
                        <span className="font-medium text-slate-700">
                          Submitted At:
                        </span>{" "}
                        {new Date(task.submittedAt).toLocaleString()}
                      </p>
                    )}

                    <div className="mt-4 space-y-2">
                      {companyReviewSubmitted ? (
                        <p className="inline-flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          Company Review Submitted
                        </p>
                      ) : (
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-sm text-amber-700 font-medium">
                            Pending Review
                          </p>
                          <Link
                            to={`/tasks/${task._id}/review`}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant"
                          >
                            Leave Review
                          </Link>
                        </div>
                      )}
                      {individualReviewSubmitted && (
                        <p className="inline-flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
                          <CheckCircle2 className="h-4 w-4" />
                          Individual Review Submitted
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </SectionCard>
            )}

            {/* ═══════════════════════════════════════════════
                INDIVIDUAL USER — STATUS SECTIONS
                ═══════════════════════════════════════════════ */}
            {user?.role === "individual" && (
              <>
                {/* In progress — assigned */}
                {task.status === "in_progress" &&
                  isSelectedApplicant && (
                    <SectionCard delay={0.4} className="mb-4">
                      <div className="rounded-xl border border-sky-200/70 bg-sky-50/50 p-5">
                        <p className="text-sm font-bold text-sky-800 mb-2">
                          Assigned To You
                        </p>
                        <p className="text-sm text-slate-600">
                          Deadline:{" "}
                          {(() => {
                            const dl = getDaysLeft(task.currentDeadline);
                            if (dl === null) return "N/A";
                            if (dl < 0) return "Overdue";
                            return `${dl} days left`;
                          })()}
                        </p>
                        <Link
                          to={`/tasks/${task._id}/submit`}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant"
                        >
                          <Send className="h-4 w-4" strokeWidth={1.8} />
                          Submit Work
                        </Link>
                      </div>
                    </SectionCard>
                  )}

                {task.status === "in_progress" &&
                  !isSelectedApplicant && (
                    <SectionCard delay={0.4} className="mb-4">
                      <div className="rounded-xl border border-sky-200/70 bg-sky-50/50 px-5 py-4">
                        <p className="text-sm font-medium text-sky-700">Task In Progress</p>
                      </div>
                    </SectionCard>
                  )}

                {/* Under review */}
                {task.status === "under_review" && (
                  <SectionCard delay={0.4} className="mb-4">
                    <div className="rounded-xl border border-amber-200/70 bg-amber-50/50 px-5 py-4">
                      <p className="text-sm font-bold text-amber-800 mb-1">Work Submitted</p>
                      <p className="text-sm text-slate-600">Awaiting Company Review</p>
                    </div>
                  </SectionCard>
                )}

                {/* Revision requested */}
                {task.status === "revision_requested" &&
                  isSelectedApplicant && (
                    <SectionCard delay={0.4} className="mb-4">
                      <div className="rounded-xl border border-orange-200/70 bg-orange-50/50 p-5">
                        <p className="text-sm font-bold text-orange-800 mb-2">Revision Requested</p>
                        <p className="text-sm text-slate-600">
                          <span className="font-medium text-slate-700">Reason:</span>{" "}
                          {task.revisionReason}
                        </p>
                        <p className="mt-1.5 text-sm text-slate-600">
                          <span className="font-medium text-slate-700">Expected Changes:</span>{" "}
                          {task.revisionExpectedChanges}
                        </p>
                        <Link
                          to={`/tasks/${task._id}/submit`}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant"
                        >
                          <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
                          Resubmit Work
                        </Link>
                      </div>
                    </SectionCard>
                  )}

                {task.status === "revision_requested" &&
                  !isSelectedApplicant && (
                    <SectionCard delay={0.4} className="mb-4">
                      <div className="rounded-xl border border-orange-200/70 bg-orange-50/50 px-5 py-4">
                        <p className="text-sm font-medium text-orange-700">Revision Requested</p>
                      </div>
                    </SectionCard>
                  )}

                {/* Completed */}
                {task.status === "completed" && (
                  <SectionCard delay={0.4} className="mb-4">
                    <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-5">
                      <p className="text-sm font-bold text-emerald-800 mb-3">Task Completed</p>
                      {isSelectedApplicant && (
                        <div className="space-y-2">
                          {companyReviewSubmitted ? (
                            <p className="inline-flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
                              <CheckCircle2 className="h-4 w-4" />
                              Company Review Submitted
                            </p>
                          ) : (
                            <p className="text-sm text-amber-700 font-medium">Waiting for Company Review</p>
                          )}
                          {companyReviewSubmitted && !individualReviewSubmitted && (
                            <div>
                              <p className="text-sm text-amber-700 font-medium mb-2">Pending Review</p>
                              <Link
                                to={`/tasks/${task._id}/review`}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-elegant"
                              >
                                Review Company
                              </Link>
                            </div>
                          )}
                          {individualReviewSubmitted && (
                            <p className="inline-flex items-center gap-1.5 text-sm text-emerald-700 font-medium">
                              <CheckCircle2 className="h-4 w-4" />
                              Individual Review Submitted
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </SectionCard>
                )}
              </>
            )}



          </div>{/* end left column */}

          {/* ─────────── RIGHT: sticky action card (25% / col-span-3) ─────────── */}
          <motion.div
            {...stagger(0.08)}
            className="lg:col-span-3 lg:sticky lg:top-20 z-10"
          >
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
              {/* Status */}
              <div className="mb-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Status</p>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold leading-none ${statusInfo.cls}`}>
                  {statusInfo.label}
                </span>
              </div>

              {/* Days left */}
              <div className="mb-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Time Remaining</p>
                <span className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold shadow-sm ${uStyle.bg} ${uStyle.text} ${uStyle.border}`}>
                  <span className={`h-2 w-2 rounded-full ${uStyle.dot}`} />
                  {getDeadlineLabel(daysLeft)}
                </span>
              </div>

              {/* Deadline */}
              {deadlineDate && (
                <div className="mb-4">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Deadline</p>
                  <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <CalendarDays className="h-3.5 w-3.5 text-violet-500" strokeWidth={1.7} />
                    {deadlineDate}
                  </p>
                </div>
              )}

              {/* Applicants — visible to all users */}
              <div className="mb-5">
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">Total Applicants</p>
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                  <Users className="h-3.5 w-3.5 text-violet-500" strokeWidth={1.7} />
                  {applicationCount} applicant{applicationCount !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Divider */}
              <div className="mb-4 border-t border-zinc-100" />

              {/* Primary action */}
              {renderPrimaryAction()}
            </div>
          </motion.div>

        </div>{/* end grid */}
      </div>

      {/* Withdraw confirmation dialog */}
      <WithdrawDialog
        open={showWithdrawDialog}
        onClose={() => setShowWithdrawDialog(false)}
        onConfirm={handleConfirmWithdraw}
      />
    </div>
  );
}

export default TaskDetails;