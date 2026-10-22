import React from "react";
import Button from "./Button.jsx";
export default function IconButton({ size = "md", className = "", label, children, ...props }) {
  return <Button size={size} className={`rio-icon-button ${size === "sm" ? "rio-icon-button--sm" : ""} ${className}`.trim()} aria-label={label} title={props.title ?? label} {...props}>{children}</Button>;
}
