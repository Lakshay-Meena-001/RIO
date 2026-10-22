export default function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className = "",
  size = "default",
}) {
  return (
    <header
      className={`rio-page-header ${
        size === "hero" ? "rio-page-header--hero" : ""
      } ${className}`}
    >
      <div className="rio-page-header__copy">
        {eyebrow && <p className="rio-page-header__eyebrow">{eyebrow}</p>}

        <h1 className="rio-page-title">{title}</h1>

        {description && <p className="rio-page-description">{description}</p>}
      </div>

      {actions && <div className="rio-page-header__actions">{actions}</div>}
    </header>
  );
}
