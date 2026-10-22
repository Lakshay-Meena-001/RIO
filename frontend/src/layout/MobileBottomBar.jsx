import React from "react";
import { NavLink } from "react-router-dom";

export default function MobileBottomBar({ items = [], className = "", ariaLabel = "Mobile navigation" }) {
  if (!items.length) return null;
  return (
    <nav className={`rio-mobile-bottom-bar md:hidden ${className}`.trim()} aria-label={ariaLabel}>
      <div className="rio-mobile-bottom-bar__inner">
        {items.map((item) => {
          const Icon = item.icon;
          const content = <>{Icon ? <Icon aria-hidden="true" size={18} /> : null}<span className="truncate">{item.label}</span></>;
          return item.href ? <NavLink key={item.href} to={item.href} end={item.end} className="rio-mobile-bottom-bar__item">{content}</NavLink> : <button key={item.label} type="button" className="rio-mobile-bottom-bar__item" onClick={item.onClick} aria-current={item.active ? "page" : undefined} disabled={item.disabled}>{content}</button>;
        })}
      </div>
    </nav>
  );
}
