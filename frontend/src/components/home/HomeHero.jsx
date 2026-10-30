import { motion } from "motion/react";
import { FiArrowRight } from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa";
import { skills } from "../../pages/home/homeData.jsx";

export default function HomeHero({ openLogin, scrollToHowItWorks }) {
  return (
    <>
      <section className="relative z-10 flex min-h-0 items-center px-5 pb-12 pt-[88px] lg:min-h-screen lg:px-10 lg:pb-16 lg:pt-[80px]">
        <div className="mx-auto grid w-full max-w-[1440px] items-center gap-12 lg:grid-cols-[1fr_0.72fr] lg:gap-8">
          <div className="mx-auto max-w-[760px] text-center lg:mx-0 lg:text-left">
            <div className="mb-7 inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/[0.68] backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.35)]" />
              AI-powered career intelligence
            </div>

            <h1 className="mx-auto max-w-[780px] text-[clamp(2.85rem,11.5vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.065em] lg:mx-0 lg:text-[clamp(3.2rem,5.5vw,5.8rem)]">
              <span className="block text-white">Turn preparation</span>
              <span
                className="mt-3 block font-serif text-[#A1A1AA]"
                style={{
                  fontStyle: "italic",
                  fontWeight: 400,
                  letterSpacing: "-0.055em",
                }}
              >
                into progress.
              </span>
            </h1>

            <p className="mx-auto mt-7 max-w-[560px] text-[14px] leading-6 text-white/[0.68] sm:text-base lg:mx-0 lg:mt-8 lg:max-w-[610px] lg:leading-7">
              Practice interviews, understand your skill gaps, build real
              technical ability, and follow a measurable path toward the role
              you want.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:mt-9 lg:justify-start">
              <button
                type="button"
                onClick={openLogin}
                className="group flex h-12 items-center gap-3 rounded-full bg-white px-6 text-sm font-medium text-[#17191C] shadow-[0_16px_45px_rgba(255,255,255,0.08)] transition-all duration-200 ease-out hover:-translate-y-0.5"
              >
                Start your journey
                <FaArrowRight
                  size={11}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={scrollToHowItWorks}
                className="group flex h-12 items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-6 text-sm font-semibold text-white/[0.82] backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/[0.065] hover:text-white"
              >
                Explore how it works
                <FiArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </div>

            <div className="mx-auto mt-10 grid w-full max-w-[560px] grid-cols-3 divide-x divide-white/10 border-y border-white/[0.08] py-5 sm:py-6 lg:mx-0 lg:mt-12 lg:py-7">
              <div className="min-w-0 pr-2 sm:pr-6">
                <p className="text-xl font-medium tracking-tight text-white sm:text-2xl">
                  AI
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.08em] text-white/[0.62] sm:text-[10px] sm:tracking-[0.1em]">
                  Guided practice
                </p>
              </div>

              <div className="min-w-0 px-2 sm:px-6">
                <p className="text-xl font-medium tracking-tight text-white sm:text-2xl">
                  1 → 1
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.08em] text-white/[0.62] sm:text-[10px] sm:tracking-[0.1em]">
                  Skill feedback
                </p>
              </div>

              <div className="min-w-0 pl-2 sm:pl-6">
                <p className="text-xl font-medium tracking-tight text-white sm:text-2xl">
                  ∞
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.08em] text-white/[0.62] sm:text-[10px] sm:tracking-[0.1em]">
                  Continuous growth
                </p>
              </div>
            </div>
          </div>

          <div className="relative hidden h-[600px] w-full lg:block">
            <div className="absolute left-[8%] top-[11%] h-[430px] w-[430px] rounded-full border border-white/10 bg-white/[0.018] shadow-[0_0_100px_rgba(255,255,255,0.04)]" />
            <div className="absolute left-[18%] top-[21%] h-[350px] w-[350px] rounded-full bg-white/[0.025] blur-[100px]" />
            <div className="absolute left-[42%] top-[39%] h-[170px] w-[170px] rounded-full bg-white/[0.09] blur-[80px]" />

            <div className="absolute left-[15%] top-[18%] h-[390px] w-[330px] -rotate-6 rounded-[32px] border border-white/10 bg-white/[0.035] shadow-[0_30px_100px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="absolute inset-4 rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-transparent" />
              <div className="absolute inset-x-7 top-7">
                <div className="flex items-center justify-between">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-white/[0.48]">
                    Skill analysis
                  </p>
                  <span className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[8px] text-white/[0.58]">
                    RIO / 01
                  </span>
                </div>
                <div className="mt-4 rounded-2xl border border-white/[0.08] bg-[#111315]/55 p-4">
                  <div className="flex items-end gap-2">
                    {[34, 54, 42, 76, 61].map((height, index) => (
                      <div
                        key={index}
                        className="flex h-[74px] flex-1 items-end"
                      >
                        <div
                          className="w-full rounded-t-sm bg-white"
                          style={{
                            height: `${height}%`,
                            opacity: 0.18 + (height / 100) * 0.58,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-white/[0.08] pt-3 text-[8px] text-white/[0.42]">
                    <span>DSA</span>
                    <span>Design</span>
                    <span>Communication</span>
                  </div>
                </div>
                <div className="mt-4 space-y-2 font-mono text-[9px] text-white/[0.42]">
                  <p>
                    <span className="text-white/[0.72]">signal</span> =
                    assess(skills)
                  </p>
                  <p>
                    <span className="text-white/[0.72]">next_step</span> =
                    find_gaps()
                  </p>
                </div>
              </div>
              <div className="absolute bottom-7 left-7 right-7">
                <div className="h-1 w-12 rounded-full bg-white" />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/[0.62]">
                  Career signal
                </p>
                <p className="mt-2 text-xl font-medium tracking-tight text-white sm:text-2xl">
                  Know where to improve.
                </p>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-[12%] right-[2%] h-[300px] w-[290px] rounded-[30px] border border-white/12 bg-[#111315]/70 p-6 shadow-[0_35px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/[0.78]">
                  Progress map
                </p>
                <span className="flex items-center gap-1.5 text-[8px] uppercase tracking-[0.12em] text-white/[0.42]">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  Skill signals
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {skills.slice(0, 3).map((skill) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex justify-between text-[10px] text-white/[0.58]">
                      <span>{skill.name}</span>
                      <span>{skill.value}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{
                          width: `${skill.value}%`,
                          opacity: skill.value / 100,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 border-t border-white/[0.08] pt-5">
                <p className="text-[10px] uppercase tracking-[0.16em] text-white/[0.42]">
                  Next focus
                </p>
                <p className="mt-2 text-sm font-semibold text-white/[0.82]">
                  Advanced graph patterns
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
