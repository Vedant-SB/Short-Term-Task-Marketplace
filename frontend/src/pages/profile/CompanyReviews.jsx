import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Star,
  ArrowLeft,
  MessageSquareX,
  AlertCircle,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/useAuth";

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

/* ════════════════════════════════════════════════════════════════ */
/*  COMPANY REVIEWS PAGE (Private to company owner)                */
/* ════════════════════════════════════════════════════════════════ */
function CompanyReviews() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.userId || user.role !== "company") return;
      setLoading(true);
      try {
        const res = await api.get(`/profiles/${user.userId}`);
        setProfile(res.data.profile);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load company reviews");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [user?.userId, user?.role]);

  // Strict role check: Only company accounts can access this page
  if (user && user.role !== "company") {
    return <Navigate to="/profile" replace />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/60 py-24">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
          <p className="text-base font-semibold text-slate-600">Loading reviews...</p>
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
          <h2 className="font-display text-2xl font-bold text-slate-900">Reviews Unavailable</h2>
          <p className="mt-2 text-base text-slate-500">{error || "Could not load reviews."}</p>
          <Link
            to="/profile"
            className="mt-6 inline-flex items-center justify-center rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold text-white hover:bg-violet-700 transition-colors"
          >
            Back to Profile
          </Link>
        </div>
      </div>
    );
  }

  const {
    reviewSummary = {
      averageRating: 0,
      reviewCount: 0,
      reviewHistory: [],
    },
    statistics = {},
  } = profile;

  const averageRating = statistics.averageRating ?? reviewSummary.averageRating ?? 0;
  const totalReviews = statistics.totalReviews ?? reviewSummary.reviewCount ?? 0;
  const reviewHistory = reviewSummary.reviewHistory || [];

  // Sort latest reviews first
  const sortedReviews = [...reviewHistory].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-slate-50/60 py-8 md:py-12">
      <div className="relative mx-auto w-[94%] max-w-[960px] space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 text-sm font-bold text-violet-600 hover:text-violet-700 mb-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </Link>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Reviews & Ratings
            </h1>
            <p className="mt-1 text-base text-slate-500">
              All feedback and ratings received for {profile.companyName || "your company"} from completed tasks.
            </p>
          </div>
        </div>

        {/* Rating Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-6 md:p-8 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-400 text-white font-display text-3xl font-bold shadow-sm">
              {averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
            </div>
            <div>
              <p className="font-display text-xl font-bold text-slate-900">TaskHub Verified Rating</p>
              <p className="text-sm text-slate-500">
                Based on {totalReviews} completed project review{totalReviews !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <StarRating rating={averageRating} size="h-6 w-6" />
        </motion.div>

        {/* All Reviews List */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-2xl border border-zinc-200/80 bg-white p-7 md:p-8 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-zinc-100">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              All Reviews
            </h2>
            <span className="inline-flex items-center rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-xs font-bold text-violet-700">
              {sortedReviews.length} Review{sortedReviews.length !== 1 ? "s" : ""}
            </span>
          </div>

          {sortedReviews.length === 0 ? (
            <div className="rounded-xl border border-zinc-100 bg-slate-50/60 p-12 text-center">
              <MessageSquareX className="mx-auto h-12 w-12 text-slate-300 mb-3" strokeWidth={1.5} />
              <p className="text-xl font-bold text-slate-700">No reviews received yet</p>
              <p className="mt-2 text-sm text-slate-400 max-w-md mx-auto">
                Reviews from completed tasks will appear here after individuals submit ratings.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sortedReviews.map((rev) => (
                <div
                  key={rev.id || rev._id || `${rev.reviewer}-${rev.date}`}
                  className="rounded-xl border border-zinc-200/80 bg-white p-5 shadow-xs space-y-3 hover:border-violet-200 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold text-sm">
                        {getInitials(rev.reviewer)}
                      </div>
                      <div>
                        <span className="font-display text-base font-bold text-slate-900 block">
                          {rev.reviewer || "TaskHub Member"}
                        </span>
                        {rev.taskTitle && (
                          <span className="text-xs text-slate-400 font-medium">
                            Task: {rev.taskTitle}
                          </span>
                        )}
                      </div>
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
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default CompanyReviews;
