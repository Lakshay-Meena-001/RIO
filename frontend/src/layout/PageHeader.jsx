import React from "react";

export default function PageHeader({ eyebrow, title, description, actions, className = "", titleId }) {
  return (
    <header className={`rio-page-header ${className}`.trim()}>
      <div className="rio-page-header__copy">
        {eyebrow ? <p className="rio-page-header__eyebrow">{eyebrow}</p> : null}
        {title ? <h1 id={titleId} className="rio-page-title">{title}</h1> : null}
        {description ? <p className="rio-page-description">{description}</p> : null}
      </div>
      {actions ? <div className="rio-page-header__actions">{actions}</div> : null}
    </header>
  );
}
