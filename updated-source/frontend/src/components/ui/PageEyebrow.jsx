export default function PageEyebrow({
  children,
  className = "",
  dot = true,
  as: Component = "p",
}) {
  if (!children) return null;
  return (
    <Component className={`rio-page-eyebrow ${className}`.trim()}>
      {dot ? (
        <span className="rio-page-eyebrow__dot" aria-hidden="true" />
      ) : null}
      <span>{children}</span>
    </Component>
  );
}
