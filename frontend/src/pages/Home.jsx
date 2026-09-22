import { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { GiJetPack } from "react-icons/gi";
import { SiFirebase } from "react-icons/si";

import Loginmodel from "../components/Loginmodel";

const RioMark = ({ className = "h-10 w-10" }) => (
  <GiJetPack className={className} aria-hidden="true" />
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

const Home = ({ setUser }) => {
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Michroma&family=Oswald:wght@400;500;600;700&display=swap');

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
      `}</style>

      <main className="relative min-h-screen overflow-x-hidden bg-[#17191C] font-sans text-white">
        {/* One atmospheric background shared visually with the auth modal. */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-[#17191C]" />

          <div
            className="absolute inset-0"
            style={{
              background: `
              radial-gradient(ellipse 62% 58% at 50% 44%,
                rgba(255, 255, 255, 0.055) 0%,
                rgba(255, 255, 255, 0.025) 30%,
                transparent 68%),
              radial-gradient(circle at 6% 12%,
                rgba(255, 255, 255, 0.045) 0%,
                transparent 31%),
              radial-gradient(circle at 95% 17%,
                rgba(255, 255, 255, 0.035) 0%,
                transparent 33%),
              radial-gradient(circle at 8% 92%,
                rgba(255, 255, 255, 0.035) 0%,
                transparent 34%),
              radial-gradient(circle at 92% 88%,
                rgba(255, 255, 255, 0.03) 0%,
                transparent 35%),
              linear-gradient(135deg,
                #17191C 0%,
                #24272B 48%,
                #111315 100%)
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

          <div
            className="absolute inset-0 opacity-[0.022] mix-blend-screen"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.65'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        {/* Navbar */}
        <nav className="fixed left-4 right-4 top-4 z-40 hidden h-[68px] rounded-2xl border border-white/[0.12] bg-[#17191C]/62 shadow-[0_18px_55px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-[32px] backdrop-saturate-150 lg:block xl:left-8 xl:right-8">
          <div className="mx-auto flex h-full w-full max-w-[1440px] items-center justify-between px-6 lg:px-10">
            <RioLogo />

            <div className="hidden items-center gap-8 text-xs font-medium text-white/45 md:flex">
              <button className="transition-colors hover:text-white">
                Product
              </button>
              <button className="transition-colors hover:text-white">
                Features
              </button>
              <button className="transition-colors hover:text-white">
                Roadmap
              </button>
              <button className="transition-colors hover:text-white">
                Resources
              </button>
            </div>

            <div className="flex items-center gap-5">
              {/* <div className="hidden items-center justify-center gap-2 text-[9px] uppercase tracking-[0.14em] text-white/18 xl:flex">
              <SiFirebase size={11} />
              Firebase secured
            </div> */}

              <button
                type="button"
                onClick={() => setShowLogin(true)}
                className="group flex h-10 items-center gap-3 rounded-xl border border-white/15 bg-white/[0.045] px-4 text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition-colors hover:border-white/30 hover:bg-white/[0.075]"
              >
                Login
                <FaArrowRight
                  size={10}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>
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
                  className="mt-3 block font-serif text-white"
                  style={{
                    fontStyle: "italic",
                    fontWeight: 400,
                    color: "#A1A1AA",
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
                  onClick={() => setShowLogin(true)}
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
                  className="flex h-12 items-center rounded-xl border border-white/10 bg-white/[0.035] px-6 text-sm font-semibold text-white/75 backdrop-blur-xl transition-colors hover:border-white/20 hover:bg-white/[0.065] hover:text-white"
                >
                  Explore how it works
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

            {/* Static visual composition. Fixed dimensions prevent layout shifts. */}
            <div className="relative hidden h-[600px] w-full lg:block">
              <div className="absolute left-[8%] top-[11%] h-[430px] w-[430px] rounded-full border border-cyan-300/10 bg-white/[0.018] shadow-[0_0_100px_rgba(34,211,238,0.06)]" />

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

              <div className="absolute bottom-[12%] right-[2%] h-[300px] w-[290px] rounded-[30px] border border-white/12 bg-[#111315]/70 p-6 shadow-[0_35px_90px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                  Progress map
                </p>

                <div className="mt-7 space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-[10px] text-white/40">
                      <span>DSA</span>
                      <span>78%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.07]">
                      <div className="h-full w-[78%] rounded-full bg-white" />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-[10px] text-white/40">
                      <span>System Design</span>
                      <span>62%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.07]">
                      <div className="h-full w-[62%] rounded-full bg-white/70" />
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex justify-between text-[10px] text-white/40">
                      <span>Communication</span>
                      <span>84%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.07]">
                      <div className="h-full w-[84%] rounded-full bg-white/85" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 border-t border-white/[0.08] pt-5">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/25">
                    Next focus
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white/75">
                    Advanced graph patterns
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mobile authentication bar */}
        <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 lg:hidden">
          <div className="rounded-2xl border border-white/10 bg-[#111315]/82 p-3 shadow-[0_-20px_60px_rgba(0,0,0,0.35)] backdrop-blur-[32px] backdrop-saturate-150">
            <button
              type="button"
              onClick={() => setShowLogin(true)}
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
