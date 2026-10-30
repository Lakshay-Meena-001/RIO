import React from "react";
import { FiCreditCard, FiLogOut, FiPlus } from "react-icons/fi";

function SidebarFooter({
  expanded,
  user,
  firstName,
  initials,
  balance,
  onNavigate,
  onLogout,
  mobile = false,
}) {
  const credits = (
    <button
      type="button"
      onClick={() => onNavigate("/billing?addBalance=1")}
      title={`Manage balance: ${balance} INR`}
      aria-label={`Manage balance: ${balance} INR`}
      className={`group flex items-center rounded-2xl text-left transition-colors hover:bg-[var(--sidebar-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sidebar-muted-strong)] ${
        expanded ? "w-full gap-3 px-2 py-2.5" : "mx-auto h-11 w-11 justify-center"
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sidebar-icon-bg)] text-[var(--sidebar-text)] transition-colors group-hover:bg-[var(--sidebar-icon-hover)]">
        <FiCreditCard size={19} strokeWidth={1.7} aria-hidden="true" />
      </span>
      {expanded && (
        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-medium uppercase tracking-[0.13em] text-[var(--sidebar-muted-strong)]">
            Available Balance
          </span>
          <span className="mt-1 block truncate text-[15px] font-semibold leading-none tracking-tight text-[var(--sidebar-text)]">
            {Number.isFinite(balance) ? balance.toLocaleString("en-IN") : "0"}{" "}
            <span className="text-[11px] font-medium text-[var(--sidebar-muted-strong)]">INR</span>
          </span>
        </span>
      )}
      {expanded && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--sidebar-avatar-bg)] text-[var(--sidebar-avatar-text)] transition-transform group-hover:scale-105" aria-hidden="true">
          <FiPlus size={17} strokeWidth={2} />
        </span>
      )}
    </button>
  );

  const account = (
    <div className="border-t border-[var(--sidebar-border)] p-3">
      {expanded ? (
        <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--sidebar-border)] bg-[var(--sidebar-card)] p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sidebar-text)] text-xs font-bold text-[var(--sidebar-bg)]" aria-hidden="true">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-bold leading-tight text-[var(--sidebar-muted-strong)]">
              {firstName}
            </span>
            <button
              type="button"
              onClick={() => onNavigate("/profile")}
              className="mt-1 block max-w-full truncate text-left text-[10px] text-[var(--sidebar-muted)] transition-colors hover:text-[var(--sidebar-text)] focus-visible:outline-none focus-visible:underline"
              aria-label="Open profile"
              title="Open profile"
            >
              {user?.email || "RIO member"}
            </button>
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[var(--sidebar-muted)] transition-colors hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sidebar-muted-strong)]"
            aria-label="Log out"
            title="Log out"
          >
            <FiLogOut size={16} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => onNavigate("/profile")}
          className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sidebar-text)] text-xs font-bold text-[var(--sidebar-bg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--sidebar-muted-strong)]"
          title={firstName}
          aria-label={`Open ${firstName}'s profile`}
        >
          {initials}
        </button>
      )}
    </div>
  );

  return (
    <footer className="shrink-0 bg-[var(--sidebar-bg)]">
      {mobile ? (
        <>
          <div className="px-3 pb-2">{credits}</div>
          {account}
        </>
      ) : (
        <>
          <div className="p-3 pb-2">{credits}</div>
          {account}
        </>
      )}
    </footer>
  );
}

export default React.memo(SidebarFooter);
