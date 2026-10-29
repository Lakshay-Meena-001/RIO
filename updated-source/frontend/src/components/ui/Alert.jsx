import { FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle, FiX } from "react-icons/fi";
import IconButton from "./IconButton.jsx";
const icons = { info: FiInfo, success: FiCheckCircle, warning: FiAlertTriangle, error: FiAlertCircle };
export default function Alert({ variant = "info", title, children, onDismiss, className = "" }) {
  const Icon = icons[variant] || icons.info;
  return (
    <div className={`rio-alert rio-alert--${variant} ${className}`.trim()} role={variant === "error" ? "alert" : "status"}>
      <Icon className="rio-alert__icon" aria-hidden="true" size={18} />
      <div className="rio-alert__content">{title ? <p className="rio-alert__title">{title}</p> : null}<div className="rio-alert__message">{children}</div></div>
      {onDismiss ? <IconButton label="Dismiss message" size="sm" variant="ghost" className="rio-alert__dismiss" onClick={onDismiss}><FiX size={16} /></IconButton> : null}
    </div>
  );
}
