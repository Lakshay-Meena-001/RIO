import { FiArrowRight, FiClock, FiPlus } from "react-icons/fi";

/** Shared mobile-only actions for the resume dashboard. */
export default function ResumeDashboardMobileActionBar({ onOpenHistory, onOpenBuilder }) {
  return (
      <div className="rio-mobile-action-bar fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#111315]/92 px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex w-full max-w-xl items-stretch gap-2">
          <button
            type="button"
            onClick={onOpenHistory}
            className="group flex min-w-0 flex-1 items-center justify-center gap-2 min-h-11 rounded-full border border-white/10 bg-white/[0.035] px-3 py-2.5 text-xs font-semibold text-[#D4D4D8] transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <FiClock size={14} />
            <span>History</span>
          </button>

          <button
            type="button"
            onClick={onOpenBuilder}
            className="group flex min-w-0 flex-1 items-center justify-center gap-2 min-h-11 rounded-full bg-white px-3 py-2.5 text-xs font-semibold text-[#17191C] shadow-[0_-10px_35px_rgba(0,0,0,0.22)] transition duration-200 active:scale-[0.99]"
          >
            <FiPlus size={14} />
            <span>Resume Builder</span>
            <FiArrowRight size={14} />
          </button>
        </div>
      </div>
  );
}
