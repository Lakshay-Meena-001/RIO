import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

const ease = [0.22, 1, 0.36, 1];

function Shimmer({ className = "" }) {
  return <span aria-hidden="true" className={`rio-shimmer block rounded-md ${className}`} />;
}

export default function DashboardStatCard({ stat, loading, onClick }) {
  const Icon = stat.icon;
  return (
    <motion.button
      type="button"
      onClick={onClick}
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.42, ease } },
      }}
      whileHover={{ y: -3, transition: { duration: 0.18, ease } }}
      whileTap={{ scale: 0.99 }}
      className="group relative flex min-h-[142px] min-w-0 flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.09] bg-gradient-to-br from-white/[0.045] to-[#111315]/70 p-4 text-left shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-[border-color,box-shadow] duration-200 hover:border-white/[0.16] hover:shadow-[0_12px_34px_rgba(0,0,0,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 sm:min-h-[158px] sm:rounded-[20px] sm:p-5 motion-reduce:transform-none"
    >
      <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/[0.045] blur-2xl transition-colors duration-300 group-hover:bg-white/[0.09]" />
      <span className="relative flex items-start justify-between gap-3">
        <span className="max-w-[calc(100%-2.5rem)] text-[9px] font-semibold uppercase leading-4 tracking-[0.15em] text-[#92949B] sm:text-[10px] sm:tracking-[0.17em]">{stat.label}</span>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.045] text-white/90 transition-colors duration-200 group-hover:border-white/[0.16] group-hover:bg-white/[0.08] group-hover:text-white"><Icon size={16} /></span>
      </span>
      <span className="relative mt-4 break-words text-[clamp(1.25rem,2vw,1.7rem)] font-medium leading-tight tracking-[-0.04em] text-white sm:mt-5">
        {loading ? <Shimmer className="h-7 w-24 max-w-full" /> : stat.value}
      </span>
      <span className="relative mt-2 flex items-center justify-between gap-2">
        <span className="text-[11px] text-[#92949B]">{loading ? <Shimmer className="h-3 w-28 max-w-full" /> : stat.note}</span>
        <FiArrowRight size={14} className="shrink-0 text-[#92949B] transition-transform duration-200 group-hover:translate-x-1 group-hover:text-white" />
      </span>
    </motion.button>
  );
}
