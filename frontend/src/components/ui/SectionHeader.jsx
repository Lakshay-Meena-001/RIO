
export default function SectionHeader({
  title,
  description,
  actions,
  className = "",
}) {
  return (
    <div className={`rio-section-header ${className}`}>
      <div className="min-w-0">
        <h2 className="rio-section-title">{title}</h2>

        {description && (
          <p className="rio-section-description">{description}</p>
        )}
      </div>

      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
