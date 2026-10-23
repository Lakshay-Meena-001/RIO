import PageEyebrow from "./PageEyebrow.jsx";

/** Shared premium page heading. Keeps the RIO eyebrow/dot treatment consistent. */
export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
  size = "default",
  titleClassName = "",
  descriptionClassName = "",
  eyebrowDot = true,
}) {
  return (
    <header
      className={`rio-page-header ${size === "hero" ? "rio-page-header--hero" : ""} ${className}`.trim()}
    >
      <div className="rio-page-header__copy">
        {eyebrow ? <PageEyebrow dot={eyebrowDot}>{eyebrow}</PageEyebrow> : null}
        <h1 className={`rio-page-title ${titleClassName}`.trim()}>{title}</h1>
        {description ? (
          <p className={`rio-page-description ${descriptionClassName}`.trim()}>
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="rio-page-header__actions">{actions}</div>
      ) : null}
    </header>
  );
}
