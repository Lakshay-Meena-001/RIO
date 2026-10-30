import { motion } from "framer-motion";
import Surface from "../ui/Surface";

export default function ProgressStatCard({ stat, loading, index = 0 }) {
  const Icon = stat.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Surface className="h-full">
        <div className="p-3 sm:p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] leading-4 text-[#92949B] sm:text-xs">{stat.label}</span>
            <span className="rounded-full border border-white/10 bg-white/[0.055] p-2 text-[#D4D4D8]"><Icon size={16} /></span>
          </div>
          <div className="mt-4 text-2xl font-semibold tracking-[-.045em] sm:mt-5 sm:text-3xl">{loading ? "—" : stat.value}</div>
          <p className="mt-2 text-[10px] leading-4 text-[#777A82] sm:text-[11px]">{loading ? "Loading saved data…" : stat.note}</p>
        </div>
      </Surface>
    </motion.div>
  );
}
