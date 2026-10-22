import React from "react";
const variants = { default: "", pending: "rio-badge--pending", completed: "rio-badge--completed", failed: "rio-badge--failed", processing: "rio-badge--processing" };
export default function Badge({ variant = "default", dot = false, className = "", children, ...props }) {
  return <span className={`rio-badge ${variants[variant] ?? ""} ${className}`.trim()} {...props}>{dot ? <span className="status-dot" aria-hidden="true" /> : null}{children}</span>;
}
