import { motion } from "motion/react";
import Surface from "../../ui/Surface";

const ease = [0.22, 1, 0.36, 1];

/** Responsive overview metrics used by the resume dashboard. */
export default function ResumeDashboardStats({ stats, loading, reduceMotion }) {
  return (
            <section aria-label="Resume overview" className="mb-9">
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;

                  return (
                    <motion.div
                      key={stat.label}
                      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: index * 0.055,
                        ease,
                      }}
                      whileHover={reduceMotion ? undefined : { y: -3 }}
                    >
                      <Surface className="h-full p-4 sm:p-5">
                        {/* Title and icon unchanged */}
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#777A82]">
                            {stat.label}
                          </p>
                          <Icon className="shrink-0 text-[#777A82]" size={16} />
                        </div>

                        {/* Number centered */}
                        <p className="mt-4 text-center text-[28px] font-semibold tracking-[-0.05em] sm:text-[34px]">
                          {loading ? (
                            <span className="inline-block h-8 w-12 animate-pulse rounded-lg bg-white/[0.08]" />
                          ) : (
                            stat.value
                          )}
                        </p>

                        {/* Supporting text centered */}
                        <p className="mt-1 text-center text-[10px] leading-4 text-[#71747C]">
                          {stat.detail}
                        </p>
                      </Surface>
                    </motion.div>
                  );
                })}
              </div>
            </section>

  );
}
