import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { FiX } from "react-icons/fi";
import IconButton from "./IconButton.jsx";

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  className = "",
  closeOnBackdrop = true,
  closeLabel = "Close dialog",
  size = "md",
}) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    previousFocusRef.current = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) {
          event.preventDefault();
          dialogRef.current.focus();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.requestAnimationFrame(() => {
      const first = dialogRef.current?.querySelector(
        "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href]",
      );
      (first || dialogRef.current)?.focus?.();
    });
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;
  return createPortal(
    <div
      className="rio-modal-backdrop"
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget)
          onClose?.();
      }}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        className={`rio-modal rio-modal--${size} ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
      >
        {title ? (
          <header className="rio-modal__header">
            <h2 className="rio-modal__title">{title}</h2>
            <IconButton
              label={closeLabel}
              onClick={onClose}
              variant="ghost"
              size="sm"
            >
              <FiX aria-hidden="true" />
            </IconButton>
          </header>
        ) : null}
        <div className="rio-modal__body">{children}</div>
        {footer ? (
          <footer className="rio-modal__footer">{footer}</footer>
        ) : null}
      </section>
    </div>,
    document.body,
  );
}
