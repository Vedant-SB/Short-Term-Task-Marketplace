
export function SectionHeader({
  title,
  action,
  children,
  className = "",
  ...props
}) {
  return (
    <div
      className={`flex items-center justify-between border-b border-border/60 px-6 py-4 md:px-8 ${className}`}
      {...props}
    >
      {title && <h2 className="font-display text-lg text-ink">{title}</h2>}
      {children}
      {action && <div>{action}</div>}
    </div>
  );
}

export default SectionHeader;
