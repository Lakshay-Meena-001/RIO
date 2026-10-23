import PageEyebrow from "./PageEyebrow.jsx";

export default function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
  titleAs: Title = "h2",
}) {
  return (
    <div className={`rio-section-header ${className}`.trim()}>
      <div className="rio-section-header__copy">
        {eyebrow ? <PageEyebrow>{eyebrow}</PageEyebrow> : null}
        {title ? <Title className="rio-section-title">{title}</Title> : null}
        {description ? (
          <p className="rio-section-description">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="rio-section-header__actions">{actions}</div>
      ) : null}
    </div>
  );
}
