import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  ExternalLink,
  Clock,
  User,
  Star,
  CheckCircle2,
  RotateCcw,
  MessageSquare,
  Send,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import {
  PageHeader,
  Card,
  StatusBadge,
  TextAreaField,
  SelectField,
  PrimaryButton,
  SecondaryButton,
  DangerButton,
  ConfirmDialog,
} from "../../components/ui";

const ease = [0.22, 1, 0.36, 1];

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ── Loading skeleton ───────────────────────────────────────── */
function ReviewSkeleton() {
  const shimmer = "animate-pulse bg-surface-2 rounded";
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto w-[94%] max-w-[900px] py-10 md:py-14">
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="space-y-3">
            <div className={`h-3 w-24 ${shimmer}`} />
            <div className={`h-8 w-64 ${shimmer}`} />
            <div className={`h-4 w-80 ${shimmer}`} />
          </div>
        </div>
        <div className="mb-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className={`h-5 w-40 mb-4 ${shimmer}`} />
          <div className={`h-4 w-full mb-2 ${shimmer}`} />
          <div className={`h-4 w-2/3 mb-2 ${shimmer}`} />
          <div className={`h-4 w-1/2 ${shimmer}`} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className={`h-5 w-32 mb-4 ${shimmer}`} />
          <div className={`h-24 w-full ${shimmer}`} />
        </div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  REVIEW SUBMISSION PAGE                                       */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ReviewSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [completing, setCompleting] = useState(false);
  const [requestingChanges, setRequestingChanges] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");
  const [revisionExpectedChanges, setRevisionExpectedChanges] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  // Confirm dialog state
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "",
    onConfirm: () => {},
    variant: "warning",
    icon: CheckCircle2,
  });

  const reviewStatus = task?.reviewStatus || {};
  const companyReviewSubmitted = !!reviewStatus.companyReviewSubmitted;
  const individualReviewSubmitted = !!reviewStatus.individualReviewSubmitted;

  const isOwner =
    user?.role === "company" && task?.postedBy?._id === user?.userId;

  const isSelectedApplicant =
    user?.role === "individual" &&
    task?.selectedApplicant?._id === user?.userId;

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await api.get(`/tasks/${id}`);
        setTask(response.data.task);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  /* ── Action handlers ─────────────────────────────────────── */
  const handleComplete = () => {
    setConfirmConfig({
      open: true,
      title: "Mark as Completed?",
      message:
        "This will mark the task as completed. This action cannot be undone.",
      confirmLabel: "Yes, Complete",
      variant: "primary",
      icon: CheckCircle2,
      onConfirm: async () => {
        setConfirmConfig((c) => ({ ...c, open: false }));
        if (completing) return;
        setCompleting(true);
        setMessage("");
        try {
          const response = await api.put(`/tasks/${id}/complete`);
          setMessage(response.data.message);
          setMessageType("success");
          const updatedTask = await api.get(`/tasks/${id}`);
          setTask(updatedTask.data.task);
        } catch (error) {
          setMessage(
            error.response?.data?.message || "Failed to complete task"
          );
          setMessageType("error");
        } finally {
          setCompleting(false);
        }
      },
    });
  };

  const handleRequestChanges = (e) => {
    e.preventDefault();
    setConfirmConfig({
      open: true,
      title: "Request Changes?",
      message:
        "The applicant will need to revise and resubmit their work.",
      confirmLabel: "Yes, Request Changes",
      variant: "warning",
      icon: RotateCcw,
      onConfirm: async () => {
        setConfirmConfig((c) => ({ ...c, open: false }));
        if (requestingChanges) return;
        setRequestingChanges(true);
        setMessage("");
        try {
          const response = await api.put(`/tasks/${id}/request-changes`, {
            reason: revisionReason,
            expectedChanges: revisionExpectedChanges,
          });
          setMessage(response.data.message);
          setMessageType("success");
          setTask({
            ...task,
            status: "revision_requested",
            revisionReason,
            revisionExpectedChanges,
          });
          setShowRevisionForm(false);
        } catch (error) {
          setMessage(
            error.response?.data?.message || "Failed to request changes"
          );
          setMessageType("error");
        } finally {
          setRequestingChanges(false);
        }
      },
    });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setConfirmConfig({
      open: true,
      title: "Submit Review?",
      message: "Your review will be visible to the other party.",
      confirmLabel: "Submit Review",
      variant: "primary",
      icon: Star,
      onConfirm: async () => {
        setConfirmConfig((c) => ({ ...c, open: false }));
        if (submittingReview) return;
        setSubmittingReview(true);
        setMessage("");
        try {
          const response = await api.post(`/reviews/${id}`, {
            rating: reviewRating,
            comment: reviewComment,
          });
          setMessage(response.data.message);
          setMessageType("success");
          setTask({
            ...task,
            reviewStatus: {
              ...reviewStatus,
              companyReviewSubmitted:
                user?.role === "company" ? true : companyReviewSubmitted,
              individualReviewSubmitted:
                user?.role === "individual"
                  ? true
                  : individualReviewSubmitted,
            },
          });
          setTimeout(() => {
            if (user?.role === "company") {
              navigate("/company-dashboard");
            } else {
              navigate("/individual-dashboard");
            }
          }, 1500);
        } catch (error) {
          setMessage(
            error.response?.data?.message || "Failed to submit review"
          );
          setMessageType("error");
        } finally {
          setSubmittingReview(false);
        }
      },
    });
  };

  /* ── Loading / Error states ──────────────────────────────── */
  if (loading) return <ReviewSkeleton />;

  if (!task) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto flex w-[94%] max-w-[900px] flex-col items-center justify-center py-32 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-surface">
            <ClipboardCheck className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl text-ink">Task Not Found</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            The task you&rsquo;re looking for doesn&rsquo;t exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  const canCompanyReview =
    user?.role === "company" &&
    isOwner &&
    task.status === "completed" &&
    !companyReviewSubmitted;

  const canIndividualReview =
    user?.role === "individual" &&
    isSelectedApplicant &&
    task.status === "completed" &&
    companyReviewSubmitted &&
    !individualReviewSubmitted;

  const showReviewForm = canCompanyReview || canIndividualReview;

  /* ── Star rating selector ────────────────────────────────── */
  const StarSelector = () => (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Rating <span className="ml-1 text-red-500">*</span>
      </label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setReviewRating(n)}
            className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
          >
            <Star
              className={`h-7 w-7 ${
                n <= reviewRating
                  ? "fill-amber-400 text-amber-400"
                  : "text-border hover:text-amber-300"
              }`}
              strokeWidth={1.5}
            />
          </button>
        ))}
        <span className="ml-2 text-sm font-semibold text-ink">
          {reviewRating}/5
        </span>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

      <div className="relative mx-auto w-[94%] max-w-[900px] py-8 md:py-12">
        {/* ── Page Header ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
        >
          <PageHeader
            badgeText="Submission Review"
            title={task.title}
            description={`Submitted by ${task.selectedApplicant?.name || "Applicant"}`}
            actions={<StatusBadge status={task.status} />}
          />
        </motion.div>

        {/* ── Messages ─────────────────────────────────────────── */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
              messageType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-destructive/20 bg-destructive/5 text-destructive"
            }`}
          >
            {message}
          </motion.div>
        )}

        {/* ── Submission Details Card ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease }}
          className="mb-6"
        >
          <Card className="p-6 md:p-8">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/50">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50">
                <ClipboardCheck
                  className="h-4 w-4 text-sky-600"
                  strokeWidth={1.8}
                />
              </div>
              <h2 className="font-display text-lg text-ink">
                Submission Details
              </h2>
            </div>

            {/* Applicant info */}
            <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <User className="h-4 w-4 text-primary" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Applicant</p>
                  <p className="text-sm font-semibold text-ink">
                    {task.selectedApplicant?.name || "—"}
                  </p>
                </div>
              </div>

              {task.selectedApplicant?.individualType && (
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="text-sm font-medium text-ink">
                    {task.selectedApplicant.individualType
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground">Submitted At</p>
                <p className="text-sm font-medium text-ink flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDate(task.submittedAt)}
                </p>
              </div>
            </div>

            {/* Submission link */}
            <div className="rounded-xl border border-border/80 bg-surface/50 p-4 mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Submission Link
              </p>
              <a
                href={task.submissionLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline break-all"
              >
                {task.submissionLink}
                <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              </a>
            </div>

            {/* Submission note */}
            <div className="rounded-xl border border-border/80 bg-surface/50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Submission Note
              </p>
              <p className="text-sm text-ink leading-relaxed whitespace-pre-line">
                {task.submissionNote || "No note provided."}
              </p>
            </div>
          </Card>
        </motion.div>

        {/* ── Company Actions (Under Review) ───────────────────── */}
        {user?.role === "company" &&
          isOwner &&
          task.status === "under_review" && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.16, ease }}
              className="mb-6"
            >
              <Card className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                    <ClipboardCheck
                      className="h-4 w-4 text-amber-600"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <h2 className="font-display text-lg text-ink">
                      Review Actions
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Approve the work or request revisions
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <PrimaryButton
                    onClick={handleComplete}
                    disabled={completing}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {completing ? "Completing..." : "Mark as Complete"}
                  </PrimaryButton>

                  <SecondaryButton
                    onClick={() => setShowRevisionForm(!showRevisionForm)}
                  >
                    <RotateCcw className="h-4 w-4" />
                    Request Changes
                  </SecondaryButton>
                </div>

                {/* Revision request form */}
                {showRevisionForm && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3, ease }}
                    onSubmit={handleRequestChanges}
                    className="mt-5 rounded-xl border border-border/80 bg-surface/50 p-5 space-y-4"
                  >
                    <h3 className="font-display text-base text-ink flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-amber-600" />
                      Request Changes
                    </h3>

                    <TextAreaField
                      label="Reason"
                      name="revisionReason"
                      required
                      rows={3}
                      placeholder="Why are changes needed?"
                      value={revisionReason}
                      onChange={(e) => setRevisionReason(e.target.value)}
                    />

                    <TextAreaField
                      label="Expected Changes"
                      name="revisionExpectedChanges"
                      required
                      rows={3}
                      placeholder="What changes are expected?"
                      value={revisionExpectedChanges}
                      onChange={(e) =>
                        setRevisionExpectedChanges(e.target.value)
                      }
                    />

                    <div className="flex gap-3 pt-1">
                      <DangerButton
                        type="submit"
                        size="sm"
                        disabled={requestingChanges}
                      >
                        {requestingChanges
                          ? "Requesting Changes..."
                          : "Submit Revision Request"}
                      </DangerButton>
                      <SecondaryButton
                        size="sm"
                        onClick={() => setShowRevisionForm(false)}
                      >
                        Cancel
                      </SecondaryButton>
                    </div>
                  </motion.form>
                )}
              </Card>
            </motion.div>
          )}

        {/* ── Revision Requested (Individual view) ─────────────── */}
        {task.status === "revision_requested" && isSelectedApplicant && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16, ease }}
            className="mb-6"
          >
            <Card className="p-6 md:p-8 border-amber-200">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/50">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                  <RotateCcw
                    className="h-4 w-4 text-amber-600"
                    strokeWidth={1.8}
                  />
                </div>
                <div>
                  <h2 className="font-display text-lg text-ink">
                    Revision Requested
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    The company has requested changes to your submission
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-border/80 bg-surface/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Reason
                  </p>
                  <p className="text-sm text-ink leading-relaxed">
                    {task.revisionReason}
                  </p>
                </div>

                <div className="rounded-xl border border-border/80 bg-surface/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Expected Changes
                  </p>
                  <p className="text-sm text-ink leading-relaxed">
                    {task.revisionExpectedChanges}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground pt-1">
                  Please revise your work and resubmit.
                </p>
              </div>
            </Card>
          </motion.div>
        )}

        {/* ── Completed Status + Review ────────────────────────── */}
        {task.status === "completed" && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16, ease }}
            className="mb-6"
          >
            {/* Completion Banner */}
            <Card className="p-6 md:p-8 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50">
                  <CheckCircle2
                    className="h-4 w-4 text-emerald-600"
                    strokeWidth={1.8}
                  />
                </div>
                <h2 className="font-display text-lg text-ink">
                  Task Completed
                </h2>
              </div>

              <div className="flex flex-wrap gap-3">
                {user?.role === "company" && (
                  <div className="rounded-lg border border-border bg-surface/50 px-4 py-2.5">
                    <p className="text-xs text-muted-foreground">
                      Company Review
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        companyReviewSubmitted
                          ? "text-emerald-600"
                          : "text-amber-600"
                      }`}
                    >
                      {companyReviewSubmitted ? "Submitted ✓" : "Pending"}
                    </p>
                  </div>
                )}

                {user?.role === "individual" && (
                  <>
                    <div className="rounded-lg border border-border bg-surface/50 px-4 py-2.5">
                      <p className="text-xs text-muted-foreground">
                        Company Review
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          companyReviewSubmitted
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {companyReviewSubmitted
                          ? "Submitted ✓"
                          : "Waiting for Company"}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-surface/50 px-4 py-2.5">
                      <p className="text-xs text-muted-foreground">
                        Your Review
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          individualReviewSubmitted
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {individualReviewSubmitted ? "Submitted ✓" : "Pending"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Review Form */}
            {showReviewForm && (
              <Card className="p-6 md:p-8">
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border/50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50">
                    <Star
                      className="h-4 w-4 text-amber-500"
                      strokeWidth={1.8}
                    />
                  </div>
                  <div>
                    <h2 className="font-display text-lg text-ink">
                      {user?.role === "company"
                        ? "Review Individual"
                        : "Review Company"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Share your experience working together
                    </p>
                  </div>
                </div>

                <form onSubmit={handleReviewSubmit} className="space-y-5">
                  <StarSelector />

                  <TextAreaField
                    label="Comment"
                    name="reviewComment"
                    required
                    rows={4}
                    placeholder="Share your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />

                  <div className="pt-1">
                    <PrimaryButton
                      type="submit"
                      disabled={submittingReview}
                    >
                      <Send className="h-4 w-4" />
                      {submittingReview
                        ? "Submitting..."
                        : "Submit Review"}
                    </PrimaryButton>
                  </div>
                </form>
              </Card>
            )}
          </motion.div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmConfig.open}
        onClose={() => setConfirmConfig((c) => ({ ...c, open: false }))}
        onConfirm={confirmConfig.onConfirm}
        icon={confirmConfig.icon}
        variant={confirmConfig.variant}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        cancelLabel="Cancel"
      />
    </div>
  );
}

export default ReviewSubmission;
