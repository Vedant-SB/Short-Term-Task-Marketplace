
export function TableContainer({ children, className = "", ...props }) {
  return (
    <div className={`overflow-x-auto ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Table({ children, minWidth = "min-w-[800px]", className = "", ...props }) {
  return (
    <table className={`w-full ${minWidth} ${className}`} {...props}>
      {children}
    </table>
  );
}

export function TableHeader({ children, className = "", ...props }) {
  return (
    <thead className={className} {...props}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className = "", ...props }) {
  return (
    <tbody className={className} {...props}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, clickable = false, className = "", ...props }) {
  const cursorClasses = clickable ? "cursor-pointer" : "";
  return (
    <tr
      className={`border-b border-border/30 transition-colors duration-150 last:border-0 hover:bg-surface/50 ${cursorClasses} ${className}`}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TableHead({ children, align = "left", className = "", ...props }) {
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
      ? "text-right"
      : "text-left";
  return (
    <th
      className={`px-4 py-3 ${alignClass} text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ children, align = "left", className = "", ...props }) {
  const alignClass =
    align === "center"
      ? "text-center"
      : align === "right"
      ? "text-right"
      : "text-left";
  return (
    <td className={`px-4 py-4 ${alignClass} ${className}`} {...props}>
      {children}
    </td>
  );
}

export default Table;
