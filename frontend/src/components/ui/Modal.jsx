import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import IconButton from "./IconButton.jsx";
import { FiX } from "react-icons/fi";
export default function Modal({ open, onClose, title, children, footer, className = "", closeOnBackdrop = true, closeLabel = "Close dialog" }) {
  useEffect(() => { if (!open) return undefined; const onKeyDown = (event) => { if (event.key === "Escape") onClose?.(); }; window.addEventListener("keydown", onKeyDown); return () => window.removeEventListener("keydown", onKeyDown); }, [open, onClose]);
  if (!open || typeof document === "undefined") return null;
  return createPortal(<div className="rio-modal-backdrop" onMouseDown={(event) => { if (closeOnBackdrop && event.target === event.currentTarget) onClose?.(); }}><section className={`rio-modal ${className}`.trim()} role="dialog" aria-modal="true" aria-label={title || "Dialog"}>{title ? <header className="rio-modal__header"><h2 className="rio-modal__title">{title}</h2><IconButton label={closeLabel} onClick={onClose} variant="ghost"><FiX aria-hidden="true" /></IconButton></header> : null}<div className="rio-modal__body">{children}</div>{footer ? <footer className="rio-modal__footer">{footer}</footer> : null}</section></div>, document.body);
}
