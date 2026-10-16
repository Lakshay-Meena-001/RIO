import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiMap,
  FiPlay,
  FiRefreshCw,
  FiTrendingUp,
} from "react-icons/fi";

import { getUserRoadmaps } from "../api/roadmap.api.js";
import Sidebar from "../components/SideBar";

const ease = [0.22, 1, 0.36, 1];

const pageVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease, staggerChildren: 0.07 },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.2, ease: "easeInOut" },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.38, ease } },
};

const Surface = ({ children, className = "" }) => (
  <div
    className={`relative overflow-hidden rounded-[22px] border border-white/[0.11] bg-[#111315] shadow-[0_22px_60px_rgba(0,0,0,0.18)] ${className}`}
  >
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse 70% 95% at 100% 0%, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 38%, transparent 70%), linear-gradient(135deg, rgba(255,255,255,0.025), transparent 48%)",
      }}
    />
    <div className="relative">{children}</div>
  </div>
);

const PrimaryButton = ({ children, onClick, className = "" }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.18, ease }}
    className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-colors hover:bg-[#E8E8E8] ${className}`}
  >
    {children}
  </motion.button>
);

const SecondaryButton = ({ children, onClick, className = "" }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    transition={{ duration: 0.18, ease }}
    className={`group inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold text-[#D4D4D8] transition-colors hover:border-white/[0.18] hover:bg-white/[0.07] hover:text-white ${className}`}
  >
    {children}
  </motion.button>
);

const getProgress = (roadmap) => {
  const value = Number(roadmap?.progressPercentage);

  if (Number.isFinite(value)) {
    return Math.min(100, Math.max(0, Math.round(value)));
  }

  const total = Number(roadmap?.totalSteps) || 0;
  const completed = Number(roadmap?.completedSteps) || 0;

  return total
    ? Math.min(100, Math.max(0, Math.round((completed / total) * 100)))
    : 0;
};

const formatDate = (value) => {
  if (!value) return "Recently updated";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently updated";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const normalizeRoadmaps = (response) => {
  const payload = response?.data ?? response;

  const list = Array.isArray(payload?.roadmaps)
    ? payload.roadmaps
    : Array.isArray(payload?.data?.roadmaps)
      ? payload.data.roadmaps
      : [];

  return list.map((item) => {
    const catalog =
      item?.roadmap && typeof item.roadmap === "object"
        ? item.roadmap
        : item?.catalogRoadmap || {};

    const phases = Array.isArray(item?.phaseProgress)
      ? item.phaseProgress
      : Object.values(item?.phaseProgress || {});

    const completedSteps = phases.filter(
      (phase) => phase?.status === "completed" || Boolean(phase?.completedAt),
    ).length;

    const totalSteps = Number(catalog?.totalPhases) || phases.length;

    const calculatedProgress = totalSteps
      ? Math.round((completedSteps / totalSteps) * 100)
      : 0;

    return {
      ...item,
      _id: item?._id || item?.userRoadmapId || item?.id,
      title: catalog?.title || item?.title || "Untitled roadmap",
      description:
        catalog?.summary ||
        catalog?.description ||
        item?.description ||
        "Follow your learning path phase by phase.",
      category:
        catalog?.category ||
        catalog?.domain ||
        item?.category ||
        "Learning path",
      totalSteps,
      completedSteps,
      progressPercentage: Number(
        item?.progressPercentage ?? calculatedProgress,
      ),
      updatedAt: item?.lastAccessedAt || item?.updatedAt || item?.createdAt,
      phaseProgress: phases,
    };
  });
};

const RoadmapDashboardPage = ({
  user,
  setUser,
  onBuildRoadmap,
  onContinueRoadmap,
  onOpenRoadmap,
  onViewHistory,
}) => {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();

  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const firstName = user?.name?.trim()?.split(/\s+/)?.[0] || "there";

  const fetchRoadmaps = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getUserRoadmaps({ page: 1, limit: 20 });
      setRoadmaps(normalizeRoadmaps(response));
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
    fetchRoadmaps();
  }, [fetchRoadmaps]);

  const currentRoadmap =
    roadmaps.find(
      (item) =>
        !["completed", "complete"].includes(
          String(item?.status || "").toLowerCase(),
        ),
    ) ||
    roadmaps[0] ||
    null;

  const stats = useMemo(() => {
    const completed = roadmaps.filter((item) =>
      ["completed", "complete"].includes(
        String(item?.status || "").toLowerCase(),
      ),
    ).length;

    const inProgress = roadmaps.filter((item) =>
      ["in_progress", "in-progress", "active"].includes(
        String(item?.status || "").toLowerCase(),
      ),
    ).length;

    const average = roadmaps.length
      ? Math.round(
          roadmaps.reduce((sum, item) => sum + getProgress(item), 0) /
            roadmaps.length,
        )
      : 0;

    return {
      total: roadmaps.length,
      completed,
      inProgress,
      average,
    };
  }, [roadmaps]);

  const build = () =>
    onBuildRoadmap ? onBuildRoadmap() : navigate("/roadmap/new");

  const history = () =>
    onViewHistory ? onViewHistory() : navigate("/roadmap/history");

  const openRoadmap = (roadmap) => {
    if (onOpenRoadmap) return onOpenRoadmap(roadmap);

    const id = roadmap?._id || roadmap?.id || roadmap?.roadmapId;

    navigate(id ? `/roadmap/${id}` : "/roadmap");
  };

  const continueRoadmap = () => {
    if (onContinueRoadmap) {
      return onContinueRoadmap(currentRoadmap);
    }

    return currentRoadmap ? openRoadmap(currentRoadmap) : build();
  };

  const motionProps = reduceMotion
    ? {}
    : {
        variants: pageVariants,
        initial: "hidden",
        animate: "visible",
        exit: "exit",
      };

  return (
    <div className="min-h-screen overflow-x-clip bg-[#17191C] text-white">
      {/* Subtle RIO background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 80% 0%, rgba(255,255,255,0.035), transparent 72%)",
        }}
      />

      {/* Mobile top bar */}
      <header className="fixed left-3 right-3 top-3 z-40 flex h-14 items-center justify-between rounded-2xl border border-white/[0.10] bg-[#111315]/[0.92] px-3 shadow-xl backdrop-blur-xl md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open navigation"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white"
        >
          <span className="text-lg">☰</span>
        </button>

        <div className="text-center">
          <p className="text-sm font-semibold tracking-[0.12em]">RIO</p>
          <p className="mt-0.5 text-[8px] tracking-[0.16em] text-[#666870]">
            ROADMAP STUDIO
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-xs font-semibold">
          {firstName.charAt(0).toUpperCase()}
        </div>
      </header>

      <div className="relative z-10 flex min-h-screen">
        <Sidebar
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          user={user}
          sidebarOpen={sidebarOpen}
          setUser={setUser}
          setSidebarOpen={setSidebarOpen}
        />

        <main
          className={`min-w-0 flex-1 transition-[margin] duration-300 ease-out ${
            sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"
          }`}
        >
          <motion.div
            {...motionProps}
            className="mx-auto w-full max-w-[1480px] px-5 pb-28 pt-[88px] sm:px-7 sm:pb-12 lg:px-10 lg:pt-10"
          >
            {/* Heading */}
            <motion.section
              variants={itemVariants}
              className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
            >
              <div>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                  Your learning workspace
                </p>

                <h1 className="text-[34px] font-semibold leading-tight tracking-[-0.045em] sm:text-[43px]">
                  Your roadmaps.
                  <span className="block text-[#777B83]">Your next move.</span>
                </h1>

                <p className="mt-4 max-w-2xl text-sm leading-6 text-[#858791]">
                  Welcome back, {firstName}. Pick up where you left off or
                  create a focused learning path for your next goal.
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <SecondaryButton onClick={history}>
                  <FiClock size={14} />
                  View history
                </SecondaryButton>

                <PrimaryButton onClick={build}>
                  <FiPlay size={14} />
                  Build roadmap
                  <FiArrowRight size={14} />
                </PrimaryButton>
              </div>
            </motion.section>

            {/* Stats */}
            <motion.section variants={itemVariants} className="mb-9">
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                {[
                  {
                    label: "Total roadmaps",
                    value: stats.total,
                    detail: "Learning paths created",
                    Icon: FiMap,
                  },
                  {
                    label: "In progress",
                    value: stats.inProgress,
                    detail: "Paths you're working on",
                    Icon: FiTrendingUp,
                  },
                  {
                    label: "Completed",
                    value: stats.completed,
                    detail: "Learning paths finished",
                    Icon: FiCheckCircle,
                  },
                  {
                    label: "Average progress",
                    value: `${stats.average}%`,
                    detail: "Across your roadmaps",
                    Icon: FiTrendingUp,
                  },
                ].map(({ label, value, detail, Icon }) => (
                  <motion.div
                    key={label}
                    whileHover={reduceMotion ? undefined : { y: -3 }}
                    transition={{ duration: 0.2, ease }}
                  >
                    <Surface className="h-full p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#777A82]">
                          {label}
                        </span>
                        <Icon size={15} className="shrink-0 text-[#777B83]" />
                      </div>

                      <p className="mt-5 text-[30px] font-semibold tracking-[-0.05em] sm:text-[34px]">
                        {loading ? "—" : value}
                      </p>

                      <p className="mt-1 text-[10px] text-[#71747C]">
                        {detail}
                      </p>
                    </Surface>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Active roadmap */}
            <motion.section variants={itemVariants} className="mb-10">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                    Continue learning
                  </p>
                  <h2 className="mt-2 text-[23px] font-semibold tracking-[-0.035em] sm:text-[27px]">
                    Pick up where you left off.
                  </h2>
                </div>

                {!loading && roadmaps.length > 0 && (
                  <button
                    type="button"
                    onClick={history}
                    className="hidden items-center gap-1.5 text-xs text-[#A5A7AD] transition hover:text-white sm:inline-flex"
                  >
                    All roadmaps <FiArrowRight size={13} />
                  </button>
                )}
              </div>

              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Surface className="p-6 sm:p-8">
                      <div className="h-3 w-28 animate-pulse rounded bg-white/[0.07]" />
                      <div className="mt-5 h-7 w-2/3 animate-pulse rounded bg-white/[0.07]" />
                      <div className="mt-4 h-3 w-full animate-pulse rounded bg-white/[0.05]" />
                      <div className="mt-7 h-2 w-full animate-pulse rounded-full bg-white/[0.07]" />
                    </Surface>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.28, ease }}
                  >
                    <Surface className="p-6 sm:p-8">
                      <p className="text-lg font-semibold">
                        Roadmaps couldn't be loaded.
                      </p>
                      <p className="mt-2 break-words text-sm leading-6 text-[#858791]">
                        {error}
                      </p>
                      <SecondaryButton className="mt-5" onClick={fetchRoadmaps}>
                        <FiRefreshCw size={13} /> Try again
                      </SecondaryButton>
                    </Surface>
                  </motion.div>
                ) : currentRoadmap ? (
                  <motion.div
                    key={currentRoadmap._id || currentRoadmap.title}
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.32, ease }}
                  >
                    <Surface>
                      <div className="grid lg:grid-cols-[minmax(0,1fr)_245px]">
                        <button
                          type="button"
                          onClick={() => openRoadmap(currentRoadmap)}
                          className="group p-5 text-left transition-colors hover:bg-white/[0.015] sm:p-8"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-white/[0.12] bg-white/[0.045] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#D4D4D8]">
                              {["completed", "complete"].includes(
                                String(
                                  currentRoadmap.status || "",
                                ).toLowerCase(),
                              )
                                ? "Completed"
                                : "Active roadmap"}
                            </span>

                            <span className="text-[10px] text-[#71747C]">
                              {currentRoadmap.category}
                            </span>
                          </div>

                          <h3 className="mt-5 text-[26px] font-semibold leading-tight tracking-[-0.04em] sm:text-[32px]">
                            {currentRoadmap.title}
                          </h3>

                          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#858791]">
                            {currentRoadmap.description}
                          </p>

                          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] text-[#71747C]">
                            <span>
                              {currentRoadmap.completedSteps || 0} of{" "}
                              {currentRoadmap.totalSteps || 0} phases completed
                            </span>
                            <span className="hidden sm:inline">·</span>
                            <span>
                              Updated {formatDate(currentRoadmap.updatedAt)}
                            </span>
                          </div>

                          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${getProgress(currentRoadmap)}%`,
                              }}
                              transition={{ duration: 0.75, ease }}
                              className="h-full rounded-full bg-white"
                            />
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-[10px] text-[#71747C]">
                              Overall progress
                            </span>
                            <span className="text-[10px] font-semibold text-[#D4D4D8]">
                              {getProgress(currentRoadmap)}%
                            </span>
                          </div>

                          <span className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-white">
                            Open roadmap
                            <FiArrowRight
                              size={14}
                              className="transition-transform duration-200 group-hover:translate-x-1"
                            />
                          </span>
                        </button>

                        <div className="flex flex-col justify-between gap-6 border-t border-white/[0.08] bg-white/[0.015] p-5 sm:p-7 lg:border-l lg:border-t-0">
                          <div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.11] bg-white/[0.045]">
                              <FiPlay size={16} className="text-[#D4D4D8]" />
                            </div>

                            <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#777A82]">
                              Keep going
                            </p>

                            <p className="mt-2 text-sm leading-6 text-[#858791]">
                              Every completed phase moves you closer to your
                              goal.
                            </p>
                          </div>

                          <PrimaryButton onClick={continueRoadmap}>
                            Continue roadmap
                            <FiArrowRight size={14} />
                          </PrimaryButton>
                        </div>
                      </div>
                    </Surface>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    <Surface className="p-6 sm:p-9">
                      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="max-w-2xl">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.11] bg-white/[0.045]">
                            <FiMap size={19} className="text-[#D4D4D8]" />
                          </div>

                          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                            Start with a goal
                          </p>

                          <h3 className="mt-2 text-[25px] font-semibold tracking-[-0.04em] sm:text-[31px]">
                            Your next learning path starts here.
                          </h3>

                          <p className="mt-3 text-sm leading-6 text-[#858791]">
                            Build a structured roadmap, follow its phases, and
                            track your progress from one place.
                          </p>
                        </div>

                        <PrimaryButton onClick={build}>
                          <FiPlay size={14} />
                          Build your first roadmap
                          <FiArrowRight size={14} />
                        </PrimaryButton>
                      </div>
                    </Surface>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>

            {/* Recent roadmaps */}
            <motion.section variants={itemVariants} className="mb-10">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                    Your workspace
                  </p>
                  <h2 className="mt-2 text-[23px] font-semibold tracking-[-0.035em] sm:text-[27px]">
                    Recent roadmaps
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={history}
                  className="inline-flex shrink-0 items-center gap-1.5 text-xs text-[#A5A7AD] transition hover:text-white"
                >
                  View history <FiArrowRight size={13} />
                </button>
              </div>

              <Surface>
                {loading ? (
                  <div className="px-5 sm:px-7">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-4 border-b border-white/[0.07] py-5 last:border-0"
                      >
                        <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.06]" />
                        <div className="flex-1 space-y-2">
                          <div className="h-3 w-40 animate-pulse rounded bg-white/[0.07]" />
                          <div className="h-2.5 w-28 animate-pulse rounded bg-white/[0.04]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="px-5 py-8 sm:px-7">
                    <p className="text-sm text-[#858791]">
                      Recent roadmaps could not be loaded.
                    </p>
                    <button
                      type="button"
                      onClick={fetchRoadmaps}
                      className="mt-3 text-xs font-semibold text-white underline underline-offset-4"
                    >
                      Try again
                    </button>
                  </div>
                ) : roadmaps.length > 0 ? (
                  <div className="px-5 sm:px-7">
                    {roadmaps.slice(0, 5).map((roadmap, index) => (
                      <motion.button
                        type="button"
                        key={
                          roadmap._id ||
                          roadmap.id ||
                          `${roadmap.title}-${index}`
                        }
                        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.28,
                          delay: index * 0.045,
                          ease,
                        }}
                        whileHover={reduceMotion ? undefined : { x: 3 }}
                        onClick={() => openRoadmap(roadmap)}
                        className={`flex w-full items-center gap-3 py-4 text-left sm:gap-4 sm:py-[18px] ${
                          index ? "border-t border-white/[0.07]" : ""
                        }`}
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.10] bg-white/[0.035] text-[#C9CBD0]">
                          <FiMap size={16} />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-xs font-semibold text-[#E1E1E5] sm:text-sm">
                            {roadmap.title}
                          </span>

                          <span className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-[#71747C]">
                            <span>{roadmap.category || "Learning path"}</span>
                            <span>·</span>
                            <span>{formatDate(roadmap.updatedAt)}</span>
                          </span>
                        </span>

                        <span className="hidden w-24 shrink-0 sm:block">
                          <span className="mb-1 block text-right text-[10px] text-[#BFC1C7]">
                            {getProgress(roadmap)}%
                          </span>
                          <span className="block h-1 overflow-hidden rounded-full bg-white/[0.08]">
                            <motion.span
                              initial={{ width: 0 }}
                              animate={{
                                width: `${getProgress(roadmap)}%`,
                              }}
                              transition={{ duration: 0.6, ease }}
                              className="block h-full rounded-full bg-white"
                            />
                          </span>
                        </span>

                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.09] text-[#858791] transition-colors group-hover:text-white">
                          <FiArrowRight size={14} />
                        </span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="px-5 py-8 sm:px-7">
                    <p className="text-sm font-semibold text-[#D4D4D8]">
                      No roadmaps yet.
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#71747C]">
                      Your created learning paths will appear here.
                    </p>
                    <SecondaryButton className="mt-4" onClick={build}>
                      Build roadmap <FiArrowRight size={13} />
                    </SecondaryButton>
                  </div>
                )}
              </Surface>
            </motion.section>

            {/* Closing action */}
            <motion.section
              variants={itemVariants}
              className="flex flex-col items-center gap-5 border-t border-white/[0.08] pt-7 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left"
            >
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                  Keep going
                </p>

                <h2 className="mt-2 text-[23px] font-semibold tracking-[-0.035em]">
                  Ready for another learning goal?
                </h2>

                <p className="mt-2 max-w-xl text-xs leading-5 text-[#71747C]">
                  Build another focused roadmap whenever you're ready.
                </p>
              </div>

              <SecondaryButton onClick={build}>
                Build another roadmap
                <FiArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </SecondaryButton>
            </motion.section>
          </motion.div>
        </main>
      </div>

      {/* Fixed mobile actions */}
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
            <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoadmapDashboardPage;
