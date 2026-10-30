import { motion, useReducedMotion } from "framer-motion";
import { FiArrowRight, FiFileText, FiPlay } from "react-icons/fi";

export default function DashboardMobileActionBar({ onStartInterview, onOpenResume }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.nav
      aria-label="Dashboard quick actions"
      initial={reduceMotion ? false : { y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: reduceMotion ? 0 : 0.32, delay: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
      className="rio-mobile-action-bar fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-[#111315]/95 px-3 pt-2 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.18)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex w-full max-w-xl items-stretch gap-2 sm:gap-3">
        <button type="button" onClick={onStartInterview} className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.045] px-2.5 py-2.5 text-[11px] font-semibold leading-tight text-[#E4E4E7] transition-colors hover:bg-white/[0.08] active:scale-[0.98] sm:gap-2 sm:px-4 sm:text-xs">
          <FiPlay size={13} className="shrink-0" /> <span className="truncate">Start interview</span>
        </button>
        <button type="button" onClick={onOpenResume} className="flex min-h-11 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-full bg-white px-2.5 py-2.5 text-[11px] font-semibold leading-tight text-[#17191C] transition-colors hover:bg-white/90 active:scale-[0.98] sm:gap-2 sm:px-4 sm:text-xs">
          <FiFileText size={14} className="shrink-0" /> <span className="truncate">Resume Builder</span> <FiArrowRight size={13} className="shrink-0" />
        </button>
      </div>
    </motion.nav>
  );
}
