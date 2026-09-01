
export function Card({ children, className = "", hover = false, ...props }) {
  const hoverClasses = hover
    ? "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-elegant"
    : "";
  return (
    <div
      className={`rounded-2xl border border-border bg-card p-6 shadow-sm ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionCard({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
