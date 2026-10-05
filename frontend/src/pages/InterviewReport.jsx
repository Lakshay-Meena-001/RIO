import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "react-router-dom";

import {
  FiAlertCircle,
  FiArrowLeft,
  FiArrowRight,
  FiBarChart2,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiTarget,
  FiTrash2,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";

import { deleteInterview, getInterview } from "../api/interview.api";

const InterviewReport = ({ interviewId: interviewIdProp, onDeleted }) => {
  const { interviewId: routeInterviewId } = useParams();
  const navigate = useNavigate();

  const navigateWithTransition = (path, options) => {
    if (
      typeof document !== "undefined" &&
      typeof document.startViewTransition === "function"
    ) {
      document.startViewTransition(() => {
        navigate(path, options);
      });
      return;
    }

    navigate(path, options);
  };

  const interviewId = interviewIdProp || routeInterviewId;

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const fetchReport = async () => {
      if (!interviewId) {
        setError("Interview ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setIsRefreshing(Boolean(interview));
      setError("");
      setExpandedQuestion(null);

      try {
        const result = await getInterview(interviewId);

        if (!result?.success || !result?.data) {
          throw new Error(
            result?.message || "Unable to load interview report.",
          );
        }

        if (!cancelled) {
          setInterview(result.data);
          setIsRefreshing(false);
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error("Failed to load interview report:", err);

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load this interview report.",
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    fetchReport();

    return () => {
      cancelled = true;
    };
  }, [interviewId, reloadKey]);

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
      coding: "Coding",
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

  const handleDeleteInterview = async () => {
    if (!interviewId || deleting) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError("");

      const result = await deleteInterview(interviewId);

      if (!result?.success) {
        throw new Error(result?.message || "Unable to delete this interview.");
      }

      setShowDeleteModal(false);

      if (typeof onDeleted === "function") {
        onDeleted(interviewId);
        return;
      }

      navigateWithTransition("/mock-interview/history", { replace: true });
    } catch (err) {
      console.error("Failed to delete interview:", err);

      setDeleteError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to delete this interview.",
      );
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
    setDeleteError("");
  };

  if (loading && !interview) {
    return (
      <div className="min-h-full bg-[#111214] px-4 py-10 text-white sm:px-6 lg:px-8">
        <div className="flex min-h-[70vh] items-center justify-center">
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

  if (!interview) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#111214] px-5 py-20 text-white">
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
            onClick={() => {
              setReloadKey((currentKey) => currentKey + 1);
            }}
            className="mt-5 rounded-xl bg-white px-5 py-2.5 text-xs font-semibold text-[#17191C]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const questions = Array.isArray(interview.questions)
    ? interview.questions
    : [];

  const completed = interview.status === "completed";
  const overallScore = Number(interview.overallScore);
  const scorePercent = Number.isFinite(overallScore)
    ? Math.min(Math.max(overallScore * 10, 0), 100)
    : 0;

  const getScoreTone = (score) => {
    const numericScore = Number(score);

    if (!Number.isFinite(numericScore)) {
      return {
        dot: "bg-[#A1A1AA]",
        glow: "shadow-[0_0_14px_rgba(161,161,170,0.28)]",
      };
    }

    if (numericScore >= 7) {
      return {
        dot: "bg-[#22C55E]",
        glow: "shadow-[0_0_14px_rgba(34,197,94,0.42)]",
      };
    }

    if (numericScore >= 4) {
      return {
        dot: "bg-[#EAB308]",
        glow: "shadow-[0_0_14px_rgba(234,179,8,0.40)]",
      };
    }

    return {
      dot: "bg-[#EF4444]",
      glow: "shadow-[0_0_14px_rgba(239,68,68,0.40)]",
    };
  };

  const overallTone = getScoreTone(overallScore);

  return (
    <div className="rio-report-page min-h-full bg-[#111214] text-white">
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
            transition-duration: 0.01ms !important;
          }
        }
        :focus-visible {
          outline: 2px solid rgba(255,255,255,0.72);
          outline-offset: 3px;
        }
`}</style>
      <style>{`
        @keyframes rioReportEnter {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rioReportFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes rioModalIn {
          from { opacity: 0; transform: translateY(10px) scale(.985); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        ::view-transition-old(root) {
          animation: 180ms ease both rioReportFade;
        }
        ::view-transition-new(root) {
          animation: 280ms cubic-bezier(.22,1,.36,1) both rioReportEnter;
        }
        .rio-report-page {
  animation: rioReportFade 320ms ease both;
}
        .rio-report-section {
          animation: rioReportEnter 360ms cubic-bezier(.22,1,.36,1) both;
        }
        .rio-modal {
          animation: rioModalIn 180ms cubic-bezier(.22,1,.36,1);
        }
        @media (prefers-reduced-motion: reduce) {
          .rio-report-page,
          .rio-report-section,
          .rio-modal {
            animation: none !important;
          }
        }
      `}</style>
      <div className="relative mx-auto w-full max-w-[1500px] px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute right-[-12%] top-[-10%] h-[420px] w-[420px] rounded-full bg-white/[0.025] blur-3xl" />
          <div className="absolute left-[-10%] top-[42%] h-[360px] w-[360px] rounded-full bg-[#EAB308]/[0.02] blur-3xl" />
        </div>
        {isRefreshing && (
          <div className="pointer-events-none fixed inset-0 z-40">
            <div className="absolute inset-0 bg-[#111214]/20 backdrop-blur-[1px]" />
            <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-white/10 bg-[#111214]/85 px-3 py-2 text-[10px] font-medium text-[#A1A1AA] shadow-xl backdrop-blur-xl">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Loading report
            </div>
          </div>
        )}
        {/* Header */}
        <section className="rio-report-section mb-7">
          <div className="mb-6 border-b border-white/[0.08] pb-5">
            <button
              type="button"
              onClick={() => navigate("/mock-interview")}
              className="group inline-flex items-center gap-2 text-xs font-medium text-[#71717A] transition-colors duration-200 hover:text-white"
            >
              <FiArrowLeft
                size={13}
                className="transition-transform duration-200 group-hover:-translate-x-0.5"
              />
              Mock Interviews
            </button>
          </div>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 hidden text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A] sm:block">
                Interview Report
              </p>

              <h1 className="text-[30px] font-semibold tracking-[-0.035em] sm:text-[38px]">
                {interview.role || "Mock Interview"}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[#71717A]">
                <span>{formatInterviewType(interview.interviewType)}</span>

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

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="hidden items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-semibold text-[#D4D4D8] transition-colors hover:border-white/15 hover:bg-white/[0.08] hover:text-white sm:inline-flex"
              >
                <FiTrash2 size={15} />
                Delete
              </button>

              <button
                type="button"
                onClick={() => navigateWithTransition("/mock-interview/new")}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#17191C] transition-transform hover:scale-[1.02]"
              >
                <FiTrendingUp size={15} />
                Interview Again
                <FiArrowRight size={15} />
              </button>
            </div>
          </div>
        </section>

        {!completed && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-sm text-[#D4D4D8]">
            <span
              aria-hidden="true"
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#EAB308] shadow-[0_0_12px_rgba(234,179,8,0.38)]"
            />

            <p>
              This interview is not marked as completed, so the final report may
              not contain all evaluation data yet.
            </p>
          </div>
        )}

        {/* Overall score */}
        <section className="grid gap-4 lg:grid-cols-[1.2fr_2fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6 shadow-[0_18px_50px_rgba(0,0,0,0.18)] sm:p-7">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                Overall performance
              </p>

              <div className="mt-1 flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${overallTone.dot} ${overallTone.glow}`}
                />

                <h2 className="text-lg font-semibold text-white">
                  Final Score
                </h2>
              </div>
            </div>

            <div className="mt-8 flex items-end gap-2">
              <span className="text-5xl font-semibold tracking-[-0.05em] text-white">
                {Number.isFinite(overallScore) ? overallScore.toFixed(1) : "—"}
              </span>

              <span className="mb-1.5 text-sm text-[#71717A]">/ 10</span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.07]">
              <div
                className="h-full rounded-full bg-white/80 transition-[width] duration-700 ease-out"
                style={{ width: `${scorePercent}%` }}
              />
            </div>

            <p className="mt-4 text-xs leading-5 text-[#71717A]">
              Based on the evaluations generated across your submitted answers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.025] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
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

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.025] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
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

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.025] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
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

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.055] to-white/[0.025] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)]">
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
          <section className="rio-report-section mt-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.025] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] sm:p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                <FiBarChart2 size={17} />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                  Breakdown
                </p>

                <h2 className="mt-1 text-lg font-semibold">Section scores</h2>
              </div>
            </div>

            <div className="space-y-5">
              {sectionScores.map(([section, score]) => {
                const numericScore = Number(score);
                const width = Number.isFinite(numericScore)
                  ? Math.min(Math.max(numericScore * 10, 0), 100)
                  : 0;

                return (
                  <div key={section}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${getScoreTone(score).dot} ${getScoreTone(score).glow}`}
                        />
                        <span className="truncate text-xs font-medium text-[#D4D4D8]">
                          {formatSectionName(section)}
                        </span>
                      </div>

                      <span className="shrink-0 text-xs font-semibold text-white">
                        {formatScore(score)}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full bg-white"
                        style={{ width: `${width}%` }}
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
          <section className="rio-report-section mt-4 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.025] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] sm:p-6">
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
          <div className="rio-report-section rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] sm:p-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                What went well
              </p>

              <div className=" mt-1 flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#22C55E] shadow-[0_0_14px_rgba(34,197,94,0.42)]"
                />
                <h2 className=" text-lg font-semibold">Strengths</h2>
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
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#22C55E]" />
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

          <div className="rio-report-section rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] sm:p-6">
            <div className="mt-1 flex items-center gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#71717A]">
                  What to improve
                </p>

                <div className=" mt-1 flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#EF4444] shadow-[0_0_14px_rgba(239,68,68,0.40)]"
                  />
                  <h2 className=" text-lg font-semibold">Weaknesses</h2>
                </div>
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
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#EF4444]" />
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
            <section className="rio-report-section mt-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.1)] sm:p-6">
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
                {interview.recommendations.map((recommendation, index) => (
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
                ))}
              </div>
            </section>
          )}

        {/* Question-by-question review */}
        <section className="rio-report-section mt-4 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.025] shadow-[0_12px_34px_rgba(0,0,0,0.1)]">
          <div className="border-b border-white/[0.07] px-5 py-5 sm:px-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#71717A]">
              Detailed review
            </p>

            <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em]">
              Question-by-question analysis
            </h2>

            <p className="mt-2 text-xs leading-5 text-[#71717A]">
              Review your answers, evaluation and the stronger answer approach
              suggested by the interviewer.
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
                const questionKey = question.questionId || index;
                const isExpanded = expandedQuestion === questionKey;

                return (
                  <div key={questionKey}>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedQuestion((previous) =>
                          previous === questionKey ? null : questionKey,
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
                        <span className="hidden items-center gap-2 sm:flex">
                          <span
                            aria-hidden="true"
                            className={`h-1.5 w-1.5 rounded-full ${getScoreTone(evaluation.score).dot} ${getScoreTone(evaluation.score).glow}`}
                          />
                          <span className="text-xs font-semibold text-[#D4D4D8]">
                            {formatScore(evaluation.score)}
                          </span>
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
                        <div
                          className={`grid grid-cols-2 gap-2 ${
                            question.section === "coding"
                              ? "sm:grid-cols-3 lg:grid-cols-6"
                              : "sm:grid-cols-5"
                          }`}
                        >
                          {[
                            ["Score", evaluation.score],
                            ["Correctness", evaluation.correctness],
                            ["Clarity", evaluation.clarity],
                            ["Relevance", evaluation.relevance],
                            ["Communication", evaluation.communication],
                            ...(question.section === "coding"
                              ? [
                                  ["Logic", evaluation.logic],
                                  ["Complexity", evaluation.complexity],
                                  ["Edge Cases", evaluation.edgeCases],
                                  ["Code Quality", evaluation.codeQuality],
                                ]
                              : []),
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

                        <div className="mt-5 grid gap-4 lg:grid-cols-2">
                          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717A]">
                              Strengths
                            </p>

                            {Array.isArray(evaluation.strengths) &&
                            evaluation.strengths.length > 0 ? (
                              <ul className="mt-3 space-y-2">
                                {evaluation.strengths.map((item, itemIndex) => (
                                  <li
                                    key={`${item}-${itemIndex}`}
                                    className="flex gap-2 text-xs leading-5 text-[#D4D4D8]"
                                  >
                                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#22C55E]" />
                                    {item}
                                  </li>
                                ))}
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
                                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#EF4444]" />
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

                        {evaluation.betterAnswer && (
                          <div className="mt-5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#71717A]">
                              Better answer
                            </p>

                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-[#D4D4D8]">
                              {evaluation.betterAnswer}
                            </p>
                          </div>
                        )}

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

        {/* Bottom CTA */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Ready for another round?</p>

            <p className="mt-1 text-xs text-[#71717A]">
              Practice again with a different interview configuration.
            </p>
          </div>

          <div className="mt-4 flex sm:mt-0">
            <button
              type="button"
              onClick={() => navigate("/mock-interview/new")}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-semibold text-[#17191C] transition-transform hover:scale-[1.02]"
            >
              Interview Again
              <FiArrowRight size={14} />
            </button>
          </div>
        </div>
        {createPortal(
          <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/[0.08] bg-[#111214]/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-16px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:hidden">
            <div className="mx-auto max-w-xl">
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-xs font-semibold black-[#D4D4D8] transition-colors hover:bg-black/[0.8] active:bg-white/[0.10]"
              >
                <FiTrash2 size={14} />
                Delete Interview
              </button>
            </div>
          </div>,
          document.body,
        )}
      </div>

      {showDeleteModal &&
        createPortal(
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="rio-modal w-full max-w-sm rounded-2xl border border-white/10 bg-[#191B1E]/95 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-white">
                    Delete interview?
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-[#71717A]">
                    This will permanently remove this completed interview and
                    its report from your history.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-[#71717A] transition-colors hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                  aria-label="Close"
                >
                  <FiX size={15} />
                </button>
              </div>

              {deleteError && (
                <p className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5 text-xs leading-5 text-[#D4D4D8]">
                  {deleteError}
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-medium text-white transition-colors hover:bg-white/[0.08] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleDeleteInterview}
                  disabled={deleting}
                  className="flex-1 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-[#111214] transition-colors hover:bg-[#EDEDEF] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default InterviewReport;
