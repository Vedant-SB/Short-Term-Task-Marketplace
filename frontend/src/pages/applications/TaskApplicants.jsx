import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Star,
  CheckCircle2,
  Briefcase,
  FolderOpen,
  UserCheck,
  XCircle,
} from "lucide-react";
import api from "../../api/axios";
import {
  PageHeader,
  Card,
  StatusBadge,
  SkillChip,
  EmptyState,
  PrimaryButton,
  SecondaryButton,
  ConfirmDialog,
} from "../../components/ui";

const ease = [0.22, 1, 0.36, 1];

/* ── Helpers ───────────────────────────────────────────────── */
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

function formatType(type) {
  if (!type) return "—";
  return type
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

/* ── Loading skeleton ──────────────────────────────────────── */
function ApplicantsSkeleton() {
  const shimmer = "animate-pulse bg-surface-2 rounded";
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto w-[94%] max-w-[1000px] py-10 md:py-14">
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="space-y-3">
            <div className={`h-3 w-24 ${shimmer}`} />
            <div className={`h-8 w-48 ${shimmer}`} />
            <div className={`h-4 w-80 ${shimmer}`} />
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`h-14 w-14 rounded-2xl ${shimmer}`} />
                <div className="flex-1 space-y-2">
                  <div className={`h-5 w-40 ${shimmer}`} />
                  <div className={`h-3 w-28 ${shimmer}`} />
                </div>
              </div>
              <div className="flex gap-2 mb-3">
                <div className={`h-6 w-16 rounded-full ${shimmer}`} />
                <div className={`h-6 w-20 rounded-full ${shimmer}`} />
                <div className={`h-6 w-14 rounded-full ${shimmer}`} />
              </div>
              <div className="flex gap-3">
                <div className={`h-9 w-28 rounded-xl ${shimmer}`} />
                <div className={`h-9 w-32 rounded-xl ${shimmer}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  TASK APPLICANTS PAGE                                         */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function TaskApplicants() {
  const { taskId } = useParams();
  useEffect(() => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant",
  });
}, [taskId]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [acceptingId, setAcceptingId] = useState(null);

  // Confirm dialog
  const [confirmConfig, setConfirmConfig] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "",
    onConfirm: () => { },
  });

  const fetchApplicants = async () => {
    try {
      const response = await api.get(`/applications/task/${taskId}`);
      setApplications(response.data.applications);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadApplicants = async () => {
      try {
        const response = await api.get(`/applications/task/${taskId}`);
        setApplications(response.data.applications);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    loadApplicants();
  }, [taskId]);

  const handleAccept = (applicationId) => {
    setConfirmConfig({
      open: true,
      title: "Accept this applicant?",
      message:
        "This will select this applicant for the task. You won't be able to select another applicant later.",
      confirmLabel: "Yes, Accept",
      onConfirm: async () => {
        setConfirmConfig((c) => ({ ...c, open: false }));
        if (acceptingId) return;
        setAcceptingId(applicationId);
        setMessage("");
        try {
          const response = await api.put(
            `/applications/${applicationId}/accept`
          );
          setMessage(response.data.message);
          setMessageType("success");
          fetchApplicants();
        } catch (error) {
          setMessage(
            error.response?.data?.message || "Failed to accept applicant"
          );
          setMessageType("error");
        } finally {
          setAcceptingId(null);
        }
      },
    });
  };

  const hasSelectedApplicant = applications.some(
    (app) => app.status === "accepted" || app.status === "selected"
  );

  if (loading) return <ApplicantsSkeleton />;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

      <div className="relative mx-auto w-[94%] max-w-[1000px] py-8 md:py-12">
        {/* ── Page Header ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease }}
        >
          <PageHeader
            badgeText="Applicant Selection"
            title="Task Applicants"
            description="Review applicants and select the best candidate for your task."
          />
        </motion.div>

        {/* ── Messages ─────────────────────────────────────────── */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${messageType === "success"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-destructive/20 bg-destructive/5 text-destructive"
              }`}
          >
            {message}
          </motion.div>
        )}

        {/* ── Applicants List ──────────────────────────────────── */}
        {applications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease }}
          >
            <Card>
              <EmptyState
                icon={Users}
                title="No Applicants Yet"
                description="No applicants have applied for this task yet. Check back later."
                button={
                  <Link
                    to="/company-applicants"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:brightness-110"
                  >
                    Back to All Tasks
                  </Link>
                }
              />
            </Card>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {applications.map((application, i) => {
              const applicant = application.applicantId;
              const name = applicant?.name || "Applicant";
              const initials = getInitials(name);
              const initialsColor = getInitialsColor(name);
              const skills = applicant?.skills || [];
              const avgRating = applicant?.averageRating || 0;
              const totalReviews = applicant?.totalReviews || 0;
              const completedProjects = applicant?.completedProjects || 0;

              return (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(i * 0.06, 0.3),
                    ease,
                  }}
                >
                  <Card
                    className="p-6 md:p-7 transition-all duration-200 hover:shadow-elegant"
                  >
                    {/* Top row: Avatar + Info + Status */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        {/* Avatar */}
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-bold border border-border/60 shadow-sm ${initialsColor}`}
                        >
                          {initials}
                        </div>

                        {/* Details */}
                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="font-display text-lg font-bold text-ink">
                              {name}
                            </h3>
                            {applicant?.individualType && (
                              <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                                {formatType(applicant.individualType)}
                              </span>
                            )}
                          </div>

                          {/* Stats row */}
                          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
                            <span className="inline-flex items-center gap-1">
                              <Star
                                className={`h-3.5 w-3.5 ${avgRating > 0
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-border"
                                  }`}
                                strokeWidth={1.5}
                              />
                              <span className="font-semibold text-ink">
                                {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
                              </span>
                              <span>
                                ({totalReviews} review
                                {totalReviews !== 1 ? "s" : ""})
                              </span>
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <CheckCircle2
                                className="h-3.5 w-3.5 text-emerald-500"
                                strokeWidth={1.8}
                              />
                              {completedProjects} completed
                            </span>
                          </div>

                          {/* Skills */}
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {skills.map((skill) => (
                                <SkillChip key={skill}>{skill}</SkillChip>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status badge */}
                      <div className="shrink-0 pt-1 md:pt-0">
                        <StatusBadge status={application.status} />
                      </div>
                    </div>

                    {/* Actions row */}
                    {/* Actions row */}
                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/50 pt-4">

                      <Link to={`/tasks/${taskId}`}>
                        <SecondaryButton size="sm">
                          <Briefcase className="h-3.5 w-3.5" />
                          View Task
                        </SecondaryButton>
                      </Link>

                      <Link to={`/portfolio/${applicant?._id}`}>
                        <SecondaryButton size="sm">
                          <FolderOpen className="h-3.5 w-3.5" />
                          View Portfolio
                        </SecondaryButton>
                      </Link>

                      {/* existing Accept / status buttons continue here */}

                      {application.status === "pending" && !hasSelectedApplicant && (
                        <PrimaryButton
                          size="sm"
                          onClick={() => handleAccept(application._id)}
                          disabled={acceptingId === application._id}
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                          {acceptingId === application._id
                            ? "Accepting..."
                            : "Accept Applicant"}
                        </PrimaryButton>
                      )}

                      {application.status === "pending" && hasSelectedApplicant && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
                          Task Already Assigned
                        </span>
                      )}

                      {application.status === "accepted" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Selected Applicant
                        </span>
                      )}

                      {application.status === "rejected" && (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                          <XCircle className="h-3.5 w-3.5" />
                          Application Rejected
                        </span>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmConfig.open}
        onClose={() => setConfirmConfig((c) => ({ ...c, open: false }))}
        onConfirm={confirmConfig.onConfirm}
        icon={UserCheck}
        variant="primary"
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        cancelLabel="Cancel"
      />
    </div>
  );
}

export default TaskApplicants;