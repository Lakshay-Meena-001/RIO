export default function LoadingState({
  label = "Loading",
  description,
  className = "",
  size = "md",
}) {
  return (
    <div
      className={`rio-state rio-loading-state rio-loading-state--${size} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <span className="rio-loading-state__spinner" aria-hidden="true" />
      <span className="rio-loading-state__copy">
        <span className="rio-loading-state__label">{label}</span>
        {description ? (
          <span className="rio-state__description">{description}</span>
        ) : null}
      </span>
    </div>
  );
}
