import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  Building2,
  Mail,
  GraduationCap,
  Briefcase,
  Calendar,
  Globe,
  CodeXml,
  BookOpen,
  Star,
  FolderOpen,
  Code,
  ExternalLink,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { ELIGIBLE_LABELS } from "../tasks/taskFormConstants";

/* ── Reusable section card ────────────────────────────────────── */
function SectionCard({ icon: Icon, title, accent, children, delay = 0 }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-border bg-card shadow-elegant p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface"
          style={{ color: accent }}
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <h2 className="font-display text-lg text-ink">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

/* ── Info row ─────────────────────────────────────────────────── */
function InfoRow({ icon: Icon, label, value, href }) {
  if (!value) return null;

  const content = href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-primary hover:underline inline-flex items-center gap-1"
    >
      {value}
      <ExternalLink className="h-3 w-3" />
    </a>
  ) : (
    <span className="text-sm text-ink">{value}</span>
  );

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-b-0">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" strokeWidth={1.6} />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        {content}
      </div>
    </div>
  );
}

/* ── Star rating display ──────────────────────────────────────── */
function StarRating({ rating }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`h-3.5 w-3.5 ${
            n <= Math.round(rating)
              ? "fill-gold text-gold"
              : "text-border"
          }`}
          strokeWidth={1.6}
        />
      ))}
      <span className="ml-1 text-xs text-muted-foreground">{rating}</span>
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  Profile Page                                                   */
/* ════════════════════════════════════════════════════════════════ */
function Profile() {
  const { userId } = useParams();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile = !userId || userId === user?.userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (isOwnProfile) {
          const profileRes = await api.get("/auth/profile");
          const statsRes = await api.get(`/profiles/${user.userId}`);
          setProfile({
            ...profileRes.data,
            ...statsRes.data.profile,
          });
        } else {
          const response = await api.get(`/profiles/${userId}`);
          setProfile(response.data.profile);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, user?.userId, isOwnProfile]);

  /* ── Loading / Error states ─────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg py-32 text-center">
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg py-32 text-center">
        <p className="text-muted-foreground text-sm">Profile not found.</p>
      </div>
    );
  }

  const {
    reviewSummary = {
      averageRating: 0,
      reviewCount: 0,
      reviewHistory: [],
    },
    portfolio = [],
  } = profile;

  const isCompany = profile.role === "company";
  const displayName = profile.companyName || profile.name || "—";
  const aboutText = isCompany ? profile.companyDescription : profile.bio;
  const companyWebsite = profile.website;
  const individualPortfolioWebsite =
    profile.portfolioWebsite || profile.website;

  /* ── Initials for avatar ────────────────────────────────────── */
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 md:py-14">
      {/* ── Page header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl md:text-4xl text-ink">Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isOwnProfile ? "Your personal information" : `${displayName}'s profile`}
        </p>
      </motion.div>

      <div className="space-y-6">

        {/* ═══════════════════════════════════════════════════════ */}
        {/* BASIC INFORMATION                                      */}
        {/* ═══════════════════════════════════════════════════════ */}

        <SectionCard icon={User} title="Basic Information" accent="var(--primary)" delay={0.05}>
          {/* Profile photo / avatar */}
          <div className="flex items-center gap-5 mb-6 pb-6 border-b border-border/50">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display text-xl shadow-elegant">
              {initials}
            </div>
            <div>
              <h3 className="font-display text-xl text-ink">{displayName}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isCompany
                  ? "Company"
                  : ELIGIBLE_LABELS[profile.individualType] || profile.individualType || "Individual"}
              </p>
            </div>
          </div>

          {/* Info rows */}
          <div>
            <InfoRow icon={Mail} label="Email" value={profile.email} />

            {isCompany ? (
              <>
                <InfoRow icon={Building2} label="Industry" value={profile.industry} />
                <InfoRow icon={Globe} label="Website" value={companyWebsite} href={companyWebsite} />
              </>
            ) : (
              <>
                <InfoRow icon={GraduationCap} label="College" value={profile.college} />
                <InfoRow icon={Building2} label="Company" value={profile.company} />
                <InfoRow icon={Briefcase} label="Experience" value={
                  profile.yearsOfExperience !== undefined && profile.yearsOfExperience !== null
                    ? `${profile.yearsOfExperience} years`
                    : null
                } />
                <InfoRow icon={Code} label="Primary Domain" value={profile.primaryDomain} />
              </>
            )}

            <InfoRow
              icon={Calendar}
              label="Member Since"
              value={
                profile.createdAt
                  ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : null
              }
            />
          </div>
        </SectionCard>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* ABOUT                                                  */}
        {/* ═══════════════════════════════════════════════════════ */}

        {aboutText && (
          <SectionCard icon={BookOpen} title="About" accent="var(--accent)" delay={0.1}>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {aboutText}
            </p>
          </SectionCard>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PROFESSIONAL INFORMATION                                */}
        {/* ═══════════════════════════════════════════════════════ */}

        {(
          (profile.skills && profile.skills.length > 0) ||
          profile.github ||
          individualPortfolioWebsite
        ) && !isCompany && (
          <SectionCard icon={Briefcase} title="Professional Information" accent="var(--sky)" delay={0.15}>
            {/* Skills */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-muted-foreground mb-2.5">Skills</p>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full bg-surface px-3 py-1 text-xs font-medium text-ink border border-border/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Links */}
            {(profile.github || individualPortfolioWebsite) && (
              <div className={profile.skills && profile.skills.length > 0 ? "pt-4 border-t border-border/50" : ""}>
                <InfoRow
                  icon={CodeXml}
                  label="GitHub"
                  value={profile.github}
                  href={
                    profile.github?.startsWith("http")
                      ? profile.github
                      : profile.github
                      ? `https://github.com/${profile.github}`
                      : null
                  }
                />
                <InfoRow
                  icon={Globe}
                  label="Portfolio Website"
                  value={individualPortfolioWebsite}
                  href={
                    individualPortfolioWebsite?.startsWith("http")
                      ? individualPortfolioWebsite
                      : individualPortfolioWebsite
                      ? `https://${individualPortfolioWebsite}`
                      : null
                  }
                />
              </div>
            )}
          </SectionCard>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/* REVIEWS                                                */}
        {/* ═══════════════════════════════════════════════════════ */}

        <SectionCard icon={Star} title="Reviews" accent="var(--gold)" delay={0.2}>
          {reviewSummary.reviewHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No reviews yet.
            </p>
          ) : (
            <div className="space-y-4">
              {/* Summary */}
              {(reviewSummary.averageRating > 0 || reviewSummary.reviewCount > 0) && (
                <div className="flex items-center gap-4 pb-4 border-b border-border/50">
                  <StarRating rating={reviewSummary.averageRating} />
                  <span className="text-xs text-muted-foreground">
                    {reviewSummary.reviewCount} review{reviewSummary.reviewCount !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {/* Individual reviews */}
              {reviewSummary.reviewHistory.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-border/60 bg-surface/50 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-ink">
                      {review.reviewer}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <StarRating rating={review.rating} />
                  {review.comment && (
                    <p className="mt-2 text-sm text-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ═══════════════════════════════════════════════════════ */}
        {/* PORTFOLIO                                              */}
        {/* ═══════════════════════════════════════════════════════ */}

        {!isCompany && (
          <SectionCard icon={FolderOpen} title="Portfolio" accent="var(--accent)" delay={0.25}>
            {portfolio.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No completed projects yet.
              </p>
            ) : (
              <div className="space-y-4">
                {portfolio.map((project) => (
                  <div
                    key={project.taskId}
                    className="rounded-xl border border-border/60 bg-surface/50 p-5"
                  >
                    <h3 className="font-display text-base text-ink mb-3">
                      {project.title}
                    </h3>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground">Category</span>
                        <p className="text-ink">{project.category}</p>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground">Completed</span>
                        <p className="text-ink">
                          {new Date(project.completedOn).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {project.skillsUsed && project.skillsUsed.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {project.skillsUsed.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex rounded-full bg-card border border-border/60 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {(project.companyRating || project.companyReview) && (
                      <div className="mt-4 pt-3 border-t border-border/50">
                        {project.companyRating && (
                          <div className="mb-1">
                            <StarRating rating={project.companyRating} />
                          </div>
                        )}
                        {project.companyReview && (
                          <p className="text-sm text-foreground leading-relaxed">
                            {project.companyReview}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        )}
      </div>
    </div>
  );
}

export default Profile;
