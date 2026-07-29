import React from "react";

export function FormSection({
  title,
  description,
  children,
  className = "",
  ...props
}) {
  return (
    <div className={`space-y-4 ${className}`} {...props}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="font-display text-base font-semibold text-ink">
              {title}
            </h3>
          )}
          {description && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

export default FormSection;
