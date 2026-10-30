import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1];

export default function DashboardReveal({ children, delay = 0, reduceMotion = false, className = "" }) {
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={reduceMotion ? { duration: 0 } : { duration: 0.46, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
