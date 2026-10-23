export default function Card({
  as: Component = "section",
  variant = "default",
  padding = true,
  interactive = false,
  className = "",
  children,
  ...props
}) {
  const variantClass =
    variant === "glass"
      ? "rio-card--glass"
      : variant === "elevated"
        ? "rio-card--elevated"
        : variant === "quiet"
          ? "rio-card--quiet"
          : "";
  return (
    <Component
      className={`rio-card ${variantClass} ${padding ? "rio-card__body" : ""} ${interactive ? "rio-card--interactive" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  );
}
