import { FiAlertCircle } from "react-icons/fi";

export default function ErrorState({
  title = "Something went wrong",
  description = "We couldn't complete this request. Please try again.",
  action,
  className = "",
  compact = false,
}) {
  return (
    <section
      className={`rio-state rio-error-state ${compact ? "rio-error-state--compact" : ""} ${className}`.trim()}
      role="alert"
    >
      <span className="rio-error-state__icon" aria-hidden="true">
        <FiAlertCircle size={21} strokeWidth={1.6} />
      </span>
      <h3 className="rio-state__title">{title}</h3>
      <p className="rio-state__description">{description}</p>
      {action ? <div className="rio-state__action">{action}</div> : null}
    </section>
  );
}
