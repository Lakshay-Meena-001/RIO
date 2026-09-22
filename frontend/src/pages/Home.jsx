import { useState } from "react";
import { motion } from "motion/react";
import {
  FiArrowRight,
  FiArrowUpRight,
  FiBarChart2,
  FiCheck,
  FiFileText,
  FiMap,
  FiMic,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";
import { FaArrowRight } from "react-icons/fa6";
import { GiJetPack } from "react-icons/gi";
import { SiFirebase } from "react-icons/si";

import Loginmodel from "../components/Loginmodel";

const RioMark = ({ className = "h-10 w-10", style }) => (
  <GiJetPack className={className} style={style} aria-hidden="true" />
);

const RioLogo = ({ compact = false }) => (
  <div className="flex items-center gap-3">
    <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.035] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      <RioMark
        className="h-5 w-5"
        style={{ animation: "rioRocketFly 2.2s ease-in-out infinite" }}
      />
    </div>

    {!compact && (
      <div className="leading-none">
        <span
          className="block text-[20px] font-bold tracking-[0.22em] text-white"
          style={{ fontFamily: '"Zen Dots", sans-serif' }}
        >
          RIO
        </span>

        <span className="mt-1 block text-[9px] font-medium uppercase tracking-[0.22em] text-white/35">
          Career Intelligence
        </span>
      </div>
    )}
  </div>
);

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: "easeOut" },
  },
};

const agents = [
  {
    icon: <FiFileText />,
    number: "01",
    title: "Resume Agent",
    desc: "Turn your experience into a stronger, role-aligned resume and identify what is holding your profile back.",
  },
  {
    icon: <FiMic />,
    number: "02",
    title: "Interview Agent",
    desc: "Practice realistic HR, technical and coding interviews with questions shaped around your target role.",
  },
  {
    icon: <FiBarChart2 />,
    number: "03",
    title: "Feedback Agent",
    desc: "Understand how you performed, where you lost points, and which skills need attention next.",
  },
  {
    icon: <FiMap />,
    number: "04",
    title: "Roadmap Agent",
    desc: "Convert your gaps into a focused learning path instead of another endless list of resources.",
  },
];

const journey = [
  {
    step: "01",
    title: "Build your profile",
    desc: "Bring your resume, target role, experience and goals into one persistent career profile.",
  },
  {
    step: "02",
    title: "Get assessed",
    desc: "Use role-aware interviews and assessments to understand your current technical and communication level.",
  },
  {
    step: "03",
    title: "See the gaps",
    desc: "RYVO turns performance into clear skill signals so you know what actually needs work.",
  },
  {
    step: "04",
    title: "Follow the path",
    desc: "Get a measurable roadmap, practice deliberately, then reassess and track the change.",
  },
];

const skills = [
  { name: "Data Structures & Algorithms", value: 78 },
  { name: "System Design", value: 62 },
  { name: "Communication", value: 84 },
  { name: "Problem Solving", value: 71 },
];

function SectionHeading({ eyebrow, title, accent, children, center = true }) {
  return (
    <div className={`${center ? "mx-auto text-center" : ""} max-w-3xl`}>
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
        {eyebrow}
      </p>

      <h2 className="text-[clamp(2.4rem,6vw,4.8rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-white">
        {title}
        {accent && (
          <span
            className="mt-2 block font-serif font-normal italic text-[#A1A1AA]"
            style={{ letterSpacing: "-0.045em" }}
          >
            {accent}
          </span>
        )}
      </h2>

      {children && (
        <p className="mt-6 text-sm leading-7 text-white/45 sm:text-base">
          {children}
        </p>
      )}
    </div>
  );
}

function GlassLine({ className = "" }) {
  return (
    <div
      className={`h-px bg-gradient-to-r from-transparent via-white/10 to-transparent ${className}`}
    />
  );
}

const Home = ({ setUser }) => {
  const [showLogin, setShowLogin] = useState(false);

  const openLogin = () => setShowLogin(true);

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@400;500;600;700;800&family=Zen+Dots&display=swap');

        html {
          scroll-behavior: smooth;
        }

        @keyframes rioRocketFly {
          0% {
            opacity: 0;
            transform: translate(-2px, 12px) rotate(-18deg);
          }
          12% {
            opacity: 1;
          }
          68% {
            opacity: 1;
            transform: translate(4px, -2px) rotate(-8deg);
          }
          100% {
            opacity: 0;
            transform: translate(18px, -24px) rotate(8deg);
          }
        }

        @keyframes rioSoftFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .rio-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: linear-gradient(to bottom, transparent, black 16%, black 84%, transparent);
        }
      `}</style>

      <main
        className="relative min-h-screen overflow-x-hidden bg-[#17191C] text-white"
        style={{ fontFamily: '"Assistant", sans-serif' }}
      >
        {/* Shared atmospheric background */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[#17191C]" />

          <div
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 62% 58% at 50% 18%,
                  rgba(255,255,255,0.055) 0%,
                  rgba(255,255,255,0.025) 30%,
                  transparent 68%),
                radial-gradient(circle at 6% 12%,
                  rgba(255,255,255,0.045) 0%,
                  transparent 31%),
                radial-gradient(circle at 95% 17%,
                  rgba(255,255,255,0.035) 0%,
                  transparent 33%),
                radial-gradient(circle at 8% 92%,
                  rgba(255,255,255,0.035) 0%,
                  transparent 34%),
                radial-gradient(circle at 92% 88%,
                  rgba(255,255,255,0.03) 0%,
                  transparent 35%),
                linear-gradient(135deg, #17191C 0%, #24272B 48%, #111315 100%)
              `,
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 24%, rgba(0,0,0,0.05) 55%, rgba(0,0,0,0.52) 100%)",
            }}
          />

          <div className="rio-grid absolute inset-0 opacity-60" />
        </div>

        {/* Desktop navbar */}
        <nav className="fixed left-4 right-4 top-4 z-40 hidden h-[68px] rounded-2xl border border-white/[0.12] bg-[#17191C]/62 shadow-[0_18px_55px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-[32px] backdrop-saturate-150 lg:block xl:left-8 xl:right-8">
          <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-6 lg:px-10">
            <RioLogo />

            <div className="hidden items-center gap-8 text-xs font-medium text-white/45 md:flex">
              <button
                onClick={() =>
                  document
                    .getElementById("product")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="transition-colors hover:text-white"
              >
                Product
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("agents")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="transition-colors hover:text-white"
              >
                Features
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="transition-colors hover:text-white"
              >
                How it works
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("roadmap")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="transition-colors hover:text-white"
              >
                Roadmap
              </button>
            </div>

            <button
              type="button"
              onClick={openLogin}
              className="group flex h-10 items-center gap-3 rounded-xl border border-white/15 bg-white/[0.045] px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/[0.075]"
            >
              Login
              <FaArrowRight
                size={10}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </nav>

        {/* Mobile brand */}
        <div className="relative z-10 flex flex-col items-center pt-7 lg:hidden">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <RioMark
              className="h-6 w-6"
              style={{ animation: "rioRocketFly 2.2s ease-in-out infinite" }}
            />
          </div>

          <div className="mt-3 text-center leading-none">
            <span
              className="block text-[17px] font-bold tracking-[0.22em] text-white"
              style={{ fontFamily: '"Zen Dots", sans-serif' }}
            >
              RIO
            </span>
            <span className="mt-1.5 block text-[8px] font-medium uppercase tracking-[0.24em] text-white/35">
              Career Intelligence
            </span>
          </div>
        </div>

        {/* Hero */}
        <section className="relative z-10 flex min-h-[calc(100svh-100px)] items-center px-5 pb-[190px] pt-8 lg:min-h-screen lg:px-10 lg:pb-16 lg:pt-[104px]">
          <div className="mx-auto grid w-full max-w-[1440px] items-center gap-12 lg:grid-cols-[1fr_0.72fr] lg:gap-8">
            <div className="mx-auto max-w-[760px] text-center lg:mx-0 lg:text-left">
              <div className="mb-7 inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.045] px-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.35)]" />
                AI-powered career intelligence
              </div>

              <h1 className="mx-auto max-w-[780px] text-[clamp(3.1rem,13vw,6.6rem)] font-semibold leading-[0.9] tracking-[-0.065em] lg:mx-0 lg:text-[clamp(3.4rem,6.4vw,6.6rem)]">
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

              <p className="mx-auto mt-7 max-w-[560px] text-[14px] leading-6 text-white/48 sm:text-base lg:mx-0 lg:mt-8 lg:max-w-[610px] lg:leading-7">
                Practice interviews, understand your skill gaps, build real
                technical ability, and follow a measurable path toward the role
                you want.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:mt-9 lg:justify-start">
                <button
                  type="button"
                  onClick={openLogin}
                  className="group flex h-12 items-center gap-3 rounded-xl bg-white px-6 text-sm font-bold text-[#17191C] shadow-[0_16px_45px_rgba(255,255,255,0.08)] transition-transform hover:-translate-y-0.5"
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
                  className="group flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-white/[0.035] px-6 text-sm font-semibold text-white/75 backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/[0.065] hover:text-white"
                >
                  Explore how it works
                  <FiArrowRight
                    size={13}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </button>
              </div>

              <div className="mx-auto mt-10 flex w-full max-w-[600px] justify-center divide-x divide-white/10 border-t border-white/[0.08] pt-6 lg:mx-0 lg:mt-12 lg:justify-start lg:pt-7">
                <div className="pr-5 sm:pr-8">
                  <p className="text-2xl font-semibold tracking-tight text-white">
                    AI
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/30">
                    Guided practice
                  </p>
                </div>

                <div className="px-5 sm:px-8">
                  <p className="text-2xl font-semibold tracking-tight text-white">
                    1 → 1
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/30">
                    Skill feedback
                  </p>
                </div>

                <div className="pl-5 sm:pl-8">
                  <p className="text-2xl font-semibold tracking-tight text-white">
                    ∞
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/30">
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
                <div className="absolute bottom-7 left-7 right-7">
                  <div className="h-1 w-12 rounded-full bg-white" />
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                    Career signal
                  </p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  Progress map
                </p>

                <div className="mt-7 space-y-4">
                  {skills.slice(0, 3).map((skill) => (
                    <div key={skill.name}>
                      <div className="mb-2 flex justify-between text-[10px] text-white/40">
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
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/25">
                    Next focus
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white/75">
                    Advanced graph patterns
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Product introduction */}
        <section
          id="product"
          className="relative z-10 px-5 py-24 sm:py-32 lg:px-10 lg:py-40"
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
                RYVO connects preparation, assessment and progress in one place.
                Instead of collecting disconnected tools, you get a continuous
                picture of what you know, what you need next, and why.
              </SectionHeading>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.7 }}
              className="mt-16 overflow-hidden rounded-[32px] border border-white/10 bg-[#111315]/70 shadow-[0_35px_100px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:mt-20"
            >
              <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4 sm:px-7">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-white/60" />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    RYVO / Career overview
                  </span>
                </div>
                <span className="text-[10px] text-white/20">Live profile</span>
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
                      <p className="mt-1 text-xs text-white/35">
                        Software Engineer
                      </p>
                    </div>
                  </div>

                  <div className="mt-9 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-white/25">
                      Career signal
                    </p>
                    <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">
                      74
                      <span className="ml-1 text-base font-normal text-white/25">
                        / 100
                      </span>
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/35">
                      Your current preparation signal across assessed skills.
                    </p>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-xs text-white/40">
                    <FiTrendingUp size={14} />
                    <span>Progress is measured over time</span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/25">
                        Skill profile
                      </p>
                      <p className="mt-2 text-xl font-semibold text-white">
                        Know what deserves attention.
                      </p>
                    </div>
                    <FiArrowUpRight className="text-white/30" />
                  </div>

                  <div className="mt-8 grid gap-5 sm:grid-cols-2">
                    {skills.map((skill) => (
                      <div
                        key={skill.name}
                        className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
                      >
                        <div className="flex justify-between gap-4 text-xs">
                          <span className="text-white/55">{skill.name}</span>
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

        <GlassLine />

        {/* How it works */}
        <section
          id="how-it-works"
          className="relative z-10 scroll-mt-24 px-5 py-24 sm:py-32 lg:px-10 lg:py-40"
        >
          <div className="mx-auto max-w-[1200px]">
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <SectionHeading
                eyebrow="How RYVO works"
                title="A simple loop."
                accent="Built for real progress."
              >
                Every stage feeds the next one, so your preparation becomes a
                system instead of a collection of disconnected sessions.
              </SectionHeading>
            </motion.div>

            <div className="mt-16 grid gap-px overflow-hidden rounded-[28px] border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {journey.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  className="group bg-[#17191C]/95 p-6 transition-colors hover:bg-white/[0.045] sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-[0.18em] text-white/25">
                      {item.step}
                    </span>
                    <FiArrowUpRight className="text-white/20 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>

                  <h3 className="mt-12 text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/40">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 rounded-[28px] border border-white/[0.08] bg-white/[0.025] p-6 sm:p-8">
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                    The loop
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-semibold text-white/75 sm:text-base">
                    {[
                      "Profile",
                      "Assessment",
                      "Skill gap",
                      "Roadmap",
                      "Practice",
                      "Re-assess",
                    ].map((item, index, arr) => (
                      <span key={item} className="flex items-center gap-2">
                        <span className="rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2">
                          {item}
                        </span>
                        {index < arr.length - 1 && (
                          <FiArrowRight className="text-white/20" size={13} />
                        )}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openLogin}
                  className="group flex h-11 shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-5 text-sm font-bold text-[#17191C] transition-transform hover:-translate-y-0.5"
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

        <GlassLine />

        {/* Agents */}
        <section
          id="agents"
          className="relative z-10 px-5 py-24 sm:py-32 lg:px-10 lg:py-40"
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

            <div className="mt-16 grid gap-4 sm:grid-cols-2">
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
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.045] text-white/80">
                      {agent.icon}
                    </div>
                    <span className="text-[10px] font-semibold tracking-[0.18em] text-white/20">
                      {agent.number}
                    </span>
                  </div>

                  <h3 className="mt-14 text-xl font-semibold tracking-[-0.02em] text-white">
                    {agent.title}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-6 text-white/40">
                    {agent.desc}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
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

        <GlassLine />

        {/* Assessment section */}
        <section className="relative z-10 px-5 py-24 sm:py-32 lg:px-10 lg:py-40">
          <div className="mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <motion.div
              variants={reveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">
                From answers to signals
              </p>
              <h2 className="mt-5 text-[clamp(2.5rem,5vw,4.6rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-white">
                Don&apos;t just know
                <span
                  className="mt-2 block font-serif font-normal italic text-[#A1A1AA]"
                  style={{ letterSpacing: "-0.045em" }}
                >
                  your score.
                </span>
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-7 text-white/45 sm:text-base">
                A score without context is only a number. RYVO breaks
                performance down into signals you can act on, then connects
                those signals to what you should practice next.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Role-aware interview assessment",
                  "Skill-level performance signals",
                  "Actionable next-focus recommendations",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 text-sm text-white/60"
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
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                    Interview analysis
                  </p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    Technical interview
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 text-xs font-semibold text-white/70">
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
                    <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
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
                  <p className="text-xs font-semibold text-white/60">
                    Recommended next focus
                  </p>
                  <FiTrendingUp className="text-white/25" size={15} />
                </div>

                <div className="mt-5 flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#17191C]">
                    <FiTarget size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      System design fundamentals
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/30">
                      Improve architecture reasoning and trade-off explanation.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <GlassLine />

        {/* Roadmap */}
        <section
          id="roadmap"
          className="relative z-10 px-5 py-24 sm:py-32 lg:px-10 lg:py-40"
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
                Your roadmap should respond to your current level, target role
                and assessment history — not just give you another giant
                checklist.
              </SectionHeading>
            </motion.div>

            <div className="mt-16 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.65 }}
                className="rounded-[28px] border border-white/10 bg-[#111315]/70 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                      Current roadmap
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      Software Engineer
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <FiMap size={17} className="text-white/60" />
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {[
                    ["DSA foundations", "Completed", true],
                    ["Advanced graph patterns", "In progress", true],
                    ["System design", "Next", false],
                    ["Mock interview cycle", "Upcoming", false],
                  ].map(([title, state, done], index) => (
                    <div
                      key={title}
                      className="flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
                    >
                      <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs font-semibold text-white/45">
                        {done ? <FiCheck size={14} /> : index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white/75">
                          {title}
                        </p>
                        <p className="mt-1 text-[11px] text-white/25">
                          {state}
                        </p>
                      </div>
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${done ? "bg-white" : "bg-white/20"}`}
                      />
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.65 }}
                className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-6 sm:p-8"
              >
                <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/[0.05] blur-[70px]" />
                <div className="relative">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-white/25">
                    Why it matters
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold leading-tight text-white">
                    Your next step should be obvious.
                  </h3>
                  <p className="mt-4 text-sm leading-6 text-white/40">
                    RYVO turns assessment history into a prioritized learning
                    sequence, so every practice session has a reason behind it.
                  </p>

                  <div className="mt-10 border-t border-white/[0.08] pt-6">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/35">Roadmap progress</span>
                      <span className="font-semibold text-white">68%</span>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/[0.07]">
                      <div className="h-full w-[68%] rounded-full bg-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative z-10 px-5 pb-24 pt-12 sm:pb-32 sm:pt-20 lg:px-10 lg:pb-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-[1200px] overflow-hidden rounded-[34px] border border-white/10 bg-white/[0.045] px-6 py-16 text-center shadow-[0_40px_120px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-10 sm:py-20 lg:px-16 lg:py-24"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06]">
              <RioMark
                className="h-7 w-7"
                style={{ animation: "rioRocketFly 2.2s ease-in-out infinite" }}
              />
            </div>

            <p className="mt-8 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">
              Start building momentum
            </p>

            <h2 className="mx-auto mt-5 max-w-3xl text-[clamp(2.6rem,6vw,5.4rem)] font-semibold leading-[0.95] tracking-[-0.055em] text-white">
              Your preparation can be
              <span
                className="mt-2 block font-serif font-normal italic text-[#A1A1AA]"
                style={{ letterSpacing: "-0.045em" }}
              >
                a system.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/40 sm:text-base">
              Create your profile, take your first assessment and let RYVO turn
              the result into your next move.
            </p>

            <button
              type="button"
              onClick={openLogin}
              className="group mt-9 inline-flex h-12 items-center gap-3 rounded-xl bg-white px-6 text-sm font-bold text-[#17191C] shadow-[0_18px_50px_rgba(255,255,255,0.08)] transition-transform hover:-translate-y-0.5"
            >
              Start your journey
              <FiArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/[0.08] px-5 pb-28 pt-12 lg:px-10 lg:pb-12">
          <div className="mx-auto max-w-[1200px]">
            <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
              <div>
                <RioLogo />
                <p className="mt-5 max-w-sm text-sm leading-6 text-white/30">
                  AI-powered career intelligence for deliberate interview
                  preparation and measurable professional growth.
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                  Product
                </p>
                <div className="mt-4 space-y-3 text-sm text-white/40">
                  <button
                    onClick={() =>
                      document
                        .getElementById("product")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="block transition-colors hover:text-white"
                  >
                    Overview
                  </button>
                  <button
                    onClick={() =>
                      document
                        .getElementById("agents")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="block transition-colors hover:text-white"
                  >
                    AI Agents
                  </button>
                  <button
                    onClick={() =>
                      document
                        .getElementById("roadmap")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                    className="block transition-colors hover:text-white"
                  >
                    Roadmap
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                  Platform
                </p>
                <div className="mt-4 space-y-3 text-sm text-white/40">
                  <button
                    onClick={openLogin}
                    className="block transition-colors hover:text-white"
                  >
                    Get started
                  </button>
                  <span className="block">Interview practice</span>
                  <span className="block">Skill intelligence</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
                  Security
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-white/25">
                  <SiFirebase size={13} />
                  Firebase secured
                </div>
                <p className="mt-4 text-xs leading-5 text-white/20">
                  Built with security and privacy as part of the product
                  foundation.
                </p>
              </div>
            </div>

            <GlassLine className="mt-12" />

            <div className="flex flex-col gap-3 pt-6 text-[10px] uppercase tracking-[0.15em] text-white/20 sm:flex-row sm:items-center sm:justify-between">
              <span>
                © {new Date().getFullYear()} RIO. All rights reserved.
              </span>
              <span>Career Intelligence</span>
            </div>
          </div>
        </footer>

        {/* Mobile authentication bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 lg:hidden">
          <div className="rounded-2xl border border-white/10 bg-[#111315]/82 p-3 shadow-[0_-20px_60px_rgba(0,0,0,0.35)] backdrop-blur-[32px] backdrop-saturate-150">
            <button
              type="button"
              onClick={openLogin}
              className="group flex h-12 w-full items-center justify-center gap-3 rounded-xl bg-white text-sm font-bold text-[#17191C] transition-transform duration-200 hover:scale-[1.01]"
            >
              Login
              <FaArrowRight
                size={11}
                className="transition-transform group-hover:translate-x-1"
              />
            </button>

            <div className="mt-5 flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/18">
              <SiFirebase size={11} />
              Firebase secured
            </div>
          </div>
        </div>

        {showLogin && (
          <Loginmodel onClose={() => setShowLogin(false)} setUser={setUser} />
        )}
      </main>
    </>
  );
};

export default Home;
