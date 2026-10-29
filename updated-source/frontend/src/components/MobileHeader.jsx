import { useNavigate } from "react-router-dom";
import { FiMenu } from "react-icons/fi";

/**
 * Shared mobile header for all authenticated RIO dashboards.
 *
 * Props:
 * - onOpenNavigation: opens the existing mobile sidebar
 * - user: current logged-in user
 */
export default function MobileHeader({ onOpenNavigation, user }) {
  const navigate = useNavigate();

  const displayName =
    [user?.firstName, user?.name, user?.displayName]
      .find((value) => typeof value === "string" && value.trim())
      ?.trim()
      .split(/\s+/)[0] || "User";

  const initial = displayName.charAt(0).toUpperCase() || "U";

  return (
    <header className="rio-mobile-header fixed left-3 right-3 top-3 z-40 flex h-14 items-center justify-between rounded-full border border-white/[0.10] bg-[#17191C]/85 px-3 text-white shadow-[0_16px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl md:hidden">
      {/* Left: open the existing mobile navigation */}
      <button
        type="button"
        onClick={onOpenNavigation}
        aria-label="Open navigation"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-white transition hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        <FiMenu size={18} aria-hidden="true" />
      </button>

      {/* Center: RIO branding */}
      <div
        className="flex min-w-0 flex-col items-center justify-center leading-none"
        aria-label="RIO Career Intelligence"
      >
        <span
          className="text-[16px] tracking-tight text-white"
          style={{ fontFamily: '"Zen Dots", sans-serif' }}
        >
          RIO
        </span>

        <span className="mt-1 text-[7px] font-medium tracking-[0.12em] text-white/55">
          CAREER INTELLIGENCE
        </span>
      </div>

      {/* Right: navigate to the user profile */}
      <button
        type="button"
        onClick={() => navigate("/profile")}
        aria-label={`Open profile for ${displayName}`}
        title="Open profile"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-sm font-semibold text-white transition hover:bg-white/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
      >
        {initial}
      </button>
    </header>
  );
}
