
export function SkillChip({ skill, children, className = "", ...props }) {
  return (
    <span
      className={`inline-flex items-center rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-ink ${className}`}
      {...props}
    >
      {children || skill}
    </span>
  );
}

export default SkillChip;
