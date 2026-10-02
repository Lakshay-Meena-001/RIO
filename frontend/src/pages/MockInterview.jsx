import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/SideBar";
import {
  getInterviewHistory,
  getActiveInterview,
  getRecentlyTerminatedInterview,
  dismissTerminationNotice,
} from "../api/interview.api";

import {
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiMenu,
  FiPlay,
  FiTarget,
  FiXCircle,
} from "react-icons/fi";

const MockInterview = ({ user, setUser }) => {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeInterview, setActiveInterview] = useState(null);
  const [activeLoading, setActiveLoading] = useState(true);

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [activeTimeLeft, setActiveTimeLeft] = useState(null);

  const [recentlyTerminatedInterview, setRecentlyTerminatedInterview] =
    useState(null);
  const [terminationLoading, setTerminationLoading] = useState(true);

  const firstName = user?.name?.split(" ")[0] || "there";

  /*
   * ---------------------------------------------------------
   * Fetch interview history
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    const loadInterviewHistory = async () => {
      try {
        const result = await getInterviewHistory();

        if (cancelled) return;

        if (!result?.success) {
          throw new Error(
            result?.message || "Failed to load interview history.",
          );
        }

        setInterviews(Array.isArray(result.data) ? result.data : []);
        setError("");
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load interview history:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load your interview history.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadInterviewHistory();

    return () => {
      cancelled = true;
    };
  }, [historyRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    const checkActiveInterview = async () => {
      try {
        const result = await getActiveInterview();

        if (cancelled) return;

        if (!result?.success) {
          throw new Error(
            result?.message || "Failed to load active interview.",
          );
        }

        setActiveInterview(result.data || null);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load active interview:", err);
        setActiveInterview(null);
      } finally {
        if (!cancelled) {
          setActiveLoading(false);
        }
      }
    };

    checkActiveInterview();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!activeInterview || activeInterview.status !== "in-progress") {
      return;
    }

    const calculateRemaining = () => {
      if (!activeInterview.startedAt || !activeInterview.timeLimit) {
        return;
      }

      const deadline =
        new Date(activeInterview.startedAt).getTime() +
        activeInterview.timeLimit * 60 * 1000;

      const remaining = Math.max(0, deadline - Date.now());

      setActiveTimeLeft(remaining);

      if (remaining <= 0) {
        setActiveInterview(null);
        setActiveTimeLeft(null);
        return;
      }
    };

    calculateRemaining();

    const timer = setInterval(calculateRemaining, 1000);

    return () => clearInterval(timer);
  }, [activeInterview]);

  useEffect(() => {
    let cancelled = false;

    const loadRecentlyTerminatedInterview = async () => {
      try {
        const result = await getRecentlyTerminatedInterview();

        if (cancelled) return;

        if (!result?.success) {
          throw new Error(
            result?.message || "Failed to load recent interview status.",
          );
        }

        setRecentlyTerminatedInterview(result.data || null);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load recently terminated interview:", err);

        setRecentlyTerminatedInterview(null);
      } finally {
        if (!cancelled) {
          setTerminationLoading(false);
        }
      }
    };

    loadRecentlyTerminatedInterview();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * Derived statistics
   * ---------------------------------------------------------
   */

  const stats = useMemo(() => {
    const total = interviews.length;

    const completed = interviews.filter(
      (interview) => interview.status === "completed",
    );

    const abandoned = interviews.filter(
      (interview) => interview.status === "abandoned",
    );

    const completedScores = completed
      .map((interview) => Number(interview.overallScore))
      .filter((score) => Number.isFinite(score));

    const averageScore =
      completedScores.length > 0
        ? completedScores.reduce((sum, score) => sum + score, 0) /
          completedScores.length
        : null;

    const bestScore =
      completedScores.length > 0 ? Math.max(...completedScores) : null;

    const answeredQuestions = interviews.reduce(
      (totalAnswered, interview) =>
        totalAnswered +
        (Array.isArray(interview.questions)
          ? interview.questions.filter((question) => question.submittedAt)
              .length
          : 0),
      0,
    );

    return {
      total,
      completed: completed.length,
      abandoned: abandoned.length,
      averageScore,
      bestScore,
      answeredQuestions,
    };
  }, [interviews]);

  /*
   * ---------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------
   */

  const handleDismissTerminationNotice = async () => {
    if (!recentlyTerminatedInterview?._id) {
      return;
    }

    try {
      await dismissTerminationNotice(recentlyTerminatedInterview._id);

      setRecentlyTerminatedInterview(null);
    } catch (err) {
      console.error("Failed to dismiss termination notice:", err);
    }
  };

  const formatScore = (score) => {
    if (!Number.isFinite(Number(score))) {
      return "—";
    }

    return `${Number(score).toFixed(1)}/10`;
  };

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown date";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCountdown = (milliseconds) => {
    if (milliseconds === null || milliseconds === undefined) {
      return "--:--";
    }

    const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0",
    )}`;
  };

  const formatInterviewType = (type) => {
    if (!type) return "Interview";

    const labels = {
      dsa: "DSA",
      core: "Core CS",
      development: "Development",
      project: "Project",
      "system-design": "System Design",
      behavioral: "Behavioral",
      full: "Full Interview",
    };

    return labels[type] || type;
  };

  const getAnsweredCount = (interview) => {
    if (!Array.isArray(interview.questions)) {
      return 0;
    }

    return interview.questions.filter((question) => question.submittedAt)
      .length;
  };

  const getQuestionCount = (interview) => {
    return interview.questionCount || interview.questions?.length || 0;
  };

  /*
   * ---------------------------------------------------------
   * Render
   * ---------------------------------------------------------
   */

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#17191C] text-white">
      {/* Background */}
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
        <header className="fixed left-3 right-3 top-3 z-40 mx-3 flex h-14 items-center justify-between rounded-full border border-white/[0.12] bg-[#17191C]/55 px-3 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-2xl md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white transition-colors hover:bg-white/[0.10]"
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

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold">
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
            className={`min-w-0 flex-1 transition-[margin-left] duration-300 ease-in-out ${
              sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"
            }`}
          >
            <div className="mx-auto w-full max-w-[1500px] px-4 pb-28 pt-[86px] sm:px-6 lg:px-8 lg:py-8 lg:pb-8">
              {/* Header */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
              >
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#A1A1AA]">
                    Interview Center
                  </p>

                  <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-white sm:text-[38px]">
                    Mock Interview
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#A1A1AA]">
                    Practice realistic interviews and track how your performance
                    changes over time.
                  </p>
                </div>

                {/* Desktop CTA */}
                <div className="hidden items-center gap-3 sm:flex">
                  <button
                    type="button"
                    onClick={() => navigate("/mock-interview/history")}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/[0.09]"
                  >
                    <FiClock size={15} />
                    History
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/mock-interview/new")}
                    className="group flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#17191C] transition-transform duration-200 hover:scale-[1.02]"
                  >
                    <FiPlay size={15} />
                    Start Interview
                    <FiArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              </motion.section>

              {/* Active interview */}
              {!activeLoading && (
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="mb-4"
                >
                  {activeInterview ? (
                    <article
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        navigate(`/mock-interview/${activeInterview._id}`)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          navigate(`/mock-interview/${activeInterview._id}`);
                        }
                      }}
                      className="group cursor-pointer rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 transition-all duration-200 hover:border-white/[0.16] hover:bg-white/[0.055] sm:px-6"
                    >
                      <div className="flex items-center justify-between gap-5">
                        {/* Left */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#A1A1AA]">
                              Active interview
                            </p>
                          </div>

                          <h2 className="mt-1.5 truncate text-sm font-semibold text-white sm:text-[15px]">
                            {activeInterview.role || "Mock Interview"}
                          </h2>

                          <p className="mt-1 text-[11px] text-[#71717A]">
                            {formatDate(
                              activeInterview.startedAt ||
                                activeInterview.createdAt,
                            )}
                          </p>
                        </div>

                        {/* Right */}
                        <div className="flex shrink-0 items-center gap-5 sm:gap-8">
                          <div className="hidden text-right sm:block">
                            <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-[#71717A]">
                              Start
                            </p>

                            <p className="mt-0.5 text-xs font-medium text-[#D4D4D8]">
                              {activeInterview.startedAt
                                ? new Date(
                                    activeInterview.startedAt,
                                  ).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Not started"}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-[#71717A]">
                              {activeInterview.status === "created"
                                ? "Status"
                                : "Time left"}
                            </p>

                            <p
                              className={`mt-0.5 font-mono text-sm font-semibold tracking-tight ${
                                activeInterview.status === "in-progress"
                                  ? "text-white"
                                  : "text-[#A1A1AA]"
                              }`}
                            >
                              {activeInterview.status === "created"
                                ? "Ready"
                                : formatCountdown(activeTimeLeft)}
                            </p>
                          </div>

                          <FiArrowRight
                            size={16}
                            className="text-[#71717A] transition-all duration-200 group-hover:translate-x-1 group-hover:text-white"
                          />
                        </div>
                      </div>

                      {/* Mobile timing */}
                      <div className="mt-3 flex items-center gap-5 sm:hidden">
                        <div>
                          <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-[#71717A]">
                            Start
                          </p>

                          <p className="mt-0.5 text-[11px] text-[#D4D4D8]">
                            {activeInterview.startedAt
                              ? new Date(
                                  activeInterview.startedAt,
                                ).toLocaleTimeString("en-IN", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Not started"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-[#71717A]">
                            {activeInterview.status === "created"
                              ? "Status"
                              : "Time left"}
                          </p>

                          <p className="mt-0.5 font-mono text-[11px] font-semibold text-white">
                            {activeInterview.status === "created"
                              ? "Ready"
                              : formatCountdown(activeTimeLeft)}
                          </p>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] px-5 py-4 sm:px-6">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                            Active interviews
                          </p>

                          <p className="mt-1 text-sm font-medium text-[#A1A1AA]">
                            No active interviews yet
                          </p>
                        </div>

                        <FiClock
                          size={16}
                          className="shrink-0 text-[#52525B]"
                        />
                      </div>
                    </div>
                  )}
                </motion.section>
              )}

              {!terminationLoading && recentlyTerminatedInterview && (
                <motion.article
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(
                      `/mock-interview/history?interview=${recentlyTerminatedInterview._id}`,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      navigate(
                        `/mock-interview/history?interview=${recentlyTerminatedInterview._id}`,
                      );
                    }
                  }}
                  className="group relative mb-4 cursor-pointer rounded-2xl border border-amber-400/10 bg-white/[0.035] px-5 py-4 transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.05] sm:px-6"
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDismissTerminationNotice();
                    }}
                    className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-[#71717A] transition-colors hover:bg-white/[0.08] hover:text-white"
                    aria-label="Dismiss notification"
                  >
                    <FiXCircle size={14} />
                  </button>

                  <div className="flex items-center justify-between gap-5 pr-7">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />

                        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                          Interview ended
                        </p>
                      </div>

                      <h2 className="mt-1.5 truncate text-sm font-semibold text-white sm:text-[15px]">
                        {recentlyTerminatedInterview.role || "Mock Interview"}
                      </h2>

                      <p className="mt-1 text-[11px] text-[#71717A]">
                        {formatDate(
                          recentlyTerminatedInterview.endedAt ||
                            recentlyTerminatedInterview.createdAt,
                        )}
                      </p>

                      <p className="mt-2 text-[11px] text-[#A1A1AA]">
                        Time limit reached
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-5 sm:gap-8">
                      <div className="hidden text-right sm:block">
                        <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-[#71717A]">
                          Start
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-[#D4D4D8]">
                          {recentlyTerminatedInterview.startedAt
                            ? new Date(
                                recentlyTerminatedInterview.startedAt,
                              ).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[8px] font-medium uppercase tracking-[0.14em] text-[#71717A]">
                          Ended
                        </p>

                        <p className="mt-0.5 text-xs font-medium text-[#D4D4D8]">
                          {recentlyTerminatedInterview.endedAt
                            ? new Date(
                                recentlyTerminatedInterview.endedAt,
                              ).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </p>
                      </div>

                      <FiArrowRight
                        size={16}
                        className="text-[#71717A] transition-all duration-200 group-hover:translate-x-1 group-hover:text-white"
                      />
                    </div>
                  </div>
                </motion.article>
              )}
              {/* Stats */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="grid grid-cols-2 gap-3 lg:grid-cols-5"
              >
                {[
                  {
                    label: "Total",
                    value: stats.total,
                    icon: FiBarChart2,
                  },
                  {
                    label: "Completed",
                    value: stats.completed,
                    icon: FiCheckCircle,
                  },
                  {
                    label: "Abandoned",
                    value: stats.abandoned,
                    icon: FiXCircle,
                  },
                  {
                    label: "Average score",
                    value: formatScore(stats.averageScore),
                    icon: FiTarget,
                  },
                  {
                    label: "Best score",
                    value: formatScore(stats.bestScore),
                    icon: FiBarChart2,
                  },
                ].map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 transition-colors duration-200 hover:bg-white/[0.065] sm:p-5"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-[#D4D4D8]">
                        <Icon size={16} />
                      </div>

                      <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#71717A]">
                        {stat.label}
                      </p>

                      <p className="mt-1 text-2xl font-semibold tracking-[-0.035em] text-white">
                        {loading ? "—" : stat.value}
                      </p>
                    </div>
                  );
                })}
              </motion.section>

              {/* Interview history */}
              <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045]"
              >
                <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5 sm:px-6">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                      History
                    </p>

                    <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                      Recent interviews
                    </h2>
                  </div>

                  {!loading && interviews.length > 0 && (
                    <span className="hidden text-xs text-[#71717A] sm:block">
                      {interviews.length}{" "}
                      {interviews.length === 1 ? "attempt" : "attempts"}
                    </span>
                  )}
                </div>

                {/* Loading */}
                {loading && (
                  <div className="divide-y divide-white/[0.07]">
                    {[1, 2, 3].map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-4 px-5 py-5 sm:px-6"
                      >
                        <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-white/[0.07]" />

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="h-3 w-40 animate-pulse rounded bg-white/[0.07]" />
                          <div className="h-2.5 w-56 animate-pulse rounded bg-white/[0.05]" />
                        </div>

                        <div className="hidden h-3 w-14 animate-pulse rounded bg-white/[0.06] sm:block" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Error */}
                {!loading && error && (
                  <div className="px-5 py-12 text-center sm:px-6">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#A1A1AA]">
                      <FiXCircle size={18} />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-white">
                      We couldn't load your interviews
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#71717A]">
                      {error}
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setLoading(true);
                        setError("");
                        setHistoryRefreshKey((previous) => previous + 1);
                      }}
                      className="mt-5 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-xs font-medium text-white transition-colors hover:bg-white/[0.09]"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {/* Empty */}
                {!loading && !error && interviews.length === 0 && (
                  <div className="px-5 py-14 text-center sm:px-6">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] text-[#A1A1AA]">
                      <FiPlay size={18} />
                    </div>

                    <h3 className="mt-5 text-sm font-semibold text-white">
                      Your interview history is empty
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#71717A]">
                      Start your first mock interview to begin building your
                      interview performance history.
                    </p>

                    <button
                      type="button"
                      onClick={() => navigate("/mock-interview/new")}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-semibold text-[#17191C] transition-transform hover:scale-[1.02]"
                    >
                      Start Interview
                      <FiArrowRight size={14} />
                    </button>
                  </div>
                )}

                {/* History list */}
                {!loading && !error && interviews.length > 0 && (
                  <div className="divide-y divide-white/[0.07]">
                    {interviews.slice(0, 3).map((interview) => {
                      const answered = getAnsweredCount(interview);
                      const totalQuestions = getQuestionCount(interview);

                      const completed = interview.status === "completed";

                      return (
                        <div
                          key={interview._id}
                          className="group flex flex-col gap-4 px-5 py-5 transition-colors duration-200 hover:bg-white/[0.025] sm:flex-row sm:items-center sm:px-6"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-4">
                            <div
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                                completed
                                  ? "border-white/10 bg-white/[0.06] text-white"
                                  : "border-white/[0.08] bg-white/[0.035] text-[#71717A]"
                              }`}
                            >
                              {completed ? (
                                <FiCheckCircle size={17} />
                              ) : (
                                <FiClock size={17} />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-sm font-semibold text-white">
                                  {interview.role || "Mock Interview"}
                                </h3>

                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.08em] text-[#A1A1AA]">
                                  {formatInterviewType(interview.interviewType)}
                                </span>
                              </div>

                              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#71717A]">
                                <span>{formatDate(interview.createdAt)}</span>

                                <span className="hidden text-white/20 sm:inline">
                                  •
                                </span>

                                <span>
                                  {answered}/{totalQuestions} answered
                                </span>

                                <span className="hidden text-white/20 sm:inline">
                                  •
                                </span>

                                <span className="capitalize">
                                  {interview.status}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 sm:justify-end">
                            <div className="text-left sm:text-right">
                              <p className="text-[9px] font-medium uppercase tracking-[0.12em] text-[#71717A]">
                                Score
                              </p>

                              <p className="mt-0.5 text-sm font-semibold text-white">
                                {completed
                                  ? formatScore(interview.overallScore)
                                  : "—"}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                navigate(
                                  `/mock-interview/history?interview=${interview._id}`,
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#A1A1AA] transition-colors hover:bg-white/[0.08] hover:text-white"
                              aria-label={
                                completed
                                  ? "Review interview"
                                  : "View interview"
                              }
                            >
                              {completed ? (
                                <FiArrowRight size={15} />
                              ) : (
                                <FiArrowRight size={15} />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.section>

              {/* Question activity */}
              {!loading && !error && interviews.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.15 }}
                  className="mt-4 grid gap-4 lg:grid-cols-2"
                >
                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                        <FiBarChart2 size={17} />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                          Practice volume
                        </p>

                        <h2 className="mt-1 text-lg font-semibold">
                          {stats.answeredQuestions} questions answered
                        </h2>
                      </div>
                    </div>

                    <p className="mt-4 text-xs leading-5 text-[#71717A]">
                      Every submitted answer becomes part of your interview
                      performance history.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                        <FiTarget size={17} />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                          Next step
                        </p>

                        <h2 className="mt-1 text-lg font-semibold">
                          Take another interview
                        </h2>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate("/mock-interview/new")}
                      className="group mt-4 inline-flex items-center gap-2 text-xs font-medium text-[#D4D4D8] transition-colors hover:text-white"
                    >
                      Configure a new interview
                      <FiArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-0.5"
                      />
                    </button>
                  </div>
                </motion.section>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#111315]/92 p-3 backdrop-blur-xl sm:hidden">
        <button
          type="button"
          onClick={() => navigate("/mock-interview/new")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-[#17191C] shadow-[0_-4px_25px_rgba(0,0,0,0.15)]"
        >
          <FiPlay size={15} />
          Start Interview
          <FiArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default MockInterview;
