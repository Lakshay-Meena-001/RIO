import { motion } from "motion/react";
import { FiArrowUpRight, FiTarget, FiTrendingUp } from "react-icons/fi";
import { skills } from "../../pages/home/homeData.jsx";
import { SectionHeading, reveal } from "./HomePrimitives.jsx";

export default function HomeProductSection() {
  return (
    <>
      <section
        id="product"
        className="relative z-10 scroll-mt-24 px-5 py-8 sm:py-20 lg:px-10 lg:py-24"
      >
        <div className="mx-auto max-w-[1200px]">
          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <SectionHeading
              eyebrow="One career system"
              title="Everything you need to"
              accent="move forward."
            >
              RIO connects preparation, assessment and progress in one place.
              Instead of collecting disconnected tools, you get a continuous
              picture of what you know, what you need next, and why.
            </SectionHeading>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.7 }}
            className="mt-10 overflow-hidden rounded-[32px] border border-white/10 bg-[#111315]/70 shadow-[0_35px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:mt-14"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 sm:px-7">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-white/60" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/[0.52]">
                  RIO / Career overview
                </span>
              </div>
              <span className="text-[10px] text-white/[0.38]">
                Live profile
              </span>
            </div>

            <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
              <div className="border-b border-white/[0.08] p-6 sm:p-8 lg:border-b-0 lg:border-r">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-white">
                    <FiTarget size={19} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Target role
                    </p>
                    <p className="mt-1 text-xs text-white/[0.52]">
                      Software Engineer
                    </p>
                  </div>
                </div>

                <div className="mt-9 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/[0.42]">
                    Career signal
                  </p>
                  <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                    74
                    <span className="ml-1 text-base font-normal text-white/[0.42]">
                      / 100
                    </span>
                  </p>
                  <p className="mt-2 text-xs leading-5 text-white/[0.52]">
                    Your current preparation signal across assessed skills.
                  </p>
                </div>

                <div className="mt-5 flex items-center gap-2 text-xs text-white/[0.58]">
                  <FiTrendingUp size={14} />
                  <span>Progress is measured over time</span>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/[0.42]">
                      Skill profile
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      Know what deserves attention.
                    </p>
                  </div>
                  <FiArrowUpRight className="text-white/[0.62]" />
                </div>

                <div className="mt-8 grid gap-5 sm:grid-cols-2">
                  {skills.map((skill) => (
                    <div
                      key={skill.name}
                      className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
                    >
                      <div className="flex justify-between gap-4 text-xs">
                        <span className="text-white/[0.68]">{skill.name}</span>
                        <span className="font-semibold text-white">
                          {skill.value}%
                        </span>
                      </div>
                      <div className="mt-4 h-1.5 rounded-full bg-white/[0.07]">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, ease: "easeOut" }}
                          className="h-full rounded-full bg-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
