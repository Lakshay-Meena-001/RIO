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

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const firstName = user?.name?.split(" ")[0] || "there";

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
    <div className="min-h-screen bg-[#17191C] text-white">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/10 bg-[#17191C]/90 px-4 backdrop-blur-xl md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white transition hover:bg-white/[0.09]"
          aria-label="Open navigation"
        >
          <FiMenu size={19} />
        </button>

        <span
          className="text-[17px] tracking-tight text-white"
          style={{ fontFamily: '"Zen Dots", sans-serif' }}
        >
          RYVO
        </span>

        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold">
          {firstName.charAt(0).toUpperCase()}
        </div>
      </header>

      <div className="flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          user={user}
        />

        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
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

                <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-white sm:text-[36px]">
                  Good to see you, {firstName}.
                </h1>

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
                    Your recent assessment shows that architecture decisions and
                    scalability are currently your biggest improvement areas.
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
                        <span className="text-sm text-[#D4D4D8]">{label}</span>
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

                <p className="mt-4 text-sm font-semibold">Practice interview</p>

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
                  Pick up your personalized preparation plan where you left off.
                </p>

                <FiArrowRight
                  size={15}
                  className="mt-4 text-[#71717A] transition-transform group-hover:translate-x-1"
                />
              </button>
            </motion.section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
