
export function InputField({
  label,
  required = false,
  error,
  helperText,
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  containerClassName = "",
  disabled = false,
  icon: Icon,
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
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-ink placeholder:text-muted-foreground shadow-sm focus:border-accent focus:outline-none disabled:opacity-50 disabled:bg-surface ${
            Icon ? "pl-10" : ""
          } ${error ? "border-red-500 focus:border-red-500" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

export default InputField;
