import React from "react";

const STATUS_MAP = {
  open: { label: "Open", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  in_progress: { label: "In Progress", cls: "bg-sky-50 text-sky-700 border-sky-300" },
  under_review: { label: "Under Review", cls: "bg-amber-50 text-amber-700 border-amber-300" },
  completed: { label: "Completed", cls: "bg-gray-100 text-gray-500 border-gray-300" },
  revision_requested: { label: "Revision Requested", cls: "bg-amber-100 text-amber-800 border-amber-300" },
  revision: { label: "Revision", cls: "bg-orange-50 text-orange-700 border-orange-300" },
  closed: { label: "Closed", cls: "bg-gray-100 text-gray-400 border-gray-300" },
  pending: { label: "Pending", cls: "bg-amber-100 text-amber-800 border-amber-300" },
  accepted: { label: "Selected", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  selected: { label: "Selected", cls: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  rejected: { label: "Rejected", cls: "bg-rose-100 text-rose-800 border-rose-300" },
  withdrawn: { label: "Withdrawn", cls: "bg-gray-100 text-gray-500 border-gray-300" },
};

const CATEGORY_MAP = {
  Development: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Design: "bg-violet-50 text-violet-700 border-violet-200",
  Data: "bg-sky-50 text-sky-700 border-sky-200",
  Writing: "bg-amber-50 text-amber-700 border-amber-200",
  Research: "bg-teal-50 text-teal-700 border-teal-200",
  Marketing: "bg-rose-50 text-rose-700 border-rose-200",
  Other: "bg-gray-50 text-gray-600 border-gray-200",
};

export function StatusBadge({ status, label, className = "", ...props }) {
  const config = STATUS_MAP[status] || {
    label: label || status || "Open",
    cls: "bg-gray-100 text-gray-600 border-gray-300",
  };

  const badgeLabel = label || config.label;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${config.cls} ${className}`}
      {...props}
    >
      {badgeLabel}
    </span>
  );
}

export function CategoryBadge({ category, className = "", ...props }) {
  const cls = CATEGORY_MAP[category] || CATEGORY_MAP.Other;

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold ${cls} ${className}`}
      {...props}
    >
      {category}
    </span>
  );
}

export default StatusBadge;
