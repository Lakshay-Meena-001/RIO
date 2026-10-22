import { FiMenu, FiRefreshCw } from "react-icons/fi";

/** Shared compact mobile header for the Dashboard and Progress pages. */
export default function MobileHeader({
  onOpenNavigation,
  onAction,
  actionLabel = "Refresh page data",
  loading = false,
}) {
  return (
    <header className="rio-mobile-header fixed left-3 right-3 top-3 z-40 flex h-14 items-center justify-between rounded-full border px-3 shadow-[0_16px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl md:hidden">
      <button
        type="button"
        onClick={onOpenNavigation}
        aria-label="Open navigation"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <FiMenu size={18} aria-hidden="true" />
      </button>

      <div className="flex min-w-0 flex-col items-center justify-center leading-none" aria-label="RIO Career Intelligence">
        <span className="rio-mobile-header__brand text-[16px] tracking-tight">RIO</span>
        <span className="rio-mobile-header__caption mt-1 text-[7px] font-medium tracking-[0.12em]">
          CAREER INTELLIGENCE
        </span>
      </div>

      <button
        type="button"
        onClick={onAction}
        disabled={loading}
        aria-label={actionLabel}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
      >
        <FiRefreshCw size={15} className={loading ? "animate-spin" : ""} aria-hidden="true" />
      </button>
    </header>
  );
}
