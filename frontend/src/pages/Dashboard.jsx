import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  FiArrowRight,
  FiBarChart2,
  FiBookOpen,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiFileText,
  FiMenu,
  FiPlay,
  FiTarget,
  FiTrendingUp,
  FiZap,
} from "react-icons/fi";
import { SiFirebase } from "react-icons/si";

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // Mobile navbar scroll effect — kept for later reactivation.
  // const [showMobileHeader, setShowMobileHeader] = useState(true);
  // const lastScrollY = useRef(0);

  const firstName = user?.name?.split(" ")[0] || "there";
  //   useEffect(() => {
  //     const handleScroll = () => {
  //       const currentScrollY = window.scrollY;
  //
  //       if (currentScrollY <= 8) {
  //         setShowMobileHeader(true);
  //       } else if (currentScrollY > lastScrollY.current + 4) {
  //         setShowMobileHeader(false);
  //       } else if (currentScrollY < lastScrollY.current - 4) {
  //         setShowMobileHeader(true);
  //       }
  //
  //       lastScrollY.current = currentScrollY;
  //     };
  //
  //     window.addEventListener("scroll", handleScroll, { passive: true });
  //
  //     return () => window.removeEventListener("scroll", handleScroll);
  //   }, []);

  const stats = [
    {
      label: "Readiness",
      value: "68%",
      change: "+8%",
      icon: FiTarget,
    },
    {
      label: "Skill strength",
      value: "74%",
      change: "+12%",
      icon: FiTrendingUp,
    },
    {
      label: "Interviews",
      value: "12",
      change: "3 this week",
      icon: FiBarChart2,
    },
    {
      label: "Practice",
      value: "36",
      change: "questions",
      icon: FiBookOpen,
    },
  ];

  const skillGaps = [
    {
      name: "System Design",
      progress: 42,
      level: "Needs work",
    },
    {
      name: "Node.js",
      progress: 61,
      level: "Developing",
    },
    {
      name: "React",
      progress: 78,
      level: "Strong",
    },
    {
      name: "MongoDB",
      progress: 84,
      level: "Strong",
    },
  ];

  const recentActivity = [
    {
      title: "Backend interview completed",
      subtitle: "Score: 76% · Technical round",
      time: "Today",
      icon: FiCheckCircle,
    },
    {
      title: "Resume analysed",
      subtitle: "8 improvement areas found",
      time: "Yesterday",
      icon: FiFileText,
    },
    {
      title: "Roadmap updated",
      subtitle: "System Design added to focus areas",
      time: "2 days ago",
      icon: FiZap,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#17191C] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(
                ellipse 90% 70% at 100% 0%,
                rgba(255,255,255,0.055) 0%,
                rgba(255,255,255,0.022) 35%,
                transparent 72%
              ),
              radial-gradient(
                ellipse 80% 65% at 0% 100%,
                rgba(255,255,255,0.028) 0%,
                rgba(255,255,255,0.012) 38%,
                transparent 72%
              ),
              linear-gradient(
                115deg,
                #191b1e 0%,
                #17191c 45%,
                #181a1d 72%,
                #1b1e21 100%
              )
            `,
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.025] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Mobile top bar */}
        <header className="fixed top-3 left-3 right-3 z-40 mx-3 flex h-14 items-center justify-between rounded-full border border-white/[0.12] bg-[#17191C]/55 px-3 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-2xl md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-colors hover:bg-white/[0.10]"
            aria-label="Open navigation"
          >
            <FiMenu size={18} />
          </button>

          <span
            className="text-[17px] tracking-tight text-white"
            style={{ fontFamily: '"Zen Dots", sans-serif' }}
          >
            RIO
          </span>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </header>

        <div className="flex min-h-screen">
          <Sidebar
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            user={user}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <main
            className={`min-w-0 flex-1 transition-[margin-left] duration-300 ease-in-out ${sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"}`}
          >
            <div className="mx-auto w-full max-w-[1500px] px-4 pb-6 pt-[86px] sm:px-6 sm:pt-[86px] lg:px-8 lg:py-8">
              {/* Header */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A1A1AA]">
                    Overview
                  </p>

                  <div className="flex flex-col sm:block">
                    <span className="text-[28px] font-thin tracking-[-0.03em] text-[#A1A1AA] sm:text-[36px] sm:text-white">
                      Good to see you,{" "}
                    </span>

                    <div className="mt-1 mb-2 flex items-center gap-2 sm:mt-0 sm:inline-flex">
                      <span
                        className="whitespace-nowrap  text-white bg-clip-text text-[56px] font-bold leading-none tracking-[-0.045em] text-transparent sm:text-[48px]"
                        style={{ letterSpacing: 0.4 }}
                      >
                        {firstName}
                      </span>

                      {/* wave */}
                    </div>
                  </div>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#A1A1AA]">
                    Your preparation is moving forward. Here&apos;s what needs
                    your attention next.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/interview")}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#17191C] transition-transform duration-200 hover:scale-[1.02] sm:w-auto"
                >
                  Start an interview
                  <FiArrowRight
                    size={16}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </button>
              </motion.section>

              {/* Stats */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="grid grid-cols-2 gap-3 lg:grid-cols-4"
              >
                {stats.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition-colors duration-200 hover:bg-white/[0.065] sm:p-5"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[#D4D4D8]">
                          <Icon size={16} />
                        </div>

                        <span className="text-[10px] font-medium text-[#A1A1AA]">
                          {stat.change}
                        </span>
                      </div>

                      <p className="mt-5 text-[11px] font-medium uppercase tracking-[0.12em] text-[#71717A]">
                        {stat.label}
                      </p>

                      <p className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-white">
                        {stat.value}
                      </p>
                    </div>
                  );
                })}
              </motion.section>

              {/* Main grid */}
              <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
                {/* Next action */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 }}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111315] p-5 sm:p-6"
                >
                  <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-white/[0.025] blur-3xl" />

                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                          Recommended next
                        </p>

                        <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white">
                          Strengthen your System Design
                        </h2>
                      </div>

                      <div className="hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] sm:flex">
                        <FiTarget size={17} />
                      </div>
                    </div>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[#A1A1AA]">
                      Your recent assessment shows that architecture decisions
                      and scalability are currently your biggest improvement
                      areas.
                    </p>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => navigate("/roadmap")}
                        className="group flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#17191C] transition-transform duration-200 hover:scale-[1.02]"
                      >
                        View roadmap
                        <FiArrowRight
                          size={15}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate("/practice")}
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
                      >
                        Practice now
                      </button>
                    </div>

                    <div className="mt-7 border-t border-white/10 pt-5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs text-[#A1A1AA]">
                          Current progress
                        </span>
                        <span className="text-xs font-medium text-white">
                          42%
                        </span>
                      </div>

                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full w-[42%] rounded-full bg-white" />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Profile readiness */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                        Profile
                      </p>
                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                        Profile strength
                      </h2>
                    </div>

                    <span className="text-xl font-semibold">82%</span>
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      ["Resume", "Complete"],
                      ["Skills", "Complete"],
                      ["Target role", "Complete"],
                      ["Preferences", "Pending"],
                    ].map(([label, status]) => (
                      <div
                        key={label}
                        className="flex items-center justify-between border-b border-white/[0.07] pb-3 last:border-0 last:pb-0"
                      >
                        <span className="text-sm text-[#D4D4D8]">{label}</span>

                        <span
                          className={
                            status === "Complete"
                              ? "text-[11px] text-[#A1A1AA]"
                              : "text-[11px] text-white"
                          }
                        >
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
                  >
                    Complete profile
                    <FiChevronRight size={15} />
                  </button>
                </motion.div>
              </section>

              {/* Skill intelligence + preparation */}
              <section className="mt-4 grid gap-4 lg:grid-cols-2">
                {/* Skill gaps */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.2 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6"
                >
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                        Skill intelligence
                      </p>

                      <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                        Where you stand
                      </h2>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/skills")}
                      className="hidden items-center gap-1 text-xs text-[#A1A1AA] transition-colors hover:text-white sm:flex"
                    >
                      View all
                      <FiChevronRight size={14} />
                    </button>
                  </div>

                  <div className="mt-6 space-y-5">
                    {skillGaps.map((skill) => (
                      <div key={skill.name}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-[#E4E4E7]">
                            {skill.name}
                          </span>

                          <span className="text-[11px] text-[#71717A]">
                            {skill.level}
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                          <div
                            className="h-full rounded-full bg-white"
                            style={{ width: `${skill.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/skills")}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.08] sm:hidden"
                  >
                    View skill intelligence
                    <FiChevronRight size={15} />
                  </button>
                </motion.div>

                {/* Preparation journey */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.25 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6"
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                      Your journey
                    </p>

                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                      Preparation progress
                    </h2>
                  </div>

                  <div className="mt-6 space-y-4">
                    {[
                      ["Profile", 100],
                      ["Resume", 100],
                      ["Assessment", 72],
                      ["Roadmap", 48],
                      ["Practice", 35],
                    ].map(([label, progress]) => (
                      <div key={label}>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm text-[#D4D4D8]">
                            {label}
                          </span>
                          <span className="text-xs text-[#71717A]">
                            {progress}%
                          </span>
                        </div>

                        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                          <div
                            className="h-full rounded-full bg-white"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </section>

              {/* Recent activity */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.3 }}
                className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6"
              >
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                      Activity
                    </p>

                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                      Recent activity
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/history")}
                    className="flex items-center gap-1 text-xs text-[#A1A1AA] transition-colors hover:text-white"
                  >
                    View history
                    <FiChevronRight size={14} />
                  </button>
                </div>

                <div className="mt-5 divide-y divide-white/[0.07]">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;

                    return (
                      <div
                        key={activity.title}
                        className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#D4D4D8]">
                          <Icon size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-white">
                            {activity.title}
                          </p>

                          <p className="mt-1 truncate text-xs text-[#71717A]">
                            {activity.subtitle}
                          </p>
                        </div>

                        <span className="shrink-0 text-[11px] text-[#71717A]">
                          {activity.time}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.section>

              {/* Quick actions */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.35 }}
                className="mt-4 grid gap-3 sm:grid-cols-3"
              >
                <button
                  type="button"
                  onClick={() => navigate("/resume")}
                  className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <FiFileText size={18} className="text-[#D4D4D8]" />

                  <p className="mt-4 text-sm font-semibold">Improve resume</p>

                  <p className="mt-1 text-xs leading-5 text-[#71717A]">
                    Review your resume and identify improvement areas.
                  </p>

                  <FiArrowRight
                    size={15}
                    className="mt-4 text-[#71717A] transition-transform group-hover:translate-x-1"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/interview")}
                  className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <FiPlay size={18} className="text-[#D4D4D8]" />

                  <p className="mt-4 text-sm font-semibold">
                    Practice interview
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#71717A]">
                    Start a focused AI interview based on your target role.
                  </p>

                  <FiArrowRight
                    size={15}
                    className="mt-4 text-[#71717A] transition-transform group-hover:translate-x-1"
                  />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/roadmap")}
                  className="group rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <FiClock size={18} className="text-[#D4D4D8]" />

                  <p className="mt-4 text-sm font-semibold">Continue roadmap</p>

                  <p className="mt-1 text-xs leading-5 text-[#71717A]">
                    Pick up your personalized preparation plan where you left
                    off.
                  </p>

                  <FiArrowRight
                    size={15}
                    className="mt-4 text-[#71717A] transition-transform group-hover:translate-x-1"
                  />
                </button>
              </motion.section>

              <footer className="mt-10 flex items-center justify-center border-t border-white/[0.08] py-6 text-[11px] text-[#71717A]">
                <span>RIO</span>
                <span className="mx-2 text-[#52525B]">·</span>
                <span>Career Intelligence</span>
                <span className="mx-2 text-[#52525B]">·</span>
                <SiFirebase size={13} className="mr-1.5 text-[#A1A1AA]" />
                <span>Secured by Firebase</span>
              </footer>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
