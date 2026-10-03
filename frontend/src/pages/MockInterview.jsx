import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/SideBar";
import {
  getInterviewHistory,
  getActiveInterview,
  getRecentlyTerminatedInterview,
  dismissTerminationNotice,
  replaceActiveInterview,
} from "../api/interview.api";

import {
  FiArrowRight,
  FiClock,
  FiMenu,
  FiPlay,
  FiXCircle,
} from "react-icons/fi";

const MockInterview = ({ user, setUser }) => {
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeInterview, setActiveInterview] = useState(null);
  const [activeLoading, setActiveLoading] = useState(true);
  const [showReplaceInterviewModal, setShowReplaceInterviewModal] =
    useState(false);
  const [replacingInterview, setReplacingInterview] = useState(false);

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

  const handleStartInterview = () => {
    if (activeInterview) {
      setShowReplaceInterviewModal(true);
      return;
    }

    navigate("/mock-interview/new");
  };

  const handleStartNewInterview = async () => {
    if (replacingInterview) {
      return;
    }

    try {
      setReplacingInterview(true);
      setError("");

      const result = await replaceActiveInterview();

      if (!result?.success) {
        throw new Error(
          result?.message || "Failed to replace active interview.",
        );
      }

      setShowReplaceInterviewModal(false);
      setActiveInterview(null);
      setActiveTimeLeft(null);

      navigate("/mock-interview/new");
    } catch (err) {
      console.error("Failed to replace active interview:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to start a new interview.",
      );
    } finally {
      setReplacingInterview(false);
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
      {/* Ambient background — kept intentionally quiet so content carries the experience. */}
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
        {/* Mobile navigation */}
        <header className="fixed left-3 right-3 top-3 z-40 flex h-14 items-center justify-between rounded-2xl border border-white/[0.1] bg-[#17191C]/70 px-3 shadow-[0_16px_45px_rgba(0,0,0,0.24)] backdrop-blur-xl md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.055] text-white transition duration-200 hover:bg-white/[0.1] focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="Open navigation"
          >
            <FiMenu size={18} />
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
            className={`min-w-0 flex-1 transition-[margin-left] duration-300 ease-out ${
              sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"
            }`}
          >
            <div className="mx-auto w-full max-w-[1480px] px-5 pb-32 pt-[88px] sm:px-7 lg:px-10 lg:pb-12 lg:pt-10">
              {/* Editorial header */}
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
                      Interview practice
                    </p>
                  </div>

                  <h1 className="max-w-2xl text-[38px] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-[50px] lg:text-[58px]">
                    Your next interview
                    <span
                      className="block mt-2 font-serif text-[#A1A1AA]"
                      style={{
                        fontStyle: "italic",
                        fontWeight: 400,
                        letterSpacing: "-0.055em",
                      }}
                    >
                      starts here.
                    </span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-[14px] leading-7 text-[#92949B] sm:text-[15px]">
                    Practice under realistic pressure, understand what happened,
                    and come back sharper for the next one.
                  </p>
                </div>

                <div className="hidden items-center gap-3 sm:flex">
                  <button
                    type="button"
                    onClick={() => navigate("/mock-interview/history")}
                    className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-xs font-semibold text-[#D4D4D8] transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20 sm:px-5"
                  >
                    <FiClock size={14} />
                    View history
                  </button>

                  <button
                    type="button"
                    onClick={handleStartInterview}
                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] shadow-[0_10px_30px_rgba(255,255,255,0.08)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_34px_rgba(255,255,255,0.12)] focus:outline-none focus:ring-2 focus:ring-white/30 sm:px-5"
                  >
                    <FiPlay size={14} />
                    Start interview
                    <FiArrowRight
                      size={14}
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </button>
                </div>
              </motion.section>

              {/* Active state / empty state */}
              {!activeLoading && (
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
                      className="group relative cursor-pointer overflow-hidden rounded-[22px] border border-white/[0.13] bg-[#111315] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-md transition duration-300 hover:border-white/[0.2] hover:bg-[#151719] focus:outline-none focus:ring-2 focus:ring-white/20 sm:p-7"
                    >
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_15%,rgba(255,255,255,0.09),transparent_35%)] opacity-70" />

                      <div className="relative">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                          <div className="max-w-2xl">
                            <div className="flex items-center gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">
                                {activeInterview.status === "created"
                                  ? "Ready to begin"
                                  : "Interview in progress"}
                              </p>
                            </div>

                            <h2 className="mt-4 text-[27px] font-semibold tracking-[-0.04em] text-white sm:text-[32px]">
                              {activeInterview.role || "Mock Interview"}
                            </h2>

                            <p className="mt-2 max-w-xl text-sm leading-6 text-[#8F9198]">
                              Pick up exactly where you left off. Your current
                              interview stays active until you finish it.
                            </p>
                          </div>

                          <div className="flex items-end justify-between gap-8 lg:min-w-[360px] lg:justify-end">
                            <div>
                              <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#666870]">
                                Time left
                              </p>
                              <p className="mt-1 font-mono text-[25px] font-semibold tracking-[-0.04em] text-white">
                                {activeInterview.status === "created"
                                  ? "Ready"
                                  : formatCountdown(activeTimeLeft)}
                              </p>
                            </div>

                            <div className="hidden sm:block">
                              <p className="text-[9px] font-medium uppercase tracking-[0.16em] text-[#666870]">
                                Started
                              </p>
                              <p className="mt-1 text-sm font-medium text-[#D4D4D8]">
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

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] transition duration-300 group-hover:bg-white group-hover:text-[#17191C]">
                              <FiArrowRight
                                size={17}
                                className="transition-transform duration-300 group-hover:translate-x-0.5"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.08] pt-4 text-[11px] text-[#71747C]">
                          <span>
                            {formatDate(
                              activeInterview.startedAt ||
                                activeInterview.createdAt,
                            )}
                          </span>
                          <span className="text-white/20">•</span>
                          <span>
                            {activeInterview.status === "created"
                              ? "Configuration saved"
                              : "Progress saved automatically"}
                          </span>
                        </div>
                      </div>
                    </article>
                  ) : (
                    <div className="flex flex-col items-center gap-5 rounded-[20px] border border-white/[0.1] bg-[#111315] px-5 py-6 text-center shadow-[0_18px_50px_rgba(0,0,0,0.12)] sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:text-left">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                          Current session
                        </p>

                        <p className="mt-2 text-lg font-medium tracking-[-0.02em] text-[#D4D4D8]">
                          No interview is waiting for you.
                        </p>

                        <p className="mt-1 text-xs leading-5 text-[#71747C]">
                          Start a fresh session whenever you are ready.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleStartInterview}
                        className="group inline-flex items-center gap-2 text-xs font-semibold text-white transition hover:text-[#D4D4D8]"
                      >
                        Start a session
                        <FiArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </button>
                    </div>
                  )}
                </motion.section>
              )}

              {/* Recent termination — semantic color is only the dot. */}
              {!terminationLoading && recentlyTerminatedInterview && (
                <motion.article
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
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
                  className="group relative mb-12 cursor-pointer border-y border-white/[0.08] py-5 focus:outline-none focus:ring-2 focus:ring-white/20"
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDismissTerminationNotice();
                    }}
                    className="absolute right-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-[#666870] transition hover:bg-white/[0.06] hover:text-white"
                    aria-label="Dismiss notification"
                  >
                    <FiXCircle size={14} />
                  </button>

                  <div className="pr-10 sm:flex sm:items-center sm:justify-between sm:gap-8">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#777980]">
                          Interview ended
                        </p>
                      </div>
                      <h2 className="mt-2 text-base font-semibold tracking-[-0.02em] text-white">
                        {recentlyTerminatedInterview.role || "Mock Interview"}
                      </h2>
                      <p className="mt-1 text-xs text-[#71747C]">
                        Time limit reached ·{" "}
                        {formatDate(
                          recentlyTerminatedInterview.endedAt ||
                            recentlyTerminatedInterview.createdAt,
                        )}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center gap-5 sm:mt-0">
                      <div className="hidden text-right sm:block">
                        <p className="text-[9px] uppercase tracking-[0.15em] text-[#666870]">
                          Ended
                        </p>
                        <p className="mt-1 text-xs text-[#D4D4D8]">
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
                      <span className="text-xs font-medium text-[#A1A1AA] transition group-hover:text-white">
                        Review
                      </span>
                      <FiArrowRight
                        size={15}
                        className="text-[#71747C] transition duration-200 group-hover:translate-x-1 group-hover:text-white"
                      />
                    </div>
                  </div>
                </motion.article>
              )}

              {/* Practice overview — narrative analytics, not five cards. */}
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
                    <p className=" text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                      Your practice
                    </p>
                    <h2 className="mt-2 text-[25px] font-semibold tracking-[-0.04em] text-white sm:text-[29px]">
                      The work is adding up.
                    </h2>
                  </div>
                  <p className="hidden sm:block max-w-xs text-right text-xs leading-5 text-[#666870]">
                    A simple view of how much you have practiced and how your
                    completed sessions are performing.
                  </p>
                </div>

                <div className="relative overflow-hidden rounded-[22px] border border-white/[0.11] bg-[#111315] shadow-[0_22px_60px_rgba(0,0,0,0.18)]">
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 70% 95% at 100% 0%, rgba(255,255,255,0.075) 0%, rgba(255,255,255,0.025) 38%, transparent 70%), linear-gradient(135deg, rgba(255,255,255,0.025), transparent 48%)",
                    }}
                  />
                  <div className="relative grid sm:grid-cols-2 lg:grid-cols-4">
                    <div className="border-b border-white/[0.08] px-3 py-4 sm:border-r sm:px-6 sm:py-5 lg:border-b-0">
                      <p className=" text-center text-[8px] font-medium uppercase tracking-[0.13em] text-[#666870] sm:text-[9px] sm:tracking-[0.16em]">
                        Interviews
                      </p>

                      <p className="text-center mt-1.5 text-[24px] font-semibold leading-none tracking-[-0.045em] text-white sm:mt-2 sm:text-[30px]">
                        {loading ? "—" : stats.total}
                      </p>

                      <p className="text-center mt-1 text-[9px] leading-4 text-[#71747C] sm:text-[11px]">
                        total practice sessions
                      </p>
                    </div>

                    <div className="border-b border-white/[0.08] px-3 py-4 sm:px-6 sm:py-5 lg:border-b-0 lg:border-r">
                      <p className="text-center text-[8px] font-medium uppercase tracking-[0.13em] text-[#666870] sm:text-[9px] sm:tracking-[0.16em]">
                        Completed
                      </p>

                      <p className=" text-center mt-1.5 text-[24px] font-semibold leading-none tracking-[-0.045em] text-white sm:mt-2 sm:text-[30px]">
                        {loading ? "—" : stats.completed}
                      </p>

                      <p className=" text-center mt-1 text-[9px] leading-4 text-[#71747C] sm:text-[11px]">
                        finished interviews
                      </p>
                    </div>

                    <div className="border-b border-white/[0.08] px-3 py-4 sm:border-r-0 sm:px-6 sm:py-5 lg:border-b-0 lg:border-r">
                      <p className=" text-center text-[8px] font-medium uppercase tracking-[0.13em] text-[#666870] sm:text-[9px] sm:tracking-[0.16em]">
                        Average
                      </p>

                      <p className=" text-center mt-1.5 text-[24px] font-semibold leading-none tracking-[-0.045em] text-white sm:mt-2 sm:text-[30px]">
                        {loading ? "—" : formatScore(stats.averageScore)}
                      </p>

                      <p className=" text-center text-center mt-1 text-[9px] leading-4 text-[#71747C] sm:text-[11px]">
                        across completed sessions
                      </p>
                    </div>

                    <div className="px-3 py-4 sm:px-6 sm:py-5">
                      <p className=" text-center text-[8px] font-medium uppercase tracking-[0.13em] text-[#666870] sm:text-[9px] sm:tracking-[0.16em]">
                        Best
                      </p>

                      <p className=" text-center mt-1.5 text-[24px] font-semibold leading-none tracking-[-0.045em] text-white sm:mt-2 sm:text-[30px]">
                        {loading ? "—" : formatScore(stats.bestScore)}
                      </p>

                      <p className="text-center mt-1 text-[9px] leading-4 text-[#71747C] sm:text-[11px]">
                        highest completed score
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-4 flex flex-col gap-3 px-1 text-xs text-[#71747C] sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    {loading
                      ? "Calculating your practice volume…"
                      : `${stats.answeredQuestions} questions answered across your history.`}
                  </span>
                  {stats.abandoned > 0 && (
                    <span>
                      {stats.abandoned} session
                      {stats.abandoned === 1 ? "" : "s"} not completed.
                    </span>
                  )}
                </div>
              </motion.section>

              {/* Recent sessions */}
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
                      Recent sessions
                    </p>
                    <h2 className="mt-2 text-[25px] font-semibold tracking-[-0.04em] text-white sm:text-[29px]">
                      What you have been working on.
                    </h2>
                  </div>

                  {!loading && interviews.length > 0 && (
                    <button
                      type="button"
                      onClick={() => navigate("/mock-interview/history")}
                      className="hidden items-center gap-2 text-xs font-semibold text-[#A1A1AA] transition hover:text-white sm:flex"
                    >
                      See all
                      <FiArrowRight size={14} />
                    </button>
                  )}
                </div>

                <div className="relative overflow-hidden rounded-[22px] border border-white/[0.11] bg-[#111315] shadow-[0_22px_60px_rgba(0,0,0,0.16)]">
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(ellipse 65% 80% at 100% 0%, rgba(255,255,255,0.055) 0%, transparent 62%), linear-gradient(135deg, rgba(255,255,255,0.018), transparent 52%)",
                    }}
                  />
                  <div className="relative px-5 sm:px-7">
                    {loading && (
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
                            <div className="hidden h-3 w-14 animate-pulse rounded bg-white/[0.06] sm:block" />
                          </div>
                        ))}
                      </div>
                    )}

                    {!loading && error && (
                      <div className="py-14 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#8A8D95]">
                          <FiXCircle size={17} />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-white">
                          We couldn't load your interviews
                        </h3>
                        <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#71747C]">
                          {error}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setLoading(true);
                            setError("");
                            setHistoryRefreshKey((previous) => previous + 1);
                          }}
                          className="mt-5 text-xs font-semibold text-white underline decoration-white/20 underline-offset-4 transition hover:decoration-white/60"
                        >
                          Try again
                        </button>
                      </div>
                    )}

                    {!loading && !error && interviews.length === 0 && (
                      <div className="py-16">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#666870]">
                          First session
                        </p>
                        <h3 className="mt-3 max-w-lg text-[24px] font-semibold tracking-[-0.035em] text-white">
                          There is nothing here yet — and that is a good place
                          to start.
                        </h3>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-[#71747C]">
                          Set up your first interview, answer under pressure,
                          and your practice history will start taking shape
                          here.
                        </p>
                        <button
                          type="button"
                          onClick={handleStartInterview}
                          className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#17191C] transition duration-200 hover:-translate-y-0.5"
                        >
                          Start your first interview
                          <FiArrowRight
                            size={14}
                            className="transition-transform group-hover:translate-x-0.5"
                          />
                        </button>
                      </div>
                    )}

                    {!loading && !error && interviews.length > 0 && (
                      <div className="divide-y divide-white/[0.07]">
                        {interviews.slice(0, 4).map((interview) => {
                          const answered = getAnsweredCount(interview);
                          const totalQuestions = getQuestionCount(interview);
                          const completed = interview.status === "completed";

                          return (
                            <div
                              key={interview._id}
                              className="group flex flex-col gap-4 py-5 transition duration-200 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div className="flex min-w-0 items-start gap-4">
                                <span
                                  className={`mt-2 hidden h-1.5 w-1.5 shrink-0 rounded-full md:block ${
                                    completed ? "bg-white" : "bg-[#555861]"
                                  }`}
                                />

                                <div className="min-w-0">
                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                    <h3 className="truncate text-sm font-semibold tracking-[-0.015em] text-white">
                                      {interview.role || "Mock Interview"}
                                    </h3>
                                    <span className="text-[9px] font-medium uppercase tracking-[0.13em] text-[#666870]">
                                      {formatInterviewType(
                                        interview.interviewType,
                                      )}
                                    </span>
                                  </div>

                                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#71747C]">
                                    <span>
                                      {formatDate(interview.createdAt)}
                                    </span>
                                    <span className="text-white/15">•</span>
                                    <span>
                                      {answered}/{totalQuestions} answered
                                    </span>
                                    <span className="text-white/15">•</span>
                                    <span className="capitalize">
                                      {interview.status}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-6 sm:justify-end">
                                <div className="text-left sm:text-right">
                                  <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#666870]">
                                    Score
                                  </p>
                                  <p className="mt-1 text-sm font-semibold text-white">
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
                                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-[#777980] transition duration-200 hover:border-white/20 hover:bg-white/[0.06] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                                  aria-label={
                                    completed
                                      ? "Review interview"
                                      : "View interview"
                                  }
                                >
                                  <FiArrowRight
                                    size={15}
                                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                                  />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>

              {/* Closing action — intentionally open, not another card. */}
              {!loading && !error && interviews.length > 0 && (
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
                      Ready for another round?
                    </h2>

                    <p className="mt-2 max-w-xl text-xs leading-5 text-[#71747C]">
                      Change the role, difficulty or format and give yourself a
                      different interview to solve.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartInterview}
                    className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.18] hover:bg-white/[0.07]"
                  >
                    Configure another interview
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

      {/* Replace active interview modal */}
      {showReplaceInterviewModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.22 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="replace-interview-title"
            className="w-full max-w-md rounded-[22px] border border-white/[0.12] bg-[#1D2024] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-7"
          >
            <div className="flex items-start gap-4">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#777980]">
                  Current session
                </p>
                <h2
                  id="replace-interview-title"
                  className="mt-2 text-xl font-semibold tracking-[-0.025em] text-white"
                >
                  Active interview in progress
                </h2>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-[#92949B]">
              You already have an interview in progress. Starting a new
              interview will end/discard the current interview and its progress.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowReplaceInterviewModal(false)}
                disabled={replacingInterview}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-[#D4D4D8] transition duration-200 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleStartNewInterview}
                disabled={replacingInterview}
                className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#17191C] transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {replacingInterview ? "Starting..." : "Start New Interview"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Mobile primary action */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#111315]/88 p-3 backdrop-blur-xl sm:hidden">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/mock-interview/history")}
            className="group flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-semibold text-[#D4D4D8] transition duration-200 hover:border-white/[0.18] hover:bg-white/[0.065] hover:text-white focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <FiClock size={14} />
            <span>View history</span>
          </button>

          <button
            type="button"
            onClick={handleStartInterview}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3 py-3 text-xs font-semibold text-[#17191C] shadow-[0_-10px_35px_rgba(0,0,0,0.22)] transition duration-200 active:scale-[0.99]"
          >
            <FiPlay size={14} />
            <span>Start interview</span>
            <FiArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default MockInterview;
