
export function PageHeader({
  title,
  description,
  badgeText,
  actions,
  children,
  className = "",
  style = {},
  ...props
}) {
  const defaultStyle = {
    backgroundImage:
      "linear-gradient(120deg, rgba(253,251,246,0.92), rgba(255,255,255,0.82))",
    ...style,
  };

  return (
    <section
      className={`mb-8 rounded-2xl border border-border bg-card/90 px-6 py-6 shadow-sm backdrop-blur-sm md:px-8 md:py-8 ${className}`}
      style={defaultStyle}
      {...props}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          {badgeText && (
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {badgeText}
            </p>
          )}
          <h1 className="font-display text-2xl font-bold text-ink md:text-3xl lg:text-[2rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-1.5 text-sm text-muted-foreground md:text-base">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export default PageHeader;
