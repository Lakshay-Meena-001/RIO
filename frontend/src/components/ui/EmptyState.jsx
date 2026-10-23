import { FiInbox } from "react-icons/fi";

export default function EmptyState({
  icon: Icon = FiInbox,
  title = "Nothing here yet",
  description,
  action,
  className = "",
  compact = false,
}) {
  return (
    <section
      className={`rio-state rio-empty-state ${compact ? "rio-empty-state--compact" : ""} ${className}`.trim()}
      aria-label={title}
    >
      <span className="rio-empty-state__icon" aria-hidden="true">
        <Icon size={21} strokeWidth={1.6} />
      </span>
      <h3 className="rio-state__title">{title}</h3>
      {description ? (
        <p className="rio-state__description">{description}</p>
      ) : null}
      {action ? <div className="rio-state__action">{action}</div> : null}
    </section>
  );
}
