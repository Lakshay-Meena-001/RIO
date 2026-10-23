import React from "react";
import { FiLoader } from "react-icons/fi";

const variantClass = {
  primary: "rio-button--primary",
  secondary: "rio-button--secondary",
  ghost: "rio-button--ghost",
  danger: "rio-button--danger",
  subtle: "rio-button--subtle",
};
const sizeClass = {
  xs: "rio-button--xs",
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
  leadingIcon,
  trailingIcon,
  ...props
}) {
  const isButton = Component === "button";
  const classes = [
    "rio-button",
    variantClass[variant] ?? variantClass.secondary,
    sizeClass[size] ?? "",
    fullWidth ? "rio-button--full" : "",
    iconOnly ? "rio-icon-button" : "",
    loading ? "rio-button--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      className={classes}
      {...(isButton
        ? {
            type,
            disabled: disabled || loading,
            "aria-busy": loading || undefined,
          }
        : {})}
      {...(!isButton && disabled ? { "aria-disabled": true } : {})}
      {...props}
    >
      {loading ? (
        <FiLoader className="rio-button__spinner" aria-hidden="true" />
      ) : leadingIcon && !iconOnly ? (
        <span className="rio-button__icon" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span className="rio-button__label">{children}</span>
      {!loading && trailingIcon ? (
        <span className="rio-button__icon" aria-hidden="true">
          {trailingIcon}
        </span>
      ) : null}
    </Component>
  );
}
