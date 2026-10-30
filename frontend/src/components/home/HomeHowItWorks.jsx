import { motion } from "motion/react";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";
import { journey } from "../../pages/home/homeData.jsx";
import { SectionHeading, reveal } from "./HomePrimitives.jsx";

export default function HomeHowItWorks({ openLogin }) {
  return (
    <>
        <section
          id="how-it-works"
          className="relative z-10 scroll-mt-24 px-5 py-10 sm:py-24 lg:px-10 lg:py-24"
        >
          <div className="mx-auto max-w-[1200px]">
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <SectionHeading
                eyebrow="How RIO works"
                title="A simple loop."
                accent="Built for real progress."
              >
                Every stage feeds the next one, so your preparation becomes a
                system instead of a collection of disconnected sessions.
              </SectionHeading>
            </motion.div>

            <div className="mt-10 grid gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {journey.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  className="group bg-[#17191C]/95 p-5 transition-colors hover:bg-white/[0.045] sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-[0.18em] text-white/[0.42]">
                      {item.step}
                    </span>
                    <FiArrowUpRight className="text-white/[0.38] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>

                  <h3 className="mt-9 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/[0.58]">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/[0.42]">
                    The loop
                  </p>
                  <div className="mt-4 flex w-full flex-col items-center justify-center gap-2 text-center text-sm font-medium text-white/[0.80] sm:text-base lg:flex-row lg:flex-wrap lg:items-center">
                    {[
                      "Profile",
                      "Assessment",
                      "Skill gap",
                      "Roadmap",
                      "Practice",
                      "Re-assess",
                    ].map((item, index, arr) => (
                      <span
                        key={item}
                        className="flex w-full flex-col items-center gap-2 lg:w-auto lg:flex-row"
                      >
                        <span className="w-full max-w-[245px] rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-center">
                          {item}
                        </span>
                        {index < arr.length - 1 && (
                          <FaArrowRight
                            className="shrink-0 rotate-90 text-white/[0.68] lg:rotate-0"
                            size={11}
                          />
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openLogin}
                  className="group mx-auto flex h-11 w-full max-w-[245px] shrink-0 items-center justify-center gap-3 rounded-full bg-white px-5 text-sm font-bold text-[#17191C] transition-all duration-200 ease-out hover:-translate-y-0.5 lg:w-auto"
                >
                  Start with your profile
                  <FiArrowRight
                    size={13}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>
            </div>
          </div>
        </section>
    </>
  );
}
