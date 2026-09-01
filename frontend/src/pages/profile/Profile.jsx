import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Mail,
  GraduationCap,
  Briefcase,
  Calendar,
  Globe,
  CodeXml,
  Star,
  ExternalLink,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  MessageSquareX,
  Award,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/useAuth";
import { ELIGIBLE_LABELS } from "../tasks/taskFormConstants";

/* ── Helpers ─────────────────────────────────────────────────── */
function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
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

/* ── Star Rating Component ───────────────────────────────────── */
function StarRating({ rating, size = "h-5 w-5" }) {
  const numericRating = Number(rating) || 0;
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${size} ${
            n <= Math.round(numericRating)
              ? "fill-amber-400 text-amber-400"
              : "text-zinc-200"
          }`}
          strokeWidth={1.5}
        />
      ))}
      <span className="ml-1.5 text-sm font-bold text-slate-700">
        {numericRating > 0 ? numericRating.toFixed(1) : "0.0"}
      </span>
    </span>
  );
}

/* ── Info Tile Component ─────────────────────────────────────── */
function InfoTile({ icon: Icon, label, value, iconColor = "text-violet-500" }) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm hover:border-violet-200/60 transition-colors">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 border border-violet-100">
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-lg font-bold text-slate-900 leading-snug">{value || "—"}</p>
    </div>
  );
}

/* ── Link Tile Component ─────────────────────────────────────── */
function LinkTile({ icon: Icon, label, href, actionText }) {
  const fullHref = href?.startsWith("http") ? href : `https://${href}`;
  return (
    <a
      href={fullHref}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-4 rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm hover:border-violet-300 hover:shadow-md transition-all"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 border border-violet-100 group-hover:bg-violet-100 transition-colors">
        <Icon className="h-5 w-5 text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="text-base font-bold text-violet-600 group-hover:text-violet-700 truncate transition-colors">
          {actionText}
        </p>
      </div>
      <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors shrink-0" />
    </a>
  );
}

/* ── Edit Profile Modal Component ────────────────────────────── */
function EditProfileModal({ open, onClose, profile, onProfileUpdated }) {
  const isCompany = profile?.role === "company";

  const [formData, setFormData] = useState({
    // Common / Individual
    name: profile?.name || "",
    bio: profile?.bio || "",
    college: profile?.college || "",
    skills: Array.isArray(profile?.skills) ? profile.skills.join(", ") : "",
    github: profile?.github || "",
    portfolioWebsite: profile?.portfolioWebsite || "",
    company: profile?.company || "",
    yearsOfExperience: profile?.yearsOfExperience || "",
    primaryDomain: profile?.primaryDomain || "",

    // Company
    companyName: profile?.companyName || "",
    industry: profile?.industry || "",
    companyDescription: profile?.companyDescription || "",
    website: profile?.website || "",
  });

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isCompany) {
      if (!formData.companyName.trim()) {
        setError("Company name is required");
        return;
      }
      if (!formData.industry.trim()) {
        setError("Industry is required");
        return;
      }
      if (!formData.companyDescription.trim() || formData.companyDescription.trim().length < 30) {
        setError("Company description must be at least 30 characters long");
        return;
      }
      if (formData.companyDescription.trim().length > 500) {
        setError("Company description cannot exceed 500 characters");
        return;
      }
    } else {
      if (!formData.name.trim()) {
        setError("Name is required");
        return;
      }
      if (!formData.bio.trim()) {
        setError("About / Bio is required");
        return;
      }
    }

    setSaving(true);
    try {
      const payload = isCompany
        ? {
            companyName: formData.companyName.trim(),
            industry: formData.industry.trim(),
            companyDescription: formData.companyDescription.trim(),
            website: formData.website.trim(),
          }
        : {
            name: formData.name.trim(),
            bio: formData.bio.trim(),
            college: formData.college.trim(),
            skills: formData.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            github: formData.github.trim(),
            portfolioWebsite: formData.portfolioWebsite.trim(),
            company: formData.company.trim(),
            yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : 0,
            primaryDomain: formData.primaryDomain.trim(),
          };

      const res = await api.put("/profiles", payload);
      if (res.data.success) {
        onProfileUpdated(res.data.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 md:p-8 shadow-2xl border border-zinc-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-zinc-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Edit3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-slate-900">
                {isCompany ? "Edit Company Profile" : "Edit Profile"}
              </h3>
              <p className="text-sm text-slate-500">Update your details and public profile information</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {isCompany ? (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Tech Solutions"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-base text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Industry *</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g. Software, E-commerce, Healthcare"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-base text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-bold text-slate-700">Company Description * (30-500 chars)</label>
                  <span className={`text-xs font-medium ${formData.companyDescription.length < 30 || formData.companyDescription.length > 500 ? "text-red-500" : "text-slate-400"}`}>
                    {formData.companyDescription.length}/500
                  </span>
                </div>
                <textarea
                  name="companyDescription"
                  rows={4}
                  value={formData.companyDescription}
                  onChange={handleChange}
                  placeholder="Describe your company, mission, and the type of work you post..."
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-base text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Company Website URL</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-base text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your Name"
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-base text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">College / University</label>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    placeholder="e.g. Stanford University"
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-base text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">About / Bio *</label>
                <textarea
                  name="bio"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Share a short summary about yourself, skills, and background..."
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-base text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">
                  Skills <span className="text-slate-400 font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, Node.js, Python, UI Design, TypeScript"
                  className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-base text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">GitHub Profile / URL</label>
                  <input
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-base text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Portfolio Website URL</label>
                  <input
                    type="url"
                    name="portfolioWebsite"
                    value={formData.portfolioWebsite}
                    onChange={handleChange}
                    placeholder="https://myportfolio.dev"
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-base text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Company (if working)</label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Current employer"
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-base text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Experience (Years)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    placeholder="e.g. 2"
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-base text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Primary Domain</label>
                  <input
                    type="text"
                    name="primaryDomain"
                    value={formData.primaryDomain}
                    onChange={handleChange}
                    placeholder="e.g. Frontend, AI"
                    className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-base text-slate-900 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600"
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-3 pt-5 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════ */
/*  MAIN PROFILE PAGE                                              */
/* ════════════════════════════════════════════════════════════════ */
function Profile() {
  const { userId: paramUserId } = useParams();
  const { user } = useAuth();

  const isOwnProfile = !paramUserId || paramUserId === user?.userId;
  const activeUserId = paramUserId || user?.userId;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!activeUserId) return;
      setLoading(true);
      try {
        if (isOwnProfile) {
          const [profileRes, statsRes] = await Promise.all([
            api.get("/auth/profile"),
            api.get(`/profiles/${user.userId}`),
          ]);
          setProfile({
            ...profileRes.data,
            ...statsRes.data.profile,
          });
        } else {
          const res = await api.get(`/profiles/${activeUserId}`);
          setProfile(res.data.profile);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [activeUserId, isOwnProfile, user?.userId]);

  const handleProfileUpdated = (updatedUser) => {
    setProfile((prev) => ({
      ...prev,
      ...updatedUser,
    }));
    setSuccessToast("Profile updated successfully!");
    setTimeout(() => setSuccessToast(""), 4000);
  };

  /* ── Loading / Error State ───────────────────────────────────── */
  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/60 py-24">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          <p className="text-base font-semibold text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/60 py-24">
        <div className="mx-auto max-w-md text-center bg-white p-10 rounded-2xl border border-zinc-200 shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900">Profile Unavailable</h2>
          <p className="mt-2 text-base text-slate-500">{error || "Profile could not be found."}</p>
          <Link
            to={user?.role === "company" ? "/company-dashboard" : "/individual-dashboard"}
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isCompany = profile.role === "company";
  const displayName = isCompany ? profile.companyName || "Company" : profile.name || "Individual";
  const aboutText = isCompany ? profile.companyDescription : profile.bio;
  const companyWebsite = profile.website;
  const individualPortfolioWebsite = profile.portfolioWebsite || profile.website;
  const initials = getInitials(displayName);

  const {
    reviewSummary = {
      averageRating: 0,
      reviewCount: 0,
      reviewHistory: [],
    },
    statistics = {},
    profileStatus = isCompany ? "Active" : "Available",
  } = profile;

  const averageRating = statistics.averageRating ?? reviewSummary.averageRating ?? 0;
  const totalReviews = statistics.totalReviews ?? reviewSummary.reviewCount ?? 0;
  const reviewHistory = reviewSummary.reviewHistory || [];
  const sortedReviews = [...reviewHistory].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  );
  const visibleReviews = sortedReviews.slice(0, 4);

  // Status Badge styling
  const getStatusBadge = () => {
    if (profileStatus === "Available" || profileStatus === "Hiring") {
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    }
    if (profileStatus === "Working" || profileStatus === "Projects In Progress") {
      return "border-amber-200 bg-amber-50 text-amber-800";
    }
    if (profileStatus === "Revision Requested") {
      return "border-orange-200 bg-orange-50 text-orange-800";
    }
    return "border-zinc-200 bg-zinc-100 text-zinc-700";
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/60 py-8 md:py-12">
      <div className="relative mx-auto w-[94%] max-w-[1120px] space-y-8">
        {/* Success Toast */}
        <AnimatePresence>
          {successToast && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3.5 text-sm font-bold text-emerald-800 shadow-sm"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              {successToast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  HERO SECTION                                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-sm"
        >
          {/* Decorative gradients */}
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-violet-100/50 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-100/30 blur-3xl" />

          <div className="relative p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Identity */}
              <div className="flex flex-col sm:flex-row items-start gap-6">
                {/* Avatar */}
                <div className="flex h-24 w-24 md:h-28 md:w-28 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 text-white font-display text-3xl md:text-4xl font-bold shadow-lg shrink-0">
                  {initials}
                </div>

                <div className="space-y-3">
                  {/* Name + Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                      {displayName}
                    </h1>
                    {!isCompany && (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold ${getStatusBadge()}`}
                      >
                        <span className="h-2 w-2 rounded-full bg-current" />
                        {profileStatus}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-700">
                      {isCompany ? "Company" : ELIGIBLE_LABELS[profile.individualType] || "Individual"}
                    </span>
                  </div>

                  {/* Info row */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-base text-slate-500">
                    <span className="inline-flex items-center gap-1.5 text-slate-700">
                      <Mail className="h-4 w-4 text-slate-400" />
                      {profile.email}
                    </span>

                    {isCompany && profile.industry && (
                      <>
                        <span className="text-zinc-300">&bull;</span>
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          <Building2 className="h-4 w-4 text-slate-400" />
                          {profile.industry}
                        </span>
                      </>
                    )}

                    {!isCompany && profile.college && (
                      <>
                        <span className="text-zinc-300">&bull;</span>
                        <span className="inline-flex items-center gap-1.5 text-slate-700">
                          <GraduationCap className="h-4 w-4 text-slate-400" />
                          {profile.college}
                        </span>
                      </>
                    )}

                    <span className="text-zinc-300">&bull;</span>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      Member since {formatDate(profile.createdAt)}
                    </span>
                  </div>

                  {/* Quick links in hero */}
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    {isCompany && companyWebsite && (
                      <a
                        href={companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:text-violet-700 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Website
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}

                    {!isCompany && profile.github && (
                      <a
                        href={profile.github.startsWith("http") ? profile.github : `https://github.com/${profile.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:text-violet-700 hover:underline"
                      >
                        <CodeXml className="h-4 w-4" />
                        GitHub
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}

                    {!isCompany && individualPortfolioWebsite && (
                      <a
                        href={individualPortfolioWebsite.startsWith("http") ? individualPortfolioWebsite : `https://${individualPortfolioWebsite}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-violet-600 hover:text-violet-700 hover:underline"
                      >
                        <Globe className="h-4 w-4" />
                        Portfolio
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Profile button */}
              {isOwnProfile && (
                <div className="shrink-0">
                  <button
                    onClick={() => setEditModalOpen(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-violet-700 active:scale-95 transition-all cursor-pointer"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  CONTENT — INDIVIDUAL PROFILE                          */}
        {/* ═══════════════════════════════════════════════════════ */}
        {!isCompany && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-8"
          >
            {/* About Me */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-7 md:p-8 shadow-sm">
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">About Me</h2>
              {aboutText ? (
                <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                  {aboutText}
                </p>
              ) : (
                <p className="text-base italic text-slate-400">No bio provided yet.</p>
              )}
            </div>

            {/* Professional Background — Info Tiles Grid */}
            <div>
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-5">Professional Background</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoTile
                  icon={GraduationCap}
                  label="Education"
                  value={profile.college || "Not specified"}
                />
                <InfoTile
                  icon={Building2}
                  label="Company"
                  value={profile.company || "Not specified"}
                />
                <InfoTile
                  icon={Clock}
                  label="Experience"
                  value={
                    profile.yearsOfExperience !== undefined && profile.yearsOfExperience !== null
                      ? `${profile.yearsOfExperience} Year${profile.yearsOfExperience !== 1 ? "s" : ""}`
                      : "Not specified"
                  }
                />
                <InfoTile
                  icon={Award}
                  label="Primary Domain"
                  value={profile.primaryDomain || "Not specified"}
                />
              </div>
            </div>

            {/* Skills & Expertise */}
            <div className="rounded-2xl border border-zinc-200/80 bg-white p-7 md:p-8 shadow-sm">
              <h2 className="font-display text-2xl font-bold text-slate-900 mb-5">Skills & Expertise</h2>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50/80 px-4 py-1.5 text-sm font-medium text-violet-700 shadow-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-base text-slate-400 italic">No skills listed yet.</p>
              )}
            </div>

            {/* Professional Links */}
            {(profile.github || individualPortfolioWebsite) && (
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900 mb-5">Professional Links</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.github && (
                    <LinkTile
                      icon={CodeXml}
                      label="GitHub"
                      href={profile.github.startsWith("http") ? profile.github : `https://github.com/${profile.github}`}
                      actionText="View Profile"
                    />
                  )}
                  {individualPortfolioWebsite && (
                    <LinkTile
                      icon={Globe}
                      label="Portfolio Website"
                      href={individualPortfolioWebsite}
                      actionText="Visit Site"
                    />
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════ */}
        {/*  CONTENT — COMPANY PROFILE                              */}
        {/* ═══════════════════════════════════════════════════════ */}
        {isCompany && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Main Column */}
            <div className="lg:col-span-7 space-y-8">
              {/* About Company */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-7 md:p-8 shadow-sm">
                <h2 className="font-display text-2xl font-bold text-slate-900 mb-4">About Company</h2>
                {aboutText ? (
                  <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                    {aboutText}
                  </p>
                ) : (
                  <p className="text-base italic text-slate-400">No company description provided yet.</p>
                )}
              </div>

              {/* Verified Reviews */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-7 md:p-8 shadow-sm">
                <h2 className="font-display text-2xl font-bold text-slate-900 mb-5">Verified Reviews</h2>

                {reviewHistory.length === 0 ? (
                  <div className="rounded-xl border border-zinc-100 bg-slate-50/60 p-10 text-center">
                    <MessageSquareX className="mx-auto h-10 w-10 text-slate-300 mb-3" strokeWidth={1.5} />
                    <p className="text-lg font-bold text-slate-700">No reviews yet</p>
                    <p className="mt-1.5 text-sm text-slate-400">
                      Reviews from completed tasks will appear here after ratings are submitted.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Rating Summary Banner */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-amber-100 bg-amber-50/50 p-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-400 text-white font-display text-2xl font-bold shadow-sm">
                          {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                        </div>
                        <div>
                          <p className="font-display text-lg font-bold text-slate-900">TaskHub Verified Rating</p>
                          <p className="text-sm text-slate-500">
                            Based on {totalReviews} completed project review{totalReviews !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={averageRating} size="h-5 w-5" />
                    </div>

                    {/* Review Cards */}
                    <div className="space-y-4">
                      {visibleReviews.map((rev) => (
                        <div
                          key={rev.id || rev._id || `${rev.reviewer}-${rev.date}`}
                          className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                                {getInitials(rev.reviewer)}
                              </div>
                              <span className="font-display text-base font-bold text-slate-900">
                                {rev.reviewer || "TaskHub Member"}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-slate-400">
                              {formatDate(rev.date)}
                            </span>
                          </div>

                          <StarRating rating={rev.rating} size="h-4 w-4" />

                          {rev.comment && (
                            <p className="text-base text-slate-700 leading-relaxed bg-slate-50/60 p-4 rounded-lg border border-zinc-100">
                              &ldquo;{rev.comment}&rdquo;
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* See All Reviews button (Only visible to the company owner when there are more than 4 reviews) */}
                    {isOwnProfile && isCompany && sortedReviews.length > 4 && (
                      <div className="text-center pt-2">
                        <Link
                          to="/profile/reviews"
                          className="inline-flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50/60 px-5 py-2.5 text-sm font-bold text-violet-700 hover:bg-violet-100 hover:text-violet-800 transition-all shadow-xs"
                        >
                          See All Reviews ({sortedReviews.length})
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Side Column — Compact Info Blocks */}
            <div className="lg:col-span-5 space-y-4">
              <InfoTile
                icon={Briefcase}
                label="Industry"
                value={profile.industry || "Not specified"}
              />

              {/* Website */}
              {companyWebsite && (
                <a
                  href={companyWebsite.startsWith("http") ? companyWebsite : `https://${companyWebsite}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group block rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm hover:border-violet-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 border border-violet-100">
                      <Globe className="h-4 w-4 text-violet-500" />
                    </div>
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      Website
                    </span>
                  </div>
                  <p className="text-lg font-bold text-violet-600 group-hover:text-violet-700 truncate leading-snug transition-colors flex items-center gap-2">
                    Visit Website
                    <ExternalLink className="h-4 w-4 shrink-0" />
                  </p>
                </a>
              )}

              {/* Contact Email */}
              <div className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm hover:border-violet-200/60 transition-colors">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-50 border border-violet-100">
                    <Mail className="h-4 w-4 text-violet-500" />
                  </div>
                  <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                    Contact
                  </span>
                </div>
                <p className="text-lg font-bold text-slate-900 leading-snug truncate">{profile.email}</p>
              </div>

              {/* Member Since */}
              <InfoTile
                icon={Calendar}
                label="Member Since"
                value={formatDate(profile.createdAt)}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <EditProfileModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          profile={profile}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  );
}

export default Profile;
