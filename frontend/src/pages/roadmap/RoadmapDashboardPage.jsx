import { useCallback, useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";

import { getRoadmaps } from "../../api/roadmap.api.js";

import Sidebar from "../../components/SideBar";

import {
  FiArrowRight,
  FiClock,
  FiMap,
  FiPlay,
  FiTrendingUp,
  FiCheckCircle,
} from "react-icons/fi";

const Surface = ({ children, className = "" }) => (
  <div
    className={`relative overflow-hidden rounded-[22px] border border-white/[0.11] bg-[#111315] shadow-[0_22px_60px_rgba(0,0,0,0.18)] ${className}`}
  >
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 70% 95% at 100% 0%, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 38%, transparent 70%), linear-gradient(135deg, rgba(255,255,255,0.025), transparent 48%)",
      }}
    />

    <div className="relative">{children}</div>
  </div>
);

const RoadmapDashboardPage = ({
  user,

  setUser,

  onBuildRoadmap,

  onContinueRoadmap,

  onOpenRoadmap,

  onViewHistory,
}) => {
  const navigate = useNavigate();

  const [roadmaps, setRoadmaps] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [mobileOpen, setMobileOpen] = useState(false);

  const fetchRoadmaps = useCallback(async () => {
    setLoading(true);

    setError("");

    try {
      const response = await getRoadmaps({ page: 1, limit: 20 });

      const payload = response?.data ?? response;

      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.roadmaps)
          ? payload.roadmaps
          : Array.isArray(payload?.items)
            ? payload.items
            : Array.isArray(payload?.results)
              ? payload.results
              : Array.isArray(payload?.data?.roadmaps)
                ? payload.data.roadmaps
                : [];

      setRoadmaps(list);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Could not load roadmaps. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRoadmaps();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchRoadmaps]);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const firstName = user?.name?.split(" ")?.[0] || "there";

  const currentRoadmap =
    roadmaps.find((item) => item.status !== "completed") || roadmaps[0] || null;

  const stats = useMemo(() => {
    const completed = roadmaps.filter(
      (item) => item.status === "completed",
    ).length;

    const inProgress = roadmaps.filter((item) =>
      ["in-progress", "in_progress", "active"].includes(item.status),
    ).length;

    const progressValues = roadmaps.map((item) => {
      const total = Number(item.totalSteps) || Number(item.steps?.length) || 0;

      const done = Number(item.completedSteps) || 0;

      return total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0;
    });

    const average = progressValues.length
      ? Math.round(
          progressValues.reduce((sum, value) => sum + value, 0) /
            progressValues.length,
        )
      : 0;

    return { total: roadmaps.length, completed, inProgress, average };
  }, [roadmaps]);

  const progressOf = (roadmap) => {
    const total =
      Number(roadmap?.totalSteps) || Number(roadmap?.steps?.length) || 0;

    const done = Number(roadmap?.completedSteps) || 0;

    return total > 0
      ? Math.min(100, Math.max(0, Math.round((done / total) * 100)))
      : 0;
  };

  const titleOf = (roadmap) =>
    roadmap?.title || roadmap?.name || roadmap?.role || "Untitled roadmap";

  const dateOf = (value) => {
    if (!value) return "Recently updated";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "Recently updated"
      : `Updated ${date.toLocaleDateString("en-IN", {
          day: "numeric",

          month: "short",

          year: "numeric",
        })}`;
  };

  const build = () => {
    if (onBuildRoadmap) return onBuildRoadmap();

    navigate("/roadmap/new");
  };

  const history = () => {
    if (onViewHistory) return onViewHistory();

    navigate("/roadmap/history");
  };

  const open = (roadmap) => {
    if (onOpenRoadmap) return onOpenRoadmap(roadmap);

    const id = roadmap?._id || roadmap?.id || roadmap?.roadmapId;

    if (id) navigate(`/roadmap/${id}`);
    else navigate("/roadmap");
  };

  const continueRoadmap = () => {
    if (onContinueRoadmap) return onContinueRoadmap(currentRoadmap);

    if (currentRoadmap) return open(currentRoadmap);

    return build();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#17191C] text-white">
      {/***** Same background treatment as MockIntervie&#x77;**\\.**&#x6A;sx. *****/}

      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0"
          style={{
            background: `

              radial-gradient(ellipse 70% 55% at 88% 4%, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 42%, transparent 72%),

              radial-gradient(ellipse 65% 55% at 0% 92%, rgba(255,255,255,0.035) 0%, transparent 70%),

              linear-gradient(135deg, #191b1e 0%, #17191c 48%, #141619 100%)

            `,
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.018] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10">
        <header className="fixed left-3 right-3 top-3 z-40 flex h-14 items-center justify-between rounded-2xl border border-white/[0.1] bg-[#17191C]/70 px-3 shadow-[0_16px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-white transition duration-200 hover:bg-white/[0.1]"
            aria-label="Open navigation"
          >
            <span className="text-lg">☰</span>
          </button>

          <span
            className="text-[16px] tracking-tight text-white"
            style={{ fontFamily: '"Zen Dots", sans-serif' }}
          >
            RIO
          </span>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-xs font-semibold">
            {firstName.charAt(0).toUpperCase()}
          </div>
        </header>

        <div className="flex min-h-screen">
          <Sidebar
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            user={user}
            sidebarOpen={sidebarOpen}
            setUser={setUser}
            setSidebarOpen={setSidebarOpen}
          />

          <main
            className={`min-w-0 flex-1 transition-[margin-left] duration-300 ease-out ${sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"}`}
          >
            <div className="mx-auto w-full max-w-[1480px] px-5 pb-24 pt-[88px] sm:px-7 lg:px-10 lg:pb-12 lg:pt-10">
              {/***** Editorial hero: typography, spacing and actions copied from Mock Interview. *****/}

              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="mb-10 flex flex-col gap-7 lg:mb-12 lg:flex-row lg:items-end lg:justify-between"
              >
                <div className="max-w-3xl">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-white/80" />

                    <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8F9198]">
                      Roadmap learning
                    </p>
                  </div>

                  <h1 className="max-w-2xl text-[38px] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-[50px] lg:text-[58px]">
                    Build a career path
                    <span
                      className="mt-2 block font-serif text-[#A1A1AA]"
                      style={{
                        fontStyle: "italic",

                        fontWeight: 400,

                        letterSpacing: "-0.055em",
                      }}
                    >
                      that moves you forward.
                    </span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-[14px] leading-7 text-[#92949B] sm:text-[15px]">
                    Hi {firstName}. Find your next step, keep your learning
                    focused, and build momentum without the overload.
                  </p>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <button
                    type="button"
                    onClick={history}
                    className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-[#D4D4D8] transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white sm:px-5"
                  >
                    <FiClock size={14} />
                    View history
                  </button>

                  <button
                    type="button"
                    onClick={build}
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] shadow-[0_10px_30px_rgba(255,255,255,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(255,255,255,0.12)] sm:px-5"
                  >
                    <FiPlay size={14} />
                    Build roadmap
                    <FiArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              </motion.section>

              {/* Current roadmap / empty state — same surface and spacing as active interview. */}

              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,

                  delay: 0.05,

                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mb-12"
              >
                <div className="mb-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                    Continue learning
                  </p>

                  <h2 className="mt-2 text-[25px] font-semibold tracking-[-0.04em] text-white sm:text-[29px]">
                    Pick up where you left off.
                  </h2>
                </div>

                {loading ? (
                  <Surface className="p-6 sm:p-7">
                    <div className="h-3 w-28 animate-pulse rounded bg-white/[0.07]" />

                    <div className="mt-5 h-7 w-2/3 animate-pulse rounded bg-white/[0.07]" />

                    <div className="mt-4 h-3 w-full animate-pulse rounded bg-white/[0.05]" />

                    <div className="mt-7 h-1.5 w-full animate-pulse rounded-full bg-white/[0.07]" />
                  </Surface>
                ) : error ? (
                  <Surface className="p-6 sm:p-8">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                      Roadmap unavailable
                    </p>

                    <h3 className="mt-3 text-xl font-semibold text-white">
                      We couldn’t load your roadmaps.
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-[#92949B]">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={fetchRoadmaps}
                      className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-white hover:text-[#D4D4D8]"
                    >
                      Try again <FiArrowRight size={14} />
                    </button>
                  </Surface>
                ) : currentRoadmap ? (
                  <Surface className="group transition duration-300 hover:border-white/[0.2]">
                    <div className="p-5 sm:p-7">
                      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-white" />

                            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">
                              Guided roadmap
                            </p>
                          </div>

                          <h2 className="mt-4 text-[27px] font-semibold tracking-[-0.04em] text-white sm:text-[32px]">
                            {titleOf(currentRoadmap)}
                          </h2>

                          <p className="mt-2 max-w-xl text-sm leading-6 text-[#8F9198]">
                            {currentRoadmap.description ||
                              "Follow your learning path step by step and keep building momentum."}
                          </p>
                        </div>

                        <div className="flex items-end justify-between gap-8 lg:min-w-[310px] lg:justify-end">
                          <div>
                            <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#666870]">
                              Overall progress
                            </p>

                            <p className="mt-1 text-[25px] font-semibold tracking-[-0.04em] text-white">
                              {progressOf(currentRoadmap)}%
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={continueRoadmap}
                            className="group/button inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition duration-200 hover:-translate-y-0.5 sm:px-5"
                          >
                            Continue{" "}
                            <FiArrowRight
                              size={14}
                              className="transition-transform group-hover/button:translate-x-0.5"
                            />
                          </button>
                        </div>
                      </div>

                      <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progressOf(currentRoadmap)}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className="h-full rounded-full bg-white"
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/[0.08] pt-4 text-[11px] text-[#71747C]">
                        <span>
                          {currentRoadmap.role ||
                            currentRoadmap.category ||
                            "Learning path"}
                        </span>

                        <span className="text-white/20">•</span>

                        <span>
                          {Number(currentRoadmap.completedSteps) || 0} of{" "}
                          {Number(currentRoadmap.totalSteps) ||
                            Number(currentRoadmap.steps?.length) ||
                            0}{" "}
                          steps
                        </span>

                        <span className="text-white/20">•</span>

                        <span>
                          {dateOf(
                            currentRoadmap.updatedAt ||
                              currentRoadmap.createdAt,
                          )}
                        </span>
                      </div>
                    </div>
                  </Surface>
                ) : (
                  <Surface className="px-5 py-6 sm:px-6">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                          Current roadmap
                        </p>

                        <p className="mt-2 text-lg font-medium tracking-[-0.02em] text-[#D4D4D8]">
                          No roadmap is waiting for you.
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#71747C]">
                          Build a focused path whenever you’re ready.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={build}
                        className="group inline-flex items-center gap-2 text-xs font-semibold text-white transition hover:text-[#D4D4D8]"
                      >
                        Build your first roadmap{" "}
                        <FiArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </button>
                    </div>
                  </Surface>
                )}
              </motion.section>

              {/***** Statistics panel copied from Mock Interview's four-column panel. *****/}

              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,

                  delay: 0.08,

                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mb-14"
              >
                <div className="mb-6 flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                      Your overview
                    </p>

                    <h2 className="mt-2 text-[25px] font-semibold tracking-[-0.04em] text-white sm:text-[29px]">
                      Progress at a glance.
                    </h2>
                  </div>

                  <p className="hidden max-w-xs text-right text-xs leading-5 text-[#666870] sm:block">
                    Your learning journey, in one place.
                  </p>
                </div>

                <Surface>
                  <div className="relative grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        label: "Roadmaps",

                        value: loading ? "—" : stats.total,

                        caption: "total learning paths",

                        Icon: FiMap,
                      },

                      {
                        label: "In progress",

                        value: loading ? "—" : stats.inProgress,

                        caption: "currently learning",

                        Icon: FiTrendingUp,
                      },

                      {
                        label: "Completed",

                        value: loading ? "—" : stats.completed,

                        caption: "finished roadmaps",

                        Icon: FiCheckCircle,
                      },

                      {
                        label: "Average progress",

                        value: loading ? "—" : `${stats.average}%`,

                        caption: "across your roadmaps",

                        Icon: FiTrendingUp,
                      },
                    ].map((stat, index) => (
                      <div
                        key={stat.label}
                        className={`px-3 py-4 sm:px-6 sm:py-5 ${index < 2 ? "border-b border-white/[0.08] lg:border-b-0" : ""} ${index % 2 === 0 ? "border-r border-white/[0.08]" : ""} ${index < 3 ? "lg:border-r lg:border-white/[0.08]" : ""}`}
                      >
                        <p className="text-center text-[8px] font-medium uppercase tracking-[0.13em] text-[#666870] sm:text-[9px] sm:tracking-[0.16em]">
                          {stat.label}
                        </p>

                        <p className="mt-1.5 text-center text-[24px] font-semibold leading-none tracking-[-0.045em] text-white sm:mt-2 sm:text-[30px]">
                          {stat.value}
                        </p>

                        <p className="mt-1 text-center text-[9px] leading-4 text-[#71747C] sm:text-[11px]">
                          {stat.caption}
                        </p>
                      </div>
                    ))}
                  </div>
                </Surface>
              </motion.section>

              {/***** Recent roadmap history uses the same rows and separators as interview history. *****/}

              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,

                  delay: 0.13,

                  ease: [0.22, 1, 0.36, 1],
                }}
                className="mb-14"
              >
                <div className="mb-6 flex items-end justify-between gap-4 text-center sm:text-left">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                      Your roadmaps
                    </p>

                    <h2 className="mt-2 text-[25px] font-semibold tracking-[-0.04em] text-white sm:text-[29px]">
                      What you have been working on.
                    </h2>
                  </div>

                  {!loading && roadmaps.length > 0 && (
                    <button
                      type="button"
                      onClick={history}
                      className="hidden items-center gap-2 text-xs font-semibold text-[#A1A1AA] transition hover:text-white sm:flex"
                    >
                      See all <FiArrowRight size={14} />
                    </button>
                  )}
                </div>

                <Surface>
                  <div className="relative px-5 sm:px-7">
                    {loading ? (
                      <div className="divide-y divide-white/[0.07]">
                        {[1, 2, 3].map((item) => (
                          <div
                            key={item}
                            className="flex items-center gap-4 py-5"
                          >
                            <div className="h-2 w-2 animate-pulse rounded-full bg-white/10" />

                            <div className="min-w-0 flex-1 space-y-2">
                              <div className="h-3 w-40 animate-pulse rounded bg-white/[0.07]" />

                              <div className="h-2.5 w-56 animate-pulse rounded bg-white/[0.05]" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : error ? (
                      <div className="py-12 text-center">
                        <h3 className="text-sm font-semibold text-white">
                          We couldn’t load your roadmaps
                        </h3>

                        <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#71747C]">
                          {error}
                        </p>

                        <button
                          type="button"
                          onClick={fetchRoadmaps}
                          className="mt-5 text-xs font-semibold text-white underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                        >
                          Try again
                        </button>
                      </div>
                    ) : roadmaps.length === 0 ? (
                      <div className="py-14">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                          First roadmap
                        </p>

                        <h3 className="mt-3 max-w-lg text-[24px] font-semibold tracking-[-0.035em] text-white">
                          Your learning journey starts here.
                        </h3>

                        <p className="mt-3 max-w-xl text-sm leading-6 text-[#71747C]">
                          Build your first roadmap and it will appear here,
                          ready for you to continue whenever you return.
                        </p>

                        <button
                          type="button"
                          onClick={build}
                          className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition duration-200 hover:-translate-y-0.5"
                        >
                          Build your first roadmap{" "}
                          <FiArrowRight
                            size={14}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-white/[0.07]">
                        {roadmaps.slice(0, 5).map((roadmap, index) => (
                          <motion.button
                            type="button"
                            key={
                              roadmap._id ||
                              roadmap.id ||
                              `${titleOf(roadmap)}-${index}`
                            }
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.035 }}
                            onClick={() => open(roadmap)}
                            className="group flex w-full flex-col gap-4 py-5 text-left transition duration-200 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex min-w-0 items-start gap-4">
                              <span className="mt-2 hidden h-1.5 w-1.5 shrink-0 rounded-full bg-white md:block" />

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <h3 className="truncate text-sm font-semibold tracking-[-0.015em] text-white">
                                    {titleOf(roadmap)}
                                  </h3>

                                  <span className="text-[9px] font-medium uppercase tracking-[0.13em] text-[#666870]">
                                    {roadmap.category ||
                                      roadmap.role ||
                                      "Roadmap"}
                                  </span>
                                </div>

                                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#71747C]">
                                  <span>
                                    {dateOf(
                                      roadmap.updatedAt || roadmap.createdAt,
                                    )}
                                  </span>

                                  <span className="text-white/15">•</span>

                                  <span>
                                    {Number(roadmap.completedSteps) || 0}/
                                    {Number(roadmap.totalSteps) ||
                                      Number(roadmap.steps?.length) ||
                                      0}{" "}
                                    steps
                                  </span>

                                  <span className="text-white/15">•</span>

                                  <span className="capitalize">
                                    {(
                                      roadmap.status || "not started"
                                    ).replaceAll("-", " ")}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between gap-6 sm:justify-end">
                              <div className="text-left sm:text-right">
                                <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#666870]">
                                  Progress
                                </p>

                                <p className="mt-1 text-sm font-semibold text-white">
                                  {progressOf(roadmap)}%
                                </p>
                              </div>

                              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#777980] transition duration-200 group-hover:border-white/20 group-hover:bg-white/[0.06] group-hover:text-white">
                                <FiArrowRight
                                  size={15}
                                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                                />
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </Surface>
              </motion.section>

              {!loading && !error && roadmaps.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.18 }}
                  className="flex flex-col items-center gap-5 border-t border-white/[0.08] pt-7 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left"
                >
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                      Keep going
                    </p>

                    <h2 className="mt-2 text-[23px] font-semibold tracking-[-0.035em] text-white">
                      Ready for another learning goal?
                    </h2>

                    <p className="mt-2 max-w-xl text-xs leading-5 text-[#71747C]">
                      Build another focused roadmap whenever you’re ready.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={build}
                    className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-white/[0.07]"
                  >
                    Build another roadmap{" "}
                    <FiArrowRight
                      size={14}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                </motion.section>
              )}
            </div>
          </main>
        </div>
      </div>

      {/***** Same fixed mobile action pattern as Mock Interview. *****/}

      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#111315]/[0.92] p-3 backdrop-blur-xl sm:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={history}
            className="group flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-semibold text-[#D4D4D8] transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white"
          >
            <FiClock size={14} />

            <span>View history</span>
          </button>

          <button
            type="button"
            onClick={build}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-[#17191C] shadow-[0_-10px_35px_rgba(0,0,0,0.22)] transition duration-200 active:scale-[0.99]"
          >
            <FiPlay size={14} />

            <span>Build roadmap</span>

            <FiArrowRight size={14} className="sm:hidden" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDashboardPage;
