import React, { useId } from "react";

export default function FormField({
  label,
  hint,
  error,
  id,
  className = "",
  labelClassName = "",
  children,
  required = false,
  optional = false,
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const describedBy =
    [hint ? `${fieldId}-hint` : "", error ? `${fieldId}-error` : ""]
      .filter(Boolean)
      .join(" ") || undefined;
  const child = React.isValidElement(children)
    ? React.cloneElement(children, {
        id: children.props.id || fieldId,
        "aria-invalid": error ? "true" : children.props["aria-invalid"],
        "aria-describedby":
          [children.props["aria-describedby"], describedBy]
            .filter(Boolean)
            .join(" ") || undefined,
        required: children.props.required ?? required,
        className:
          `rio-field__control ${children.props.className || ""}`.trim(),
      })
    : children;
  return (
    <div
      className={`rio-field ${error ? "rio-field--error" : ""} ${className}`.trim()}
    >
      {label ? (
        <label
          className={`rio-field__label ${labelClassName}`.trim()}
          htmlFor={fieldId}
        >
          {label}
          {required ? <span className="rio-field__required"> *</span> : null}
          {optional ? (
            <span className="rio-field__optional"> (optional)</span>
          ) : null}
        </label>
      ) : null}
      {child}
      {hint && !error ? (
        <p className="rio-field__hint" id={`${fieldId}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="rio-field__error" id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
