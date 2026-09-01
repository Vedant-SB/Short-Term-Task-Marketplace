import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Star,
  Globe,
  Briefcase,
  CheckCircle2,
  Calendar,
  ExternalLink,
  FolderX,
  MessageSquareX,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/useAuth";

/* ── Helpers ───────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
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

const CATEGORY_BADGE = {
  Development: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Design: "bg-violet-50 text-violet-700 border-violet-200",
  Data: "bg-sky-50 text-sky-700 border-sky-200",
  Writing: "bg-amber-50 text-amber-700 border-amber-200",
  Research: "bg-teal-50 text-teal-700 border-teal-200",
  Marketing: "bg-rose-50 text-rose-700 border-rose-200",
  Other: "bg-gray-50 text-gray-600 border-gray-200",
};

const INDIVIDUAL_TYPE_LABELS = {
  student: "Student",
  first_year_student: "1st Year Student",
  second_year_student: "2nd Year Student",
  third_year_student: "3rd Year Student",
  final_year_student: "Final Year Student",
  fresh_graduate: "Fresh Graduate",
  professional: "Professional",
  freelancer: "Freelancer",
};

const ease = [0.22, 1, 0.36, 1];

/* ── Skeleton ──────────────────────────────────────────────── */
function PortfolioSkeleton() {
  const shimmer = "animate-pulse bg-surface-2 rounded";
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
      <div className="relative mx-auto w-[94%] max-w-[1200px] py-10 md:py-14">
        <div className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className={`h-24 w-24 rounded-full ${shimmer}`} />
            <div className="flex-1 space-y-3">
              <div className={`h-8 w-64 ${shimmer}`} />
              <div className={`h-4 w-40 ${shimmer}`} />
              <div className={`h-4 w-full max-w-xl ${shimmer}`} />
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className={`mb-2 h-8 w-16 ${shimmer}`} />
              <div className={`h-4 w-24 ${shimmer}`} />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className={`h-6 w-48 mb-3 ${shimmer}`} />
              <div className={`h-4 w-full mb-2 ${shimmer}`} />
              <div className={`h-4 w-2/3 ${shimmer}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
/*  APPLICANT PORTFOLIO PAGE                                    */
/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

function ApplicantPortfolio() {
  const { userId: paramUserId } = useParams();
  const { user } = useAuth();
  const userId = paramUserId || user?.userId;
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const res = await api.get(`/profiles/${userId}`);
        setProfile(res.data.profile);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load applicant portfolio");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId]);

  if (loading) return <PortfolioSkeleton />;

  if (error || !profile) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
        <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />
        <div className="relative mx-auto flex w-[94%] max-w-[1200px] flex-col items-center justify-center py-32 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-red-50">
            <User className="h-7 w-7 text-red-400" />
          </div>
          <h2 className="font-display text-xl text-ink">Portfolio Not Available</h2>
          <p className="mt-2 text-sm text-muted-foreground">{error || "User profile not found."}</p>
          <Link
            to="/company-dashboard"
            className="mt-6 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const {
    name,
    profileImage,
    bio,
    skills,
    portfolioWebsite,
    individualType,
    statistics,
    reviewSummary,
    portfolio,
  } = profile;

  const averageRating = statistics?.averageRating || reviewSummary?.averageRating || 0;
  const totalReviews = statistics?.totalReviews || reviewSummary?.reviewCount || 0;
  const completedProjectsCount = statistics?.completedTasks || portfolio?.length || 0;

  // Filter company reviews for applicant
  const companyReviews = (reviewSummary?.reviewHistory || []).filter(
    (r) => r.reviewType === "company_to_individual" || !r.reviewType
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-canvas">
      <div className="pointer-events-none fixed inset-0 bg-grid opacity-40" />

      <div className="relative mx-auto w-[94%] max-w-[1200px] py-8 md:py-12">
        {/* ═══════════════════════════════════════════════════════ */}
        {/*  HEADER CARD                                          */}
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
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {/* Avatar */}
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={name}
                  className="h-24 w-24 rounded-2xl object-cover border border-border shadow-sm"
                />
              ) : (
                <div
                  className={`flex h-24 w-24 items-center justify-center rounded-2xl text-2xl font-bold border border-border shadow-sm ${getInitialsColor(
                    name
                  )}`}
                >
                  {getInitials(name)}
                </div>
              )}

              {/* Details */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
                    {name}
                  </h1>
                  {individualType && (
                    <span className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {INDIVIDUAL_TYPE_LABELS[individualType] || individualType}
                    </span>
                  )}
                </div>

                {bio && (
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {bio}
                  </p>
                )}

                {/* Website */}
                {portfolioWebsite && (
                  <div className="pt-1">
                    <a
                      href={portfolioWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {portfolioWebsite}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}

                {/* Skills */}
                {skills && skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-ink"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Rating Box */}
            <div className="flex shrink-0 flex-col items-start rounded-xl border border-border bg-background/80 p-4 shadow-sm md:items-end">
              <div className="flex items-center gap-1.5">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="font-display text-2xl font-bold text-ink">
                  {averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {totalReviews} verified review{totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  SUMMARY CARDS (Informational)                        */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease }}
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold text-ink">{completedProjectsCount}</p>
            <p className="text-xs text-muted-foreground">Completed Projects</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            </div>
            <p className="font-display text-2xl font-bold text-ink">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </p>
            <p className="text-xs text-muted-foreground">TaskHub Rating</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Briefcase className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-bold text-ink">{totalReviews}</p>
            <p className="text-xs text-muted-foreground">Total Verified Reviews</p>
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  COMPLETED PROJECTS (Main Section)                    */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease }}
          className="mb-8"
        >
          <h2 className="mb-4 font-display text-xl font-bold text-ink">Completed Projects</h2>

          {!portfolio || portfolio.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border">
                <FolderX className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="font-medium text-ink">No completed projects yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                This applicant has not completed any TaskHub projects yet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {portfolio.map((project) => {
                const catCls = CATEGORY_BADGE[project.category] || CATEGORY_BADGE.Other;

                return (
                  <div
                    key={project.taskId}
                    className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:shadow-elegant"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="font-display text-lg font-bold text-ink">
                            {project.title}
                          </h3>
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${catCls}`}
                          >
                            {project.category}
                          </span>
                        </div>

                        {project.companyName && (
                          <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                            Posted by <span className="text-ink font-semibold">{project.companyName}</span>
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-muted-foreground">
                          {project.completedOn && (
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              Completed {formatDate(project.completedOn)}
                            </span>
                          )}
                        </div>

                        {/* Skills Used */}
                        {project.skillsUsed && project.skillsUsed.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2">
                            {project.skillsUsed.map((s) => (
                              <span
                                key={s}
                                className="inline-flex items-center rounded-full border border-violet-200/70 bg-violet-50/85 px-2.5 py-0.5 text-[11px] font-medium text-violet-700"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Company Review on this project */}
                    {(project.companyRating || project.companyReview) && (
                      <div className="mt-4 rounded-xl border border-border/80 bg-surface/60 p-4">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Company Feedback:
                          </span>
                          {project.companyRating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-ink">{project.companyRating}/5</span>
                            </div>
                          )}
                        </div>
                        {project.companyReview && (
                          <p className="text-sm italic text-ink/90">"{project.companyReview}"</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  REVIEWS SECTION                                      */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3, ease }}
          className="mb-8"
        >
          <h2 className="mb-4 font-display text-xl font-bold text-ink">Verified Company Reviews</h2>

          {companyReviews.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border">
                <MessageSquareX className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="font-medium text-ink">No reviews received yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                This applicant has not received any verified reviews yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {companyReviews.map((rev) => (
                <div key={rev.id || rev._id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-display font-bold text-ink text-sm">
                      {rev.reviewer || "Company"}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-ink">{rev.rating}/5</span>
                    </div>
                  </div>
                  <p className="text-sm text-ink/90 leading-relaxed mb-3">"{rev.comment}"</p>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-2">
                    <span>{rev.taskTitle ? `For: ${rev.taskTitle}` : "Verified Review"}</span>
                    <span>{formatDate(rev.date)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
}

export default ApplicantPortfolio;
