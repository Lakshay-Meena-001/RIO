const variants = {
  default: "",
  pending: "rio-badge--pending",
  completed: "rio-badge--completed",
  failed: "rio-badge--failed",
  processing: "rio-badge--processing",
  info: "rio-badge--info",
  neutral: "rio-badge--neutral",
};
export default function Badge({
  variant = "default",
  dot = false,
  className = "",
  children,
  ...props
}) {
  return (
    <span
      className={`rio-badge ${variants[variant] ?? ""} ${className}`.trim()}
      {...props}
    >
      {dot ? <span className="rio-badge__dot" aria-hidden="true" /> : null}
      <span className="rio-badge__label">{children}</span>
    </span>
  );
}
