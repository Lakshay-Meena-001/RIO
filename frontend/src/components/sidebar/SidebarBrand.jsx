import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

function SidebarBrand({ expanded, showToggle, onToggle, onHome }) {
  return (
    <header
      className={`flex h-[72px] shrink-0 items-center border-b border-[var(--sidebar-border)] ${
        expanded ? "justify-between pl-4" : "justify-center pl-4"
      }`}
    >
      <button
        type="button"
        onClick={onHome}
        aria-label="RIO home"
        className={`group flex min-w-0 items-center text-left ${expanded ? "gap-3" : "justify-center"}`}
      >
        <span className="relative block shrink-0 text-left">
          <span
            className={`block leading-none tracking-tight text-[var(--sidebar-text)] ${
              expanded ? "text-[17px]" : "text-[16px]"
            }`}
            style={{ fontFamily: '"Zen Dots", sans-serif' }}
          >
            RIO
          </span>
          <span
            className={`pointer-events-none absolute left-0 top-[calc(100%+4px)] whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.2em] text-[var(--sidebar-muted)] transition-opacity duration-200 ${
              expanded ? "opacity-100" : "opacity-0"
            }`}
          >
            Career Intelligence
          </span>
        </span>
      </button>

      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={expanded}
          className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--sidebar-muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sidebar-muted-strong)]"
        >
          {expanded ? <FiChevronLeft size={17} /> : <FiChevronRight size={17} />}
        </button>
      )}
    </header>
  );
}

export default React.memo(SidebarBrand);
