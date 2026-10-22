import React from "react";
export default function Card({ as: Component = "section", variant = "default", padding = true, className = "", children, ...props }) {
  const variantClass = variant === "glass" ? "rio-card--glass" : variant === "elevated" ? "rio-card--elevated" : "";
  return <Component className={`rio-card ${variantClass} ${padding ? "rio-card__body" : ""} ${className}`.trim()} {...props}>{children}</Component>;
}
