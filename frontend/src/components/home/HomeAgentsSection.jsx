import { motion } from "motion/react";
import { FiArrowRight } from "react-icons/fi";
import { agents } from "../../pages/home/homeData.jsx";
import { SectionHeading } from "./HomePrimitives.jsx";
import { reveal } from "./homeMotion.js";

export default function HomeAgentsSection() {
  return (
    <>
        <section
          id="agents"
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
                eyebrow="AI-powered agents"
                title="Specialized intelligence"
                accent="for every stage."
              >
                Each agent has a focused job. Together they turn your career
                preparation into one connected workflow.
              </SectionHeading>
            </motion.div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.number}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.6, delay: index * 0.07 }}
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_20px_55px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-colors hover:border-white/20 hover:bg-white/[0.055] sm:p-8"
                >
                  <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-white/[0.80]">
                      {agent.icon}
                    </div>
                    <span className="text-[10px] font-semibold tracking-[0.18em] text-white/[0.38]">
                      {agent.number}
                    </span>
                  </div>

                  <h3 className="mt-10 text-xl font-semibold tracking-[-0.02em] text-white sm:mt-14">
                    {agent.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/[0.58]">
                    {agent.desc}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/[0.42]">
                    Explore agent
                    <FiArrowRight
                      size={11}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
    </>
  );
}
