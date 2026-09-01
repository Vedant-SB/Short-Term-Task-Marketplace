
const VARIANTS = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-elegant hover:brightness-110",
  secondary:
    "border border-border bg-card text-ink shadow-sm hover:-translate-y-0.5 hover:bg-surface hover:shadow-elegant",
  outline:
    "border border-border bg-card text-ink shadow-sm hover:bg-surface hover:shadow",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
};

const SIZES = {
  sm: "px-3.5 py-2 text-xs font-medium rounded-lg",
  md: "px-5 py-2.5 text-sm font-semibold rounded-xl",
  lg: "px-6 py-3 text-base font-semibold rounded-xl",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none";
  const variantClasses = VARIANTS[variant] || VARIANTS.primary;
  const sizeClasses = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function PrimaryButton(props) {
  return <Button variant="primary" {...props} />;
}

export function SecondaryButton(props) {
  return <Button variant="secondary" {...props} />;
}

export function DangerButton(props) {
  return <Button variant="danger" {...props} />;
}

export function IconButton({
  children,
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg border border-border bg-card p-2 text-muted-foreground shadow-sm transition-all duration-150 hover:bg-surface hover:text-ink hover:shadow cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
