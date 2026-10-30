import { motion } from "motion/react";
import { FiX } from "react-icons/fi";

/** Shared, presentation-only frame for RIO's authentication flow. */
export default function AuthModalFrame({ children, onClose, isLoading }) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#090b0d]/85 p-2 backdrop-blur-md sm:p-5 md:p-6"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="flex h-full max-h-full w-full items-center justify-center">
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="RIO account access"
          initial={{ opacity: 0, scale: 0.975, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.985, y: 4 }}
          transition={{
            opacity: { duration: 0.16, ease: "easeOut" },
            scale: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
            y: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
          }}
          className="relative flex h-[min(590px,calc(100dvh-24px))] w-full max-w-[440px] overflow-hidden rounded-[24px] border border-white/12 bg-[#141619] shadow-[0_28px_100px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] sm:rounded-[28px] md:h-[min(680px,calc(100dvh-48px))] md:max-w-[1080px]"
          style={{ willChange: "transform, opacity", transformOrigin: "center center" }}
        >
          <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/[0.08]" />
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close authentication modal"
            className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/20 text-white/65 shadow-sm backdrop-blur-xl transition-colors duration-150 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 disabled:opacity-40 md:right-4 md:top-4"
          >
            <FiX size={18} />
          </button>
          {children}
        </motion.div>
      </div>
    </div>
  );
}
