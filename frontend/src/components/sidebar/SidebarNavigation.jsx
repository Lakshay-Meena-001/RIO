import React from "react";

function SidebarNavigation({
  items,
  label,
  expanded,
  isActive,
  onNavigate,
  showLabel = true,
}) {
  return (
    <section aria-label={label}>
      {expanded && showLabel && (
        <h2 className="px-3 pb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[var(--sidebar-label)]">
          {label}
        </h2>
      )}
      <nav aria-label={label} className="space-y-1">
        {items.map(({ label: itemLabel, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <button
              key={path}
              type="button"
              onClick={() => onNavigate(path)}
              title={!expanded ? itemLabel : undefined}
              aria-label={!expanded ? itemLabel : undefined}
              aria-current={active ? "page" : undefined}
              className={`group relative flex min-h-10 w-full items-center rounded-xl transition-[background-color,color] duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sidebar-muted-strong)] ${
                expanded ? "gap-3 px-3 py-2.5" : "justify-center px-2 py-3"
              } ${
                active
                  ? "bg-[var(--sidebar-active)] text-[var(--sidebar-text)]"
                  : "text-[var(--sidebar-muted)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
              }`}
            >
              {active && (
                <span
                  className="absolute left-0 h-5 w-[2px] rounded-full bg-[var(--sidebar-text)]"
                  aria-hidden="true"
                />
              )}
              <Icon size={18} strokeWidth={1.7} className="shrink-0" aria-hidden="true" />
              {expanded && (
                <span className="min-w-0 truncate text-left text-[12px] font-medium">
                  {itemLabel}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </section>
  );
}

export default React.memo(SidebarNavigation);
