import React from "react";

export function SelectField({
  label,
  required = false,
  error,
  helperText,
  id,
  name,
  options = [],
  value,
  onChange,
  className = "",
  containerClassName = "",
  disabled = false,
  placeholder = "Select an option",
  children,
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
      <select
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-ink shadow-sm focus:border-accent focus:outline-none cursor-pointer disabled:opacity-50 disabled:bg-surface ${
          error ? "border-red-500 focus:border-red-500" : ""
        } ${className}`}
        {...props}
      >
        {children ? (
          children
        ) : (
          <>
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => {
              const optValue = typeof opt === "object" ? opt.value : opt;
              const optLabel = typeof opt === "object" ? opt.label : opt;
              return (
                <option key={optValue} value={optValue}>
                  {optLabel}
                </option>
              );
            })}
          </>
        )}
      </select>
      {error && <p className="text-xs font-medium text-red-500">{error}</p>}
      {!error && helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}

export default SelectField;
