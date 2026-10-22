import React, { useId } from "react";
export default function FormField({ label, hint, error, id, className = "", labelClassName = "", children, required = false }) {
  const generatedId = useId(); const fieldId = id || generatedId;
  const describedBy = [hint ? `${fieldId}-hint` : "", error ? `${fieldId}-error` : ""].filter(Boolean).join(" ") || undefined;
  const child = React.isValidElement(children) ? React.cloneElement(children, { id: children.props.id || fieldId, "aria-invalid": error ? "true" : children.props["aria-invalid"], "aria-describedby": children.props["aria-describedby"] || describedBy, required: children.props.required ?? required, className: `rio-field__control ${children.props.className || ""}`.trim() }) : children;
  return <div className={`rio-field ${className}`.trim()}>{label ? <label className={`rio-field__label ${labelClassName}`.trim()} htmlFor={fieldId}>{label}{required ? " *" : ""}</label> : null}{child}{hint ? <p className="rio-field__hint" id={`${fieldId}-hint`}>{hint}</p> : null}{error ? <p className="rio-field__error" id={`${fieldId}-error`} role="alert">{error}</p> : null}</div>;
}
