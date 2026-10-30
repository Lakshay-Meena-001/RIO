import { motion } from "framer-motion";
import Surface from "../ui/Surface";

const ease = [0.22, 1, 0.36, 1];

export default function BillingMetricCard({ label, value, detail, Icon, loading, index = 0, reduceMotion = false }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.055, ease }}
    >
      <Surface className="h-full p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-[#777A82]">{label}</p>
          <Icon size={17} className="shrink-0 text-[#92949B]" />
        </div>
        <p className="mt-5 break-words text-[30px] font-semibold tracking-[-0.05em] sm:text-[36px]">
          {loading ? <span className="inline-block h-9 w-24 animate-pulse rounded-lg bg-white/[0.08]" /> : value}
        </p>
        <p className="mt-2 text-[11px] leading-5 text-[#71747C]">{detail}</p>
      </Surface>
    </motion.div>
  );
}
