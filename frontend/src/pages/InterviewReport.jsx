import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiMenu,
  FiTarget,
  FiTrendingUp,
  FiXCircle,
} from "react-icons/fi";

import Sidebar from "../components/SideBar";
import { getInterview } from "../api/interview.api";

const InterviewReport = ({ user, setUser }) => {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [expandedQuestion, setExpandedQuestion] = useState(null);

  /*
   * ---------------------------------------------------------
   * Load report
   * ---------------------------------------------------------
   */

  const loadReport = useCallback(async () => {
    try {
      const result = await getInterview(interviewId);

      if (!result?.success || !result?.data) {
        throw new Error(result?.message || "Unable to load interview report.");
      }

      setInterview(result.data);
    } catch (err) {
      console.error("Failed to load interview report:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load this interview report.",
      );
    } finally {
      setLoading(false);
    }
  }, [interviewId]);

  /*
   * Initial report fetch.
   *
   * Keep the async work inside the effect instead of directly
   * calling a function that performs synchronous state updates.
   */

  useEffect(() => {
    let cancelled = false;

    const fetchReport = async () => {
      try {
        const result = await getInterview(interviewId);

        if (!result?.success || !result?.data) {
          throw new Error(
            result?.message || "Unable to load interview report.",
          );
        }

        if (cancelled) return;

        setInterview(result.data);
      } catch (err) {
        if (cancelled) return;

        console.error("Failed to load interview report:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load this interview report.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchReport();

    return () => {
      cancelled = true;
    };
  }, [interviewId]);

  /*
   * ---------------------------------------------------------
   * Helpers
   * ---------------------------------------------------------
   */

  const formatScore = (score) => {
    const numericScore = Number(score);

    if (!Number.isFinite(numericScore)) {
      return "—";
    }

    return `${numericScore.toFixed(1)}/10`;
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

  const formatTime = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatInterviewType = (type) => {
    const labels = {
      dsa: "DSA",
      core: "Core CS",
      development: "Development",
      project: "Project",
      "system-design": "System Design",
      behavioral: "Behavioral",
      full: "Full Interview",
    };

    return labels[type] || type || "Interview";
  };

  const formatSectionName = (section) => {
    if (!section) return "General";

    return section
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  };

  /*
   * ---------------------------------------------------------
   * Section scores
   * ---------------------------------------------------------
   */

  const sectionScores = useMemo(() => {
    if (!interview?.sectionScores) {
      return [];
    }

    const source = interview.sectionScores;

    if (source instanceof Map) {
      return Array.from(source.entries());
    }

    if (typeof source === "object") {
      return Object.entries(source);
    }

    return [];
  }, [interview]);

  /*
   * ---------------------------------------------------------
   * Question statistics
   * ---------------------------------------------------------
   */

  const questionStats = useMemo(() => {
    const questions = Array.isArray(interview?.questions)
      ? interview.questions
      : [];

    const answered = questions.filter(
      (question) => question?.submittedAt,
    ).length;

    const evaluated = questions.filter(
      (question) =>
        question?.evaluation &&
        Number.isFinite(Number(question.evaluation.score)),
    );

    const averageQuestionScore =
      evaluated.length > 0
        ? evaluated.reduce(
            (sum, question) => sum + Number(question.evaluation.score),
            0,
          ) / evaluated.length
        : null;

    return {
      total: questions.length,
      answered,
      evaluated: evaluated.length,
      averageQuestionScore,
    };
  }, [interview]);

  /*
   * ---------------------------------------------------------
   * Loading
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#17191C] text-white">
        <div className="flex min-h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />

            <p className="text-xs text-[#71717A]">
              Preparing your interview report...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Error
   * ---------------------------------------------------------
   */

  if (!interview) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#17191C] px-5 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/[0.045] p-6 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-[#A1A1AA]">
            <FiAlertCircle size={18} />
          </div>

          <h1 className="mt-4 text-lg font-semibold">Unable to load report</h1>

          <p className="mt-2 text-sm leading-6 text-[#71717A]">
            {error || "Something went wrong while loading this report."}
          </p>

          <button
            type="button"
            onClick={loadReport}
            className="mt-5 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-[#17191C]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Report data
   * ---------------------------------------------------------
   */

  const questions = Array.isArray(interview.questions)
    ? interview.questions
    : [];

  const completed = interview.status === "completed";

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
      </div>

      <div className="relative z-10">
        {/* Mobile top bar */}
        <header className="fixed left-3 right-3 top-3 z-40 mx-3 flex h-14 items-center justify-between rounded-full border border-white/[0.12] bg-[#17191C]/55 px-3 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur-2xl md:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06]"
            aria-label="Open navigation"
          >
            <FiMenu size={18} />
          </button>

          <span
            className="text-[17px] tracking-tight"
            style={{ fontFamily: '"Zen Dots", sans-serif' }}
          >
            RIO
          </span>

          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-xs font-semibold">
            {user?.name?.charAt(0)?.toUpperCase() || "U"}
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
            className={`min-w-0 flex-1 transition-[margin-left] duration-300 ${
              sidebarOpen ? "md:ml-[250px]" : "md:ml-[76px]"
            }`}
          >
            <div className="mx-auto w-full max-w-[1500px] px-4 pb-32 pt-[86px] sm:px-6 lg:px-8 lg:py-8 lg:pb-12">
              {/* Header */}
              <section className="mb-7">
                <button
                  type="button"
                  onClick={() => navigate("/mock-interview")}
                  className="mb-6 inline-flex items-center gap-2 text-xs font-medium text-[#A1A1AA] transition-colors hover:text-white"
                >
                  <FiArrowLeft size={14} />
                  Back to interviews
                </button>

                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                      Interview Report
                    </p>

                    <h1 className="text-[30px] font-semibold tracking-[-0.035em] sm:text-[38px]">
                      {interview.role || "Mock Interview"}
                    </h1>

                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[#71717A]">
                      <span>
                        {formatInterviewType(interview.interviewType)}
                      </span>

                      <span className="text-white/20">•</span>

                      <span>{formatDate(interview.createdAt)}</span>

                      {formatTime(interview.createdAt) && (
                        <>
                          <span className="text-white/20">•</span>
                          <span>{formatTime(interview.createdAt)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/mock-interview/new")}
                    className="hidden items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#17191C] transition-transform hover:scale-[1.02] lg:flex"
                  >
                    <FiTrendingUp size={15} />
                    Interview Again
                    <FiArrowRight size={15} />
                  </button>
                </div>
              </section>

              {!completed && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-yellow-400/20 bg-yellow-400/[0.05] px-4 py-3 text-sm text-yellow-200">
                  <FiAlertCircle size={16} className="mt-0.5 shrink-0" />

                  <p>
                    This interview is not marked as completed, so the final
                    report may not contain all evaluation data yet.
                  </p>
                </div>
              )}

              {/* Overall score */}
              <section className="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 sm:p-7">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <FiTarget size={17} />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                        Overall performance
                      </p>

                      <h2 className="mt-1 text-sm font-semibold">
                        Final Score
                      </h2>
                    </div>
                  </div>

                  <div className="mt-8 flex items-end gap-2">
                    <span className="text-5xl font-semibold tracking-[-0.05em]">
                      {Number.isFinite(Number(interview.overallScore))
                        ? Number(interview.overallScore).toFixed(1)
                        : "—"}
                    </span>

                    <span className="mb-1.5 text-sm text-[#71717A]">/ 10</span>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
                    <div
                      className="h-full rounded-full bg-white"
                      style={{
                        width: `${Math.min(
                          Math.max(Number(interview.overallScore) * 10 || 0, 0),
                          100,
                        )}%`,
                      }}
                    />
                  </div>

                  <p className="mt-4 text-xs leading-5 text-[#71717A]">
                    Based on the evaluations generated across your submitted
                    answers.
                  </p>
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <FiBarChart2 size={16} />
                    </div>

                    <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#71717A]">
                      Questions
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                      {questionStats.total}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <FiCheckCircle size={16} />
                    </div>

                    <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#71717A]">
                      Answered
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                      {questionStats.answered}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <FiTarget size={16} />
                    </div>

                    <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#71717A]">
                      Avg. question
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                      {formatScore(questionStats.averageQuestionScore)}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <FiClock size={16} />
                    </div>

                    <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.12em] text-[#71717A]">
                      Time limit
                    </p>

                    <p className="mt-1 text-2xl font-semibold">
                      {interview.timeLimit || "—"}
                      <span className="ml-1 text-xs font-normal text-[#71717A]">
                        min
                      </span>
                    </p>
                  </div>
                </div>
              </section>

              {/* Section scores */}
              {sectionScores.length > 0 && (
                <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <FiBarChart2 size={17} />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                        Breakdown
                      </p>

                      <h2 className="mt-1 text-lg font-semibold">
                        Section scores
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {sectionScores.map(([section, score]) => {
                      const numericScore = Number(score);

                      return (
                        <div key={section}>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-medium text-[#D4D4D8]">
                              {formatSectionName(section)}
                            </span>

                            <span className="text-xs font-semibold text-white">
                              {formatScore(score)}
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                            <div
                              className="h-full rounded-full bg-white"
                              style={{
                                width: `${Math.min(
                                  Math.max(numericScore * 10 || 0, 0),
                                  100,
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Summary */}
              {interview.summary && (
                <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                    Interview summary
                  </p>

                  <p className="mt-4 max-w-4xl text-sm leading-7 text-[#D4D4D8]">
                    {interview.summary}
                  </p>
                </section>
              )}

              {/* Strengths / weaknesses */}
              <section className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <FiCheckCircle size={17} />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                        What went well
                      </p>

                      <h2 className="mt-1 text-lg font-semibold">Strengths</h2>
                    </div>
                  </div>

                  {Array.isArray(interview.strengths) &&
                  interview.strengths.length > 0 ? (
                    <ul className="mt-6 space-y-3">
                      {interview.strengths.map((strength, index) => (
                        <li
                          key={`${strength}-${index}`}
                          className="flex gap-3 text-sm leading-6 text-[#D4D4D8]"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-6 text-sm text-[#71717A]">
                      No strengths were recorded for this interview.
                    </p>
                  )}
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                      <FiXCircle size={17} />
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                        What to improve
                      </p>

                      <h2 className="mt-1 text-lg font-semibold">Weaknesses</h2>
                    </div>
                  </div>

                  {Array.isArray(interview.weaknesses) &&
                  interview.weaknesses.length > 0 ? (
                    <ul className="mt-6 space-y-3">
                      {interview.weaknesses.map((weakness, index) => (
                        <li
                          key={`${weakness}-${index}`}
                          className="flex gap-3 text-sm leading-6 text-[#D4D4D8]"
                        >
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A1A1AA]" />
                          <span>{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-6 text-sm text-[#71717A]">
                      No weaknesses were recorded for this interview.
                    </p>
                  )}
                </div>
              </section>

              {/* Recommendations */}
              {Array.isArray(interview.recommendations) &&
                interview.recommendations.length > 0 && (
                  <section className="mt-4 rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                        <FiTrendingUp size={17} />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                          Next steps
                        </p>

                        <h2 className="mt-1 text-lg font-semibold">
                          Recommendations
                        </h2>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-3">
                      {interview.recommendations.map(
                        (recommendation, index) => (
                          <div
                            key={`${recommendation}-${index}`}
                            className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4"
                          >
                            <div className="flex gap-3">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-[10px] font-semibold text-[#A1A1AA]">
                                {index + 1}
                              </span>

                              <p className="text-sm leading-6 text-[#D4D4D8]">
                                {recommendation}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </section>
                )}

              {/* Question-by-question review */}
              <section className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.045]">
                <div className="border-b border-white/[0.07] px-5 py-5 sm:px-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
                    Detailed review
                  </p>

                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
                    Question-by-question analysis
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-[#71717A]">
                    Review your answers, evaluation and the stronger answer
                    approach suggested by the interviewer.
                  </p>
                </div>

                {questions.length === 0 ? (
                  <div className="px-5 py-12 text-center">
                    <p className="text-sm text-[#71717A]">
                      No questions are available for this report.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/[0.07]">
                    {questions.map((question, index) => {
                      const evaluation = question.evaluation || {};
                      const isExpanded =
                        expandedQuestion === question.questionId;

                      return (
                        <div key={question.questionId || index}>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedQuestion((previous) =>
                                previous === question.questionId
                                  ? null
                                  : question.questionId,
                              )
                            }
                            className="flex w-full items-center gap-4 px-5 py-5 text-left transition-colors hover:bg-white/[0.025] sm:px-6"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-xs font-semibold text-[#A1A1AA]">
                              {index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-[#71717A]">
                                  {formatSectionName(question.section)}
                                </span>

                                {question.difficulty && (
                                  <>
                                    <span className="text-white/20">•</span>

                                    <span className="text-[9px] capitalize text-[#71717A]">
                                      {question.difficulty}
                                    </span>
                                  </>
                                )}
                              </div>

                              <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-[#D4D4D8]">
                                {question.text}
                              </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-3">
                              <span className="hidden text-xs font-semibold text-white sm:block">
                                {formatScore(evaluation.score)}
                              </span>

                              <FiChevronDown
                                size={16}
                                className={`text-[#71717A] transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            </div>
                          </button>

                          {isExpanded && (
                            <div className="border-t border-white/[0.06] bg-black/[0.08] px-5 py-6 sm:px-6">
                              {/* Score */}
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                                {[
                                  ["Score", evaluation.score],
                                  ["Correctness", evaluation.correctness],
                                  ["Clarity", evaluation.clarity],
                                  ["Relevance", evaluation.relevance],
                                  ["Communication", evaluation.communication],
                                ].map(([label, value]) => (
                                  <div
                                    key={label}
                                    className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"
                                  >
                                    <p className="text-[9px] uppercase tracking-[0.1em] text-[#71717A]">
                                      {label}
                                    </p>

                                    <p className="mt-1 text-sm font-semibold">
                                      {formatScore(value)}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {/* Candidate answer */}
                              <div className="mt-5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                                  Your answer
                                </p>

                                <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                                  <p className="whitespace-pre-wrap text-sm leading-7 text-[#D4D4D8]">
                                    {question.answer?.trim() ||
                                      "No answer submitted."}
                                  </p>
                                </div>
                              </div>

                              {/* Feedback */}
                              {evaluation.feedback && (
                                <div className="mt-5">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                                    Interviewer feedback
                                  </p>

                                  <p className="mt-3 text-sm leading-7 text-[#D4D4D8]">
                                    {evaluation.feedback}
                                  </p>
                                </div>
                              )}

                              {/* Question strengths / weaknesses */}
                              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717A]">
                                    Strengths
                                  </p>

                                  {Array.isArray(evaluation.strengths) &&
                                  evaluation.strengths.length > 0 ? (
                                    <ul className="mt-3 space-y-2">
                                      {evaluation.strengths.map(
                                        (item, itemIndex) => (
                                          <li
                                            key={`${item}-${itemIndex}`}
                                            className="flex gap-2 text-xs leading-5 text-[#D4D4D8]"
                                          >
                                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white" />
                                            {item}
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  ) : (
                                    <p className="mt-3 text-xs text-[#52525B]">
                                      No specific strengths recorded.
                                    </p>
                                  )}
                                </div>

                                <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717A]">
                                    Weaknesses
                                  </p>

                                  {Array.isArray(evaluation.weaknesses) &&
                                  evaluation.weaknesses.length > 0 ? (
                                    <ul className="mt-3 space-y-2">
                                      {evaluation.weaknesses.map(
                                        (item, itemIndex) => (
                                          <li
                                            key={`${item}-${itemIndex}`}
                                            className="flex gap-2 text-xs leading-5 text-[#D4D4D8]"
                                          >
                                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#A1A1AA]" />
                                            {item}
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  ) : (
                                    <p className="mt-3 text-xs text-[#52525B]">
                                      No specific weaknesses recorded.
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Better answer */}
                              {evaluation.betterAnswer && (
                                <div className="mt-5 rounded-xl border border-white/[0.08] bg-white/[0.035] p-4">
                                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717A]">
                                    Better answer
                                  </p>

                                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#D4D4D8]">
                                    {evaluation.betterAnswer}
                                  </p>
                                </div>
                              )}

                              {/* Recommendations */}
                              {Array.isArray(evaluation.recommendations) &&
                                evaluation.recommendations.length > 0 && (
                                  <div className="mt-5">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717A]">
                                      How to improve
                                    </p>

                                    <ul className="mt-3 space-y-2">
                                      {evaluation.recommendations.map(
                                        (item, itemIndex) => (
                                          <li
                                            key={`${item}-${itemIndex}`}
                                            className="flex gap-2 text-xs leading-5 text-[#D4D4D8]"
                                          >
                                            <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white/10 text-[8px]">
                                              {itemIndex + 1}
                                            </span>

                                            {item}
                                          </li>
                                        ),
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Bottom desktop CTA */}
              <div className="mt-6 hidden items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:flex">
                <div>
                  <p className="text-sm font-semibold">
                    Ready for another round?
                  </p>

                  <p className="mt-1 text-xs text-[#71717A]">
                    Practice again with a different interview configuration.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/mock-interview/new")}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-[#17191C]"
                >
                  Interview Again
                  <FiArrowRight size={14} />
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Mobile fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/[0.08] bg-[#111315]/95 p-3 backdrop-blur-xl sm:hidden">
        <button
          type="button"
          onClick={() => navigate("/mock-interview/new")}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-semibold text-[#17191C]"
        >
          <FiTrendingUp size={15} />
          Interview Again
          <FiArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default InterviewReport;
