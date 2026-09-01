
export function TextAreaField({
  label,
  required = false,
  error,
  helperText,
  id,
  name,
  rows = 4,
  placeholder,
  value,
  onChange,
  className = "",
  containerClassName = "",
  disabled = false,
  ...props
}) {
  const inputId = id || name;

  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-ink placeholder:text-muted-foreground shadow-sm focus:border-accent focus:outline-none disabled:opacity-50 disabled:bg-surface ${
          error ? "border-red-500 focus:border-red-500" : ""
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

export default TextAreaField;
