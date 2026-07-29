import React from "react";
import { Star } from "lucide-react";

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = "bg-blue-50",
  iconColor = "text-blue-600",
  isRating = false,
  reviewCount = 0,
  className = "",
  ...props
}) {
  const numericValue =
    typeof value === "number" ? value : parseFloat(value) || 0;

  return (
    <div
      className={`group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-elegant ${className}`}
      {...props}
    >
      {Icon && (
        <div
          className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.8} />
        </div>
      )}

      <p className="font-display text-3xl font-bold text-ink">
        {isRating && typeof value === "number" ? value.toFixed(1) : value}
      </p>

      <p className="mt-0.5 text-[13px] text-muted-foreground">
        {subtitle || title}
      </p>

      {isRating && (
        <div className="mt-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.round(numericValue)
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-300"
                }`}
                strokeWidth={1.5}
              />
            ))}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {reviewCount > 0 || typeof value === "number"
              ? `Based on ${reviewCount} verified review${reviewCount !== 1 ? "s" : ""}`
              : "No verified reviews yet"}
          </p>
        </div>
      )}
    </div>
  );
}

export default StatCard;
