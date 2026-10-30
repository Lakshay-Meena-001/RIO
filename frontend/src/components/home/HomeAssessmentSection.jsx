import { motion } from "motion/react";
import { FiCheck, FiTarget, FiTrendingUp } from "react-icons/fi";

import { reveal } from "./HomePrimitives.jsx";

export default function HomeAssessmentSection() {
  return (
    <>
        <section className="relative z-10 scroll-mt-24 px-5 py-8 sm:py-20 lg:px-10 lg:py-24">
          <div className="mx-auto grid max-w-[1200px] items-center gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <p className="text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-white/[0.62] lg:text-left">
                From answers to signals
              </p>
              <h2 className="mt-5 text-center text-[clamp(2.5rem,5vw,4.6rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-white lg:text-left">
                Don&apos;t just know
                <span
                  className="mt-2 block font-serif font-normal italic text-[#A1A1AA]"
                  style={{ letterSpacing: "-0.045em" }}
                >
                  your score.
                </span>
              </h2>
              <p className="mx-auto mt-5 max-w-lg text-center text-sm leading-7 text-white/[0.72] sm:text-base lg:mx-0 lg:text-left">
                A score without context is only a number. RIO breaks performance
                down into signals you can act on, then connects those signals to
                what you should practice next.
              </p>

              <div className="mx-auto mt-7 w-fit space-y-3 lg:mx-0">
                {[
                  "Role-aware interview assessment",
                  "Skill-level performance signals",
                  "Actionable next-focus recommendations",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/[0.72]"
                  >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                      <FiCheck size={12} />
                    </span>
                    {item}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7 }}
              className="rounded-[30px] border border-white/10 bg-[#111315]/75 p-5 shadow-[0_35px_100px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-7"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/[0.42]">
                    Interview analysis
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Technical interview
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-white/[0.78]">
                  74 / 100
                </div>
              </div>

              <div className="grid gap-3 py-6 sm:grid-cols-3">
                {[
                  ["Problem solving", "82%"],
                  ["Communication", "76%"],
                  ["Technical depth", "64%"],
                ].map(([name, value]) => (
                  <div
                    key={name}
                    className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4"
                  >
                    <p className="text-[10px] uppercase tracking-[0.12em] text-white/[0.42]">
                      {name}
                    </p>
                    <p className="mt-3 text-xl font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white/[0.72]">
                    Recommended next focus
                  </p>
                  <FiTrendingUp className="text-white/[0.42]" size={15} />
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#17191C]">
                    <FiTarget size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      System design fundamentals
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/[0.62]">
                      Improve architecture reasoning and trade-off explanation.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
    </>
  );
}
