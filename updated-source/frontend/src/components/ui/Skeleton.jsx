export default function Skeleton({
  width,
  height = "1rem",
  radius = "md",
  className = "",
  circle = false,
  as: Component = "div",
}) {
  const style = {
    ...(width ? { width } : {}),
    height,
    ...(circle ? { width: width || height, borderRadius: "999px" } : {}),
  };
  return (
    <Component
      aria-hidden="true"
      className={`rio-skeleton rio-skeleton--${radius} ${circle ? "rio-skeleton--circle" : ""} ${className}`.trim()}
      style={style}
    />
  );
}
