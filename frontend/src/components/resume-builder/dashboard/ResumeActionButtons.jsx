import { motion } from "motion/react";

const ease = [0.22, 1, 0.36, 1];

const baseClass =
  "group inline-flex min-h-10 min-w-0 items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-semibold transition duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5";

export function PrimaryButton({ children, onClick, className = "", ...props }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease }}
      className={`${baseClass} bg-white text-[#17191C] shadow-[0_10px_30px_rgba(255,255,255,0.06)] hover:shadow-[0_14px_34px_rgba(255,255,255,0.10)] ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export function SecondaryButton({ children, onClick, className = "", ...props }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.18, ease }}
      className={`${baseClass} border border-white/10 bg-white/[0.035] text-[#D4D4D8] hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
