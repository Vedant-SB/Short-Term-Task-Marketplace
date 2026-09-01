
export function EmptyState({
  icon: Icon,
  title,
  description,
  button,
  children,
  className = "",
  ...props
}) {
  return (
    <div className={`px-6 py-10 text-center md:px-8 ${className}`} {...props}>
      {Icon && (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border">
          <Icon className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
        </div>
      )}
      {title && (
        <h3 className="font-display text-base font-semibold text-ink">
          {title}
        </h3>
      )}
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {button && <div className="mt-4">{button}</div>}
      {children}
    </div>
  );
}

export default EmptyState;
