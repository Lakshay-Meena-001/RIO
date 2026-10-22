import React from "react";

const variantClass = {
  primary: "rio-button--primary",
  secondary: "",
  ghost: "rio-button--ghost",
  danger: "rio-button--danger",
};

const sizeClass = {
  sm: "rio-button--sm",
  md: "",
  lg: "rio-button--lg",
};

export default function Button({
  as: Component = "button",
  variant = "secondary",
  size = "md",
  fullWidth = false,
  loading = false,
  disabled = false,
  iconOnly = false,
  className = "",
  type = "button",
  children,
  ...props
}) {
  const classes = [
    "rio-button",
    variantClass[variant] ?? variantClass.secondary,
    sizeClass[size] ?? "",
    fullWidth ? "rio-button--full" : "",
    iconOnly ? "rio-icon-button" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      className={classes}
      {...(Component === "button" ? { type } : {})}
      {...(Component === "button"
        ? { disabled: disabled || loading, "aria-busy": loading || undefined }
        : {})}
      {...props}
    >
      {children}
    </Component>
  );
}
