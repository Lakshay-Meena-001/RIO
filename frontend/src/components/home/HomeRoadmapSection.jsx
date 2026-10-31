import { motion } from "motion/react";
import { FiCheck, FiMap } from "react-icons/fi";
import { SectionHeading } from "./HomePrimitives.jsx";
import { reveal } from "./homeMotion.js";

export default function HomeRoadmapSection() {
  return (
    <>
      <section
        id="roadmap"
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
              eyebrow="Personalized roadmap"
              title="Less random learning."
              accent="More intentional practice."
            >
              Your roadmap should respond to your current level, target role and
              assessment history — not just give you another giant checklist.
            </SectionHeading>
          </motion.div>

          <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            {/* Left card: existing neutral RIO surface, with a little useful detail */}
            <motion.div
              initial={{ opacity: 0, x: -18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55 }}
              className="flex flex-col rounded-[28px] border border-white/10 bg-[#111315]/70 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/[0.42]">
                    Current roadmap
                  </p>
                  <p className="mt-2 text-xl font-semibold text-white">
                    Software Engineer
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                  <FiMap size={17} className="text-white/[0.72]" />
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                {[
                  ["DSA foundations", "Completed", true],
                  ["Advanced graph patterns", "In progress", true],
                  ["System design", "Next", false],
                  ["Mock interview cycle", "Upcoming", false],
                ].map(([title, state, done], index) => (
                  <div
                    key={title}
                    className={`flex items-center gap-3 rounded-2xl border p-3.5 sm:p-4 ${state === "In progress" ? "border-white/[0.15] bg-white/[0.045]" : "border-white/[0.07] bg-white/[0.02]"}`}
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs font-semibold text-white/[0.62]">
                      {done && state === "Completed" ? (
                        <FiCheck size={14} />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white/[0.84]">
                        {title}
                      </p>
                      <p className="mt-1 text-[11px] text-white/[0.42]">
                        {state}
                      </p>
                    </div>
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${state === "Completed" ? "bg-white/80" : state === "In progress" ? "bg-white/65" : "bg-white/20"}`}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-5 border-t border-white/[0.08] pt-4">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-white/[0.48]">Current focus</span>
                  <span className="text-right font-medium text-white/[0.78]">
                    Advanced graph patterns
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Concept review", "Timed practice", "Dry runs"].map(
                    (label) => (
                      <span
                        key={label}
                        className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-[10px] text-white/[0.52]"
                      >
                        {label}
                      </span>
                    ),
                  )}
                </div>
              </div>
            </motion.div>

            {/* Right card: same charcoal / white glass treatment, modestly filled */}
            <motion.div
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.55 }}
              className="relative flex flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-6 sm:p-8"
            >
              <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/[0.035] blur-[70px]" />
              <div className="relative flex flex-1 flex-col">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/[0.42]">
                  Why it matters
                </p>
                <h3 className="mt-4 text-2xl font-semibold leading-tight text-white">
                  Your next step should be obvious.
                </h3>
                <p className="mt-4 text-sm leading-6 text-white/[0.58]">
                  RIO turns assessment history into a prioritized learning
                  sequence, so every practice session has a reason behind it.
                </p>
                <div className="mt-7 border-t border-white/[0.08] pt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/[0.52]">Roadmap progress</span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: 0.2 }}
                      className="font-semibold text-white"
                    >
                      68%
                    </motion.span>
                  </div>
                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]"
                    role="img"
                    aria-label="Roadmap progress: 68 percent"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "68%" }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.9,
                        ease: "easeOut",
                        delay: 0.1,
                      }}
                      className="h-full rounded-full bg-white"
                    />
                  </div>
                </div>

                <div className="mt-7 border-t border-white/[0.08] pt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/[0.52]">
                      Interview progress
                    </span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: 0.2 }}
                      className="font-semibold text-white"
                    >
                      94%
                    </motion.span>
                  </div>
                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]"
                    role="img"
                    aria-label="Roadmap progress: 68 percent"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "94%" }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.9,
                        ease: "easeOut",
                        delay: 0.1,
                      }}
                      className="h-full rounded-full bg-white"
                    />
                  </div>
                </div>
                <div className="mt-7 border-t border-white/[0.08] pt-5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/[0.52]">
                      Resume Builder progress
                    </span>
                    <motion.span
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: 0.2 }}
                      className="font-semibold text-white"
                    >
                      82%
                    </motion.span>
                  </div>
                  <div
                    className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.07]"
                    role="img"
                    aria-label="Roadmap progress: 68 percent"
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "82%" }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.9,
                        ease: "easeOut",
                        delay: 0.1,
                      }}
                      className="h-full rounded-full bg-white"
                    />
                  </div>
                </div>
                <p className="mt-auto pt-4 text-[10px] text-white/[0.32]">
                  Illustrative sample data · not live account progress
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
